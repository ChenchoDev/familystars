# FamilyStars Deployment Guide

## Overview
FamilyStars is deployed across multiple platforms:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render.com (Node.js + Express)
- **Database**: Neon (PostgreSQL - serverless)

## Pre-Deployment Checklist

### Prerequisites
- GitHub account for version control
- Vercel account (https://vercel.com)
- Render account (https://render.com)
- Neon account (https://neon.tech) - Database should already be set up
- Cloudinary account for image hosting
- Resend account for email delivery

### Current Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://neondb_owner:...@ep-noisy-voice-alyfy5eb-pooler.c-3.eu-central-1.aws.neon.tech/neondb
JWT_SECRET=0fa1de324dd03146fc2a6426f93cb864bd1eea4547b3c46a5667fb737a67473c
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000 (Render will set this)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RESEND_API_KEY=your-resend-key
EMAIL_FROM=noreply@familystars.app
FRONTEND_URL=https://familystars.vercel.app
ADMIN_EMAIL=chencho@example.com
```

#### Frontend (.env)
```
VITE_API_URL=https://familystars-api.onrender.com
```

## Deployment Steps

### 1. Frontend Deployment (Vercel)

#### Option A: Using Git (Recommended)
1. Initialize git and push to GitHub:
   ```bash
   cd d:/chenchoWeb/familystars
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/familystars.git
   git push -u origin main
   ```

2. In Vercel Dashboard:
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select `apps/frontend` as root directory
   - Add environment variable: `VITE_API_URL` = `https://familystars-api.onrender.com`
   - Deploy

#### Option B: Direct Deployment
```bash
npm install -g vercel
cd apps/frontend
vercel --prod
```

### 2. Backend Deployment (Render)

#### Option A: Using render.yaml
1. Push code to GitHub (if not already done)
2. In Render Dashboard:
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select `render.yaml`
   - Render will automatically create the service

#### Option B: Manual Setup
1. In Render Dashboard:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `familystars-api`
     - **Environment**: Node
     - **Build Command**: `cd apps/backend && npm install`
     - **Start Command**: `cd apps/backend && npm start`
     - **Root Directory**: `.` (or leave empty)

2. Add Environment Variables:
   - `DATABASE_URL`: [Your Neon connection string]
   - `JWT_SECRET`: [Same as backend .env]
   - `CLOUDINARY_CLOUD_NAME`: [Your Cloudinary name]
   - `CLOUDINARY_API_KEY`: [Your Cloudinary key]
   - `CLOUDINARY_API_SECRET`: [Your Cloudinary secret]
   - `RESEND_API_KEY`: [Your Resend API key]
   - `FRONTEND_URL`: `https://familystars.vercel.app`
   - And all other vars from the .env file

3. Deploy and note the API URL (usually `https://familystars-api.onrender.com`)

### 3. Update Frontend API URL
Once backend is deployed to Render:
1. Update `apps/frontend/.env`:
   ```
   VITE_API_URL=https://familystars-api.onrender.com
   ```

2. Rebuild and redeploy frontend on Vercel

## Post-Deployment

### Health Check
- Frontend: https://familystars.vercel.app
- Backend: https://familystars-api.onrender.com/health

### Database Setup
If needed, run migrations on production:
```bash
npm run migrate:prod
```

### Monitoring
- **Vercel**: https://vercel.com/dashboard
- **Render**: https://dashboard.render.com
- **Neon**: https://console.neon.tech

## Troubleshooting

### Vercel Issues
- **Build fails**: Check `npm run build` locally first
- **Env vars not loading**: Verify in Project Settings → Environment Variables
- **API calls failing**: Ensure VITE_API_URL is correct

### Render Issues
- **Build fails**: Check build logs in Render dashboard
- **DB connection fails**: Verify DATABASE_URL is correct and Neon is accessible
- **Service crashes**: Check logs for errors (Runtime Logs tab)

## Rollback
If needed, both Vercel and Render allow you to redeploy previous versions from their dashboards.

## Notes
- First deploy may take 5-10 minutes
- Neon free tier includes 3GB storage
- Render free tier includes 750 hours/month
- Vercel free tier supports unlimited projects
