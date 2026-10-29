"""Split a bare act into one node per section, the way India Code prints it.

India Code PDFs start a section with its number and marginal heading followed by an em dash,
for example `303. Theft.—(1) Whoever ...`. The "Arrangement of Sections" at the front lists the
same headings without the dash, so it is skipped. Explanations and illustrations stay with their
section. Sections longer than about `max_tokens` are split at sub-section markers `(1)`, `(2)`.
"""

import re
from collections.abc import Sequence
from typing import Any

from llama_index.core.node_parser import NodeParser
from llama_index.core.schema import BaseNode, Document, NodeRelationship, TextNode

# A long heading wraps onto a second line ("22. Confession caused by ... in criminal\nproceeding.—"),
# as long as that line does not start another numbered section.
SECTION_START = re.compile(
    r"^\s*(?P<num>\d{1,3}[A-Z]{0,2})\.\s+"
    r"(?P<heading>[^\n—–]{2,220}?(?:\n(?!\s*\d{1,3}[A-Z]{0,2}\.\s)[^\n—–]{1,220}?)?)"
    r"\.?\s*(?:—|–|-{2}|\.-)\s*",
    re.MULTILINE,
)
CHAPTER = re.compile(r"^\s*CHAPTER\s+(?P<num>[IVXLC]+[A-Z]?)\s*\n\s*(?P<title>[^\n]{3,200})", re.MULTILINE)
# Amendment footnotes India Code prints at the foot of a page, e.g. "1. Subs. by Act 5 of 2009".
FOOTNOTE = re.compile(r"^\s*\d{1,2}\.\s+(?:Subs|Ins|Omitted|Rep|Added|The words|Cl|Sub-section)\b.*$", re.MULTILINE)
SUBSECTION = re.compile(r"(?=\(\d{1,2}\)\s)")


def section_key(num: str) -> tuple[int, str]:
    m = re.match(r"(\d+)([A-Z]*)", num)
    assert m
    return int(m.group(1)), m.group(2)


def approx_tokens(text: str) -> int:
    return int(len(text.split()) * 1.3)


class SectionNodeParser(NodeParser):
    """Turns one whole-act Document into section nodes with act and date metadata.

    The Document's metadata must carry `act`, `effective_from`, `effective_to` and `source_url`.
    It may carry `page_starts`: a list of `[char_offset, page_label]` so each node gets the page
    its section starts on.
    """

    max_tokens: int = 800

    def _parse_nodes(self, nodes: Sequence[BaseNode], show_progress: bool = False, **kwargs: Any) -> list[BaseNode]:
        out: list[BaseNode] = []
        for node in nodes:
            out.extend(self.split_act(node))
        return out

    def split_act(self, doc: BaseNode) -> list[TextNode]:
        meta = dict(doc.metadata)
        page_starts: list[list[Any]] = meta.pop("page_starts", None) or []
        act = meta["act"]
        text = FOOTNOTE.sub("", doc.get_content())

        chapters = [(m.start(), m.group("num"), m.group("title").strip()) for m in CHAPTER.finditer(text)]
        starts = self._section_starts(text)

        nodes: list[TextNode] = []
        for i, m in enumerate(starts):
            end = starts[i + 1].start() if i + 1 < len(starts) else len(text)
            # A chapter heading printed between two sections belongs to the next one.
            end = min([end] + [pos for pos, _, _ in chapters if m.start() < pos < end])
            body = re.sub(r"[ \t]+", " ", text[m.start() : end]).strip()
            num, heading = m.group("num"), " ".join(m.group("heading").split())
            chapter = next(((c, t) for pos, c, t in reversed(chapters) if pos < m.start()), (None, None))
            base = {
                **meta,
                "section": num,
                "heading": heading,
                "chapter": chapter[0],
                "chapter_title": chapter[1],
                "page": self._page_at(page_starts, m.start()),
            }
            parts = self._split_long(body)
            for p, part in enumerate(parts):
                node = TextNode(
                    id_=f"{act}-{num}" + (f"-p{p + 1}" if len(parts) > 1 else ""),
                    text=part,
                    metadata={**base, "part": p + 1, "parts": len(parts)},
                    excluded_embed_metadata_keys=["source_url", "page", "part", "parts", "effective_from", "effective_to"],
                    excluded_llm_metadata_keys=["source_url", "part", "parts"],
                    # Links the node to its act, so re-ingesting a changed act deletes its old vectors.
                    relationships={NodeRelationship.SOURCE: doc.as_related_node_info()},
                )
                nodes.append(node)
        return nodes

    def _section_starts(self, text: str) -> list[re.Match[str]]:
        """Section heading matches in order, dropping false hits.

        A real section number never goes backwards, so a match whose number is lower than the
        previous one (a cross-reference such as "under 2. ..." at a line start, or a stray
        table-of-contents line) is ignored.
        """
        kept: list[re.Match[str]] = []
        last = (0, "")
        for m in SECTION_START.finditer(text):
            key = section_key(m.group("num"))
            if key <= last:
                continue
            kept.append(m)
            last = key
        return kept

    def _split_long(self, body: str) -> list[str]:
        if approx_tokens(body) <= self.max_tokens:
            return [body]
        pieces = [p for p in SUBSECTION.split(body) if p.strip()]
        # The section number and heading stay with sub-section (1).
        if len(pieces) > 1 and not pieces[0].lstrip().startswith("("):
            pieces[1] = pieces[0] + pieces[1]
            pieces = pieces[1:]
        parts: list[str] = []
        cur = ""
        for piece in pieces:
            if cur and approx_tokens(cur + piece) > self.max_tokens:
                parts.append(cur.strip())
                cur = piece
            else:
                cur += piece
        if cur.strip():
            parts.append(cur.strip())
        return parts

    @staticmethod
    def _page_at(page_starts: list[list[Any]], offset: int) -> str | None:
        page = None
        for start, label in page_starts:
            if start > offset:
                break
            page = str(label)
        return page


def merge_pages(pages: list[Document], metadata: dict[str, Any]) -> Document:
    """Join PDFReader's one-Document-per-page output into one act Document with page offsets."""
    text, page_starts = "", []
    for d in pages:
        page_starts.append([len(text), d.metadata.get("page_label", "")])
        text += d.get_content() + "\n"
    return Document(text=text, metadata={**metadata, "page_starts": page_starts})
