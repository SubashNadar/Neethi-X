# Law library sources

Public bare acts only, from India Code (https://www.indiacode.nic.in). No commentaries or
textbooks. Download the official PDF of each act and save it in `data/raw/` under this name:

| Act | File | Where |
| --- | --- | --- |
| Bharatiya Nyaya Sanhita, 2023 | `bns_2023.pdf` | https://www.indiacode.nic.in/bitstream/123456789/20062/1/a202345.pdf |
| Bharatiya Nagarik Suraksha Sanhita, 2023 | `bnss_2023.pdf` | https://www.indiacode.nic.in/bitstream/123456789/20099/1/A202346.pdf |
| Bharatiya Sakshya Adhiniyam, 2023 | `bsa_2023.pdf` | https://www.indiacode.nic.in/bitstream/123456789/20063/1/aa202347.pdf |
| Indian Penal Code, 1860 | `ipc_1860.pdf` | https://www.indiacode.nic.in/bitstream/123456789/4219/1/THE-INDIAN-PENAL-CODE-1860.pdf |

`uv run nya-agent fetch` downloads all four. The BNS, BNSS and BSA files are the central acts
(handles 20062, 20099, 20063, "as on 6th October, 2025"); India Code also lists a state copy of the
BNSS under Uttarakhand (handle 21920), which is not the one to use.

The same URLs are in `SOURCE_URLS` in `src/nya_agent/library/ingest.py`, so every citation links
back to its source. `data/raw/` is not committed.

`section_map.csv` holds starter IPC to BNS rows. Each row stays `verified=false` until it has been
checked against the Ministry of Home Affairs comparison table.
