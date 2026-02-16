# Lumina DocGen - Standalone AI Document Generator

This is a standalone MERN-stack application (Next.js + Node.js) for generating professional PDF documents using AI customization.

## Project Structure

- `backend/` - Node.js + Express + Puppeteer (PDF Engine)
- `frontend/` - Next.js App Router (User Interface)

## Getting Started

You need to run both the backend and frontend servers.

### 1. Start the Backend

Open a terminal:

```bash
cd lumina-doc-gen/backend
npm start
```

Runs on http://localhost:4000

### 2. Start the Frontend

Open a **new** terminal:

```bash
cd lumina-doc-gen/frontend
npm run dev
```

Runs on http://localhost:3000

## Features

- **AI Styling**: Type prompts like "Make it modern and blue" to auto-configure styles.
- **PDF Generation**: Uses Headless Chrome for pixel-perfect rendering.
- **Standalone**: Does not depend on the main ForPlus app (yet).

## Configuration

To use real AI features, create a `.env` file in `backend/` with:
```
OPENAI_API_KEY=sk-...
```
Without a key, it runs in "Simulation Mode" (keyword matching).
