# Accountabilabuddy: Full-Stack Task Management Demo

Accountabilabuddy is a modern full-stack demo app for managing tasks and accountability with friends. It demonstrates best practices in React frontend development, Express backend APIs, and Turso (SQLite) database integration. The app is designed for learning and rapid prototyping, not production security.

---

## Architecture Overview

- **Frontend:** React + TanStack Router/Query + Shadcn UI + Tailwind CSS
- **Backend:** Express.js REST API
- **Database:** Turso (serverless SQLite)
- **Local SQLite Database:** A local SQLite database file (`mydb.sqlite`) is included in the project root. You can use this for local development, inspection, or migration. Export your Turso cloud database to this file using the Turso CLI for offline access.

---

## Frontend

- **React:** SPA with TanStack Router for file-based routing and layouts.
- **TanStack Query:** Handles all data fetching, caching, and mutations for todos, users, and friends.
- **Shadcn UI:** Beautiful, accessible components built on Radix UI and Tailwind CSS.
- **API Switching:** Easily toggle between a fake local API and the real backend using an environment variable (`VITE_USE_REAL_API`).
- **Authentication:** Signup, login, and logout flows. User state is managed in the frontend and passed to API calls.
- **Friend Management:** Add friends by username, view their public todos grouped by state (read-only).
- **Todos:** Create, edit, delete, and mark todos as public or private. Private todos are only visible to the owner.
- **Local Storage for Guests:** If you are not logged in, your todos are saved locally in your browser and will not sync across devices.
- **Theming Engine:** Switch between light and dark themes using the button in the header.
- **Routing:** All navigation and redirects handled by TanStack Router, including after login/signup/logout.

---

## Backend

- **Express.js:** RESTful API endpoints for users, login, todos, and friends.
- **Endpoints:**
  - `/api/users` (signup)
  - `/api/login` (login)
  - `/api/todos` (CRUD)
  - `/api/friends` (add friend)
  - `/api/friends/:user_id/todos` (get friends' public todos)
- **Logging:** Detailed request logging for debugging and development.
- **Error Handling:** Consistent error responses for failed requests.
- **Security:** Passwords are stored in plain text for demo purposes only. No session management or password hashing is implemented.

---

## Database (Turso / SQLite)

- **Schema:**

  | Table    | Columns                                                                                 |
  |----------|----------------------------------------------------------------------------------------|
  | users    | id (PK), username (unique), password                                                   |
  | todos    | id (PK), user_id (FK), title, description, state (open/in_progress/blocked/closed), visibility (public/private), createdAt, updatedAt |
  | friends  | user_id (FK), friend_user_id (FK)                                                      |

- **Best Practices:**
  - Foreign key constraints ensure data integrity.
  - Queries are parameterized to prevent SQL injection.
  - All data access is abstracted in `server/turso.js` for maintainability.
- **Why Turso?**
  - Serverless, fast, and easy to use for prototyping and edge deployments.
  - SQL is familiar and flexible for relational data.

---

## Demo Practices & Limitations

- **Authentication:** Login/logout is required to access personal and friends' data. No password hashing or session tokens—this is for demo only.
- **Friend System:** Add friends by username. You can view their public todos, but not private ones.
- **API Switching:** Use the fake API for local development, or connect to the real backend for full-stack testing.
- **No Production Security:** Do not use this codebase for sensitive data or production apps without adding password hashing, sessions, and proper validation.
- **Local Storage for Guests:** If you are not logged in, todos are saved locally in your browser and are not synced.
- **Theming Engine:** Easily switch between light and dark mode from the header.

---

## Usage Instructions

1. **Sign Up:** Create a new account with a username and password.
2. **Login:** Log in to access your dashboard.
3. **Add Todos:** Create todos and choose public/private visibility.
4. **Add Friends:** Enter a friend's username to add them. View their public todos grouped by state.
5. **Logout:** End your session and return to the home page.
6. **Switch Theme:** Use the button in the header to toggle between light and dark mode.

---

## Screenshots

### Dashboard
![Dashboard](public/screenshot-dashboard.png)

### Friend Management & Public Todos
![Friends](public/screenshot-friends.png)

*Add your own screenshots to the `public/` folder and update the filenames above as needed.*

---

## Getting Started

```bash
npm install
npm run dev
```

## Building For Production

```bash
npm run build
```

## Testing

```bash
npm run test
```

## Serve the backend
```bash
npm run backend
```

## Styling

Tailwind CSS is used for utility-first styling. Shadcn UI provides accessible, modern components.

## Linting & Formatting

```bash
npm run lint
npm run format
npm run check
```

---

## Learn More

- [TanStack Docs](https://tanstack.com)
- [Turso Docs](https://docs.turso.tech)
- [Shadcn UI](https://ui.shadcn.com)
- [Express.js](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com)

---

## Copilot for Readme
I enjoy using AI for documentation, keeps things fresh.
