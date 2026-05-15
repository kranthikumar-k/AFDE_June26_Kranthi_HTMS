from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os

load_dotenv()

from database import engine, get_db
import models
import crud
from routers import tickets
from schemas import DashboardStats, CATEGORIES, PRIORITIES, STATUSES, DEPARTMENTS

# ── Create all tables ─────────────────────────────────────────
models.Base.metadata.create_all(bind=engine)

# ── FastAPI app ───────────────────────────────────────────────
app = FastAPI(
    title="Helpdesk Ticket Management System",
    description="REST API for managing IT support tickets",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include routers ───────────────────────────────────────────
app.include_router(tickets.router)

# ── Health check ──────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "message":     "Helpdesk Ticket Management System API",
        "version":     "1.0.0",
        "status":      "running",
        "docs":        "/docs",
    }

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy", "service": "Helpdesk API"}

# ── Dashboard stats ───────────────────────────────────────────
@app.get("/dashboard", response_model=DashboardStats, tags=["Dashboard"])
def get_dashboard(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)

# ── Search endpoint ───────────────────────────────────────────
@app.get("/search", tags=["Search"])
def search_tickets(
    q: str = Query(..., min_length=1, description="Search keyword"),
    db: Session = Depends(get_db),
):
    results = crud.search_tickets(db, keyword=q)
    return {
        "query":   q,
        "total":   len(results),
        "results": results,
    }

# ── Metadata endpoints ────────────────────────────────────────
@app.get("/meta/categories", tags=["Metadata"])
def get_categories():
    return {"categories": CATEGORIES}

@app.get("/meta/priorities", tags=["Metadata"])
def get_priorities():
    return {"priorities": PRIORITIES}

@app.get("/meta/statuses", tags=["Metadata"])
def get_statuses():
    return {"statuses": STATUSES}

@app.get("/meta/departments", tags=["Metadata"])
def get_departments():
    return {"departments": DEPARTMENTS}
