"""`uv run nya-agent <command>`: setup, ingest, golden, search, status."""

import argparse
from datetime import date
from pathlib import Path

from nya_agent.library import db

DATA = Path(__file__).resolve().parents[3] / "data"


def main() -> None:
    p = argparse.ArgumentParser(prog="nya-agent", description="Nya-AI law library (release R0)")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("setup", help="create tables, register the acts and load the IPC to BNS map")
    ing = sub.add_parser("ingest", help="ingest acts from nya-ai/data/raw/")
    ing.add_argument("acts", nargs="*", default=["BNS", "BNSS", "BSA", "IPC"])
    gold = sub.add_parser("golden", help="check golden-set sections against the ingested text")
    gold.add_argument("path", type=Path, help="path to evals/GOLDEN-QUERIES.md (legal-docs-platform)")
    s = sub.add_parser("search", help="try a question against the library")
    s.add_argument("question")
    s.add_argument("--as-of", type=date.fromisoformat, default=None, help="date the law is needed for")
    sub.add_parser("status", help="acts and the last ingestion jobs")
    args = p.parse_args()

    engine = db.get_engine()
    if args.cmd == "setup":
        db.setup(engine)
        n = db.load_section_map(engine, DATA / "section_map.csv")
        print(f"tables ready; {n} section_map rows loaded")
    elif args.cmd == "ingest":
        from nya_agent.library import index
        from nya_agent.library.ingest import ingest_act

        db.setup(engine)
        embed = index.embed_model()
        for code in args.acts:
            print(ingest_act(code.upper(), engine, embed))
    elif args.cmd == "golden":
        from nya_agent.library.golden import check, render

        report = check(engine, args.path)
        print(render(report))
        raise SystemExit(0 if report.ok else 1)
    elif args.cmd == "search":
        from nya_agent.library import index
        from nya_agent.library.retrieve import LawLibrary

        for e in LawLibrary(engine, index.embed_model()).search(args.question, args.as_of):
            print(f"[{e.found_by} {e.score:.3f}] {e.act} §{e.section} {e.heading} (p. {e.page})")
    elif args.cmd == "status":
        from sqlalchemy import select

        with engine.connect() as conn:
            for a in conn.execute(select(db.acts)).mappings():
                print(f"{a['code']:<5} {a['sections']:>4} sections  ingested {a['ingested_at'] or 'never'}")
            jobs = conn.execute(select(db.ingestion_jobs).order_by(db.ingestion_jobs.c.id.desc()).limit(5)).mappings()
            for j in jobs:
                print(f"job {j['id']} {j['act']} {j['stage']} {j['status']} {j['stats']}")
