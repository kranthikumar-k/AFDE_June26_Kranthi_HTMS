"""
Helpdesk Phase 2 — LOAD MODULE
Writes clean tickets and analytics tables to data/processed/ and data/output/
"""
import os, json, logging
from datetime import datetime
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [LOAD] %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger(__name__)

ROOT      = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROCESSED = os.path.join(ROOT, "data", "processed")
OUTPUT    = os.path.join(ROOT, "data", "output")


def _save(df: pd.DataFrame, name: str, folder: str):
    os.makedirs(folder, exist_ok=True)
    df.to_csv(os.path.join(folder,  f"{name}.csv"),  index=False)
    df.to_json(os.path.join(folder, f"{name}.json"), orient="records", indent=2, date_format="iso")
    log.info(f"  ✅ {name}: {len(df)} rows")


class AnalyticsLoader:

    def run(self, transformed: dict) -> dict:
        log.info("=" * 50)
        log.info("LOAD STAGE — START")

        tickets   = transformed["tickets_clean"]
        analytics = transformed["analytics"]

        # ── Processed tables ───────────────────────────────────
        log.info("\n── Writing PROCESSED tables ──")
        _save(tickets, "tickets_clean", PROCESSED)

        # ── Analytics output tables ────────────────────────────
        log.info("\n── Writing ANALYTICS tables ──")
        table_map = {
            "category_analysis":     "category_analysis",
            "priority_distribution": "priority_distribution",
            "department_analysis":   "department_analysis",
            "monthly_trend":         "monthly_trend",
            "status_summary":        "status_summary",
            "category_group":        "category_group_summary",
            "resolution_time_dist":  "resolution_time_distribution",
            "top_employees":         "top_employees",
        }
        for key, name in table_map.items():
            _save(analytics[key], name, OUTPUT)

        # ── ETL Summary ────────────────────────────────────────
        summary = analytics["etl_summary"]
        summary_path = os.path.join(OUTPUT, "etl_summary.json")
        os.makedirs(OUTPUT, exist_ok=True)
        with open(summary_path, "w") as f:
            json.dump(summary, f, indent=2)
        log.info(f"  ✅ etl_summary.json")

        log.info("\nLOAD STAGE — COMPLETE")
        log.info(f"  Processed: 1 table | Analytics: {len(table_map)} tables")
        log.info("=" * 50)

        return {"summary": summary}
