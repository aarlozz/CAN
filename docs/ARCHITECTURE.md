# Architecture

## Overall System Architecture
The CAN platform follows a standard 3-tier Client-Server architecture:
1. **Client Tier**: A Single Page Application (SPA) built with React and Vite.
2. **Application Tier**: A RESTful API built with Node.js and Express.
3. **Data Tier**: A NoSQL database hosted on MongoDB Atlas.

```ascii
+-------------------+       HTTP/JSON       +-------------------+       Mongoose        +-------------------+
|   React Client    | <===================> |  Express API      | <===================> |   MongoDB Atlas   |
| (Vite + Tailwind) |    (Axios config)     | (Node.js backend) |       (TCP)           |  (canfednp_db)    |
+-------------------+                       +-------------------+                       +-------------------+
```

## Frontend Architecture
- **Component-Based UI**: Built using functional React components and Hooks (`useState`, `useEffect`).
- **Global State**: Managed via React Context API (`AuthContext.jsx`).
- **Routing**: Client-side routing via `react-router-dom`. Routes are protected using a `ProtectedRoute` wrapper component.
- **API Communication**: Centralized Axios instance (`api.js`) that automatically attaches the JWT token from `localStorage` via interceptors.

## Backend Architecture
- **Modular Monolith**: The Express app is divided into functional domains (Auth, Student, Institution, Scholarship, Application).
- **Controller-Service-Route Pattern**:
  - `routes/`: Defines HTTP endpoints and attaches middleware.
  - `controllers/`: Handles business logic and database interactions.
  - `models/`: Defines Mongoose schemas.
- **Middleware Chain**:
  ```ascii
  Request -> CORS -> Body Parser (10mb limit) -> Auth Guard (protect) -> Role Guard (requireRole) -> Controller
  ```

## Database Architecture
- **Type**: Document-oriented (NoSQL).
- **Core Entities**: `User`, `StudentProfile`, `InstitutionProfile`, `Scholarship`, `ScholarshipApplication`.
- **Design Pattern**: Base `User` collection holds credentials and role. Detailed data is normalized into `*Profile` collections linked via `user` ObjectId. Denormalization is used sparingly (e.g., `institutionName` inside `Scholarship` to avoid deep population queries).

## AI Architecture
*⚠ Needs Confirmation: There are currently no active AI features embedded directly into the application source code. This documentation is optimized for AI assistants developing the codebase, not AI features within the product itself.*

## Authentication Flow
1. **Login (Local)**: User submits email/password -> Backend hashes password with bcrypt -> Compares with DB -> Returns JWT.
2. **Login (Google)**: Frontend fetches Google credential -> Sends to backend `/api/authbuild/google-login` -> Backend verifies via `google-auth-library` -> Auto-creates empty profile if new -> Returns JWT.
3. **Session**: JWT stored in `localStorage` (`can_token`).
4. **Hydration**: On reload, `AuthContext` reads `localStorage` to restore session state.

## Authorization
- Handled by custom middleware:
  - `protect`: Verifies JWT signature and expiry. Attaches `req.user`.
  - `requireRole(...roles)`: Checks if `req.user.role` is in the allowed array.

## External Services
- **MongoDB Atlas**: Database hosting.
- **Google OAuth 2.0**: Identity provider.
- **Local File System**: `multer` stores uploaded files directly on the server's disk (`uploads/` folder).

## Folder Responsibilities
- `backend/controllers/`: Business logic.
- `backend/models/`: Database schemas.
- `backend/routes/`: API endpoint definitions.
- `backend/middlewares/`: Auth and upload interceptors.
- `frontend/src/pages/`: Route-level components.
- `frontend/src/Components/`: Reusable UI elements (Headers, Footers).
- `frontend/src/context/`: Global state management.

## Data Flow (Application Submission)
```ascii
[Student] -> Fills Application Form -> [Frontend Axios] POST /api/application/apply
-> [Express Router] -> [Auth Middleware] -> [Application Controller]
-> Validates Scholarship isActive & remainingSeats > 0
-> Creates ScholarshipApplication (snapshotting student profile data)
-> Returns 201 Created -> [Frontend] shows Success Toast
```
