# Email Service Error Resolution Guide

## Current Issue
The email service is failing due to CORS (Cross-Origin Resource Sharing) restrictions when trying to send emails directly from the frontend to the Resend API.

## Error Details
- **Error Type**: CORS Policy Violation
- **Location**: Contact form submission
- **Cause**: Browser security prevents direct API calls from frontend to external services
- **Impact**: Email notifications fail, but form data is still saved

## Solution Options

### Option 1: Local Backend Server (Recommended for Development)

#### Step 1: Create Backend Directory
```bash
mkdir chefpro-backend
cd chefpro-backend
```

#### Step 2: Initialize Node.js Project
```bash
npm init -y
```

#### Step 3: Install Dependencies
```bash
npm install express cors dotenv resend
npm install -D @types/node @types/express typescript ts-node nodemon
```

#### Step 4: Create TypeScript Configuration
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### Step 5: Create Server File
Create `src/server.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, html'
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'ChefPro <noreply@yourdomain.com>', // Replace with your domain
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Email service running on port ${port}`);
});
```

#### Step 6: Create Environment File
Create `.env` in the backend directory:
```env
RESEND_API_KEY=your_resend_api_key_here
PORT=3002
```

#### Step 7: Update Package.json Scripts
Add to `package.json`:
```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

#### Step 8: Start Backend Server
```bash
npm run dev
```

### Option 2: Vercel Serverless Function (Recommended for Production)

#### Step 1: Create API Directory
In your main project, create `api/send-email.ts`:
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html } = req.body;

    const { data, error } = await resend.emails.send({
      from: 'ChefPro <noreply@yourdomain.com>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      return res.status(400).json({ success: false, error });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
```

#### Step 2: Add Environment Variable
Add to `.env.local`:
```env
RESEND_API_KEY=your_resend_api_key_here
```

#### Step 3: Deploy to Vercel
```bash
vercel --prod
```

### Option 3: Netlify Functions

#### Step 1: Create Functions Directory
Create `netlify/functions/send-email.ts`:
```typescript
import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { to, subject, html } = JSON.parse(event.body || '{}');

    const { data, error } = await resend.emails.send({
      from: 'ChefPro <noreply@yourdomain.com>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Internal server error' })
    };
  }
};
```

## Frontend Configuration

### Update Email Service URL
In `src/services/emailService.ts`, update the backend URL:
```typescript
const BACKEND_URL = 'http://localhost:3002'; // For local development
// const BACKEND_URL = 'https://your-vercel-app.vercel.app'; // For production
```

## Testing the Solution

### 1. Test Backend Health
```bash
curl http://localhost:3002/health
```

### 2. Test Email Endpoint
```bash
curl -X POST http://localhost:3002/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>"
  }'
```

### 3. Test Frontend Integration
1. Fill out the contact form
2. Check browser console for errors
3. Check backend logs for email sending status

## Troubleshooting

### Common Issues

#### 1. CORS Errors
- Ensure backend CORS is configured for your frontend URL
- Check that both frontend and backend are running

#### 2. API Key Issues
- Verify RESEND_API_KEY is set correctly
- Check API key permissions in Resend dashboard

#### 3. Domain Verification
- Verify your sending domain in Resend
- Use a verified domain in the 'from' field

#### 4. Port Conflicts
- If port 3002 is in use, change PORT in .env
- Update frontend BACKEND_URL accordingly

### Debug Steps

1. **Check Backend Logs**: Look for error messages in terminal
2. **Check Network Tab**: Verify API calls are reaching backend
3. **Check Environment Variables**: Ensure all required vars are set
4. **Test API Directly**: Use curl or Postman to test endpoints

## Production Deployment

### Environment Variables Required
- `RESEND_API_KEY`: Your Resend API key
- `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend URLs

### Security Considerations
- Use HTTPS in production
- Implement rate limiting
- Add request validation
- Use environment-specific configurations

## Alternative Solutions

### 1. Email Service Providers with CORS Support
- EmailJS (supports direct frontend calls)
- Formspree (form handling service)

### 2. Form Handling Services
- Netlify Forms
- Formik with backend integration

### 3. Third-party APIs
- SendGrid with proper CORS configuration
- Mailgun with proxy setup

## Support

If you continue experiencing issues:
1. Check the browser console for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure your domain is verified with Resend
4. Test the backend endpoint independently

For additional help, refer to:
- [Resend Documentation](https://resend.com/docs)
- [Express.js CORS Guide](https://expressjs.com/en/resources/middleware/cors.html)
- [Vercel API Routes](https://vercel.com/docs/concepts/functions/serverless-functions)