# Deployment Guide: GitHub & Netlify

This guide provides step-by-step instructions for deploying your Industrial Kitchen Consultancy website to GitHub and Netlify.

## Prerequisites

- Git installed on your computer
- GitHub account
- Netlify account
- Node.js and npm installed

## Part 1: Uploading to GitHub

### Step 1: Initialize Git Repository
```bash
cd c:\Users\Gaming\Downloads\chefpro
git init
```

### Step 2: Create .gitignore (if not exists)
Ensure your `.gitignore` file includes:
```
node_modules/
dist/
.env
.env.local
.env.production
*.log
.DS_Store
```

### Step 3: Add and Commit Files
```bash
git add .
git commit -m "Initial commit: Industrial Kitchen Consultancy website"
```

### Step 4: Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository" (+ icon)
3. Name your repository (e.g., "industrial-kitchen-consultancy")
4. Choose "Public" or "Private"
5. Do NOT initialize with README (since you already have files)
6. Click "Create repository"

### Step 5: Connect Local Repository to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
git branch -M main
git push -u origin main
```

### Step 6: Future Updates
For future changes:
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

## Part 2: Deploying to Netlify

### Method A: Deploy from GitHub (Recommended)

#### Step 1: Connect Netlify to GitHub
1. Go to [Netlify.com](https://netlify.com)
2. Sign up/Login
3. Click "New site from Git"
4. Choose "GitHub"
5. Authorize Netlify to access your GitHub

#### Step 2: Configure Build Settings
1. Select your repository
2. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** (leave empty)

#### Step 3: Environment Variables (if needed)
1. Go to Site settings > Environment variables
2. Add any required environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Any other environment variables your app needs

#### Step 4: Deploy
1. Click "Deploy site"
2. Wait for build to complete
3. Your site will be available at a random Netlify URL

#### Step 5: Custom Domain (Optional)
1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow instructions to configure DNS

### Method B: Manual Deploy

#### Step 1: Build the Project
```bash
npm run build
```

#### Step 2: Deploy to Netlify
1. Go to [Netlify.com](https://netlify.com)
2. Drag and drop the `dist` folder to the deploy area
3. Your site will be deployed instantly

## Important Notes

### For GitHub:
- Never commit sensitive information (API keys, passwords)
- Use environment variables for sensitive data
- Keep your repository updated regularly
- Use meaningful commit messages

### For Netlify:
- Automatic deployments trigger on every GitHub push (Method A)
- Build logs are available in the Netlify dashboard
- Free tier includes 100GB bandwidth and 300 build minutes
- HTTPS is automatically enabled

### Environment Variables Setup:
1. Create `.env.local` file in your project root:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Add these same variables in Netlify dashboard under Site settings > Environment variables

### Build Optimization:
- Ensure all dependencies are in `package.json`
- Test build locally before deploying: `npm run build`
- Check for any build warnings or errors

## Troubleshooting

### Common GitHub Issues:
- **Authentication failed:** Use personal access token instead of password
- **Permission denied:** Check repository permissions
- **Large files:** Use Git LFS for files over 100MB

### Common Netlify Issues:
- **Build failed:** Check build logs in Netlify dashboard
- **404 errors:** Ensure `_redirects` file for SPA routing
- **Environment variables:** Verify all required variables are set

### SPA Routing Fix for Netlify:
Create `public/_redirects` file with:
```
/*    /index.html   200
```

## Success Checklist

### GitHub:
- [ ] Repository created and code uploaded
- [ ] .gitignore properly configured
- [ ] No sensitive data committed
- [ ] Repository is accessible

### Netlify:
- [ ] Site deployed successfully
- [ ] Build completes without errors
- [ ] Environment variables configured
- [ ] Site loads and functions properly
- [ ] Custom domain configured (if applicable)

## Next Steps

1. Test your deployed site thoroughly
2. Set up monitoring and analytics
3. Configure custom domain if needed
4. Set up continuous deployment workflow
5. Consider setting up staging environment

Your Industrial Kitchen Consultancy website should now be live and accessible to users worldwide!