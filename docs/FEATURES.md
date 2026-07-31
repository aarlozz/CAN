# Features

## 1. Unified Authentication (OAuth & Local)
- **Purpose**: Allow users to securely create accounts and log in.
- **Workflow**: 
  1. User clicks Google Sign-In or enters email/password.
  2. Backend validates credentials.
  3. JWT is issued and stored in `localStorage`.
- **Business Logic**: Users are strictly separated by `role` (`student`, `institution`, etc.). Google users default to `student` and bypass password requirements.
- **API Endpoints**: 
  - `POST /api/authbuild/signup`
  - `POST /api/authbuild/login`
  - `POST /api/authbuild/google-login`
- **Limitations**: Google signup defaults to `student` role. Institutions must sign up manually.

## 2. Institution Management
- **Purpose**: Allow educational bodies to manage their profile and courses.
- **Workflow**: Institution logs in, navigates to dashboard, adds courses, and awaits admin verification.
- **Business Logic**: Only verified institutions (`verification.status === 'verified'`) can post active scholarships.
- **Database Interaction**: Updates `InstitutionProfile` and embedded `courses` array.
- **API Endpoints**: 
  - `GET /api/institution/dashboard-institution`
  - `POST /api/institution/courses`

## 3. Scholarship Creation & Listing
- **Purpose**: Institutions post financial aid opportunities; students browse them.
- **Workflow**: 
  1. Institution fills out scholarship details (seats, coverage, eligibility).
  2. Students visit `/scholarships` to browse and filter by location.
- **Business Logic**: Scholarships auto-expire when `applicationDeadline` passes (handled via Virtuals).
- **API Endpoints**: 
  - `POST /api/scholarship/create`
  - `GET /api/scholarship/all`
  - `GET /api/scholarship/:id`

## 4. Application Processing
- **Purpose**: Let students apply for scholarships and institutions review them.
- **Workflow**:
  1. Student clicks "Apply" on a scholarship.
  2. Backend captures a "snapshot" of the student's current profile.
  3. Institution reviews and sets status (`pending`, `approved`, `rejected`).
- **Business Logic**: A student cannot apply to the same scholarship twice (Compound Unique Index).
- **Edge Cases**: If a student changes their profile *after* applying, the application retains the original "snapshot" data to prevent tampering.
- **API Endpoints**:
  - `POST /api/application/apply`
  - `PATCH /api/application/:id/review`

## 5. Document Uploads
- **Purpose**: Verify student academic and reservation claims.
- **Workflow**: Student uploads a PDF/JPG. Multer saves it to disk. File path is saved to `StudentProfile`.
- **Limitations**: Currently stored on local disk, which does not scale across multiple server instances.
- **Future Improvements**: Migrate to AWS S3 or Cloudinary.
