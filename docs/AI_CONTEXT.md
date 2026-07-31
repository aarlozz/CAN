# AI Context

*Note to AI Assistants: Read this file FIRST before modifying the CAN codebase.*

## Project Summary
**CAN (Computer Association Nepal)** is a centralized scholarship portal for Nepal. It connects Students with Educational Institutions offering financial aid.

## Architecture Snapshot
- **MERN Stack**: MongoDB, Express, React (Vite), Node.js.
- **Auth**: JWT stored in `localStorage` + Google OAuth 2.0.
- **Database**: Mongoose ODM. Normalization via `User`, `StudentProfile`, and `InstitutionProfile` collections.
- **Roles**: student, institution, district_admin, province_admin, super_admin.

## Current Progress & Objective
The platform has recently unified its authentication flow and added Google OAuth 2.0. The MVP is functional, allowing institutions to post scholarships and students to apply for them. 

**Current Objective**: Stabilize the unified authentication, resolve lingering localStorage mismatches (`can_token` vs `token`), and prepare for cloud deployments.

## Coding Conventions
- **Backend**: Use ECMAScript Modules (`import`/`export`). Do NOT use `require()`. Return errors as JSON: `res.status(400).json({ message: "..." })`.
- **Frontend**: Use Tailwind utility classes. Prefer functional React components and Hooks. Use the central Axios instance from `api.js` for all backend calls.

## Known Issues (Fix these before adding major features)
1. `AuthContext.jsx` looks for `can_token` in `localStorage`, but the new unified login sets `token`. This causes Protected Routes to fail or redirect loops.
2. The `app.js` file has an excessively large body parser limit (`10mb`).
3. Mongoose schemas (`User.js` and `StudentProfile.js`) have duplicate index warnings because `unique: true` and `.index()` are both declared for the same fields.

## Critical Files
- `backend/app.js`: Main Express configuration.
- `backend/controllers/authControllerbuilding.js`: Core login/signup logic (Local + Google).
- `frontend/src/context/AuthContext.jsx`: Global session state.
- `frontend/src/App.jsx`: React routing table.

## Things to Avoid
- **DO NOT** convert ESM imports back to CommonJS.
- **DO NOT** edit legacy files in `routes/authRoutes.js` (use `authbuildingRoutes.js` instead).
- **DO NOT** add business logic to route definition files; keep it in controllers.
- **DO NOT** use `cat` to edit files in your bash environment. Use proper IDE/file-replacement tools.
