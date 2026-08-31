# Complete Production Deployment Guide: AI Tourism & Smart Travel Platform

This guide provides an exact, step-by-step walkthrough to publish the **AI Tourism & Smart Travel Platform** to production. Following these steps ensures your app is publicly accessible via HTTPS on Chrome, Edge, Firefox, and mobile devices without hardcoding URLs or breaking local development.

---

## Architecture Flow

```text
User Browser / Mobile Device
       │
       ▼
Frontend (Vercel / Netlify) ───[ HTTPS API Requests ]───► Backend API (Render / Railway)
                                                                 │
                                                                 ▼
                                                     MongoDB Atlas Cloud Database
```

---

## STEP 1 — Create GitHub Repository

1. Open your browser and navigate to [GitHub](https://github.com).
2. Log in and click the **+** icon in the top-right corner → select **New repository**.
3. Set the Repository Name: `ai-tourism-platform`.
4. Choose **Public** or **Private** based on your preference.
5. Do **NOT** initialize with a README or .gitignore (we already have clean project files).
6. Click **Create repository**.

---

## STEP 2 — Push Project Code to GitHub

Open terminal in the project directory (`c:\Users\bdhar\OneDrive\Desktop\hackthon\travel-tourism`) and run:

```bash
git init
git add .
git commit -m "Production deployment ready setup"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ai-tourism-platform.git
git push -u origin main
```
*(Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username)*

---

## STEP 3 — Create MongoDB Atlas Database

1. Register or log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. In the Atlas dashboard, click **Build a Database** (or **Create**).
3. Select the **M0 Free Tier** cluster option.
4. Select your preferred Cloud Provider (AWS, GCP, or Azure) and Region (closest to your users), then click **Create**.

---

## STEP 4 — Configure MongoDB Database User & Network Access

### A. Create Database User
1. Under **Security** in the left sidebar, click **Database Access**.
2. Click **+ Add New Database User**.
3. Set **Authentication Method** to **Password**.
4. Set **Username** (e.g., `admin`).
5. Click **Autogenerate Secure Password** or set a strong password (e.g., `TravelAdmin2026!`). **Copy and save this password!**
6. Under **Database User Privileges**, select **Read and write to any database**.
7. Click **Add User**.

### B. Configure Network Access
1. Under **Security** in the left sidebar, click **Network Access**.
2. Click **+ Add IP Address**.
3. Click **Allow Access from Anywhere** (this automatically sets `0.0.0.0/0`, necessary for cloud backend hosts like Render).
4. Click **Confirm**.

### C. Get MongoDB Connection URI String
1. Click **Database** under **Deployment** in the left sidebar.
2. Click **Connect** next to your cluster.
3. Select **Drivers** (Node.js).
4. Copy the connection string. It looks like:
   ```text
   mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/sih_travel_tourism?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual database user password.

---

## STEP 5 — Deploy Backend API Service (on Render)

1. Register or log in at [Render.com](https://render.com).
2. Click **New +** top right → select **Web Service**.
3. Choose **Build and deploy from a Git repository** → click **Next**.
4. Connect your GitHub account and select the `ai-tourism-platform` repository.
5. Fill in the web service configuration:
   - **Name**: `ai-tourism-backend`
   - **Region**: Choose the region closest to your MongoDB Atlas cluster.
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node server.js`)
   - **Instance Type**: `Free`

---

## STEP 6 — Add Backend Environment Variables (on Render)

1. Scroll down to the **Environment Variables** section on Render (or click the **Environment** tab).
2. Add the following key-value pairs:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Server Port (Render sets this dynamically) |
| `MONGODB_URI` | `mongodb+srv://admin:TravelAdmin2026!@cluster0.abcde.mongodb.net/sih_travel_tourism?retryWrites=true&w=majority` | Connection URI string from Step 4 |
| `JWT_SECRET` | `prod_jwt_super_secret_key_2026` | Secret key used for signing JWT tokens |
| `CLIENT_URL` | `https://ai-tourism-frontend.vercel.app` | Production Frontend domain (updated after Step 7) |
| `AI_API_KEY` | `AIzaSy...` *(optional)* | Google Gemini AI API key for itinerary generator |

3. Click **Create Web Service** (or **Save Changes**).
4. Wait for Render to build and deploy. Once finished, copy your public backend URL (e.g. `https://ai-tourism-backend.onrender.com`).

---

## STEP 7 — Deploy Frontend Web App (on Vercel or Netlify)

### Option A: Vercel (Recommended)
1. Register or log in at [Vercel.com](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository (`ai-tourism-platform`).
4. In the project setup menu:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit → select `frontend` → click **Continue**.

### Option B: Netlify
1. Register or log in at [Netlify.com](https://netlify.com).
2. Click **Add new site** → **Import an existing project**.
3. Select **GitHub** and choose `ai-tourism-platform`.
4. Set **Base directory** to `frontend`, **Build command** to `npm run build`, and **Publish directory** to `frontend/dist`.

---

## STEP 8 — Add Frontend Environment Variables

Before clicking Deploy on Vercel or Netlify, expand the **Environment Variables** section:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://ai-tourism-backend.onrender.com/api` | Deployed backend URL + `/api` |

Click **Deploy**. Once deployment finishes, Vercel/Netlify will output your public frontend URL (e.g. `https://ai-tourism-frontend.vercel.app`).

---

## STEP 9 — Configure CORS on Backend

1. Go back to [Render.com](https://render.com) → open your `ai-tourism-backend` web service.
2. Click **Environment** in the left menu.
3. Update `CLIENT_URL` to match your actual frontend production URL:
   ```text
   CLIENT_URL=https://ai-tourism-frontend.vercel.app
   ```
4. Click **Save Changes**. Render will automatically redeploy the backend with the correct CORS origins allowed.

---

## STEP 10 — Seed Production Database with Demo Users

To populate initial destination data, places, and demo accounts into your MongoDB Atlas cloud database:

From your local machine terminal, run:
```bash
cd backend
# Set MONGODB_URI to your Atlas connection string temporarily
$env:MONGODB_URI="mongodb+srv://admin:TravelAdmin2026!@cluster0.abcde.mongodb.net/sih_travel_tourism?retryWrites=true&w=majority"
npm run seed
```

### Pre-seeded Demo Test Accounts:
- **Admin**: `admin@test.com` / `password123`
- **Tourist**: `tourist@test.com` / `password123`
- **Guide**: `guide@test.com` / `password123`
- **Photographer**: `photo@test.com` / `password123`

---

## STEP 11 — Configure External Map & AI Services

- **Maps**: The frontend uses Leaflet with Google Maps tiles (`https://mt1.google.com/vt/...`). No paid API key is required.
- **AI Generator**: If a Google Gemini API Key (`AI_API_KEY`) is set on backend Render environment variables, live AI itinerary generation will be enabled. If left blank, the platform automatically serves database fallbacks seamlessly.

---

## STEP 12 — Production Testing Checklist

Run through these verification tests on your deployed website:

- [x] **Public URL Access**: Open `https://your-frontend-domain.vercel.app` in Chrome, Edge, Firefox, and Mobile.
- [x] **User Registration**: Register a new Tourist account and verify successful login.
- [x] **User Login**: Log in as Admin (`admin@test.com`), Guide (`guide@test.com`), Tourist, and Photographer.
- [x] **Dashboard Routing**: Test switching between role dashboards.
- [x] **Page Refresh (SPA Routing)**: Refresh the browser while on `/destinations` or `/login` — confirm no 404 error occurs.
- [x] **Interactive Maps**: Check destination map rendering, layer toggles, and live geolocation button.
- [x] **AI Planner**: Generate an itinerary and verify JSON payload response.
- [x] **MongoDB Atlas Reads & Writes**: Submit a photo or local observation report from Guide/Photographer dashboard and verify it persists to MongoDB Atlas.

---

## Local Development (Preserved)

To run the project locally on your development machine without affecting production:

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
Local frontend connects automatically to `http://localhost:5000/api` using fallback default variables.
