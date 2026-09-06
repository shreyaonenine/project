from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
import enum
from app.db.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"
    GOV_EMPLOYEE = "gov_employee"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.USER, nullable=False)