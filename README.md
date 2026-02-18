# 🏠 Aria

A modern short-term rental platform — built with React, Node/Express, and PostgreSQL.

---

## Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React + Vite, Tailwind CSS, React Query  |
| Backend     | Node.js + Express, JWT Auth             |
| Database    | PostgreSQL                              |
| Testing     | Cypress (JS) + Playwright (TS)          |
| Deployment  | Netlify (client) + Render (server + DB) |

---

## Getting Started

### Prerequisites
- Node.js >= 18
- Yarn >= 1.22
- PostgreSQL >= 15

### Install dependencies
```bash
yarn install
```

### Set up environment
```bash
cp .env.example .env
# Fill in your values
```

### Run in development
```bash
yarn dev
```

This starts both the client (port 5173) and server (port 5000) concurrently.

---

## Project Structure
```
aria/
├── client/          # React + Vite frontend
├── server/          # Node + Express API
├── e2e-cypress/     # Cypress E2E tests (JavaScript)
├── e2e-playwright/  # Playwright E2E + API tests (TypeScript)
└── .github/         # CI/CD workflows + PR templates
```

---

## Branch Strategy

| Branch      | Purpose                  |
|-------------|--------------------------|
| main        | Production               |
| develop     | Staging / integration    |
| feature/*   | New features             |
| fix/*       | Bug fixes                |
| chore/*     | Config, deps, tooling    |

---

## Scripts

| Command          | Description                        |
|------------------|------------------------------------|
| `yarn dev`       | Run client + server concurrently   |
| `yarn client`    | Run client only                    |
| `yarn server`    | Run server only                    |
| `yarn lint`      | Lint all workspaces                |
| `yarn test`      | Run all workspace tests            |