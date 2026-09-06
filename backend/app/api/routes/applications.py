from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import json
import os
import shutil
from pathlib import Path
from app.db.database import get_db
from app.models.application import Application
from app.models.scheme import Scheme
from app.schemas.application import ApplicationResponse, StatusUpdate

router = APIRouter(prefix="/applications", tags=["applications"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/apply/{scheme_id}", response_model=ApplicationResponse)
async def submit_application(
    scheme_id: int,
    user_id: int = Form(...),
    form_data: str = Form(...),  # Received as stringified JSON from frontend
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    parsed_form_data = json.loads(form_data)
    uploaded_docs = {}

    # File validation against dynamic documents_schema
    req_docs = {doc["doc_name"]: doc for doc in scheme.documents_schema}

    for file in files:
        doc_key = file.filename.split("_")[0]  # Expected naming: DocName_filename.ext
        doc_rule = req_docs.get(doc_key)

        # Extension validation
        ext = file.filename.split(".")[-1].lower()
        if doc_rule and ext not in doc_rule["allowed_types"]:
            raise HTTPException(
                status_code=400, 
                detail=f"File {file.filename} extension not allowed. Allowed: {doc_rule['allowed_types']}"
            )

        # Save to disk
        file_path = UPLOAD_DIR / f"{user_id}_{scheme_id}_{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Check max size
        if doc_rule:
            size_mb = os.path.getsize(file_path) / (1024 * 1024)
            if size_mb > doc_rule["max_size_mb"]:
                os.remove(file_path)
                raise HTTPException(
                    status_code=400, 
                    detail=f"File {file.filename} exceeds max size of {doc_rule['max_size_mb']}MB"
                )

        uploaded_docs[doc_key] = str(file_path)

    application = Application(
        scheme_id=scheme_id,
        user_id=user_id,
        form_data=parsed_form_data,
        document_paths=uploaded_docs,
        status="Pending"
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application

@router.get("/user/{user_id}", response_model=List[ApplicationResponse])
def get_user_applications(user_id: int, db: Session = Depends(get_db)):
    return db.query(Application).filter(Application.user_id == user_id).all()

@router.get("/all", response_model=List[ApplicationResponse])
def get_all_applications(db: Session = Depends(get_db)):
    return db.query(Application).all()

@router.patch("/{app_id}/status", response_model=ApplicationResponse)
def update_application_status(app_id: int, status_data: StatusUpdate, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = status_data.status
    db.commit()
    db.refresh(app)
    return app