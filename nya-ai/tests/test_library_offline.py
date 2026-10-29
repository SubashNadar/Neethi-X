"""Parser, date and citation logic, without a database."""

from datetime import date
from pathlib import Path

from llama_index.core.schema import Document

from nya_agent.library.acts import ACTS, OPEN_END, acts_in_force
from nya_agent.library.golden import parse_golden
from nya_agent.library.parser import SectionNodeParser, merge_pages
from nya_agent.library.retrieve import section_refs

FIXTURE = (Path(__file__).parent / "fixtures" / "sample_act.txt").read_text()
META = {"act": "BNS", "effective_from": "2024-07-01", "effective_to": OPEN_END, "source_url": "test"}


def _nodes(max_tokens: int = 800):
    half = len(FIXTURE) // 2
    pages = [Document(text=FIXTURE[:half], metadata={"page_label": "1"}),
             Document(text=FIXTURE[half:], metadata={"page_label": "2"})]
    return SectionNodeParser(max_tokens=max_tokens).split_act(merge_pages(pages, META))


def test_splits_one_node_per_section_and_skips_the_arrangement():
    nodes = _nodes()
    assert [n.metadata["section"] for n in nodes] == ["1", "2", "3", "3A", "4"]
    assert nodes[2].metadata["heading"] == "Taking of property"
    assert nodes[2].metadata["chapter"] == "II"
    assert nodes[2].id_ == "BNS-3"


def test_keeps_explanations_and_illustrations_and_drops_footnotes():
    by = {n.metadata["section"]: n for n in _nodes()}
    assert "Explanation.—A thing attached" in by["2"].text
    assert "Subs. by Act" not in by["2"].text
    assert "A moves a pen" in by["3"].text
    assert "CHAPTER II" not in by["2"].text  # chapter heading belongs to the next section


def test_heading_wrapped_onto_a_second_line():
    text = (
        "21. Admissions.—An admission is relevant.\n"
        "22. Confession caused by inducement, threat, coercion or promise, when irrelevant in criminal \n"
        "proceeding.—A confession made by an accused person is irrelevant.\n"
        "23. Next.—Text.\n"
    )
    nodes = SectionNodeParser().split_act(Document(text=text, metadata=META))
    assert [n.metadata["section"] for n in nodes] == ["21", "22", "23"]
    assert nodes[1].metadata["heading"] == (
        "Confession caused by inducement, threat, coercion or promise, when irrelevant in criminal proceeding"
    )


def test_page_and_date_metadata():
    by = {n.metadata["section"]: n for n in _nodes()}
    assert by["1"].metadata["page"] == "1"
    assert by["4"].metadata["page"] == "2"
    assert by["4"].metadata["effective_to"] == OPEN_END


def test_long_sections_split_at_sub_sections():
    parts = [n for n in _nodes(max_tokens=25) if n.metadata["section"] == "4"]
    assert len(parts) == 2
    assert parts[1].text.startswith("(2)")
    assert parts[1].id_ == "BNS-4-p2"


def test_acts_in_force_switch_on_1_july_2024():
    assert acts_in_force(date(2024, 3, 12), ["IPC", "BNS"]) == ["IPC"]
    assert acts_in_force(date(2024, 6, 30), ["IPC", "BNS"]) == ["IPC"]
    assert acts_in_force(date(2024, 7, 1), ["IPC", "BNS"]) == ["BNS"]
    assert ACTS["IPC"].effective_to == "2024-06-30"


def test_section_refs():
    assert section_refs("Which BNS section replaced IPC 420?") == [("IPC", "420")]
    assert section_refs("what does section 138 say") == [(None, "138")]
    assert section_refs("Is s. 379 IPC bailable? And BNS §303?") == [("BNS", "303"), ("IPC", "379")]
    assert section_refs("How do I file an FIR?") == []


def test_parse_golden_table(tmp_path):
    md = tmp_path / "g.md"
    md.write_text(
        "| # | Query | Risk | Mode | Escalation | Expected source |\n|---|---|---|---|---|---|\n"
        "| 1 | Theft? | Low | rag | none | BNS §303 |\n"
        "| 15 | WhatsApp? | Medium | rag | none | BSA §§61, 63 |\n"
        "| 29 | 498A? | Medium | hybrid | none | `section_map` → BNS §§85–86 text |\n"
        "| 11 | Consumer? | Low | rag | none | CPA 2019 §2(7) |\n"
    )
    got = {(r.query, r.act, r.section) for r in parse_golden(md)}
    assert got == {(1, "BNS", "303"), (15, "BSA", "61"), (15, "BSA", "63"), (29, "BNS", "85"), (29, "BNS", "86"), (11, "CPA", "2")}
