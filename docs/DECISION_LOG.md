# Decision Log

## 1. Unified Authentication Flow
- **Decision**: Migrate from separate student/institution auth routes to a unified `/api/authbuild/*` flow.
- **Reason**: Maintaining separate login routes caused code duplication and made adding third-party auth (Google) incredibly difficult.
- **Alternatives Considered**: Keeping separate tables for Students and Institutions.
- **Pros**: Cleaner codebase, centralized JWT issuance, easier OAuth integration.
- **Cons**: Required significant refactoring of frontend routing and Context API.

## 2. Defaulting Google OAuth to Student Role
- **Decision**: When a new user signs up via Google, they are automatically assigned the `student` role.
- **Reason**: 95% of incoming traffic will be students. Institutions have complex verification requirements (establishing year, address, contact persons) that cannot be pulled from a basic Google Profile.
- **Future Implications**: Institutions must use the manual signup form. If an institution accidentally signs up via Google, they will be stuck as a student and must contact support.

## 3. Snapshotting Student Profiles on Application
- **Decision**: In `ScholarshipApplication`, the student's data is copied into a `studentSnapshot` object rather than just relying on a Mongoose `.populate()` reference.
- **Reason**: If a student applies to a scholarship in 2025, and then updates their grades or changes their address in 2026, the historical 2025 application must remain unchanged for auditing purposes.
- **Pros**: Perfect historical accuracy.
- **Cons**: Slightly larger database footprint per application.

## 4. Retaining Empty Profiles for OAuth
- **Decision**: When creating an OAuth user, an empty `StudentProfile` is immediately generated with placeholder "Not Specified" strings.
- **Reason**: To prevent frontend crashes where components expect `profile.address` to exist.
- **Alternatives**: Making all schema fields optional.
- **Pros**: Keeps strict schema validations intact.
