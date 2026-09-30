# Junior AI Assistant - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
- Copy `backend/.env.example` to `backend/.env`
- Add your API keys and configure settings

**Frontend** (`front-end/.env`):
- Copy `front-end/.env.example` to `front-end/.env`
- Configure feature flags and API endpoints

### 3. Run Development Servers
```bash
npm run dev
```

This will start both backend (port 5000) and frontend (port 5173) servers concurrently.

## Project Structure

```
JUNIOR/
├── backend/           # Node.js/Express backend
│   ├── index.js      # Main server file
│   ├── .env          # Backend environment (sensitive)
│   └── .env.example  # Environment template
├── front-end/        # React/Vite frontend
│   ├── src/
│   │   └── components/  # Individual widget components
│   ├── .env          # Frontend environment
│   └── .env.example  # Environment template
├── .gitignore        # Root git ignore
└── package.json      # Root package with dev command
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Run both backend and frontend |
| `npm run dev:backend` | Run only backend server |
| `npm run dev:frontend` | Run only frontend server |
| `npm run install:all` | Install all dependencies |
| `npm run build` | Build frontend for production |
| `npm run start` | Start backend in production |

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS
- API keys for external services

### Frontend (.env)
- `VITE_BACKEND_URL` - Backend API URL
- `VITE_API_ENDPOINT` - API endpoint path
- `VITE_ENABLE_*` - Feature flags for widgets

**Note**: All frontend variables must start with `VITE_` to be exposed to the client.

## Widget Components

Each widget has its own file in `front-end/src/components/`:
- `DateTimeWidget.jsx` - Date and time display
- `WeatherWidget.jsx` - Weather information
- `JuniorMusicPlayer.jsx` - Cyberpunk themed music player with YouTube/iTunes integration
- `QuickNotesWidget.jsx` - Note-taking widget
- `SpeechTerminal.jsx` - Voice interaction
- `StatusWidget.jsx` - System status
- `SystemWidget.jsx` - System information
- `Navbar.jsx` - Navigation bar
- `SettingsPanel.jsx` - Settings configuration

## Troubleshooting

### Backend not starting?
- Check if port 5000 is available
- Verify `.env` file exists in backend folder
- Run: `npm run dev:backend`

### Frontend not loading?
- Check if port 5173 is available
- Verify `.env` file exists in front-end folder
- Run: `npm run dev:frontend`

### API calls failing?
- Ensure both servers are running
- Check `VITE_BACKEND_URL` matches backend port
- Verify CORS settings in backend
