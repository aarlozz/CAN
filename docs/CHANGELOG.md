# Changelog

## [MVP / Current] - 2026-07-31

### Added
- **Google OAuth 2.0**: Implemented Google Sign-In on the frontend using `@react-oauth/google`.
- **Google Login Controller**: Added backend verification using `google-auth-library`.
- **Unified Authentication**: Merged disparate student and institution login flows into a single unified `/api/authbuild/login` and `/signup` API structure.
- **Documentation**: Generated comprehensive AI Knowledge Base (`/docs`).

### Changed
- **Database Models**: Updated `User` model to make passwords conditionally required (only for `local` auth). Added `authProvider` and `googleId` fields.
- **Student Profile Creation**: Adjusted the empty `StudentProfile` creation during Google Signup to include default "Not Specified" values to bypass strict Mongoose validation errors.
- **Frontend Build**: Added `nepali-date-converter` to fix Vite build failures.

### Fixed
- Fixed an issue where manual login attempts using a Google-authenticated email would crash the backend due to a missing password.
- Updated `institutionaldashbaord.jsx` logout redirects to point to the unified `/login` page instead of the deprecated `/login-institution`.

### Deprecated
- The legacy `authRoutes.js` and `collegeRoutes.js` are currently being phased out in favor of the `*buildingRoutes.js` equivalents.
