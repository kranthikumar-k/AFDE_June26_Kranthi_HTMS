from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    ticket_id        = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_name    = Column(String(200), nullable=False)
    department       = Column(String(200), nullable=False)
    issue_category   = Column(String(200), nullable=False)
    description      = Column(Text, nullable=False)
    priority         = Column(String(50), nullable=False, default="Medium")
    status           = Column(String(50), nullable=False, default="Open")
    resolution_notes = Column(Text, nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
