# 🌐 PERMANENT 24/7 LIFELONG DEPLOYMENT GUIDE

Follow this guide to get a **permanent, lifelong, 24/7 public HTTPS URL** on the internet with zero expiration and zero IP verification screens!

---

## 🎯 Target Architecture (100% Free & Permanent 24/7)

```
                     ┌──────────────────────────────┐
                     │    Netlify / Vercel SPA      │
                     │  (https://your-app.netlify.app)│
                     └──────────────┬───────────────┘
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │    Render.com Node Backend    │
                     │(https://your-api.onrender.com)│
                     └──────────────┬───────────────┘
                                    │
                                    ▼
                     ┌──────────────────────────────┐
                     │     MongoDB Atlas Cloud      │
                     │  (Permanent 24/7 DB Cluster)  │
                     └──────────────────────────────┘
```

---

## 🚀 STEP 1: Set Up Free MongoDB Atlas Cloud Database (2 Minutes)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Create Database** ➔ Choose **M0 Free Shared Tier**.
3. Under **Security ➔ Network Access**:
   - Click **Add IP Address** ➔ Select **Allow Access from Anywhere (`0.0.0.0/0`)**.
4. Under **Security ➔ Database Access**:
   - Click **Add New Database User** ➔ Username: `admin`, Password: `password123`.
5. Copy your connection string:
   `mongodb+srv://admin:password123@cluster0.mongodb.net/sih_travel_tourism?retryWrites=true&w=majority`

---

## 🚀 STEP 2: Deploy Permanent Backend to Render.com (3 Minutes)

1. Push your project code to GitHub.
2. Sign up at [Render.com](https://render.com) ➔ Click **New +** ➔ Select **Web Service**.
3. Connect your GitHub repository.
4. Set configuration:
   - **Name**: `ai-tourism-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add **Environment Variables**:
   - `MONGODB_URI`: *Your MongoDB connection string from Step 1*
   - `JWT_SECRET`: `permanent_production_secret_key_2026`
   - `ADMIN_EMAIL`: `admin@test.com`
   - `ADMIN_PASSWORD`: `password123`
6. Click **Create Web Service**.
7. Render will provide your permanent 24/7 backend API URL:
   `https://ai-tourism-backend.onrender.com`

---

## 🚀 STEP 3: Connect Frontend on Netlify / Vercel (2 Minutes)

1. Go to your [Netlify Dashboard](https://app.netlify.com).
2. Select your site ➔ **Site settings** ➔ **Environment variables** ➔ Click **Add a variable**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://ai-tourism-backend.onrender.com/api`
3. Click **Deploys** ➔ **Trigger deploy** ➔ **Clear cache and deploy site**.

---

## 🎉 DONE!
Your website will be live 24 hours a day, 365 days a year, lifelong on the internet without any expiration dates or IP verification screens!
