# AI Tourism Intelligence & Smart Travel Platform

*Explore Smarter. Travel Safer. Experience More.*

This project is built for the **Smart India Hackathon (SIH26202 — TRAVEL & TOURISM)** problem statement. It is a smart digital travel companion that combines AI, real-time location, Maps, weather intelligence, scenic visibility, traffic, crowd information, and verified local updates to help tourists discover, plan, and travel safely.

## Features

- **Live Location Tracking**: Uses browser Geolocation to show exactly where you are on an interactive map.
- **Smart Tourism Intelligence**: Calculates Mountain Visibility, Rain Impact, and Travel Condition Scores based on weather and local parameters.
- **Verified Local Updates & Today's View**: Authorized Guides and Photographers can upload verified daily photos and traffic/road incident reports.
- **AI Smart Trip Planner**: Fully integrated with the live Gemini AI model to generate contextual, weather-aware, day-by-day travel itineraries.
- **Offline / Fallback Safety**: If any external API fails, the application elegantly falls back to intelligent MongoDB demonstration data to ensure the platform never crashes during your hackathon demo.
- **Role-Based Dashboards**: Complete distinct UI dashboards for Tourists, Guides, Photographers, and Administrators.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB running locally on default port 27017 (`mongodb://127.0.0.1:27017/sih_travel_tourism`)

## Installation & Setup

### 1. Start the Backend

Open a terminal and run the following commands:

```bash
cd backend
npm install
npm run dev
```
The backend server will start on `http://localhost:5000`.

### 2. Configure Backend Environment Variables

Ensure your `backend/.env` file contains the following (the AI key is already configured):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/sih_travel_tourism
JWT_SECRET=mysecretkey123
AI_API_KEY=your_gemini_api_key
```

### 3. Start the Frontend

Open a new terminal window and run:

```bash
cd frontend
npm install
npm run dev
```
The React frontend will start on `http://localhost:5173`. Open this URL in your browser.

## Demo Accounts

To test the role-based verification features during the hackathon, use the following pre-seeded demo accounts:

- **Admin**: `admin@test.com` / `password123`
- **Tourist**: `tourist@test.com` / `password123`
- **Verified Guide**: `guide@test.com` / `password123`
- **Verified Photographer**: `photo@test.com` / `password123`

## Architecture

* **Frontend**: React.js, Vite, TailwindCSS, React-Leaflet
* **Backend**: Node.js, Express.js, Mongoose, Axios
* **Database**: MongoDB
* **External APIs**: Google Generative AI (Gemini), OpenWeather (Mocked fallback), Google Maps Satellite Tiles
