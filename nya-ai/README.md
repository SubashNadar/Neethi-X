# Nya-AI agent service

The service that will answer chat questions for the Nya-AI app: a LangGraph graph over a
LlamaIndex law library, traced in Langfuse. The plan is
https://claude.ai/artifact/KtuTmzcwCe2aMQqWRtVN29.

**Built so far: release R0, the law library.** The LangGraph graph is release R1.

## What R0 does

- Splits each bare act into one node per section (`SectionNodeParser`), keeping explanations and
  illustrations with their section and splitting long sections at sub-sections.
- Embeds with Azure `text-embedding-3-large` at 1536 dimensions and stores in pgvector with a
  full-text column, through a LlamaIndex `IngestionPipeline`. Re-ingesting an unchanged act embeds
  nothing; a changed act replaces its own vectors only.
- Retrieves by fusing vector and full-text search (`QueryFusionRetriever`, reciprocal rank), after
  filtering to the acts in force on the date. IPC before 1 July 2024, BNS, BNSS and BSA from then.
  A section named in the question ("IPC 420") is fetched directly first.
- Keeps SQL tables beside the index: `acts`, `sections` (used to check citations), `section_map`
  (IPC to BNS, starter rows, all unverified), `offence_class` (empty until R2) and
  `ingestion_jobs` (stage-by-stage log for the law library admin screen).
- Checks every section the golden queries expect against the ingested text.
- Sends each ingestion run to Langfuse as one trace with a span per stage.

## Run it

```bash
cd nya-ai
docker compose up -d          # Postgres + pgvector on 5433, Langfuse on http://localhost:3000
cp .env.example .env          # add your Azure endpoint and key
uv sync
uv run nya-agent setup        # tables, acts, section map
# put the four India Code PDFs in data/raw/ (see data/SOURCES.md), then:
uv run nya-agent ingest       # BNS BNSS BSA IPC
uv run nya-agent golden ../../legal-docs-platform/evals/GOLDEN-QUERIES.md
uv run nya-agent search "My phone was stolen in March 2024" --as-of 2024-03-12
uv run nya-agent status
```

Langfuse login on first start: `admin@nya.local` / `change-me-admin` (change the values in
`docker-compose.yml` first).

## Tests

```bash
uv run pytest
```

Offline tests cover the parser, dates and citation parsing. The Postgres tests ingest a synthetic
fixture with a mock embedding into the `nya_test` database and are skipped when the database is not
running. No Azure key is needed for tests.

## Notes

- The parser was built against India Code's printed layout (`303. Theft.—(1) Whoever ...`) and
  tested on a synthetic fixture. Check its section counts on the real PDFs first: the BNS should
  give 358 sections, the BNSS 531, the BSA 170 and the IPC 511 numbered sections (plus lettered
  ones such as 498A).
- Pinned versions: llama-index-core 0.14, langgraph 1.2, langfuse 5.0. Two workarounds are noted in
  `library/index.py` (docstore built from the kvstore; psycopg2 for the vector store).
