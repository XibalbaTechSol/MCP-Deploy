
# MCP Server Deploy

**A platform-as-a-service (PaaS) to simplify the creation, hosting, and integration of Model Context Protocol (MCP) servers with one-click deployment.**

This project is a feature-rich MVP designed to demonstrate the core value proposition of the MCP Server Ecosystem. It provides a clean, responsive, and intuitive user interface for managing the complete lifecycle of MCP servers.

---

## ✨ Core Features

*   **Dashboard Overview**: A central hub displaying at-a-glance statistics for your server fleet, including total servers, running/stopped counts, total function calls, and data transferred.
*   **Comprehensive Server Management**:
    *   **One-Click Creation**: A guided modal to create new servers from a dynamic list of official GitHub templates.
    *   **Lifecycle Actions**: Easily **Start**, **Stop**, and **Delete** servers. Actions are intelligently disabled during transient states (e.g., 'Creating', 'Stopping') to ensure data integrity.
    *   **Live Metrics**: Running servers display real-time (simulated) metrics for CPU usage, memory consumption, and network traffic.
*   **Detailed Server View**: A slide-in panel provides an in-depth look at any server, with dedicated tabs for:
    *   **Live Metrics**: Visual graphs and stats for CPU, Memory, and Network I/O.
    *   **Logs**: A real-time (simulated) log stream for monitoring server activity and debugging.
    *   **Information**: Key details like Server ID, Container ID, creation date, and total data usage.
*   **Promote to LLM**: A powerful feature that generates provider-specific code snippets to integrate your running server as a "tool" or "function" with leading LLMs. Supported providers:
    *   Gemini (CLI)
    *   Claude (Python SDK)
    *   OpenAI (Python SDK)
    *   cURL (Universal)
*   **Dynamic Search & Filtering**: Instantly search for servers by name and filter the list by status (Running, Stopped, etc.).
*   **Responsive UI**: A modern, clean interface built with Tailwind CSS that works seamlessly on both desktop and mobile devices.
*   **User Authentication Flow**: A mock authentication system with a professional login screen for Google and GitHub providers.

---

## 🛠️ Technology Stack

This project is built with a modern, performant, and scalable frontend stack.

*   **Framework**: [React](https://react.dev/) (^19.2)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (via CDN)
*   **Markdown Rendering**: [React Markdown](https://github.com/remarkjs/react-markdown) for displaying template READMEs.
*   **Icons**: A custom suite of SVG icons, organized as individual React components.
*   **Backend**: **Mock In-Memory Database** (`/data/mockData.ts`). For this MVP, all server data, user information, and logs are simulated in-memory to demonstrate full application functionality without requiring a live backend.

---

## 🚀 Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/mcp-server-deploy.git
    cd mcp-server-deploy
    ```

2.  **Install dependencies:**
    This project uses a standard Node.js environment.
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the development server (likely on `http://localhost:5173`). Open the URL in your browser to see the application.

---

## 🏛️ Project Architecture

The application is architected around a centralized state management model within the main `App.tsx` component, ensuring a single source of truth and predictable data flow.

### State Management

*   **`App.tsx`**: This component acts as the root of the application. It manages the global state, including the current user, the list of all servers, and their associated logs.
*   **Mock Database**: The `MOCK_DB` object from `/data/mockData.ts` is initialized into the state. All server operations (create, start, stop, delete) are functions within `App.tsx` that manipulate this state object, simulating backend API calls.
*   **Simulated Real-Time Updates**: `useEffect` hooks in `App.tsx` are used to simulate real-time events:
    *   Server state transitions (e.g., 'Creating' -> 'Running') are handled with `setTimeout`.
    *   Live metrics for running servers are updated every 3 seconds using `setInterval`, providing a dynamic and realistic dashboard experience.

### Data Flow

*   Data flows unidirectionally from the parent `App.tsx` component down to child components via props.
*   Child components use callback functions (e.g., `onCreateServer`, `onDeleteServer`) passed down as props to signal events and request state changes from the parent `App.tsx` component.

### Key Components

*   **`/components`**: Contains all reusable React components.
    *   **`Dashboard.tsx`**: The main interface after login. It orchestrates the display of stats, the server list, and modals.
    *   **`ServerRow.tsx`**: A single row in the server list table, displaying key information and action buttons for one server. (Note: This is currently implemented within `Dashboard.tsx`).
    *   **`ServerDetailPanel.tsx`**: The slide-out panel that provides a deep-dive into a selected server's metrics, logs, and information.
    *   **`CreateServerModal.tsx`**: A modal for new server creation. It demonstrates fetching external data from the GitHub API to populate the template list.
    *   **`PromoteServerModal.tsx`**: The modal that showcases the multi-provider "Promote to LLM" functionality.
    *   **`/icons`**: A directory of individual SVG icon components for easy and consistent use throughout the app.

---

## 🛣️ Future Roadmap

This MVP provides a solid foundation. Future development could include:

*   **Backend Integration**: Replace the mock data with a real backend service (e.g., Node.js/Express, Go, or Python) and a database (e.g., PostgreSQL, MongoDB).
*   **Real Authentication**: Integrate a real authentication service like OAuth 2.0 with Google/GitHub, using JWTs for session management.
*   **Containerization & Deployment**:
    *   Connect the server creation logic to a real container orchestration service (e.g., Docker, Kubernetes).
    *   Automate deployments with CI/CD pipelines.
*   **Billing & Subscriptions**: Integrate a payment provider like Stripe to manage user plans and billing.
*   **WebSockets**: Use WebSockets for true real-time log streaming and metric updates instead of polling/intervals.
*   **Enhanced Template Management**: Allow users to connect their own GitHub repositories as templates.

