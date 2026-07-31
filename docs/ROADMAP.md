# Roadmap

## Completed (MVP)
- [x] Basic Express/MongoDB backend setup.
- [x] Base User schemas and auth flows.
- [x] Scholarship CRUD operations for Institutions.
- [x] Student application submission flow.
- [x] Frontend dashboards (Student & Institution).
- [x] Integration of Google OAuth 2.0.
- [x] Refactoring to unified authentication system (ESM modules).

## In Progress
- [ ] Transitioning legacy CommonJS (CJS) files to ECMAScript Modules (ESM).
- [ ] Admin verification portals (Province/Super Admins).
- [ ] Fixing UI inconsistencies in the new authentication pages.

## Next Up
- [ ] **Security Hardening**: Implement rate limiting, secure cookies, and CORS restrictions.
- [ ] **Cloud Storage**: Move file uploads from local `multer` disk storage to AWS S3.
- [ ] **Email Notifications**: Integrate SendGrid/Nodemailer to email students when their application status changes.

## Future / Ideas (Nice-to-Have)
- **AI Scholarship Matching**: Suggest scholarships to students based on their profile and geographic location.
- **In-App Messaging**: Allow institutions to chat directly with applicants if they need clarification on documents.
- **Advanced Analytics**: Generate graphs and charts for Admins to track scholarship distribution across different provinces in Nepal.
