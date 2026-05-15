from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas import TicketCreate, TicketUpdate, TicketResponse, DashboardStats
import crud

router = APIRouter(prefix="/tickets", tags=["Tickets"])

# ── GET /tickets ──────────────────────────────────────────────
@router.get("/", response_model=List[TicketResponse])
def get_all_tickets(
    skip:     int            = Query(default=0,   ge=0),
    limit:    int            = Query(default=100, le=500),
    status:   Optional[str] = Query(default=None),
    priority: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    return crud.get_tickets(db, skip=skip, limit=limit, status=status, priority=priority, category=category)

# ── GET /tickets/count ────────────────────────────────────────
@router.get("/count")
def get_count(
    status:   Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    count = crud.get_tickets_count(db, status=status, priority=priority, category=category)
    return {"count": count}

# ── GET /tickets/{id} ─────────────────────────────────────────
@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket #{ticket_id} not found")
    return ticket

# ── POST /tickets ─────────────────────────────────────────────
@router.post("/", response_model=TicketResponse, status_code=201)
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    return crud.create_ticket(db, ticket)

# ── PUT /tickets/{id} ─────────────────────────────────────────
@router.put("/{ticket_id}", response_model=TicketResponse)
def update_ticket(ticket_id: int, ticket: TicketUpdate, db: Session = Depends(get_db)):
    updated = crud.update_ticket(db, ticket_id, ticket)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Ticket #{ticket_id} not found")
    return updated

# ── DELETE /tickets/{id} ──────────────────────────────────────
@router.delete("/{ticket_id}")
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_ticket(db, ticket_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Ticket #{ticket_id} not found")
    return {"message": f"Ticket #{ticket_id} deleted successfully"}
