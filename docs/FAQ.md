# Frequently Asked Questions (FAQ)

## 1. Why are there two sets of API routes (`authRoutes.js` vs `authbuildingRoutes.js`)?
The project is currently transitioning from an older, segregated authentication system (where students and institutions had completely different login endpoints) to a **Unified Authentication System** (`authbuildingRoutes.js`). The old routes are kept for legacy compatibility but should not be used for new features.

## 2. Why does the backend crash when I log in manually with an OAuth account?
If a user created their account via Google OAuth, the `User.password` field in the database is intentionally left empty (undefined). The backend code explicitly checks if `authProvider === 'google'` and returns a `"Please sign in with Google"` error message rather than crashing during the `bcrypt.compare` step.

## 3. Where are uploaded documents stored?
Currently, documents are stored directly on the backend server's file system using `multer` inside the `backend/uploads/` directory. 
*⚠ Needs Confirmation: Plans to migrate to AWS S3 are in the roadmap but not yet implemented.*

## 4. Why is `can_token` used in AuthContext instead of `token`?
This is a piece of technical debt. Earlier versions of the frontend used `can_token` for `localStorage`. Recent updates to `login.jsx` and `signup.jsx` set `token`. This discrepancy needs to be unified (see `TODO.md`).

## 5. How do I bypass MongoDB IP Whitelist errors locally?
If you see a `MongooseError: Operation users.findOne() buffering timed out`, your current IP address is not authorized in MongoDB Atlas. Log into Atlas -> Security -> Network Access -> Add IP Address -> Add Current IP.

## 6. How does the Scholarship Application "snapshot" work?
When a student applies for a scholarship, their current profile data (grades, address, caste) is copied entirely into the `ScholarshipApplication` document. This ensures that if the student modifies their profile a month later, the institution reviewing the application still sees the data exactly as it was at the time of submission.
