# Law library sources

Public bare acts only, from India Code (https://www.indiacode.nic.in). No commentaries or
textbooks. Download the official PDF of each act and save it in `data/raw/` under this name:

| Act | File | Where |
| --- | --- | --- |
| Bharatiya Nyaya Sanhita, 2023 | `bns_2023.pdf` | India Code, search "Bharatiya Nyaya Sanhita" |
| Bharatiya Nagarik Suraksha Sanhita, 2023 | `bnss_2023.pdf` | India Code, search "Bharatiya Nagarik Suraksha Sanhita" |
| Bharatiya Sakshya Adhiniyam, 2023 | `bsa_2023.pdf` | India Code, search "Bharatiya Sakshya Adhiniyam" |
| Indian Penal Code, 1860 | `ipc_1860.pdf` | India Code, search "Indian Penal Code" |

Record the exact URL of each PDF in `SOURCE_URLS` in `src/nya_agent/library/ingest.py` so every
citation links back to its source. `data/raw/` is not committed.

`section_map.csv` holds starter IPC to BNS rows. Each row stays `verified=false` until it has been
checked against the Ministry of Home Affairs comparison table.
