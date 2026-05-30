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

| Category | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP Client | Axios |
| Charts | Recharts |
| Compiler | Babel with React Compiler plugin |
| Linting | ESLint with TypeScript and React Hooks rules |

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

## Local Setup

### Prerequisites
- Node.js 18+
- npm or any compatible package manager

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the `fe/` root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Start Development Server

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

### Other Commands

```bash
# Type-check and build for production
npm run build

# Preview the production build locally
npm run preview

# Run the linter
npm run lint
```

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
