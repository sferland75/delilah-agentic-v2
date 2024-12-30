from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from database.session import Base
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    THERAPIST = "therapist"
    SUPERVISOR = "supervisor"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLAlchemyEnum(UserRole), nullable=False, default=UserRole.THERAPIST)
    is_active = Column(Boolean, default=True)
    license_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    patients = relationship("Patient", back_populates="therapist", cascade="all, delete-orphan", lazy="dynamic")
    assessments = relationship("Assessment", back_populates="therapist", cascade="all, delete-orphan", lazy="dynamic")
    reports = relationship("Report", back_populates="therapist", cascade="all, delete-orphan", lazy="dynamic")

    def __repr__(self):
        return f"<User {self.email}>"

    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "full_name": self.full_name,
            "role": self.role.value if isinstance(self.role, UserRole) else self.role,
            "is_active": self.is_active,
            "license_number": self.license_number,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }