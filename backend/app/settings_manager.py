"""Settings management module."""

import json
import os
from pathlib import Path
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session

from .models import PreflightSettings, MaterialRule, FolderPaths
from .database import SettingsHistory

SETTINGS_FILE = os.getenv("SETTINGS_FILE", "preflight-settings.json")


class SettingsManager:
    """Manages preflight settings persistence."""

    def __init__(self, settings_file: str = SETTINGS_FILE):
        self.settings_file = Path(settings_file)
        self._ensure_settings_file()

    def _ensure_settings_file(self):
        """Create default settings file if it doesn't exist."""
        if not self.settings_file.exists():
            default_settings = PreflightSettings(
                folder_paths=FolderPaths(
                    downloads="/downloads",
                    print_ready="/print-ready",
                    needs_revision="/needs-revision",
                    acrobat_watched="/acrobat-watched"
                ),
                dimension_tolerance=0.25,
                bleed_threshold=0.5,
                min_dpi_warning=150,
                min_dpi_error=72,
                material_rules={
                    "banner": MaterialRule(min_dpi=100, requires_cut_path=False),
                    "vinyl decal": MaterialRule(min_dpi=200, requires_cut_path=True),
                    "yard sign": MaterialRule(min_dpi=150, requires_cut_path=False),
                }
            )
            self.save_settings(default_settings)

    def load_settings(self) -> PreflightSettings:
        """Load settings from JSON file."""
        try:
            with open(self.settings_file, 'r') as f:
                data = json.load(f)
            return PreflightSettings(**data)
        except Exception as e:
            raise ValueError(f"Failed to load settings: {str(e)}")

    def save_settings(self, settings: PreflightSettings, db: Optional[Session] = None) -> None:
        """Save settings to JSON file and optionally log to database."""
        try:
            # Convert to dict and save to JSON
            settings_dict = settings.model_dump()

            with open(self.settings_file, 'w') as f:
                json.dump(settings_dict, f, indent=2)

            # Log to database if session provided
            if db:
                history_entry = SettingsHistory(
                    settings_json=json.dumps(settings_dict),
                    timestamp=datetime.utcnow()
                )
                db.add(history_entry)
                db.commit()
        except Exception as e:
            raise ValueError(f"Failed to save settings: {str(e)}")

    def get_settings_history(self, db: Session, limit: int = 10) -> list:
        """Get settings change history."""
        history = db.query(SettingsHistory).order_by(
            SettingsHistory.timestamp.desc()
        ).limit(limit).all()

        return [
            {
                "id": entry.id,
                "timestamp": entry.timestamp,
                "changed_by": entry.changed_by,
                "settings": json.loads(entry.settings_json)
            }
            for entry in history
        ]


# Global settings manager instance
settings_manager = SettingsManager()
