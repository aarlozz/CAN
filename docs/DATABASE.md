# Database Schema

## `User`
- **Purpose**: Base authentication table.
- **Columns**: `_id`, `name`, `email` (unique), `password` (conditionally required), `authProvider` (local/google), `googleId`, `role` (enum), `isVerified`.
- **Indexes**: `{ email: 1 }`
- **Constraints**: Email must be unique. Password required if `authProvider === 'local'`.

## `StudentProfile`
- **Purpose**: Extended details for student users.
- **Columns**:
  - `user` (ObjectId, ref: User, unique)
  - `personal_info`: dob, gender, phone
  - `address`: province, district, municipality, ward, street, plus location refs.
  - `guardian_info`: name, relation, phone, occupation
  - `educationInfo`: schoolName, type, currentLevel
  - `reservationInfo`: caste, disability
  - `documents`: Embedded array of uploaded file paths.
- **Indexes**: `{ user: 1 }`, `{ "address.province": 1 }`, `{ "address.district": 1 }`

## `InstitutionProfile`
- **Purpose**: Extended details for schools/colleges.
- **Columns**:
  - `user` (ObjectId, ref: User, unique)
  - `institutionName`, `institutionType`, `establishedYear`
  - `website`, `description`, `contactPerson`
  - `verification`: `{ status, verifiedBy, verifiedAt }`
  - `isApproved`: Boolean synced with verification status.

## `Scholarship`
- **Purpose**: Financial aid posted by an institution.
- **Columns**:
  - `institutionId` (ObjectId, ref: InstitutionProfile)
  - `scholarshipTitle`, `description`, `coverage`, `eligibilityCriteria`
  - `totalSeats`, `remainingSeats`
  - `locationFilter`: Restricts who can see it.
  - `isActive`, `applicationDeadline`
- **Indexes**: Text index on `scholarshipTitle` and `description`.

## `ScholarshipApplication`
- **Purpose**: A record of a student applying to a scholarship.
- **Columns**:
  - `scholarshipId` (ObjectId, ref: Scholarship)
  - `studentId` (ObjectId, ref: StudentProfile)
  - `applicationStatus` (pending, approved, rejected, withdrawn)
  - `studentSnapshot`: Freezes the student's profile data at the time of application to preserve history if their profile changes.
- **Constraints**: Compound unique index `{ scholarshipId: 1, studentId: 1 }` prevents duplicate applications.

## `Notification` & `ActivityLog` (Legacy)
- **Purpose**: Track system events and alert users.
- **Indexes**: Use MongoDB TTL indexes to auto-delete after 30 and 90 days respectively.
