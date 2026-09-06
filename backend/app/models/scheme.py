from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from app.db.database import Base

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    # Stores field definitions: e.g., [{"name": "phone", "type": "number", "validation": "^[0-9]{10}$"}, ...]
    fields_schema = Column(JSONB, nullable=False) 
    # Stores required documents: e.g., [{"doc_name": "Aadhar", "allowed_types": ["pdf", "jpg"], "max_size_mb": 2}]
    documents_schema = Column(JSONB, nullable=False)