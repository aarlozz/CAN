# Security Posture

## Authentication & Authorization
- **JWT**: JSON Web Tokens are used for session verification. They are signed with a secure `JWT_SECRET` and expire in 1 day.
- **Passwords**: Hashed using `bcryptjs` with 12 salt rounds before being stored in the database.
- **RBAC (Role-Based Access Control)**: Enforced on the backend via the `requireRole` middleware. E.g., `router.post('/create', protect, requireRole('institution'), createScholarship);`

## Current Vulnerabilities (⚠ Needs Remediation)
1. **XSS (Cross-Site Scripting)**: JWT tokens are stored in `localStorage` on the frontend. If an attacker injects malicious JavaScript, they can steal these tokens. **Recommendation**: Move JWT storage to `HttpOnly` cookies.
2. **Brute Force Attacks**: There is no rate-limiting on the `/api/authbuild/login` route. **Recommendation**: Implement `express-rate-limit`.
3. **Open CORS Policy**: `app.use(cors())` allows any origin to interact with the API. **Recommendation**: Restrict to `VITE_API_URL`.
4. **Denial of Service (DoS) via Payload**: The JSON body parser is currently set to `limit: "10mb"`. This is excessive for standard JSON payloads and can exhaust server memory. **Recommendation**: Reduce to `100kb`. Use Multer exclusively for large file uploads.
5. **NoSQL Injection**: The API does not sanitize inputs against MongoDB operators. **Recommendation**: Install and use `express-mongo-sanitize`.

## File Upload Security
- Currently uses `multer` to save files locally.
- ⚠ **Limitation**: Local storage is not persistent on cloud hosts like Heroku or Render, and poses a risk if someone uploads executable scripts (though Multer limits this by mime-type).
- **Recommendation**: Integrate AWS S3 for secure, isolated file storage.
