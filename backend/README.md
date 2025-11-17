# Preflight Management Backend

FastAPI backend for the Print Shop Preflight Management System.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Run the server:
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or:
```bash
python -m app.main
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

### Settings
- `GET /api/settings` - Get current settings
- `POST /api/settings` - Update settings
- `GET /api/settings/history` - Get settings history

### Logs
- `GET /api/logs` - Get preflight logs (with filtering)
- `GET /api/logs/{log_id}` - Get specific log details
- `GET /api/logs/export/csv` - Export logs to CSV

### Folders
- `GET /api/folders` - List monitored folders
- `POST /api/folders/scan` - Scan for new folders

### Preflight
- `POST /api/preflight/{folder_id}` - Run preflight on folder
- `POST /api/preflight/manual` - Upload PDF for manual check
- `POST /api/reprocess/{folder_id}` - Reprocess a folder

### Dashboard
- `GET /api/dashboard/stats` - Get statistics for dashboard

## Database

SQLite database is automatically created on first run.

Tables:
- `preflight_logs` - Preflight check results
- `folder_status` - Folder processing status
- `settings_history` - Settings change history
