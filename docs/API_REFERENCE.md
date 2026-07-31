# API Reference

*Note: This documents the unified (active) API routes. Legacy routes in `/api/auth` and `/api/college` are deprecated.*

## Authentication (`/api/authbuild`)

### 1. Unified Login
- **Method**: `POST`
- **URL**: `/api/authbuild/login`
- **Description**: Authenticates a user using email and password.
- **Request Body**: `{ "email": "...", "password": "..." }`
- **Response**: `200 OK`
  ```json
  { "message": "Login successful", "token": "jwt...", "role": "student", "profile": {...} }
  ```
- **Error Handling**: `400 Invalid credentials` or `400 Please sign in with Google` (if no password exists).

### 2. Google Login
- **Method**: `POST`
- **URL**: `/api/authbuild/google-login`
- **Description**: Verifies Google ID token and logs in/registers user.
- **Request Body**: `{ "token": "google_id_token_string" }`
- **Response**: `200 OK` (same format as standard login).

### 3. Unified Signup
- **Method**: `POST`
- **URL**: `/api/authbuild/signup`
- **Description**: Registers a new Student or Institution.
- **Request Body**: User data + Role specific data (`personal_info`, `address` for students).
- **Response**: `201 Created`

---

## Scholarships (`/api/scholarship`)

### 1. Get All Scholarships
- **Method**: `GET`
- **URL**: `/api/scholarship/all`
- **Description**: Retrieves active scholarships (paginated).
- **Authentication**: None (Public)
- **Query Params**: `page`, `limit`, `province`, `district`.

### 2. Create Scholarship
- **Method**: `POST`
- **URL**: `/api/scholarship/create`
- **Authentication**: Bearer Token (Role: `institution`)
- **Request Body**: Scholarship details (`scholarshipTitle`, `totalSeats`, `eligibilityCriteria`).
- **Response**: `201 Created`

---

## Applications (`/api/application`)

### 1. Apply for Scholarship
- **Method**: `POST`
- **URL**: `/api/application/apply`
- **Authentication**: Bearer Token (Role: `student`)
- **Request Body**: `{ "scholarshipId": "..." }`
- **Response**: `201 Created`
- **Error Handling**: `400 You have already applied for this scholarship`.

### 2. Review Application
- **Method**: `PATCH`
- **URL**: `/api/application/:id/review`
- **Authentication**: Bearer Token (Role: `institution`)
- **Request Body**: `{ "status": "approved", "rejectionReason": "..." }`
- **Response**: `200 OK`

---

## Student Profile (`/api/student`)

### 1. Upload Document
- **Method**: `POST`
- **URL**: `/api/student/documents`
- **Authentication**: Bearer Token (Role: `student`)
- **Headers**: `Content-Type: multipart/form-data`
- **Request**: Form data with file attached to `document` key.
- **Response**: `200 OK` with uploaded document metadata.
