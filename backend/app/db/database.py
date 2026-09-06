import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Replace with your local Postgres credentials if needed: "postgresql://username:password@localhost:5432/industrial_portal_db"
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:admin@localhost:5433/industrial_portal_db"
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()