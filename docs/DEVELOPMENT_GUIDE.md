# Development Guide

## Prerequisites
- Node.js v18 or v22
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console account (for OAuth 2.0 Client ID)

## Environment Variables

### Backend (`backend/.env`)
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/can_db
PORT=5000
NODE_ENV=development
JWT_SECRET=generate_a_strong_random_string
JWT_EXPIRE=1d
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

## Running Locally
1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *(Server starts on port 5000 using nodemon)*

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *(Server starts on port 5173 using Vite)*

## Common Problems & Solutions

### 1. `MongooseError: Operation users.findOne() buffering timed out`
- **Cause**: IP Address is not whitelisted in MongoDB Atlas.
- **Solution**: Go to Atlas Network Access -> Add IP Address -> Add Current IP.

### 2. `Error 401: invalid_client (Google OAuth popup)`
- **Cause**: `VITE_GOOGLE_CLIENT_ID` is missing in `frontend/.env` or Vite server was not restarted after editing `.env`.
- **Solution**: Add the real Client ID and completely restart `npm run dev`.

### 3. "Please sign in with Google" error on manual login form
- **Cause**: The user registered via Google, so they do not have a password stored in the DB.
- **Solution**: Use the Google button. This is intentional security behavior.
