# Preflight Management System

A comprehensive web application for managing print shop preflight operations. Built with FastAPI (backend) and React (frontend).

## Features

### 1. Settings Management
- Configure folder paths for downloads, print-ready files, and revision folders
- Set preflight thresholds (DPI limits, dimension tolerance, bleed)
- Define material-specific rules (banner, vinyl, yard signs, etc.)
- Persistent JSON-based configuration
- Settings change history tracking

### 2. Logs Viewer
- View preflight processing logs in real-time
- Filter by date range, status (PASS/FAIL/WARNING), and customer
- Export logs to CSV for reporting
- Detailed view of check results and issues

### 3. Folder Monitor
- Live view of folders being processed
- Status indicators (pending, processing, approved, needs-revision)
- Manual trigger for reprocessing orders
- Automatic folder scanning

### 4. Manual Preflight
- Upload PDF files for immediate preflight checks
- Specify expected dimensions for validation
- View detailed results instantly
- Perfect for testing files before production

### 5. Dashboard
- Overview of recent activity
- Statistics on folder status and preflight checks
- Quick access to key metrics

## Architecture

```
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py      # Main FastAPI application
│   │   ├── database.py  # SQLAlchemy models and database setup
│   │   ├── models.py    # Pydantic models for API
│   │   ├── settings_manager.py    # Settings persistence
│   │   └── preflight_runner.py    # Preflight script integration
│   └── requirements.txt
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components (Layout, etc.)
│   │   ├── pages/       # Page components (Dashboard, Settings, etc.)
│   │   ├── services/    # API service layer
│   │   └── App.jsx      # Main application component
│   └── package.json
│
└── quick-preflight.py   # Preflight script (mock implementation)
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+ and npm
- Git

### Backend Setup

1. Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start the backend server:
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000
- API Documentation (Swagger): http://localhost:8000/docs
- Alternative docs (ReDoc): http://localhost:8000/redoc

### Frontend Setup

1. Install Node dependencies:
```bash
cd frontend
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

The UI will be available at http://localhost:3000

## API Endpoints

### Settings
- `GET /api/settings` - Get current settings
- `POST /api/settings` - Update settings
- `GET /api/settings/history` - Get settings change history

### Logs
- `GET /api/logs` - Get preflight logs (with filtering)
- `GET /api/logs/{log_id}` - Get specific log details
- `GET /api/logs/export/csv` - Export logs to CSV

### Folders
- `GET /api/folders` - List monitored folders
- `POST /api/folders/scan` - Scan for new folders in downloads directory

### Preflight
- `POST /api/preflight/{folder_id}` - Run preflight check on a folder
- `POST /api/preflight/manual` - Upload PDF for manual preflight
- `POST /api/reprocess/{folder_id}` - Reprocess a folder

### Dashboard
- `GET /api/dashboard/stats` - Get statistics for dashboard

## Database

The system uses SQLite for data persistence with three main tables:

- **preflight_logs**: Stores all preflight check results
- **folder_status**: Tracks folder processing status
- **settings_history**: Maintains settings change history

The database is automatically created on first run.

## Integration with Existing Systems

### OrderPilot Integration
The system expects OrderPilot to create folders with:
- `complete-order-data.json` - Order and customer information
- `artwork.pdf` - PDF file(s) to check

### n8n Workflow Integration
The backend can be triggered by n8n workflows using the API endpoints. Example workflow:
1. Watch for new folders in downloads directory
2. Call `POST /api/folders/scan` to register the folder
3. Call `POST /api/preflight/{folder_id}` to run preflight
4. Check results and move files accordingly

### Acrobat Integration
The `quick-preflight.py` script should be replaced with your actual preflight logic that:
- Calls Acrobat preflight profiles
- Analyzes PDF properties (DPI, dimensions, color spaces)
- Checks for production issues (bleed, cut paths, etc.)

## Configuration

### Folder Paths
Configure in Settings UI or edit `preflight-settings.json`:
```json
{
  "folder_paths": {
    "downloads": "/path/to/downloads",
    "print_ready": "/path/to/print-ready",
    "needs_revision": "/path/to/needs-revision",
    "acrobat_watched": "/path/to/acrobat-watched"
  }
}
```

### Preflight Thresholds
- **dimension_tolerance**: Allowed variance from expected dimensions (inches)
- **bleed_threshold**: Expected bleed size (inches)
- **min_dpi_warning**: DPI threshold for warnings
- **min_dpi_error**: DPI threshold for errors

### Material Rules
Define product-specific rules:
```json
{
  "material_rules": {
    "banner": {
      "min_dpi": 100,
      "requires_cut_path": false
    },
    "vinyl decal": {
      "min_dpi": 200,
      "requires_cut_path": true
    }
  }
}
```

## Development

### Running Tests
```bash
# Backend tests (when implemented)
cd backend
pytest

# Frontend tests (when implemented)
cd frontend
npm test
```

### Building for Production

Backend:
```bash
cd backend
# Use a production WSGI server like Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

Frontend:
```bash
cd frontend
npm run build
# Serve the dist/ directory with nginx or similar
```

## Customization

### Adding New Material Rules
1. Go to Settings page
2. Click "Add Material"
3. Enter material name
4. Configure DPI and cut path requirements

### Extending Preflight Checks
Modify `quick-preflight.py` to add:
- Custom validation rules
- Integration with other PDF tools
- Additional file format support

### Custom Email Templates
The system is designed to work with your existing email notification system. Results can be accessed via the API for integration.

## Troubleshooting

### Backend won't start
- Check that port 8000 is not in use
- Verify Python dependencies are installed
- Check `.env` file configuration

### Frontend won't connect to backend
- Ensure backend is running on port 8000
- Check CORS settings in `backend/app/main.py`
- Verify proxy configuration in `frontend/vite.config.js`

### Preflight checks failing
- Ensure `quick-preflight.py` is executable
- Check folder permissions
- Verify `complete-order-data.json` format

## Contributing

This is a custom internal tool. For modifications:
1. Create a feature branch
2. Test thoroughly with production data
3. Update documentation
4. Submit for review

## License

Internal use only - Print Shop Automation System

## Support

For issues or questions, contact your development team.

---

**Built with:**
- FastAPI - Modern Python web framework
- React - UI library
- SQLAlchemy - Database ORM
- Tailwind CSS - Utility-first CSS
- Lucide Icons - Beautiful icons
