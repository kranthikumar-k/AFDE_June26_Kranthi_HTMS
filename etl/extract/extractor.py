"""
Helpdesk Phase 2 — EXTRACT MODULE
Reads tickets_dataset.csv, validates schema, reports quality issues.
"""
import os, logging
import pandas as pd
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [EXTRACT] %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger(__name__)

ROOT     = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASETS = os.path.join(ROOT, "datasets")

REQUIRED_COLS = [
    "ticket_id", "employee_name", "department", "issue_category",
    "description", "priority", "status", "created_at"
]

class TicketExtractor:

    def extract_csv(self, path: str) -> pd.DataFrame:
        log.info(f"Reading CSV: {path}")
        df = pd.read_csv(path, dtype=str)
        log.info(f"  → {len(df)} rows, {len(df.columns)} columns")
        return df

    def validate(self, df: pd.DataFrame) -> pd.DataFrame:
        log.info("Validating schema...")
        missing = [c for c in REQUIRED_COLS if c not in df.columns]
        if missing:
            log.warning(f"  ⚠ Missing columns: {missing}")
            for c in missing:
                df[c] = None

        null_counts = df[REQUIRED_COLS].isnull().sum()
        issues = null_counts[null_counts > 0]
        if not issues.empty:
            log.warning(f"  ⚠ Null values:\n{issues.to_string()}")

        dupes = df.duplicated(subset=["employee_name","issue_category","created_at"], keep=False).sum()
        log.info(f"  Duplicate rows detected: {dupes}")
        log.info(f"  Schema validation complete ✓")
        return df

    def run(self) -> dict:
        log.info("=" * 50)
        log.info("EXTRACT STAGE — START")

        csv_path = os.path.join(DATASETS, "tickets_dataset.csv")
        df = self.extract_csv(csv_path)
        df = self.validate(df)

        log.info(f"EXTRACT COMPLETE — {len(df)} tickets loaded")
        log.info("=" * 50)
        return {
            "tickets_df":        df,
            "extract_timestamp": datetime.now().isoformat(),
            "source_count":      len(df),
        }

if __name__ == "__main__":
    result = TicketExtractor().run()
    print(f"Extracted: {result['source_count']} tickets")
