# Netlify Deployment Guide for ChefPro

## The Issue You Encountered

The errors you're seeing are common deployment issues:

1. **MIME type error**: This happens when you deploy source code instead of the built application
2. **404 for vite.svg**: The server can't find static assets because they're not in the right location

## Root Cause

You likely deployed the entire project folder instead of the `dist` folder that contains the built application.

## Solution Steps

### 1. Build Your Application Locally

```bash
npm run build
```

This creates a `dist` folder with the production-ready files.

### 2. Deploy Options

#### Option A: Deploy dist folder only (Recommended)
1. Zip only the contents of the `dist` folder
2. Upload this zip to Netlify
3. Make sure to extract it in the root of your Netlify site

#### Option B: Connect Git Repository (Best Practice)
1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Netlify will automatically:
   - Run `npm run build`
   - Deploy the `dist` folder
   - Use the settings from `netlify.toml`

### 3. Netlify Configuration

I've created a `netlify.toml` file with the correct settings:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **SPA redirects**: All routes redirect to `index.html`
- **MIME type headers**: Proper JavaScript content types

### 4. Environment Variables

If you're using Supabase or other services, add your environment variables in Netlify:

1. Go to Site Settings → Environment Variables
2. Add your variables (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

## Files Created/Modified

1. **netlify.toml** - Netlify configuration
2. **public/_redirects** - SPA routing support
3. **vite.config.ts** - Updated build configuration

## Verification

After deployment, your site should:
- Load without MIME type errors
- Handle client-side routing properly
- Serve all static assets correctly

## Common Mistakes to Avoid

1. ❌ Don't deploy the entire project folder
2. ❌ Don't forget to run `npm run build` first
3. ❌ Don't ignore environment variables
4. ✅ Always deploy the `dist` folder contents
5. ✅ Use Git integration for automatic deployments
6. ✅ Test locally with `npm run preview` first

## Testing Locally

Before deploying, test the production build:

```bash
npm run build
npm run preview
```

This serves the built application locally on port 3000.

## Need Help?

If you still encounter issues:
1. Check Netlify's deploy logs
2. Verify all environment variables are set
3. Ensure the `dist` folder contains `index.html` and `assets/` folder
4. Check browser console for specific error messages