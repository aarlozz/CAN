# Codebase Guide

## Folder Structure

### `/backend`
- **Purpose**: The Express API application.
- **Dependencies**: `mongoose`, `express`, `jsonwebtoken`, `bcryptjs`, `multer`.
- **`models/`**: Defines database schemas. The most critical files are `User.js`, `StudentProfile.js`, and `ScholarshipApplication.js`.
- **`controllers/`**: Contains business logic. `authControllerbuilding.js` manages both local and Google OAuth logins.
- **`routes/`**: Wires endpoints to controllers.
- **`middlewares/`**: Contains `authMiddleware.js` which exports `protect` (JWT validation) and `requireRole` (RBAC).

### `/frontend`
- **Purpose**: The React SPA.
- **Dependencies**: `react`, `react-router-dom`, `axios`, `tailwindcss`, `@react-oauth/google`.
- **`src/context/`**: `AuthContext.jsx` is the core state manager for user sessions. It hydrates from `localStorage`.
- **`src/services/`**: `api.js` configures the Axios interceptor that injects the JWT into every outgoing request.
- **`src/pages/auth/`**: `login.jsx` and `signup.jsx` handle the onboarding flow, including the embedded `<GoogleLogin />` component.
- **`src/pages/Dashboard/`**: Role-specific dashboards (e.g. `studentdashboard.jsx`).
- **Build Process**: `npm run build` uses Vite for fast bundling.

## Routing (Frontend)
Routing is managed in `App.jsx`. Protected routes are wrapped in a `<ProtectedRoute allowedRoles={['student']}>` component, which checks the current user state and redirects to `/login` if unauthorized.

## State Management
Context API is used for global state (`AuthContext.jsx`), primarily for authentication. Form state and UI state are kept local to components using standard `useState`.
