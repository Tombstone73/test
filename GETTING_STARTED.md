# Getting Started with Preflight Management System

## What You Have

A complete web application for managing your print shop preflight operations. The system includes:

1. **Backend API** (FastAPI) - Handles all business logic, database operations, and preflight script execution
2. **Frontend UI** (React) - Clean, modern interface for managing settings and monitoring operations
3. **Mock Preflight Script** - Template that can be replaced with your actual Acrobat-based preflight logic

## First Steps

### Quick Start (One Command)

The easiest way to start everything:

```bash
./start.sh
```

This single command will:
- ✓ Start the backend server (http://localhost:8000)
- ✓ Start the frontend dev server (http://localhost:3000)
- ✓ Show live logs from both services
- ✓ Handle graceful shutdown with Ctrl+C

**Alternative: Start Services Individually**

If you prefer separate terminals:

**Terminal 1 - Backend:**
```bash
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
./start-frontend.sh
```

Once running:
- Frontend UI: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Initial Configuration

### Step 1: Configure Settings

1. Open http://localhost:3000/settings
2. Update **Folder Paths**:
   - Downloads: Where OrderPilot places new orders
   - Print Ready: Where approved files should go
   - Needs Revision: Where rejected files should go
   - Acrobat Watched: Folder monitored by Acrobat (if using)

3. Adjust **Preflight Thresholds**:
   - Dimension Tolerance: How much variance is acceptable (default: 0.25")
   - Bleed Threshold: Expected bleed size (default: 0.5")
   - Min DPI Warning: DPI that triggers warnings (default: 150)
   - Min DPI Error: DPI that causes rejection (default: 72)

4. Add **Material Rules**:
   - Click "Add Material"
   - Enter product type (e.g., "Banner", "Vinyl Decal")
   - Set specific DPI requirements
   - Check if cut path is required

5. Click **Save Settings**

### Step 2: Test with Manual Preflight

1. Go to http://localhost:3000/manual
2. Upload a test PDF
3. Optionally specify expected dimensions
4. Click "Run Preflight Check"
5. Review the results

This uses the mock preflight script. Results will always show PASS with 300 DPI until you integrate your actual preflight logic.

## Integration with Your Workflow

### Replace Mock Preflight Script

The included `quick-preflight.py` is a mock implementation. Replace it with your actual preflight logic that:

1. Reads the folder path passed as argument
2. Analyzes PDFs using Acrobat or other tools
3. Checks dimensions, DPI, color spaces, bleed, etc.
4. Outputs JSON in this format:

```json
{
  "success": true,
  "overall_status": "PASS|FAIL|WARNING",
  "order_id": "...",
  "customer_name": "...",
  "customer_email": "...",
  "results": [
    {
      "status": "PASS",
      "file_name": "artwork.pdf",
      "pdf_width": 18.0,
      "pdf_height": 24.0,
      "dimension_match": true,
      "has_magenta": false,
      "avg_dpi": 300,
      "errors": [],
      "warnings": []
    }
  ]
}
```

### Connect to n8n Workflow

Your n8n workflow can call the API to:

1. **Scan for new folders**:
   ```
   POST http://localhost:8000/api/folders/scan
   ```

2. **Get folder list**:
   ```
   GET http://localhost:8000/api/folders
   ```

3. **Run preflight on specific folder**:
   ```
   POST http://localhost:8000/api/preflight/{folder_id}
   ```

4. **Check results**:
   ```
   GET http://localhost:8000/api/logs
   ```

### Test with Sample Data

Create a test order folder:

```bash
mkdir -p /tmp/test-order
cat > /tmp/test-order/complete-order-data.json <<EOF
{
  "id": "test-123",
  "cleanSender": "Test Customer",
  "cleanSubject": "Test Sign",
  "finalDirLinux": "/tmp/test-order",
  "customer": {
    "name": "Test Customer",
    "email": "test@example.com",
    "phone": "(555) 123-4567"
  },
  "order": {
    "line_items": [
      {
        "product_type": "Yard Sign 18x24",
        "size": {
          "width": 18.0,
          "height": 24.0,
          "unit": "in"
        },
        "quantity": 1
      }
    ]
  }
}
EOF

# Add a sample PDF (you'll need a real PDF file)
cp /path/to/sample.pdf /tmp/test-order/artwork.pdf
```

Then in the UI:
1. Go to Folders
2. Click "Scan Folders" (update settings first to point to /tmp)
3. Click "Reprocess" on the test order
4. View results in Logs

## Understanding the UI

### Dashboard
- Shows statistics on folder status and preflight checks
- Displays recent activity
- Quick overview of system health

### Settings
- **Priority #1** - Configure this first
- All settings saved to `preflight-settings.json`
- Changes are logged in database for audit trail

### Logs
- View all preflight check history
- Filter by date, customer, or status
- Export to CSV for reporting
- Click any row for detailed results

### Folders
- See all orders being tracked
- Status indicators show processing state
- Reprocess any folder manually
- Scan button finds new orders

### Manual Check
- Upload PDFs for testing
- Great for checking files before production
- No need for complete order structure
- Instant results

## Production Deployment

For production use:

1. **Backend**: Use Gunicorn or similar WSGI server
   ```bash
   cd backend
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Frontend**: Build and serve with nginx
   ```bash
   cd frontend
   npm run build
   # Serve dist/ folder with nginx or similar
   ```

3. **Database**: SQLite works for most shops, but you can switch to PostgreSQL by changing DATABASE_URL in .env

4. **Security**: Add authentication, HTTPS, and firewall rules

## Troubleshooting

### Backend won't start
- Check that Python 3.8+ is installed
- Ensure port 8000 is available
- Check `backend/.env` file exists

### Frontend won't start
- Check that Node.js 18+ is installed
- Ensure port 3000 is available
- Run `npm install` in frontend directory

### Preflight checks show mock data
- This is expected until you replace `quick-preflight.py` with real implementation
- Mock always returns PASS with 300 DPI

### Folders not appearing
1. Check Settings → Folder Paths are correct
2. Click "Scan Folders" to search for orders
3. Ensure folders have `complete-order-data.json`

### API not connecting
- Ensure backend is running on port 8000
- Check browser console for CORS errors
- Verify Vite proxy in `frontend/vite.config.js`

## Next Steps

1. Configure your actual folder paths in Settings
2. Replace `quick-preflight.py` with your Acrobat integration
3. Test with real order data
4. Connect your n8n workflow
5. Train staff on the UI
6. Monitor logs for issues

## Getting Help

- Check API documentation: http://localhost:8000/docs
- Review README.md for detailed information
- Check backend logs for errors
- Use browser developer console for frontend issues

## File Structure Reference

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app and endpoints
│   │   ├── database.py          # Database models
│   │   ├── models.py            # API request/response models
│   │   ├── settings_manager.py  # Settings persistence
│   │   └── preflight_runner.py  # Script execution
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Configuration (create from .env.example)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Main dashboard
│   │   │   ├── Settings.jsx     # Settings page
│   │   │   ├── Logs.jsx         # Logs viewer
│   │   │   ├── Folders.jsx      # Folder monitor
│   │   │   └── ManualPreflight.jsx  # Manual upload
│   │   ├── services/api.js      # API client
│   │   └── App.jsx              # Main app
│   ├── package.json             # Node dependencies
│   └── .env                     # Configuration (create from .env.example)
│
├── quick-preflight.py           # Preflight script (replace with real one)
├── start-backend.sh             # Backend startup script
├── start-frontend.sh            # Frontend startup script
└── README.md                    # Full documentation
```

---

**You now have a fully functional preflight management system!**

Start simple by testing with the manual preflight feature, then gradually integrate with your production workflow.
