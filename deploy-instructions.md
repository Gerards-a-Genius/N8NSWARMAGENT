# 🚀 Deploy Your Agent Swarm Webapp - Live Deployment Guide

Your webapp is ready for deployment! Here are several ways to get it live:

## Option 1: Netlify (Easiest - 3 minutes)

### Frontend Deployment:
1. **Visit**: https://app.netlify.com/drop
2. **Drag & Drop**: Drag the `frontend/build` folder to the browser
3. **Done!** You'll get a live URL instantly

### Backend Options:
- Use Railway: https://railway.app (free tier available)
- Use Render: https://render.com (free tier available)
- Use Heroku: https://heroku.com (paid only now)

## Option 2: Vercel (Recommended)

1. **Install Vercel CLI** (already done)
2. **Login**: Run `vercel login` and authenticate
3. **Deploy**: Run `vercel --prod` in the project root
4. **Configure**: Add environment variables in Vercel dashboard

## Option 3: Railway (Full Stack)

1. **Visit**: https://railway.app
2. **New Project** → Deploy from GitHub
3. **Import** this project
4. **Add Variables**:
   - `N8N_WEBHOOK_URL`
   - `SESSION_SECRET`
5. **Deploy** - Railway handles everything automatically

## Option 4: Local Tunnel (Immediate Testing)

For immediate live testing without deployment:

```bash
# Install ngrok
npm install -g ngrok

# In one terminal, run your app
npm run dev

# In another terminal, expose it
ngrok http 3000
```

## Environment Variables Needed

For any deployment, configure these:

```
N8N_WEBHOOK_URL=your-webhook-url
SESSION_SECRET=your-secret-key
NODE_ENV=production
```

## Quick Deploy Commands

### Build Everything
```bash
cd frontend && npm run build && cd ..
```

### Test Production Build Locally
```bash
cd frontend && npx serve -s build -l 3000
```

## Deployment Checklist

- [ ] Frontend built successfully
- [ ] Backend API endpoints configured
- [ ] Environment variables set
- [ ] CORS settings updated for production domain
- [ ] Webhook URL configured in settings

## Live URL Structure

Once deployed, your app will be available at:
- Frontend: `https://your-app-name.netlify.app`
- Backend API: `https://your-app-name.herokuapp.com/api`

Update the backend URL in your frontend code if needed.