# CAN — Architecture & Implementation Details

## System Architecture

```text
+-----------------------+       HTTP/REST       +-------------------------+
|                       |  (Axios, JWT Auth)    |                         |
|     React Frontend    | <===================> |   Express.js Backend    |
| (Vite, Tailwind CSS)  |                       |       (Node.js)         |
|                       |                       |                         |
+-----------------------+                       +-------------------------+
                                                             |
                                                             | Mongoose (ODM)
                                                             v
                                                +-------------------------+
                                                |                         |
                                                |    MongoDB Database     |
                                                |  (Cloud / Localhost)    |
                                                |                         |
                                                +-------------------------+
```

---

## Authentication Flow

### 1. Registration
1. User submits signup form (student or institution) to `POST /api/authbuild/signup`.
2. Backend creates a core `User` document with hashed password (via `bcryptjs`).
3. Backend creates a role-specific profile (`StudentProfile` or `InstitutionProfile`) linked to the User ID.

### 2. Login
1. User submits credentials to `POST /api/authbuild/login`.
2. Backend verifies password and fetches the user's role-specific profile.
3. Backend generates a JWT token (valid for 1 day) containing `{ id, role }`.
4. Frontend saves `token`, `user`, and `profile` data in `localStorage`.
5. Frontend's `AuthContext` hydrates state from `localStorage`.

### 3. Authenticated Requests
1. Axios interceptor automatically attaches `Authorization: Bearer <token>` to all requests.
2. Backend `protect` middleware verifies the token and attaches decoded info to `req.user`.
3. Backend `requireRole` middleware checks if `req.user.role` is permitted for the route.

---

## Database Schema (Key Collections)

### `User`
- **Fields:** `name`, `email` (unique), `password`, `role` (student/institution/admin), `isVerified`

### `StudentProfile`
- **Fields:** `user` (ref: User), `personal_info`, `address`, `guardian_info`, `educationInfo`, `reservationInfo`, `documents` (array of uploaded files).

### `InstitutionProfile`
- **Fields:** `user` (ref: User), `institutionName`, `institutionType`, `establishedYear`, `location`, `contactPerson`, `courses`, `verification` (status: pending/verified/rejected).

### `Scholarship`
- **Fields:** `institutionId` (ref: InstitutionProfile), `scholarshipTitle`, `description`, `coverage`, `eligibilityCriteria`, `totalSeats`, `remainingSeats`, `applicationDeadline`, `isActive`.

### `ScholarshipApplication`
- **Fields:** `scholarshipId` (ref: Scholarship), `studentId` (ref: StudentProfile), `applicationType` (merit/reservation), `applicationStatus` (pending/under_review/approved/rejected), `studentSnapshot` (freezes student data at the time of application), `meritDetails`, `reservationDetails`, `documents`, `review`.
- **Note:** Has a compound unique index on `(scholarshipId, studentId)` to prevent duplicate applications.

---

## API Endpoints

### Auth (`/api/authbuild`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/signup` | Register new student/institution | No |
| POST | `/login` | Authenticate and get JWT | No |

### Student (`/api/student`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/dashboard-student` | Get student profile | student |
| GET | `/my-applications` | Get student's applications | student |
| PATCH | `/education` | Update education info | student |
| POST | `/documents` | Upload supporting document | student |

### Institution (`/api/institution`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/dashboard-institution`| Get institution profile | institution |
| POST | `/courses` | Add a course | institution |
| PATCH | `/verify/:id` | Verify an institution | province/super admin |

### Scholarship (`/api/scholarship`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/all` | List all scholarships | No |
| GET | `/my` | List institution's scholarships | institution |
| POST | `/create` | Create a new scholarship | institution |
| GET | `/:id` | Get scholarship details | No |
| PATCH | `/:id` | Update scholarship | institution |

### Application (`/api/application`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/apply` | Submit an application | student |
| GET | `/my` | View student's applications | student |
| GET | `/institution` | View institution's received apps | institution |
| PATCH | `/:id/review` | Approve/Reject application | institution |

---

## File Upload Flow

1. **Frontend:** User selects a file (PDF/JPG/PNG, max 5MB).
2. **Backend:** Request passes through `multer` middleware.
3. **Storage:** File is saved to local disk at `uploads/students/{userId}/{fieldname}/{timestamp}_{filename}`.
4. **Database:** File metadata (path, name, size, type) is pushed to the `documents` array in the `StudentProfile` or `ScholarshipApplication` document.

---

## Technical Debt & Known Issues

1. **Role Naming:** Transitioning from the legacy term `college` to `institution` is ongoing. Some older files (e.g., `collegeRoutes.js`, `College.js` model) still exist alongside their newer counterparts.
2. **Auth Storage Mismatch:** `ProtectedRoute.jsx` checks `token` and `role` in `localStorage`, but `AuthContext.jsx` saves them as `can_token` and `can_user`. This can cause routing issues if not perfectly synchronized.
3. **File Storage:** Uploads are currently saved to the local disk. In a production environment, this should be migrated to cloud storage (e.g., AWS S3).
