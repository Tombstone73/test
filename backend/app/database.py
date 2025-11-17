"""Database configuration and models."""

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./preflight.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class PreflightLog(Base):
    """Stores preflight processing logs."""
    __tablename__ = "preflight_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    order_id = Column(String, index=True)
    customer_name = Column(String, index=True)
    customer_email = Column(String)
    folder_path = Column(String)
    overall_status = Column(String, index=True)  # PASS, FAIL, WARNING
    results_json = Column(Text)  # JSON string of full results
    error_message = Column(Text, nullable=True)


class FolderStatus(Base):
    """Tracks folder processing status."""
    __tablename__ = "folder_status"

    id = Column(Integer, primary_key=True, index=True)
    folder_path = Column(String, unique=True, index=True)
    order_id = Column(String, index=True)
    customer_name = Column(String)
    status = Column(String, index=True)  # pending, processing, approved, needs-revision, error
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_preflight_id = Column(Integer, nullable=True)  # References PreflightLog


class SettingsHistory(Base):
    """Stores settings change history."""
    __tablename__ = "settings_history"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    settings_json = Column(Text)
    changed_by = Column(String, default="user")


def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
