# SmartWealth — Frontend

SmartWealth is a multi-asset investment portfolio tracker with AI-powered insights and stock price prediction. This repository contains the frontend web application built with React and TypeScript.

---

## Background

Keeping track of investments across stocks, crypto, mutual funds, and gold is messy when everything lives in different apps. SmartWealth brings all of it into one clean dashboard, shows you how your portfolio is doing in real-time, and gives you AI-generated advice on what to do next.

---

## What It Does

- Shows a unified dashboard for all investment assets
- Tracks profit/loss, ROI, and portfolio allocation in real-time
- Provides AI-generated insights and a portfolio health score
- Predicts IDX stock prices using a machine learning model
- Supports login with email/password or Google account

---

## Pages

| Page | Route | Description |
|---|---|---|
| Login | `/login` | Email/password login and Google OAuth sign-in |
| Register | `/register` | Create a new account |
| Dashboard | `/dashboard` | Portfolio overview — total value, P&L, allocation chart, and wealth history |
| Assets | `/assets` | List of all investment assets with current prices and ROI |
| Transactions | `/transactions` | Full transaction history with filters |
| Insights | `/insights` | Portfolio health score, rule-based alerts, and AI analysis |
| Predictions | `/predictions` | IDX stock price prediction for 1–7 business days |
| Google Callback | `/auth/callback` | OAuth redirect handler after Google sign-in |

All pages except Login, Register, and the OAuth callback are protected and require authentication.

---

## Tech Stack

**Core**

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Styling & UI**

![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=recharts&logoColor=white)

**Routing & Data Fetching**

![React Router](https://img.shields.io/badge/React_Router_v7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

**Tooling**

![Babel](https://img.shields.io/badge/Babel-F9DC3E?style=for-the-badge&logo=babel&logoColor=black)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

---

## Design System

The UI is inspired by Stripe's design language — a financial-infrastructure aesthetic built around a deep navy and electric indigo color palette.

**Key design decisions:**
- **Color palette**: Electric indigo (`#533afd`) as the primary CTA color, deep navy (`#0d253d`) for body text and dark surfaces
- **Typography**: Inter at weight 300 with negative letter-spacing for display headings; tabular figures (`tnum`) for all monetary values
- **Shapes**: Pill-shaped buttons (9999px border radius) for a clean, transactional feel
- **Cards**: Light surface cards with subtle shadows for content grouping
- **Charts**: Recharts for portfolio allocation and wealth history visualizations

The full design spec is documented in [DESIGN.md](./DESIGN.md).

---

## Project Structure

```
fe/
├── src/
│   ├── main.tsx             # App entry point
│   ├── App.tsx              # Router setup and protected route wrapper
│   ├── index.css            # Global styles and design system tokens
│   ├── pages/               # One file per page/route
│   │   ├── LoginPage.tsx        # Login with email/password or Google
│   │   ├── RegisterPage.tsx     # New account registration
│   │   ├── DashboardPage.tsx    # Main portfolio dashboard
│   │   ├── AssetsPage.tsx       # Asset list and management
│   │   ├── TransactionsPage.tsx # Transaction history
│   │   ├── InsightsPage.tsx     # Health score and AI insights
│   │   ├── PredictionPage.tsx   # Stock price prediction
│   │   └── GoogleCallbackPage.tsx # OAuth callback handler
│   ├── components/          # Shared reusable components
│   │   ├── AppShell.tsx         # Main layout with sidebar navigation
│   │   ├── AddAssetModal.tsx    # Modal for adding a new asset
│   │   ├── AssetLogo.tsx        # Asset icon/logo display component
│   │   ├── GoogleSignInButton.tsx # Google OAuth button
│   │   └── ErrorBoundary.tsx    # React error boundary wrapper
│   ├── contexts/
│   │   └── AuthContext.tsx      # Global authentication state (user, token, login/logout)
│   ├── api/                 # Axios API call functions grouped by domain
│   └── lib/                 # Utility functions and helpers
├── public/                  # Static assets
├── index.html               # HTML entry point
├── vite.config.ts           # Vite build configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config          # Tailwind CSS v4 setup (via @tailwindcss/vite)
└── vercel.json              # Vercel deployment config (SPA routing)
```

---

## How It Works

### Application Architecture

The frontend is a single-page application (SPA). React Router handles all navigation client-side — the server only serves one HTML file, and page transitions happen without a full reload.

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (React SPA)                     │
│                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌────────────┐   │
│  │   AuthContext│     │  React Router│     │   Pages    │   │
│  │  (JWT token, │────▶│  (client-side│────▶│ Dashboard │   │
│  │   user state)│     │   routing)   │     │ Assets     │   │
│  └──────────────┘     └──────────────┘     │ Insights   │   │
│          │                                 │ Predictions│   │
│          ▼                                 └────────────┘   │
│  ┌──────────────┐     ┌──────────────┐                      │
│  │  Axios Client │────▶│  API Module │                     │
│  │  (auto-attach │     │  (grouped by│                      │
│  │   JWT header) │     │   domain)   │                      │
│  └──────────────┘     └──────┬───────┘                      │
└──────────────────────────────┼──────────────────────────────┘
                               │  HTTPS REST API
                               ▼
                      Backend API (FastAPI)
```

### How a Page Loads Data

Every protected page follows the same pattern:

1. **Route guard** — `ProtectedRoute` in `App.tsx` checks `AuthContext`. If the user is not logged in, they are redirected to `/login` immediately
2. **Page mounts** — the page component fires a `useEffect` that calls the relevant API function from the `api/` module
3. **Axios sends the request** — an Axios request interceptor automatically reads the access token from `AuthContext` and attaches it as the `Authorization: Bearer` header
4. **Response arrives** — state is updated, the UI re-renders with real data
5. **Token expires** — if the API returns a 401, an Axios response interceptor silently calls `POST /auth/refresh` to get a new access token, then retries the original request automatically

### Authentication Flow

```
Email / Password:
  User fills login form
    → POST /api/v1/auth/login
    → AuthContext stores access token in memory
    → Refresh token saved for silent renewal
    → User redirected to /dashboard

Google OAuth:
  User clicks "Sign in with Google"
    → Redirect to Google consent screen
    → Google redirects back to /auth/callback
    → GoogleCallbackPage exchanges the code with the backend
    → AuthContext stores the returned token
    → User redirected to /dashboard

Silent Token Refresh:
  Any API call returns 401
    → Axios interceptor calls POST /auth/refresh
    → New access token stored in AuthContext
    → Original request retried automatically
    → If refresh also fails → logout → redirect to /login
```

### Page-by-Page Data Flow

| Page | What it fetches | Where data comes from |
|---|---|---|
| Dashboard | Portfolio summary, allocation, wealth history, asset performance | `/api/v1/dashboard/*` |
| Assets | All user assets with current prices and ROI | `/api/v1/assets` + `/api/v1/prices/*` |
| Transactions | Full transaction history | `/api/v1/transactions` |
| Insights | Health score, rule-based alerts, AI analysis | `/api/v1/insights` + `/api/v1/insights/ai` |
| Predictions | Stock prediction for a given ticker and horizon | `/api/v1/predictions/{ticker}` |

---

---

## Authentication Flow

The app uses JWT-based authentication managed through `AuthContext`:

1. On login, the API returns an access token and a refresh token
2. The access token is stored in memory (not localStorage) for security
3. Axios interceptors automatically attach the token to every request
4. When the access token expires, the interceptor silently calls the refresh endpoint
5. If the refresh also fails, the user is logged out and redirected to `/login`

For Google OAuth, the user is redirected to Google's sign-in page, then back to `/auth/callback` where the token exchange happens automatically.

---

## Deployment

The frontend is configured for deployment on Vercel. The `vercel.json` file handles SPA routing so that refreshing any route (e.g. `/dashboard`) returns the correct page instead of a 404.

To deploy:
1. Connect the `fe/` directory to a Vercel project
2. Set the environment variables in the Vercel dashboard
3. Set the build command to `npm run build` and the output directory to `dist`

Make sure the `VITE_API_BASE_URL` points to the deployed backend URL in production.
