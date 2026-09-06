from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime

class ApplicationResponse(BaseModel):
    id: int
    scheme_id: int
    user_id: int
    form_data: Dict[str, Any]
    document_paths: Dict[str, str]
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str  # "Approved" or "Rejected"