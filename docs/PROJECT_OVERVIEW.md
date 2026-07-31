# Project Overview

## Project Name
CAN - Computer Association Nepal (Scholarship Management Platform)

## Elevator Pitch
CAN is a modern, unified platform connecting students across Nepal with educational institutions offering scholarships, streamlining the application, verification, and management process into a single, seamless digital experience.

## Problem Statement
The current scholarship application process in Nepal is fragmented, paper-heavy, and difficult to track. Students struggle to find relevant scholarships, and institutions face high administrative overhead in processing, verifying, and managing thousands of paper-based or disjointed digital applications.

## Vision
To democratize access to education in Nepal by providing a transparent, centralized, and highly efficient scholarship portal that bridges the gap between deserving students and generous institutions.

## Goals
- Centralize all scholarship listings in Nepal.
- Provide a unified, role-based portal for Students, Institutions, and Administrators.
- Automate eligibility checking and application tracking.
- Reduce administrative overhead for institutions.
- Digitize document uploads and verifications.

## Target Users
1. **Students**: High school graduates and current students seeking financial aid for +2, Bachelors, or Masters programs.
2. **Institutions**: Schools, Colleges, and Universities offering scholarships.
3. **Administrators**: District, Provincial, and Super Admins who oversee the platform, verify institutions, and generate reports.

## Current Status
**Phase:** Minimum Viable Product (MVP) / Active Development
The core flow (Signup, Login, Scholarship Creation, Application Submission) is functional. The system recently migrated to a unified authentication flow (ESM modules) and integrated Google OAuth 2.0.

## Feature Summary
- **Unified Authentication**: Single entry point for all roles (Local + Google OAuth 2.0).
- **Role-Based Dashboards**: Custom interfaces for Students, Institutions, and Admins.
- **Scholarship Management**: Institutions can post, edit, and manage scholarships.
- **Application System**: Students can apply to scholarships with merit and reservation details.
- **Document Management**: Secure file uploads for academic and reservation certificates.
- **Location Filtering**: Scholarships and profiles tied to Nepal's Province/District/Municipality hierarchy.

## High-Level Architecture
- **Frontend**: React (Vite) + Tailwind CSS + Axios.
- **Backend**: Node.js + Express.js.
- **Database**: MongoDB Atlas (Mongoose ODM).
- **Authentication**: JWT (JSON Web Tokens) stored in localStorage, backed by bcrypt password hashing and Google OAuth 2.0.
- **File Storage**: Local disk storage via Multer (currently).

## Tech Stack
| Layer | Technology |
|---|---|
| **Frontend Framework** | React v19.2.0 |
| **Build Tool** | Vite v7.2.4 |
| **Styling** | Tailwind CSS v4.1.18 |
| **Routing** | React Router DOM v7.11.0 |
| **Backend Framework** | Express.js v5.2.1 |
| **Database** | MongoDB v7.2.0 |
| **ODM** | Mongoose v9.1.2 |
| **Auth** | jsonwebtoken, bcryptjs, @react-oauth/google |

## Current Development Phase
- Stabilizing the unified authentication flow.
- Completing the transition from legacy CommonJS (CJS) files to modern ECMAScript Modules (ESM).
- Enhancing security (rate limiting, secure cookies) — *⚠ Needs Confirmation if prioritized for next sprint*.

## Project Timeline
- **Past**: Initial separate portals for Students and Institutions (legacy code still present).
- **Present**: Unification of Auth, Google OAuth integration, Mongoose schema strictness fixes.
- **Future**: Admin portal completion, advanced reporting, moving file storage to AWS S3.
