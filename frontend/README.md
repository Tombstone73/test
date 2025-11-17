# Preflight Management UI

React frontend for the Print Shop Preflight Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Run development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Features

- **Dashboard**: Overview of processing activity and statistics
- **Settings**: Configure folder paths, preflight thresholds, and material rules
- **Logs**: View and filter preflight processing history
- **Folders**: Monitor order folders and trigger reprocessing
- **Manual Check**: Upload PDFs for immediate preflight analysis

## Technology Stack

- React 18
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- Lucide React for icons
- Vite for fast development
