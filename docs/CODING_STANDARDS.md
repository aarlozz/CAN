# Coding Standards

## Architecture Principles
- **Separation of Concerns**: Controllers should not define database schemas. Routes should not contain business logic.
- **Fat Models, Skinny Controllers**: Push data validation logic (like password conditions) into Mongoose Schemas rather than Controller checks where possible.

## Naming Conventions
- **Files/Folders**: PascalCase for React components (`StudentDashboard.jsx`), camelCase for standard JS files (`api.js`, `authControllerbuilding.js`).
- **Variables/Functions**: camelCase.
- **Database Fields**: camelCase preferred, though some legacy fields use snake_case (`personal_info`). Do not rename existing legacy fields without running a database migration.

## Error Handling
- **Backend**: Wrap all controller logic in `try/catch` blocks. Always return a structured JSON error response: `return res.status(400).json({ message: "Error description" });`
- **Frontend**: Log errors to the console, and map the `err.response?.data?.message` directly to a local UI `error` state variable to display to the user.

## Security Practices
- **Never commit `.env` files**.
- Do not log sensitive user data (passwords, full tokens) to the console, even in development.
- Always use `protect` and `requireRole` middleware on sensitive backend endpoints.

## Git Workflow
- Use semantic commit messages (e.g., `feat: add google login`, `fix: update redirect path`, `chore: install dependencies`, `docs: update readme`).
- Small, atomic commits are preferred over massive bundled commits.
