"""FastAPI main application."""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
from pathlib import Path
from datetime import datetime
import tempfile
import shutil

from .database import get_db, init_db, PreflightLog, FolderStatus
from .models import (
    PreflightSettings,
    LogFilter,
    LogEntry,
    FolderInfo,
    ManualPreflightRequest,
    PreflightResponse,
    PreflightStatus
)
from .settings_manager import settings_manager
from .preflight_runner import preflight_runner

# Initialize FastAPI app
app = FastAPI(
    title="Preflight Management API",
    description="API for managing print shop preflight operations",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()
    print("✓ Database initialized")
    print(f"✓ Settings file: {settings_manager.settings_file}")


# ============================================================================
# SETTINGS ENDPOINTS
# ============================================================================

@app.get("/api/settings", response_model=PreflightSettings)
async def get_settings():
    """Get current preflight settings."""
    try:
        return settings_manager.load_settings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/settings", response_model=PreflightSettings)
async def update_settings(
    settings: PreflightSettings,
    db: Session = Depends(get_db)
):
    """Update preflight settings."""
    try:
        settings_manager.save_settings(settings, db)
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/settings/history")
async def get_settings_history(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get settings change history."""
    try:
        return settings_manager.get_settings_history(db, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# LOGS ENDPOINTS
# ============================================================================

@app.get("/api/logs", response_model=List[LogEntry])
async def get_logs(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    status: Optional[PreflightStatus] = None,
    customer: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get preflight processing logs with optional filtering."""
    try:
        query = db.query(PreflightLog)

        # Apply filters
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(PreflightLog.timestamp >= start_dt)

        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(PreflightLog.timestamp <= end_dt)

        if status:
            query = query.filter(PreflightLog.overall_status == status.value)

        if customer:
            query = query.filter(PreflightLog.customer_name.ilike(f"%{customer}%"))

        # Order by timestamp descending and apply pagination
        query = query.order_by(PreflightLog.timestamp.desc())
        query = query.limit(limit).offset(offset)

        logs = query.all()

        # Convert to response format
        result = []
        for log in logs:
            log_entry = LogEntry(
                id=log.id,
                timestamp=log.timestamp,
                order_id=log.order_id,
                customer_name=log.customer_name,
                customer_email=log.customer_email,
                folder_path=log.folder_path,
                overall_status=log.overall_status,
                error_message=log.error_message,
                results=json.loads(log.results_json) if log.results_json else None
            )
            result.append(log_entry)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/logs/{log_id}", response_model=LogEntry)
async def get_log_detail(log_id: int, db: Session = Depends(get_db)):
    """Get detailed information for a specific log entry."""
    log = db.query(PreflightLog).filter(PreflightLog.id == log_id).first()

    if not log:
        raise HTTPException(status_code=404, detail="Log entry not found")

    return LogEntry(
        id=log.id,
        timestamp=log.timestamp,
        order_id=log.order_id,
        customer_name=log.customer_name,
        customer_email=log.customer_email,
        folder_path=log.folder_path,
        overall_status=log.overall_status,
        error_message=log.error_message,
        results=json.loads(log.results_json) if log.results_json else None
    )


@app.get("/api/logs/export/csv")
async def export_logs_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    status: Optional[PreflightStatus] = None,
    db: Session = Depends(get_db)
):
    """Export logs to CSV format."""
    # This would generate a CSV file - simplified version
    try:
        query = db.query(PreflightLog)

        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(PreflightLog.timestamp >= start_dt)

        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(PreflightLog.timestamp <= end_dt)

        if status:
            query = query.filter(PreflightLog.overall_status == status.value)

        logs = query.order_by(PreflightLog.timestamp.desc()).all()

        # Generate CSV content
        csv_lines = ["Timestamp,Order ID,Customer,Email,Status,Folder,Errors"]
        for log in logs:
            csv_lines.append(
                f"{log.timestamp},{log.order_id},{log.customer_name},"
                f"{log.customer_email or ''},{log.overall_status},"
                f"{log.folder_path},{log.error_message or ''}"
            )

        return {"csv": "\n".join(csv_lines)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# FOLDER MONITOR ENDPOINTS
# ============================================================================

@app.get("/api/folders", response_model=List[FolderInfo])
async def get_folders(
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get list of folders and their processing status."""
    try:
        query = db.query(FolderStatus)

        if status:
            query = query.filter(FolderStatus.status == status)

        query = query.order_by(FolderStatus.updated_at.desc()).limit(limit)
        folders = query.all()

        return [
            FolderInfo(
                folder_path=f.folder_path,
                order_id=f.order_id,
                customer_name=f.customer_name,
                status=f.status,
                created_at=f.created_at,
                updated_at=f.updated_at
            )
            for f in folders
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/folders/scan")
async def scan_folders(db: Session = Depends(get_db)):
    """Scan downloads folder for new orders."""
    try:
        settings = settings_manager.load_settings()
        downloads_path = Path(settings.folder_paths.downloads)

        if not downloads_path.exists():
            return {
                "success": False,
                "message": f"Downloads folder does not exist: {downloads_path}"
            }

        # Look for folders with complete-order-data.json
        scanned = 0
        added = 0

        for folder in downloads_path.iterdir():
            if not folder.is_dir():
                continue

            order_data_file = folder / "complete-order-data.json"
            if not order_data_file.exists():
                continue

            scanned += 1

            # Check if folder already tracked
            existing = db.query(FolderStatus).filter(
                FolderStatus.folder_path == str(folder)
            ).first()

            if existing:
                continue

            # Read order data
            try:
                with open(order_data_file, 'r') as f:
                    order_data = json.load(f)

                folder_status = FolderStatus(
                    folder_path=str(folder),
                    order_id=order_data.get("id", "unknown"),
                    customer_name=order_data.get("customer", {}).get("name", "Unknown"),
                    status="pending"
                )
                db.add(folder_status)
                added += 1

            except Exception as e:
                print(f"Error reading order data from {folder}: {e}")
                continue

        db.commit()

        return {
            "success": True,
            "scanned": scanned,
            "added": added
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# PREFLIGHT ENDPOINTS
# ============================================================================

@app.post("/api/preflight/{folder_id}", response_model=PreflightResponse)
async def run_preflight_check(folder_id: int, db: Session = Depends(get_db)):
    """Run preflight check on a specific folder."""
    try:
        # Get folder info
        folder = db.query(FolderStatus).filter(FolderStatus.id == folder_id).first()

        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")

        # Update status to processing
        folder.status = "processing"
        folder.updated_at = datetime.utcnow()
        db.commit()

        # Run preflight
        result = preflight_runner.run_preflight(folder.folder_path, db)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/preflight/manual", response_model=PreflightResponse)
async def manual_preflight(
    file: UploadFile = File(...),
    expected_width: Optional[float] = None,
    expected_height: Optional[float] = None,
    product_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Run manual preflight check on uploaded PDF."""
    try:
        # Create temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Save uploaded file
            pdf_path = temp_path / file.filename
            with open(pdf_path, 'wb') as f:
                shutil.copyfileobj(file.file, f)

            # Create a mock complete-order-data.json
            order_data = {
                "id": f"manual-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
                "customer": {
                    "name": "Manual Upload",
                    "email": "manual@test.com"
                },
                "order": {
                    "line_items": []
                }
            }

            if expected_width and expected_height:
                order_data["order"]["line_items"].append({
                    "product_type": product_type or "Manual Check",
                    "size": {
                        "width": expected_width,
                        "height": expected_height,
                        "unit": "in"
                    }
                })

            order_data_path = temp_path / "complete-order-data.json"
            with open(order_data_path, 'w') as f:
                json.dump(order_data, f)

            # Run preflight
            result = preflight_runner.run_preflight(str(temp_path), db)

            return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/reprocess/{folder_id}", response_model=PreflightResponse)
async def reprocess_folder(folder_id: int, db: Session = Depends(get_db)):
    """Reprocess a folder (alias for run_preflight_check)."""
    return await run_preflight_check(folder_id, db)


# ============================================================================
# DASHBOARD / STATS ENDPOINTS
# ============================================================================

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    try:
        # Count folders by status
        total_folders = db.query(FolderStatus).count()
        pending = db.query(FolderStatus).filter(FolderStatus.status == "pending").count()
        processing = db.query(FolderStatus).filter(FolderStatus.status == "processing").count()
        approved = db.query(FolderStatus).filter(FolderStatus.status == "approved").count()
        needs_revision = db.query(FolderStatus).filter(FolderStatus.status == "needs-revision").count()

        # Count logs by status
        total_checks = db.query(PreflightLog).count()
        passed = db.query(PreflightLog).filter(PreflightLog.overall_status == "PASS").count()
        warnings = db.query(PreflightLog).filter(PreflightLog.overall_status == "WARNING").count()
        failed = db.query(PreflightLog).filter(PreflightLog.overall_status == "FAIL").count()

        # Recent activity
        recent_logs = db.query(PreflightLog).order_by(
            PreflightLog.timestamp.desc()
        ).limit(5).all()

        return {
            "folders": {
                "total": total_folders,
                "pending": pending,
                "processing": processing,
                "approved": approved,
                "needs_revision": needs_revision
            },
            "checks": {
                "total": total_checks,
                "passed": passed,
                "warnings": warnings,
                "failed": failed
            },
            "recent_activity": [
                {
                    "timestamp": log.timestamp,
                    "customer": log.customer_name,
                    "status": log.overall_status
                }
                for log in recent_logs
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
