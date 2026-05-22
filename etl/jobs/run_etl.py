"""
Helpdesk Phase 2 — MAIN ETL JOB
Run: python etl/jobs/run_etl.py  (from project root)
"""
import sys, os, time, logging

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ROOT)

os.makedirs(os.path.join(ROOT, "logs"), exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(message)s",
    datefmt="%H:%M:%S",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(ROOT, "logs", "etl.log"), mode="a"),
    ]
)
log = logging.getLogger(__name__)

from etl.extract.extractor   import TicketExtractor
from etl.transform.transformer import TicketTransformer
from etl.load.loader          import AnalyticsLoader


def run_etl():
    log.info("\n" + "═"*58)
    log.info("  HELPDESK PHASE 2 — ETL PIPELINE STARTING")
    log.info("═"*58)
    start = time.time()

    # Stage 1: Extract
    t1 = time.time()
    extracted = TicketExtractor().run()
    log.info(f"  ⏱ Extract: {time.time()-t1:.2f}s\n")

    # Stage 2: Transform
    t2 = time.time()
    transformed = TicketTransformer().run(extracted)
    log.info(f"  ⏱ Transform: {time.time()-t2:.2f}s\n")

    # Stage 3: Load
    t3 = time.time()
    loaded = AnalyticsLoader().run(transformed)
    log.info(f"  ⏱ Load: {time.time()-t3:.2f}s\n")

    total   = time.time() - start
    summary = loaded["summary"]

    log.info("═"*58)
    log.info("  ✅ ETL PIPELINE COMPLETED SUCCESSFULLY")
    log.info(f"  Run ID          : {summary['etl_run_id']}")
    log.info(f"  Duration        : {total:.2f} seconds")
    log.info(f"  Total tickets   : {summary['total_tickets']}")
    log.info(f"  Open tickets    : {summary['open_tickets']}")
    log.info(f"  Resolved        : {summary['resolved_tickets']}")
    log.info(f"  Critical        : {summary['critical_tickets']}")
    log.info(f"  SLA breaches    : {summary['sla_breaches']}")
    log.info(f"  Avg resolution  : {summary['avg_resolution_hours']}h")
    log.info(f"  Top category    : {summary['top_category']}")
    log.info(f"  Top department  : {summary['top_department']}")
    log.info(f"  Duplicates removed: {summary['dedup_removed']}")
    log.info("═"*58)
    return summary


if __name__ == "__main__":
    run_etl()
