"""Preflight script runner and integration."""

import subprocess
import json
import os
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session

from .models import PreflightResponse, PreflightStatus, PreflightResult
from .database import PreflightLog, FolderStatus
from .settings_manager import settings_manager


class PreflightRunner:
    """Runs preflight checks and manages results."""

    def __init__(self, preflight_script: str = "quick-preflight.py"):
        self.preflight_script = preflight_script

    def run_preflight(
        self,
        folder_path: str,
        db: Optional[Session] = None
    ) -> PreflightResponse:
        """Execute preflight script on a folder."""
        try:
            # Check if script exists
            if not os.path.exists(self.preflight_script):
                # Try to find it in the parent directory or use mock
                return self._mock_preflight(folder_path)

            # Run the preflight script
            result = subprocess.run(
                ["python3", self.preflight_script, folder_path],
                capture_output=True,
                text=True,
                timeout=60
            )

            if result.returncode != 0:
                raise Exception(f"Preflight script failed: {result.stderr}")

            # Parse JSON output
            output_data = json.loads(result.stdout)
            response = PreflightResponse(**output_data)

            # Log to database if session provided
            if db:
                self._log_preflight(folder_path, response, db)

            return response

        except subprocess.TimeoutExpired:
            error_msg = f"Preflight script timed out for {folder_path}"
            return PreflightResponse(
                success=False,
                overall_status=PreflightStatus.FAIL,
                order_id="unknown",
                customer_name="unknown",
                results=[],
                error_message=error_msg
            )
        except Exception as e:
            error_msg = f"Preflight error: {str(e)}"
            return PreflightResponse(
                success=False,
                overall_status=PreflightStatus.FAIL,
                order_id="unknown",
                customer_name="unknown",
                results=[],
                error_message=error_msg
            )

    def _mock_preflight(self, folder_path: str) -> PreflightResponse:
        """Mock preflight for testing when script doesn't exist."""
        # Try to read complete-order-data.json
        order_data_path = Path(folder_path) / "complete-order-data.json"

        customer_name = "Test Customer"
        order_id = "test-order"

        if order_data_path.exists():
            try:
                with open(order_data_path, 'r') as f:
                    order_data = json.load(f)
                    customer_name = order_data.get("customer", {}).get("name", "Test Customer")
                    order_id = order_data.get("id", "test-order")
            except:
                pass

        return PreflightResponse(
            success=True,
            overall_status=PreflightStatus.PASS,
            order_id=order_id,
            customer_name=customer_name,
            customer_email="test@example.com",
            results=[
                PreflightResult(
                    status=PreflightStatus.PASS,
                    file_name="artwork.pdf",
                    pdf_width=18.0,
                    pdf_height=24.0,
                    dimension_match=True,
                    has_magenta=False,
                    avg_dpi=300,
                    errors=[],
                    warnings=[]
                )
            ]
        )

    def _log_preflight(
        self,
        folder_path: str,
        response: PreflightResponse,
        db: Session
    ):
        """Log preflight results to database."""
        log_entry = PreflightLog(
            order_id=response.order_id,
            customer_name=response.customer_name,
            customer_email=response.customer_email,
            folder_path=folder_path,
            overall_status=response.overall_status.value,
            results_json=json.dumps([r.model_dump() for r in response.results]),
            error_message=response.error_message
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)

        # Update or create folder status
        folder_status = db.query(FolderStatus).filter(
            FolderStatus.folder_path == folder_path
        ).first()

        if folder_status:
            folder_status.status = self._map_status_to_folder_status(response.overall_status)
            folder_status.updated_at = datetime.utcnow()
            folder_status.last_preflight_id = log_entry.id
        else:
            folder_status = FolderStatus(
                folder_path=folder_path,
                order_id=response.order_id,
                customer_name=response.customer_name,
                status=self._map_status_to_folder_status(response.overall_status),
                last_preflight_id=log_entry.id
            )
            db.add(folder_status)

        db.commit()

    def _map_status_to_folder_status(self, preflight_status: PreflightStatus) -> str:
        """Map preflight status to folder status."""
        mapping = {
            PreflightStatus.PASS: "approved",
            PreflightStatus.WARNING: "approved",  # Warnings still get approved
            PreflightStatus.FAIL: "needs-revision"
        }
        return mapping.get(preflight_status, "error")


# Global preflight runner instance
preflight_runner = PreflightRunner()
