from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.db.database import engine, Base, SessionLocal
import app.models.user
import app.models.scheme
import app.models.application

from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.api.routes import auth, schemes, applications

# Auto-create tables in PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Industrial Approvals & Compliance API")

# Seed default admin user on server startup
@app.on_event("startup")
def seed_default_admin():
    db = SessionLocal()
    try:
        admin_email = "admin@portal.gov.in"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if not existing_admin:
            default_admin = User(
                email=admin_email,
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN
            )
            db.add(default_admin)
            db.commit()
            print("INFO: Default admin created: admin@portal.gov.in / admin123")
    finally:
        db.close()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(schemes.router)
app.include_router(applications.router)

@app.get("/")
def root():
    return {"message": "API is operational"}