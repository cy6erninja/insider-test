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

# With custom port
just fe-dev port="4000"

# With custom backend URL
just fe-dev backend-url="http://localhost:8080"
```

### Backend Development

```bash
# Install PHP dependencies first
cd backend && composer install

# Start the backend development server
just be-dev

# With custom port
just be-dev port="9000"

# With custom CORS allowed origins
just be-dev allowed-origins="http://localhost:3000,https://example.com"
```

### Production Builds

```bash
# Build frontend for production
just fe-prod

# Build backend Docker image
just be-prod

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

- **CORS Settings**: The backend accepts a comma-separated list of allowed origins via the `ALLOWED_ORIGINS` environment variable. By default, it allows:
  - `http://localhost:3000` (local development)
  - `https://localhost:3000` (local HTTPS)
  - `https://sikachev.github.io` (GitHub Pages)
  - `https://sikachev.github.io/insider-test` (GitHub Pages with repo name)
  - You can set to `*` to allow all origins
