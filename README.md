# SmartWealth Frontend

React + TypeScript + Vite frontend untuk SmartWealth.

## Local Development

```bash
npm install
npm run dev
```

App berjalan di:

```text
http://localhost:5173
```

## Environment Variables

Buat `.env` di folder `fe/`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

Untuk production, ganti ke URL deploy:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_GOOGLE_REDIRECT_URI=https://your-frontend.vercel.app/auth/callback
```

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Deploy

Gunakan root directory `fe`.

```text
Build Command: npm run build
Output Directory: dist
```
