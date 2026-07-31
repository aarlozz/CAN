# CAN — Computer Association Nepal
## Project Overview

CAN (Computer Association Nepal) is a full-stack web platform designed to connect **students** with **scholarship opportunities** offered by educational institutions across Nepal. It enables institutions to post scholarships, students to discover and apply for them, and administrators to manage the platform.

---

## Purpose

The platform solves a core problem in Nepal's education sector: students do not know what scholarships exist, and institutions struggle to reach eligible students. CAN bridges this gap with:

- A public scholarship directory (no login required to browse)
- Student profile management for organized applications
- Institution dashboards to post and manage scholarships
- An application review workflow: pending → under review → approved/rejected

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | Runtime | Server-side JavaScript |
| Express.js | ^5.2.1 | REST API framework |
| MongoDB | ^7.2.0 | NoSQL database |
| Mongoose | ^9.1.2 | ODM for MongoDB |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT authentication |
| multer | ^2.1.1 | File upload handling |
| cors | ^2.8.5 | Cross-Origin Resource Sharing |
| dotenv | ^17.2.3 | Environment variable management |
| nodemon | ^3.1.11 | Dev server auto-restart |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2.0 | UI library |
| React Router DOM | ^7.11.0 | Client-side routing |
| Vite | ^7.2.4 | Build tool and dev server |
| Axios | ^1.13.5 | HTTP client for API calls |
| Tailwind CSS | ^4.1.18 | Utility-first CSS framework |

---

## User Roles

The system has 5 defined roles in the User model:

| Role | Description |
|---|---|
| student | Can browse scholarships, apply, and manage their profile |
| institution | Can post scholarships and review student applications |
| district_admin | District-level administrator (defined, not yet wired to routes) |
| province_admin | Can verify/reject institutions within their province |
| super_admin | Full platform access |

Note: `college` is a legacy role name seen in older files that was renamed to `institution` in the active codebase. Both naming conventions coexist during transition.

---

## Key Features

### For Students
- Register with personal, address, guardian, and education info
- Browse all scholarships publicly (no login required)
- View full scholarship details including eligibility criteria
- Apply for scholarships (merit-based or reservation-based)
- Upload supporting documents (PDF, JPG, PNG, max 5MB each)
- Track application status: pending, under review, approved, rejected
- Withdraw a pending application
- Manage profile: education info, reservation info, uploaded documents

### For Institutions
- Register with institution details (type, location, contact person)
- Post new scholarship listings with eligibility criteria, seat count, deadline
- View and manage their posted scholarships
- Review incoming student applications
- Approve or reject applications with notes/reasons
- View institution dashboard with statistics

### For Admins
- Platform statistics overview
- List all users (super_admin only)
- Deactivate user accounts (super_admin only)
- Verify or reject colleges/institutions (province_admin + super_admin)

---

## Folder Structure

```
CAN/
├── backend/
│   ├── app.js                        # Express setup, middleware, route mounting
│   ├── server.js                     # Entry point — connects DB, starts server
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── controllers/                  # Business logic (12 files)
│   │   ├── authController.js
│   │   ├── authControllerbuilding.js
│   │   ├── InstitutionProfileController.js
│   │   ├── StudentProfileController.js
│   │   ├── adminController.js
│   │   ├── applicationController.js
│   │   ├── collegeController.js
│   │   ├── locationController.js
│   │   ├── notificationController.js
│   │   ├── scholarshipController.js
│   │   └── studentController.js
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT protect + requireRole
│   │   ├── errorHandler.js
│   │   └── upload.js                 # Multer config
│   ├── models/                       # Mongoose schemas (17 files)
│   │   ├── User.js
│   │   ├── StudentProfile.js
│   │   ├── InstitutionProfile.js
│   │   ├── Scholarship.js
│   │   ├── ScholarshipApplication.js
│   │   ├── Notification.js
│   │   ├── Activitylog.js
│   │   ├── Admin.js
│   │   ├── Provincialadmin.js
│   │   ├── Province.js
│   │   ├── District.js
│   │   └── Municipality.js
│   ├── routes/                       # Route definitions (12 files)
│   └── utils/
│       ├── asyncHandler.js
│       ├── generateToken.js
│       ├── notificationHelper.js
│       ├── paginate.js
│       └── seeder.js
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── services/
        │   └── api.js                # Axios instance with JWT interceptor
        ├── context/
        │   └── AuthContext.jsx       # Global auth state
        ├── Components/
        │   ├── ProtectedRoute.jsx
        │   ├── header.jsx
        │   └── footer.jsx
        └── pages/
            ├── home.jsx
            ├── auth/                 # Login and signup pages
            ├── Dashboard/            # Role-specific dashboards
            └── scholarships/        # Scholarship browsing and detail
```

---

## Active vs. Legacy Files

The codebase is mid-refactor. Some files use the older `college` terminology and CommonJS require(), while newer files use `institution` and ES Modules import/export.

| Status | Files |
|---|---|
| Active (ESM) | authControllerbuilding.js, scholarshipController.js, applicationController.js, StudentProfileController.js |
| Legacy (CJS) | adminRoutes.js, collegeRoutes.js, notificationRoutes.js, College.js, Admin.js, Activitylog.js |

---

## Environment Variables

Backend (`.env` in `/backend`):
```
MONGO_URI=<MongoDB connection string>
JWT_SECRET=<secret key>
JWT_EXPIRE=1d
```

Frontend (`.env` in `/frontend`):
```
VITE_API_URL=http://localhost:5000/api
```

---

## Running the Project

```bash
# Backend — http://localhost:5000
cd backend && npm run dev

# Frontend — http://localhost:5173
cd frontend && npm run dev
```
