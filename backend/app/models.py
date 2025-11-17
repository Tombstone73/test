"""Pydantic models for API requests/responses."""

from pydantic import BaseModel, Field, EmailStr
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum


class PreflightStatus(str, Enum):
    """Preflight status values."""
    PASS = "PASS"
    FAIL = "FAIL"
    WARNING = "WARNING"


class FolderStatusEnum(str, Enum):
    """Folder processing status."""
    PENDING = "pending"
    PROCESSING = "processing"
    APPROVED = "approved"
    NEEDS_REVISION = "needs-revision"
    ERROR = "error"


class MaterialRule(BaseModel):
    """Material-specific preflight rules."""
    min_dpi: int = 150
    requires_cut_path: bool = False
    custom_checks: Optional[Dict[str, Any]] = None


class FolderPaths(BaseModel):
    """Folder path configuration."""
    downloads: str = Field(..., description="Folder where orders are downloaded")
    print_ready: str = Field(..., description="Folder for approved files")
    needs_revision: str = Field(..., description="Folder for files needing revision")
    acrobat_watched: str = Field(..., description="Folder watched by Acrobat")


class PreflightSettings(BaseModel):
    """Preflight configuration settings."""
    folder_paths: FolderPaths
    dimension_tolerance: float = Field(0.25, description="Allowed dimension variance in inches")
    bleed_threshold: float = Field(0.5, description="Expected bleed in inches")
    min_dpi_warning: int = Field(150, description="DPI threshold for warnings")
    min_dpi_error: int = Field(72, description="DPI threshold for errors")
    material_rules: Dict[str, MaterialRule] = Field(
        default_factory=dict,
        description="Product-specific preflight rules"
    )


class PreflightResult(BaseModel):
    """Individual file preflight result."""
    status: PreflightStatus
    file_name: str
    pdf_width: Optional[float] = None
    pdf_height: Optional[float] = None
    dimension_match: bool = True
    has_magenta: bool = False
    avg_dpi: Optional[int] = None
    errors: List[str] = []
    warnings: List[str] = []


class PreflightResponse(BaseModel):
    """Complete preflight check response."""
    success: bool
    overall_status: PreflightStatus
    order_id: str
    customer_name: str
    customer_email: Optional[EmailStr] = None
    results: List[PreflightResult]
    error_message: Optional[str] = None


class LogFilter(BaseModel):
    """Filter parameters for logs."""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[PreflightStatus] = None
    customer: Optional[str] = None
    limit: int = Field(100, le=1000)
    offset: int = 0


class LogEntry(BaseModel):
    """Log entry response."""
    id: int
    timestamp: datetime
    order_id: str
    customer_name: str
    customer_email: Optional[str]
    folder_path: str
    overall_status: str
    results: Optional[List[PreflightResult]] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class FolderInfo(BaseModel):
    """Folder information response."""
    folder_path: str
    order_id: str
    customer_name: str
    status: FolderStatusEnum
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ManualPreflightRequest(BaseModel):
    """Request for manual preflight check."""
    expected_width: Optional[float] = None
    expected_height: Optional[float] = None
    product_type: Optional[str] = None
