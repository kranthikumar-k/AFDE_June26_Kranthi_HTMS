from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

CATEGORIES = [
    "VPN Issue",
    "Password Reset",
    "Software Installation",
    "Laptop Issue",
    "Email Access",
    "Network Connectivity",
    "Hardware Request",
    "Other",
]

PRIORITIES = ["Low", "Medium", "High", "Critical"]
STATUSES   = ["Open", "In Progress", "Resolved", "Closed"]

DEPARTMENTS = [
    "Engineering", "HR", "Finance", "Operations",
    "Marketing", "Sales", "Legal", "IT Support", "Management", "Other",
]

# ── Create ────────────────────────────────────────────────────
class TicketCreate(BaseModel):
    employee_name:  str = Field(..., min_length=2, max_length=200)
    department:     str = Field(..., min_length=2, max_length=200)
    issue_category: str = Field(..., min_length=2, max_length=200)
    description:    str = Field(..., min_length=10)
    priority:       str = Field(default="Medium")

    class Config:
        json_schema_extra = {
            "example": {
                "employee_name":  "Kranthi Kumar",
                "department":     "Engineering",
                "issue_category": "VPN Issue",
                "description":    "Unable to connect to VPN since this morning.",
                "priority":       "High",
            }
        }

# ── Update ────────────────────────────────────────────────────
class TicketUpdate(BaseModel):
    employee_name:    Optional[str] = Field(None, min_length=2, max_length=200)
    department:       Optional[str] = None
    issue_category:   Optional[str] = None
    description:      Optional[str] = Field(None, min_length=10)
    priority:         Optional[str] = None
    status:           Optional[str] = None
    resolution_notes: Optional[str] = None

# ── Response ──────────────────────────────────────────────────
class TicketResponse(BaseModel):
    ticket_id:        int
    employee_name:    str
    department:       str
    issue_category:   str
    description:      str
    priority:         str
    status:           str
    resolution_notes: Optional[str] = None
    created_at:       Optional[datetime] = None
    updated_at:       Optional[datetime] = None

    class Config:
        from_attributes = True

# ── Dashboard stats ───────────────────────────────────────────
class DashboardStats(BaseModel):
    total_tickets:      int
    open_tickets:       int
    in_progress:        int
    resolved_tickets:   int
    closed_tickets:     int
    critical_tickets:   int
    high_tickets:       int
