from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Stores user answers corresponding to the scheme fields: {"phone": "9876543210", ...}
    form_data = Column(JSONB, nullable=False)
    
    # Stores paths to uploaded documents: {"Aadhar": "/uploads/aadhar_123.pdf", ...}
    document_paths = Column(JSONB, nullable=False)
    
    status = Column(String, default="Pending", nullable=False) # Pending, Approved, Rejected
    submitted_at = Column(DateTime, default=datetime.utcnow)