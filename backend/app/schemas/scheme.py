from pydantic import BaseModel
from typing import List, Optional, Any

class DynamicFieldRule(BaseModel):
    name: str                   # e.g. "mobile_number", "annual_turnover"
    label: str                  # e.g. "Enter Mobile Number"
    field_type: str             # "text", "number", "email", "date"
    required: bool = True
    validation_regex: Optional[str] = None  # e.g. "^[0-9]{10}$" for phone
    min_value: Optional[float] = None
    max_value: Optional[float] = None

class DynamicDocumentRule(BaseModel):
    doc_name: str               # e.g. "Aadhar Card", "Factory License"
    allowed_types: List[str]    # e.g. ["pdf", "jpg", "png"]
    max_size_mb: int = 5        # file size limit in MB
    required: bool = True

class SchemeCreate(BaseModel):
    title: str
    description: str
    fields_schema: List[DynamicFieldRule]
    documents_schema: List[DynamicDocumentRule]

class SchemeResponse(BaseModel):
    id: int
    title: str
    description: str
    fields_schema: List[Any]
    documents_schema: List[Any]

    class Config:
        from_attributes = True