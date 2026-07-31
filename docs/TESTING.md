# Testing Strategy

## Current Status
*⚠ Needs Confirmation: There are currently no automated tests (Unit, Integration, or E2E) present in the repository.* 

## Recommended Testing Architecture

### 1. Unit Tests (Backend)
- **Framework**: `Jest` + `Supertest`.
- **Target**: Controllers and Middlewares.
- **Mocking**: Mock Mongoose models to prevent hitting the real MongoDB Atlas database during test runs.

### 2. Integration Tests (Backend)
- **Target**: API Endpoints (`/api/authbuild/signup`, `/api/application/apply`).
- **Database**: Use `mongodb-memory-server` to spin up a transient in-memory database for testing database reads/writes without affecting production or dev data.

### 3. Unit Tests (Frontend)
- **Framework**: `Vitest` + `React Testing Library`.
- **Target**: Complex UI logic, rendering of `AuthContext`, and form validations.

### 4. End-to-End (E2E) Tests
- **Framework**: `Cypress` or `Playwright`.
- **Target**: The critical paths:
  1. Student Signup -> Profile Fill -> Scholarship Apply.
  2. Institution Signup -> Create Scholarship -> Review Application.

## Manual Testing Checklist
Before deploying to production, manually verify:
- [ ] Google OAuth login works for new users.
- [ ] Google OAuth login works for returning users.
- [ ] Manual login fails securely with "Please sign in with Google" for OAuth users.
- [ ] Students cannot view the Institution Dashboard.
- [ ] Institutions cannot apply to their own scholarships.
- [ ] File uploads (PDFs/JPGs) are saved successfully and linked to the correct profile.
