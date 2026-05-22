"""
Helpdesk Phase 2 — TRANSFORM MODULE
Cleans, deduplicates, categorizes, and enriches ticket data.
"""
import os, logging
import pandas as pd
import numpy as np
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [TRANSFORM] %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger(__name__)

PRIORITY_ORDER = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}
STATUS_ORDER   = {"Open": 1, "In Progress": 2, "Resolved": 3, "Closed": 4}

PRIORITY_SLA_HOURS = {"Critical": 4, "High": 8, "Medium": 24, "Low": 72}

CATEGORY_GROUP = {
    "VPN Issue":             "Network & Connectivity",
    "Network Connectivity":  "Network & Connectivity",
    "Email Access":          "Communication",
    "Printer Issue":         "Hardware",
    "Hardware Request":      "Hardware",
    "Laptop Issue":          "Hardware",
    "Password Reset":        "Access & Security",
    "Access Denied":         "Access & Security",
    "Software Installation": "Software",
    "System Crash":          "Software",
    "Data Recovery":         "Data Management",
    "Other":                 "General",
}


class TicketTransformer:

    def clean(self, df: pd.DataFrame) -> pd.DataFrame:
        log.info("  Cleaning ticket records...")
        df = df.copy()

        # Text normalisation
        for col in ["employee_name","department","issue_category","priority","status","description"]:
            if col in df.columns:
                df[col] = df[col].astype(str).str.strip().str.replace(r'\s+', ' ', regex=True)

        # Title-case key fields
        df["priority"] = df["priority"].str.title()
        df["status"]   = df["status"].str.title()
        df["status"]   = df["status"].str.replace("In_progress", "In Progress")

        # Dates
        df["created_at"]  = pd.to_datetime(df["created_at"],  errors="coerce")
        df["resolved_at"] = pd.to_datetime(df.get("resolved_at",""), errors="coerce")

        # Numeric
        df["ticket_id"] = pd.to_numeric(df["ticket_id"], errors="coerce").fillna(0).astype(int)

        # Fill blanks
        df["resolution_notes"] = df["resolution_notes"].replace({"nan":"", "None":"", "":""}).fillna("")
        df["priority"] = df["priority"].where(df["priority"].isin(PRIORITY_ORDER), "Medium")
        df["status"]   = df["status"].where(df["status"].isin(STATUS_ORDER), "Open")

        before = len(df)
        df = df.drop_duplicates(subset=["employee_name","issue_category","created_at"])
        log.info(f"    Deduplication: {before} → {len(df)} rows ({before-len(df)} removed)")
        return df

    def enrich(self, df: pd.DataFrame) -> pd.DataFrame:
        log.info("  Enriching ticket records...")
        df = df.copy()

        df["priority_rank"] = df["priority"].map(PRIORITY_ORDER).fillna(2).astype(int)
        df["status_rank"]   = df["status"].map(STATUS_ORDER).fillna(1).astype(int)
        df["category_group"]= df["issue_category"].map(CATEGORY_GROUP).fillna("General")

        # Resolution time in hours
        mask = df["resolved_at"].notna() & df["created_at"].notna()
        df["resolution_hours"] = np.where(
            mask,
            (df["resolved_at"] - df["created_at"]).dt.total_seconds() / 3600,
            np.nan
        )
        df["resolution_hours"] = df["resolution_hours"].round(2)

        # SLA status
        df["sla_hours"] = df["priority"].map(PRIORITY_SLA_HOURS).fillna(24)
        df["sla_breached"] = np.where(
            df["resolution_hours"].notna(),
            df["resolution_hours"] > df["sla_hours"],
            False
        )

        # Date parts for trend analysis
        df["created_month"] = df["created_at"].dt.to_period("M").astype(str)
        df["created_week"]  = df["created_at"].dt.to_period("W").astype(str)
        df["created_hour"]  = df["created_at"].dt.hour
        df["created_dow"]   = df["created_at"].dt.day_name()

        # Is resolved
        df["is_resolved"] = df["status"].isin(["Resolved", "Closed"])

        log.info(f"    Enrichment complete. Resolved tickets: {df['is_resolved'].sum()}")
        return df

    def build_analytics(self, df: pd.DataFrame) -> dict:
        log.info("  Building analytics summaries...")

        # 1. Category analysis
        cat = df.groupby("issue_category").agg(
            ticket_count=("ticket_id","count"),
            resolved=("is_resolved","sum"),
            avg_resolution_hours=("resolution_hours","mean"),
            critical_count=("priority", lambda x:(x=="Critical").sum()),
            high_count=("priority",    lambda x:(x=="High").sum()),
        ).round(2).reset_index()
        cat["resolution_rate_pct"] = (cat["resolved"]/cat["ticket_count"]*100).round(1)
        cat = cat.sort_values("ticket_count", ascending=False)

        # 2. Priority distribution
        pri = df.groupby("priority").agg(
            ticket_count=("ticket_id","count"),
            resolved=("is_resolved","sum"),
            avg_resolution_hours=("resolution_hours","mean"),
            sla_breached=("sla_breached","sum"),
        ).round(2).reset_index()
        pri["resolution_rate_pct"] = (pri["resolved"]/pri["ticket_count"]*100).round(1)
        pri["sla_breach_rate_pct"] = (pri["sla_breached"]/pri["ticket_count"]*100).round(1)

        # 3. Department analysis
        dept = df.groupby("department").agg(
            ticket_count=("ticket_id","count"),
            open_tickets=("status",   lambda x:(x=="Open").sum()),
            resolved=("is_resolved","sum"),
            avg_resolution_hours=("resolution_hours","mean"),
            critical_count=("priority",lambda x:(x=="Critical").sum()),
        ).round(2).reset_index()
        dept["resolution_rate_pct"] = (dept["resolved"]/dept["ticket_count"]*100).round(1)
        dept = dept.sort_values("ticket_count", ascending=False)

        # 4. Monthly trend
        monthly = df.groupby("created_month").agg(
            tickets_created=("ticket_id","count"),
            resolved=("is_resolved","sum"),
            avg_resolution_hours=("resolution_hours","mean"),
            critical_tickets=("priority",lambda x:(x=="Critical").sum()),
        ).round(2).reset_index()
        monthly = monthly.sort_values("created_month")

        # 5. Status summary
        status = df.groupby("status").agg(
            count=("ticket_id","count"),
            avg_resolution_hours=("resolution_hours","mean"),
        ).round(2).reset_index()

        # 6. Category group summary
        grp = df.groupby("category_group").agg(
            ticket_count=("ticket_id","count"),
            resolved=("is_resolved","sum"),
            avg_resolution_hours=("resolution_hours","mean"),
        ).round(2).reset_index()
        grp["resolution_rate_pct"] = (grp["resolved"]/grp["ticket_count"]*100).round(1)

        # 7. Resolution time distribution
        resolved_df = df[df["resolution_hours"].notna()]
        bins   = [0, 4, 8, 24, 48, 72, 999]
        labels = ["<4h","4-8h","8-24h","24-48h","48-72h",">72h"]
        resolved_df = resolved_df.copy()
        resolved_df["time_bucket"] = pd.cut(resolved_df["resolution_hours"], bins=bins, labels=labels, include_lowest=True)
        rt_dist = resolved_df.groupby("time_bucket", observed=True).agg(count=("ticket_id","count")).reset_index()
        rt_dist["time_bucket"] = rt_dist["time_bucket"].astype(str)

        # 8. Top employees by tickets
        emp = df.groupby("employee_name").agg(
            total_tickets=("ticket_id","count"),
            open=("status", lambda x:(x=="Open").sum()),
            resolved=("is_resolved","sum"),
            critical=("priority", lambda x:(x=="Critical").sum()),
        ).reset_index().sort_values("total_tickets", ascending=False).head(15)

        # ETL summary
        total = len(df)
        summary = {
            "etl_run_id":    f"ETL-HELPDESK-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "completed_at":  datetime.now().isoformat(),
            "total_tickets": total,
            "open_tickets":  int((df["status"]=="Open").sum()),
            "resolved_tickets": int(df["is_resolved"].sum()),
            "critical_tickets": int((df["priority"]=="Critical").sum()),
            "sla_breaches":  int(df["sla_breached"].sum()),
            "avg_resolution_hours": round(float(df["resolution_hours"].mean()), 2),
            "top_category":  cat.iloc[0]["issue_category"] if len(cat) else "N/A",
            "top_department":dept.iloc[0]["department"]    if len(dept) else "N/A",
            "dedup_removed": 0,
        }

        log.info(f"    Analytics built: 8 tables")
        return {
            "category_analysis":     cat,
            "priority_distribution": pri,
            "department_analysis":   dept,
            "monthly_trend":         monthly,
            "status_summary":        status,
            "category_group":        grp,
            "resolution_time_dist":  rt_dist,
            "top_employees":         emp,
            "etl_summary":           summary,
        }

    def run(self, extracted: dict) -> dict:
        log.info("=" * 50)
        log.info("TRANSFORM STAGE — START")

        df = extracted["tickets_df"]
        before = len(df)

        df_clean    = self.clean(df)
        df_enriched = self.enrich(df_clean)
        analytics   = self.build_analytics(df_enriched)

        analytics["etl_summary"]["dedup_removed"] = before - len(df_clean)

        log.info(f"TRANSFORM COMPLETE — {len(df_enriched)} clean tickets")
        log.info("=" * 50)

        return {
            "tickets_clean": df_enriched,
            "analytics":     analytics,
            "transform_timestamp": datetime.now().isoformat(),
        }
