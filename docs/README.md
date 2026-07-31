# CAN - Computer Association Nepal

![CAN Logo](../frontend/src/assets/images/logo/CAN_logo.png)

A unified scholarship management platform designed to connect students across Nepal with educational institutions offering financial aid.

## Features
- 🎓 **Student Portal**: Browse scholarships, manage academic profiles, and apply seamlessly.
- 🏫 **Institution Portal**: Create and manage scholarship listings, and review incoming applications.
- 🔐 **Secure Authentication**: Features Google OAuth 2.0 integration alongside standard encrypted credentials.
- 📄 **Document Management**: Securely upload and attach academic transcripts to applications.

## Architecture Overview
This platform is built on the **MERN Stack**:
- **MongoDB Atlas** (Mongoose ODM)
- **Express.js** (Node.js backend)
- **React** (Vite, Tailwind CSS frontend)

For an in-depth look at the system architecture, please see [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md).

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CAN
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   # Create a .env file based on docs/DEVELOPMENT_GUIDE.md
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file based on docs/DEVELOPMENT_GUIDE.md
   npm run dev
   ```

## Folder Structure
- `/backend`: Express API, Mongoose Models, Controllers, Multer configurations.
- `/frontend`: React SPA, Tailwind styles, Context API.
- `/docs`: Permanent AI Knowledge Base and architectural documentation.

## Contributing
To maintain codebase integrity, please refer to our [`docs/CODING_STANDARDS.md`](./CODING_STANDARDS.md) before submitting pull requests.

## License
ISC License
