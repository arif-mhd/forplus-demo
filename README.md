# Forplus Procurement System

This improved version of the Forplus Procurement System is built with Next.js for a modern, fast, and scalable experience.

## Project Structure

The project is split into two main applications:

1.  **`frontend-next`**: The main Catalog application.
    *   **Port**: 3000
    *   **Features**: Product Search, Brand Filtering, Brochure Upload & Viewing.

2.  **`frontend-cart-next`**: The Cart & Quote application.
    *   **Port**: 3001
    *   **Features**: Cart Management, Quote Generation, PDF Invoicing.

## Getting Started

To run the full system, you need to start both applications simultaneously.

### Prerequisites

*   Node.js (v18 or higher)
*   npm

### Installation

1.  Open a terminal in the root directory.
2.  Install dependencies for both apps:

```bash
cd frontend-next
npm install
cd ../frontend-cart-next
npm install
```

### Running the Applications

Open two separate terminals.

**Terminal 1 (Main Catalog):**

```bash
cd frontend-next
npm run dev -- -p 3000
```

**Terminal 2 (Cart System):**

```bash
cd frontend-cart-next
npm run dev -- -p 3001
```

Access the application at [http://localhost:3000](http://localhost:3000).

## Features

*   **Smart Search**: Find products across multiple brochures.
*   **Deep Brochure Integration**: View PDFs and search within them directly.
*   **Premium Invoicing**: Generate professional PDF quotes with a single click.
*   **Seamless Sync**: Cart items and status updates sync instantly between browsing and checkout.
