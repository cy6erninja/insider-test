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

## Troubleshooting

If you encounter case sensitivity issues with PSR-4 autoloading in the backend, the Dockerfile includes steps to fix directory casing during Docker builds.
