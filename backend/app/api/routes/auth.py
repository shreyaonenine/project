from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.db.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

class RoleUpdateRequest(BaseModel):
    role: str  # "gov_employee" or "user"

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Force any regular sign-up to default role 'user'
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        role=UserRole.USER
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "role": user.role, "user_id": user.id}

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "role": user.role, "user_id": user.id}

@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(user_id: int, req: RoleUpdateRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if req.role not in [UserRole.USER, UserRole.GOV_EMPLOYEE]:
        raise HTTPException(status_code=400, detail="Invalid target role")
    
    user.role = req.role
    db.commit()
    db.refresh(user)
    return user