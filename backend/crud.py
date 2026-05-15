from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import Ticket
from schemas import TicketCreate, TicketUpdate
from typing import Optional

# ── Get all tickets ───────────────────────────────────────────
def get_tickets(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
):
    query = db.query(Ticket)
    if status:   query = query.filter(Ticket.status == status)
    if priority: query = query.filter(Ticket.priority == priority)
    if category: query = query.filter(Ticket.issue_category == category)
    return query.order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()

# ── Get total count ───────────────────────────────────────────
def get_tickets_count(
    db: Session,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
):
    query = db.query(Ticket)
    if status:   query = query.filter(Ticket.status == status)
    if priority: query = query.filter(Ticket.priority == priority)
    if category: query = query.filter(Ticket.issue_category == category)
    return query.count()

# ── Get single ticket ─────────────────────────────────────────
def get_ticket(db: Session, ticket_id: int):
    return db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()

# ── Create ticket ─────────────────────────────────────────────
def create_ticket(db: Session, ticket: TicketCreate):
    db_ticket = Ticket(
        employee_name  = ticket.employee_name,
        department     = ticket.department,
        issue_category = ticket.issue_category,
        description    = ticket.description,
        priority       = ticket.priority,
        status         = "Open",
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

# ── Update ticket ─────────────────────────────────────────────
def update_ticket(db: Session, ticket_id: int, ticket: TicketUpdate):
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return None
    update_data = ticket.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

# ── Delete ticket ─────────────────────────────────────────────
def delete_ticket(db: Session, ticket_id: int):
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return False
    db.delete(db_ticket)
    db.commit()
    return True

# ── Search tickets ────────────────────────────────────────────
def search_tickets(db: Session, keyword: str):
    return db.query(Ticket).filter(
        or_(
            Ticket.description.ilike(f"%{keyword}%"),
            Ticket.employee_name.ilike(f"%{keyword}%"),
            Ticket.issue_category.ilike(f"%{keyword}%"),
            Ticket.department.ilike(f"%{keyword}%"),
            Ticket.resolution_notes.ilike(f"%{keyword}%"),
        )
    ).order_by(Ticket.created_at.desc()).all()

# ── Dashboard stats ───────────────────────────────────────────
def get_dashboard_stats(db: Session):
    total    = db.query(Ticket).count()
    open_t   = db.query(Ticket).filter(Ticket.status == "Open").count()
    inprog   = db.query(Ticket).filter(Ticket.status == "In Progress").count()
    resolved = db.query(Ticket).filter(Ticket.status == "Resolved").count()
    closed   = db.query(Ticket).filter(Ticket.status == "Closed").count()
    critical = db.query(Ticket).filter(Ticket.priority == "Critical").count()
    high     = db.query(Ticket).filter(Ticket.priority == "High").count()
    return {
        "total_tickets":    total,
        "open_tickets":     open_t,
        "in_progress":      inprog,
        "resolved_tickets": resolved,
        "closed_tickets":   closed,
        "critical_tickets": critical,
        "high_tickets":     high,
    }
