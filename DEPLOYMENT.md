# Smartchain AI - Render Deployment Guide

This guide will help you deploy your Smartchain AI application to Render.

## Prerequisites

1. A GitHub account with your Smartchain AI repository
2. A Render account (free tier available)

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository contains the following files:
- `render.yaml` - Render configuration file
- `backend/requirements.txt` - Python dependencies
- `backend/runtime.txt` - Python version specification
- `frontend/package.json` - Node.js dependencies

### 2. Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. **Connect your GitHub repository to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" and select "Blueprint"
   - Connect your GitHub account and select your Smartchain AI repository
   - Render will automatically detect the `render.yaml` file

2. **Deploy:**
   - Render will create both services (backend and frontend) automatically
   - The deployment will take 5-10 minutes

#### Option B: Manual Deployment

1. **Deploy Backend:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Set the following:
     - **Name:** `smartchain-ai-backend`
     - **Root Directory:** `backend`
     - **Environment:** `Python`
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

2. **Deploy Frontend:**
   - Click "New +" and select "Static Site"
   - Connect your GitHub repository
   - Set the following:
     - **Name:** `smartchain-ai-frontend`
     - **Root Directory:** `frontend`
     - **Build Command:** `npm install && npm run build`
     - **Publish Directory:** `build`

### 3. Environment Variables

The following environment variables will be automatically set by Render:

**Backend:**
- `PYTHON_VERSION`: 3.10.0
- `DATABASE_URL`: SQLite database (for free tier)
- `SECRET_KEY`: Auto-generated
- `ALGORITHM`: HS256
- `ACCESS_TOKEN_EXPIRE_MINUTES`: 30

**Frontend:**
- `REACT_APP_API_URL`: Points to your backend service

### 4. Custom Domain (Optional)

1. Go to your service settings in Render
2. Click on "Custom Domains"
3. Add your domain and follow the DNS configuration instructions

## Post-Deployment

### 1. Test Your Application

1. Visit your frontend URL: `https://smartchain-ai-frontend.onrender.com`
2. Test the login functionality
3. Verify that the backend API is working

### 2. Database Setup

The application uses SQLite by default. For production, consider:
- Upgrading to a paid Render plan for PostgreSQL
- Using an external database service

### 3. Environment Variables

You may need to set additional environment variables:
- `OMNIDIMENSION_API_KEY`
- `OMNIDIMENSION_AGENT_ID`
- `JWT_SECRET_KEY`

## Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in `requirements.txt`
   - Verify Python version in `runtime.txt`

2. **API Connection Issues:**
   - Verify the `REACT_APP_API_URL` environment variable
   - Check CORS settings in the backend

3. **Database Issues:**
   - Ensure the database file is being created
   - Check database permissions

### Logs

- View logs in the Render dashboard under your service
- Backend logs show API requests and errors
- Frontend logs show build and deployment status

## Updating Your Application

1. Push changes to your GitHub repository
2. Render will automatically redeploy your services
3. Monitor the deployment logs for any issues

## Cost Considerations

- **Free Tier:** Limited to 750 hours/month per service
- **Paid Plans:** Start at $7/month per service
- **Database:** Free tier includes SQLite, paid plans include PostgreSQL

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Documentation](https://reactjs.org/docs) 