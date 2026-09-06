from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.scheme import Scheme
from app.schemas.scheme import SchemeCreate, SchemeResponse

router = APIRouter(prefix="/schemes", tags=["schemes"])

@router.post("/", response_model=SchemeResponse)
def create_scheme(scheme_data: SchemeCreate, db: Session = Depends(get_db)):
    scheme = Scheme(
        title=scheme_data.title,
        description=scheme_data.description,
        fields_schema=[f.dict() for f in scheme_data.fields_schema],
        documents_schema=[d.dict() for d in scheme_data.documents_schema]
    )
    db.add(scheme)
    db.commit()
    db.refresh(scheme)
    return scheme

@router.get("/", response_model=List[SchemeResponse])
def get_all_schemes(db: Session = Depends(get_db)):
    return db.query(Scheme).all()

@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme_by_id(scheme_id: int, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme