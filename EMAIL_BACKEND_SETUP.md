# Email Service Backend Setup

## Problem
The Resend API calls are failing due to CORS policy when called directly from the frontend. Email APIs should be called from the backend for security and CORS compliance.

## Solution
We've created a backend API endpoint that handles email sending. Here are the setup options:

### Option 1: Local Backend Server (Development)

1. Create a new directory for the backend:
```bash
mkdir chefpro-backend
cd chefpro-backend
npm init -y
```

2. Install dependencies:
```bash
npm install express cors resend dotenv
npm install -D @types/node @types/express typescript ts-node nodemon
```

3. Create the server file (server.js or server.ts)
4. Add your RESEND_API_KEY to the backend .env file
5. Run the backend server on port 3001

### Option 2: Serverless Function (Production)

Deploy the `src/api/sendEmail.ts` file as:
- Vercel Function
- Netlify Function  
- AWS Lambda
- Any other serverless platform

### Option 3: Temporary Workaround (Current)

The current implementation will:
1. Try to call the backend API first
2. Fall back to direct API calls (which will fail due to CORS)
3. Still save the form data to the database
4. Show success message to user

## Environment Variables Needed

Backend .env file:
```
RESEND_API_KEY=your_actual_resend_api_key_here
PORT=3001
```

Frontend .env file:
```
VITE_BACKEND_URL=http://localhost:3001
# or your deployed backend URL
```

## Current Status
- Form submissions are saved to database ✅
- User sees success message ✅  
- Email notifications fail due to CORS ❌
- Need backend deployment for email functionality ⚠️