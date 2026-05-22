"""
Helpdesk Phase 2 -- Analytics Router
Serves ETL output as REST endpoints.
"""
import os, json
from fastapi import APIRouter
import pandas as pd

router = APIRouter(prefix="/analytics", tags=["Analytics (Phase 2)"])

# analytics.py is at: htms/backend/routers/analytics.py
# dirname x3 goes: routers -> backend -> htms -> htms (project root)
ROOT   = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUTPUT = os.path.join(ROOT, "data", "output")
PROC   = os.path.join(ROOT, "data", "processed")


def read_json(folder: str, name: str):
    path = os.path.join(folder, f"{name}.json")
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def read_csv(folder: str, name: str):
    path = os.path.join(folder, f"{name}.csv")
    if not os.path.exists(path):
        return None
    df = pd.read_csv(path)
    return df.where(pd.notnull(df), None).to_dict(orient="records")


# -- Dashboard summary ------------------------------------------------
@router.get("/dashboard")
def analytics_dashboard():
    summary  = read_json(OUTPUT, "etl_summary")
    cat      = read_json(OUTPUT, "category_analysis")
    priority = read_json(OUTPUT, "priority_distribution")
    dept     = read_json(OUTPUT, "department_analysis")

    if not summary:
        return {"error": "ETL data not found. Run: python etl/jobs/run_etl.py"}

    return {
        "success": True,
        "kpis": {
            "total_tickets":        summary["total_tickets"],
            "open_tickets":         summary["open_tickets"],
            "resolved_tickets":     summary["resolved_tickets"],
            "critical_tickets":     summary["critical_tickets"],
            "sla_breaches":         summary["sla_breaches"],
            "avg_resolution_hours": summary["avg_resolution_hours"],
            "top_category":         summary["top_category"],
            "top_department":       summary["top_department"],
            "last_etl_run":         summary["etl_run_id"],
        },
        "top_categories":  (cat      or [])[:5],
        "priority_summary":(priority or []),
        "top_departments": (dept     or [])[:5],
    }


# -- Category analysis ------------------------------------------------
@router.get("/categories")
def category_analysis():
    data = read_json(OUTPUT, "category_analysis")
    if not data:
        return {"error": "No data. Run ETL first."}
    return {"success": True, "categories": data}


# -- Priority distribution --------------------------------------------
@router.get("/priorities")
def priority_distribution():
    data = read_json(OUTPUT, "priority_distribution")
    if not data:
        return {"error": "No data. Run ETL first."}
    return {"success": True, "priorities": data}


# -- Department analysis ----------------------------------------------
@router.get("/departments")
def department_analysis():
    data = read_json(OUTPUT, "department_analysis")
    if not data:
        return {"error": "No data. Run ETL first."}
    return {"success": True, "departments": data}


# -- Monthly trend ----------------------------------------------------
@router.get("/monthly-trend")
def monthly_trend():
    data = read_json(OUTPUT, "monthly_trend")
    if not data:
        return {"error": "No data. Run ETL first."}
    return {"success": True, "trend": data}


# -- Resolution time distribution -------------------------------------
@router.get("/resolution-time")
def resolution_time():
    data = read_json(OUTPUT, "resolution_time_distribution")
    if not data:
        return {"error": "No data. Run ETL first."}
    return {"success": True, "distribution": data}


# -- Status summary ---------------------------------------------------
@router.get("/status-summary")
def status_summary():
    data = read_json(OUTPUT, "status_summary")
    if not data:
        return {"error": "No data. Run ETL first."}
    return {"success": True, "statuses": data}


# -- Top employees ----------------------------------------------------
@router.get("/top-employees")
def top_employees():
    data = read_json(OUTPUT, "top_employees")
    if not data:
        return {"error": "No data. Run ETL first."}
    return {"success": True, "employees": data}


# -- Category groups --------------------------------------------------
@router.get("/category-groups")
def category_groups():
    data = read_json(OUTPUT, "category_group_summary")
    if not data:
        return {"error": "No data. Run ETL first."}
    return {"success": True, "groups": data}


# -- ETL status -------------------------------------------------------
@router.get("/etl-status")
def etl_status():
    summary = read_json(OUTPUT, "etl_summary")
    if not summary:
        return {"error": "No ETL run found. Run: python etl/jobs/run_etl.py"}
    return {"success": True, "etl": summary}