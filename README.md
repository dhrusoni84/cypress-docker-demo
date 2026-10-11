# Cypress Docker Demo

A lightweight dashboard for running Cypress end‑to‑end tests inside Docker containers.

## Overview

This repository provides a simple **Node.js** server (`server.js`) that orchestrates Cypress test execution using Docker workers. The dashboard exposes a small HTTP API and an SSE endpoint for live updates. Test specifications are located under `cypress/e2e/` and results are persisted in the `reports/` directory.

![Demo screenshot](https://raw.githubusercontent.com/your-repo/cypress-docker-demo/main/public/screenshot.png)

## Prerequisites

- **Docker** (>= 20.10) installed and running.
- **Node.js** (>= 14) for building the dashboard image.
- **npm** (or `yarn`) to install dependencies.

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd cypress-docker-demo

# Install Node dependencies
npm install
```

### Build the Docker image

```bash
docker build -t cypress-demo .
```

## Running the Dashboard

You can start the server directly with Node:

```bash
node server.js
```

The dashboard will listen on **port 3001** (or the value of `PORT` env var). Open <http://localhost:3001> in your browser.

### Using Docker Compose

A helper `docker-compose.yml` is provided to spin up multiple workers:

```bash
docker compose up --scale worker=3
```

This will launch three identical workers (`worker1`, `worker2`, `worker3`) using the image built above. Each worker runs a single spec defined in the compose file.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/events` | Server‑Sent Events stream with live run updates. |
| `GET`  | `/api/run` | Current run summary. |
| `GET`  | `/api/specs` | List of discovered Cypress spec files. |
| `GET`  | `/api/reports` | List of saved run reports. |
| `GET`  | `/api/reports/:id` | Detailed JSON report for a specific run. |
| `GET`  | `/api/compare?base=<id>&target=<id>` | Compare two runs (regressions, fixes, etc.). |
| `POST` | `/api/run` | Start a new run. Body: `{ workers?: number, retries?: number }`. |

## Running Tests

To trigger a new test run via the API:

```bash
curl -X POST http://localhost:3001/api/run \
  -H "Content-Type: application/json" \
  -d '{"workers":2,"retries":1}'
```

The server will discover all spec files under `cypress/e2e/`, queue them, and dispatch them to Docker workers. Logs and artifacts (screenshots, videos) are stored under `reports/<run-id>/artifacts/`.

## Viewing Results

- **Live view**: Open <http://localhost:3001> and watch the SSE feed.
- **Saved reports**: Navigate to `/reports/<run-id>.json` or use the `/api/reports` endpoint.
- **Artifacts**: Screenshots and videos are served under `/artifacts/`.

## Customising Workers

`server.js` reads the following environment variables:

- `CYPRESS_WORKER_IMAGE` – Docker image to use (default: `cypress-demo:latest`).
- `MAX_WORKERS` – Upper bound for concurrent workers (default: `2`).
- `PORT` – Port for the dashboard server (default: `3001`).

Adjust these before starting the server or in your `docker-compose.yml`.

## Project Structure

```
├─ cypress/
│  └─ e2e/                # Cypress spec files
├─ public/                # Static assets served by Express
├─ reports/               # Run JSON files and artifacts (generated)
├─ Dockerfile             # Builds the Cypress image
├─ docker-compose.yml     # Example multi‑worker setup
├─ server.js              # Dashboard back‑end (Express)
└─ README.md              # This document
```

## Contributing

Feel free to open issues or submit pull requests. When adding new specs, ensure they are placed under `cypress/e2e/` and follow the naming convention `*.cy.js` or `*.spec.js`.

## License

This project is licensed under the MIT License.

