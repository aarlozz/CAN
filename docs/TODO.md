# Developer TODO List

## High Priority
- [ ] **CORS Restriction**: Update `backend/app.js` to restrict CORS to the frontend domain.
- [ ] **Auth Hydration Fix**: The `ProtectedRoute` currently looks for `token` and `role` in `localStorage`, but `AuthContext` uses `can_token`, `can_user`, `can_profile`. Align these keys to prevent routing bugs.
- [ ] **Duplicate Index Warning**: Remove the manual `finaluserSchema.index({ email: 1 });` in `User.js` since `email: { unique: true }` already creates an index.

## Medium Priority
- [ ] **Cloud Storage**: Replace `multer` local storage with `multer-s3` (AWS) to ensure files aren't lost if the server restarts.
- [ ] **Rate Limiting**: Add `express-rate-limit` to the `/api/authbuild/*` routes.
- [ ] **JWT Storage**: Refactor `AuthContext` to use HTTP-only cookies instead of `localStorage`.

## Low Priority
- [ ] **Code Cleanup**: Delete unmounted/deprecated files like `adminRoutes.js` and `collegeRoutes.js`.
- [ ] **Testing Setup**: Setup Vitest and Jest for frontend and backend unit tests.

## Technical Debt
- [ ] **Module Systems**: The backend is currently mixed. Some older files might still use `require()` syntax while newer files use `import`. Standardize entirely on ES Modules.
