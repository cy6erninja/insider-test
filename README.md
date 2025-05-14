# Insider Test Project

This monorepo contains a Next.js frontend and PHP backend for the Insider Champion League application. It uses `just` for task automation and is deployed to GitHub Pages (frontend) and DigitalOcean (backend).

## Prerequisites

- [just](https://github.com/casey/just) - command runner
- Node.js (for frontend)
- PHP 8.4 (for backend)
- Docker (for backend containerization)

## Running Locally

### Frontend Development

```bash
# Start the frontend development server
just fe-dev

# With custom port (e.g., 4000)
just fe-dev 4000

# With custom port and backend URL
just fe-dev 4000 http://localhost:8080
```

### Backend Development

```bash
# Install PHP dependencies first
cd backend && composer install

# Start the backend development server
just be-dev

# With custom port (e.g., 9000)
just be-dev 9000

# With custom port and allowed origins
just be-dev 9000 "http://localhost:4000,https://example.com"
```

### Production Builds

```bash
# Build frontend for production
just fe-prod

# With custom backend URL
just fe-prod http://localhost:8080

# Build backend Docker image
just be-prod

# With custom port (e.g., 9090)
just be-prod 9090

# With custom port and allowed origins
just be-prod 9090 "http://localhost:4000,https://example.com"

# Run both production builds
just all
```

## Deployment

The project is automatically deployed when changes are pushed to the `main` branch:

- Frontend: Deployed to GitHub Pages
- Backend: Built as a Docker image and pushed to DigitalOcean Container Registry

You can also manually trigger a deployment from the GitHub Actions tab.

### Configuration

- **Backend URL**: The frontend build uses the `BACKEND_URL` repository secret for API requests. If not set, it defaults to the DigitalOcean app URL. To change this:

  1. Go to your repository's Settings
  2. Select "Secrets and variables" → "Actions"
  3. Add a new repository secret named `BACKEND_URL` with your backend endpoint

- **CORS Settings**: The backend accepts a comma-separated list of allowed origins via the `ALLOWED_ORIGINS` environment variable. 