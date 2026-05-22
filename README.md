# Helpdesk Ticket Management System — Phase 2
## ETL Pipeline & Analytics Dashboard

---

## ETL Workflow

```
datasets/tickets_dataset.csv        ← 220 ticket records (input)
         │
         ▼
etl/extract/extractor.py            ← STAGE 1: EXTRACT
  - Reads tickets_dataset.csv
  - Validates schema and required columns
  - Detects duplicate records (20 found)
         │
         ▼
etl/transform/transformer.py        ← STAGE 2: TRANSFORM
  - Normalises text fields and dates
  - Removes 10 duplicate tickets
  - Maps categories to groups
  - Computes resolution time in hours
  - Checks SLA compliance per priority
  - Extracts month/week/hour from timestamps
  - Builds 8 analytics summary tables
         │
         ▼
etl/load/loader.py                  ← STAGE 3: LOAD
  - Writes tickets_clean.csv/json → data/processed/
  - Writes 8 analytics tables → data/output/
  - Writes etl_summary.json
         │
         ▼
backend/routers/analytics.py        ← REST API
  - Serves all 8 analytics tables as JSON endpoints
         │
         ▼
frontend/src/pages/AnalyticsDashboard.js  ← UI
  - 5-tab analytics dashboard
```

---

## Dataset

`datasets/tickets_dataset.csv` — 220 tickets with fields:
- ticket_id, employee_name, department, issue_category
- description, priority, status, resolution_notes
- created_at, resolved_at, is_duplicate, source

---

## How to Run Phase 2

```bash
# Install ETL dependencies
pip install -r requirements_etl.txt

# Generate dataset
python scripts/generate_dataset.py

# Run ETL pipeline
python etl/jobs/run_etl.py

# Start backend (from backend/)
uvicorn main:app --reload --port 8000

# Start frontend (from frontend/)
npm start
```

Open `http://localhost:3000/analytics` for the ETL dashboard.

---

## Analytics API Endpoints

| Endpoint | Description |
|---|---|
| GET /analytics/dashboard | KPI summary |
| GET /analytics/categories | Most common issue categories |
| GET /analytics/priorities | Priority distribution + SLA |
| GET /analytics/departments | Department-wise ticket counts |
| GET /analytics/monthly-trend | Monthly creation trends |
| GET /analytics/resolution-time | Resolution time buckets |
| GET /analytics/status-summary | Status breakdown |
| GET /analytics/top-employees | Top ticket submitters |
| GET /analytics/etl-status | Last ETL run info |
