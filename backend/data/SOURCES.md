# Law library sources

Public bare acts only, from India Code (https://indiacode.gov.in; the IPC still comes from the older www.indiacode.nic.in). No commentaries or
textbooks. Download the official PDF of each act and save it in `data/raw/` under this name:

| Act | File | Where |
| --- | --- | --- |
| Bharatiya Nyaya Sanhita, 2023 | `bns_2023.pdf` | https://indiacode.gov.in/server/api/core/bitstreams/8007a80e-259b-429d-9ca4-1a2f474b5000/content |
| Bharatiya Nagarik Suraksha Sanhita, 2023 | `bnss_2023.pdf` | https://indiacode.gov.in/server/api/core/bitstreams/73f93470-5f6a-4f0f-bc23-1309e32b9554/content |
| Bharatiya Sakshya Adhiniyam, 2023 | `bsa_2023.pdf` | https://indiacode.gov.in/server/api/core/bitstreams/fa0f7526-d871-41f2-a644-2a42952211f5/content |
| Indian Penal Code, 1860 | `ipc_1860.pdf` | https://www.indiacode.nic.in/bitstream/123456789/4219/1/THE-INDIAN-PENAL-CODE-1860.pdf |

`uv run nya-agent fetch` downloads all four. The BNS, BNSS and BSA files are the central acts
(handles 20062, 20099, 20063, "as on 6th October, 2025"); India Code also lists a state copy of the
BNSS under Uttarakhand (handle 21920), which is not the one to use.

The same URLs are in `SOURCE_URLS` in `app/rag/ingest.py`, so every citation links
back to its source. `data/raw/` is not committed.

`section_map.csv` holds starter IPC to BNS rows. Each row stays `verified=false` until it has been
checked against the Ministry of Home Affairs comparison table.
