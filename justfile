# Justfile for monorepo tasks

# Build frontend static files with configurable backend URL
fe-prod backend-url="http://localhost:8080":
    cd frontend && NEXT_PUBLIC_API_BASE={{backend-url}} npm install && NEXT_PUBLIC_API_BASE={{backend-url}} npm run build

# Run frontend dev server with configurable port and backend URL
fe-dev port="3000" backend-url="http://localhost:8080":
    cd frontend && NEXT_PUBLIC_API_BASE={{backend-url}} npm install && NEXT_PUBLIC_API_BASE={{backend-url}} npm run dev -- -p {{port}}

# Build backend Docker image with configurable port (default: 8080)
be-prod port="8080":
    cd backend && docker build --build-arg PORT={{port}} -t cy6erninja/champion-league-be:latest .

# Run backend dev server with configurable port (default: 8080)
be-dev port="8080":
    cd backend && php -S 0.0.0.0:{{port}} -t public

all:
    just fe-prod
    just be-prod 