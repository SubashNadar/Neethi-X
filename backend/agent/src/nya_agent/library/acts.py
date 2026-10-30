"""The acts R0 ingests, with the dates that decide which law applies on a given day.

Source files are the official India Code PDFs. Put them in `backend/agent/data/raw/` under the file
names below (see `data/SOURCES.md`); the raw PDFs are not committed.
"""

from dataclasses import dataclass
from datetime import date

# Sections still in force have no end date. Stored as this sentinel so date filters stay simple
# string comparisons on ISO dates.
OPEN_END = "9999-12-31"


@dataclass(frozen=True)
class Act:
    code: str
    title: str
    file: str
    in_force_from: date
    repealed_on: date | None = None  # first day it no longer applies
    replaced_by: str | None = None

    @property
    def effective_from(self) -> str:
        return self.in_force_from.isoformat()

    @property
    def effective_to(self) -> str:
        """Last day the act applies, as an ISO date (OPEN_END while in force)."""
        if self.repealed_on is None:
            return OPEN_END
        return date.fromordinal(self.repealed_on.toordinal() - 1).isoformat()

    def in_force_on(self, day: date) -> bool:
        return self.in_force_from <= day and (self.repealed_on is None or day < self.repealed_on)


NEW_CODES_FROM = date(2024, 7, 1)

ACTS: dict[str, Act] = {
    a.code: a
    for a in [
        Act("BNS", "Bharatiya Nyaya Sanhita, 2023", "bns_2023.pdf", NEW_CODES_FROM),
        Act("BNSS", "Bharatiya Nagarik Suraksha Sanhita, 2023", "bnss_2023.pdf", NEW_CODES_FROM),
        Act("BSA", "Bharatiya Sakshya Adhiniyam, 2023", "bsa_2023.pdf", NEW_CODES_FROM),
        Act("IPC", "Indian Penal Code, 1860", "ipc_1860.pdf", date(1862, 1, 1), NEW_CODES_FROM, "BNS"),
    ]
}


def acts_in_force(day: date, codes: list[str] | None = None) -> list[str]:
    """Codes of the acts (optionally limited to `codes`) that apply on `day`."""
    pool = codes or list(ACTS)
    return [c for c in pool if c in ACTS and ACTS[c].in_force_on(day)]
