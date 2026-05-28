# SmartWealth Frontend - API Testing

> Simple functional frontend untuk test semua backend API endpoints

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Backend Server

```bash
# Di folder be/
python -m uvicorn app.main:app --reload
```

Backend akan running di: **http://localhost:8000**

### 3. Start Frontend

```bash
npm run dev
```

Frontend akan running di: **http://localhost:5173**

---

## 📋 Pages & API Tests

### **1. Login Page** (`/login`)
**Test API:**
- `POST /auth/login` - Login dengan email/password

**Test Flow:**
1. Buka http://localhost:5173/login
2. Input email & password
3. Klik "Login"
4. Should redirect ke `/dashboard`

**Quick Test:**
```
Email: test@example.com
Password: password123
```

---

### **2. Register Page** (`/register`)
**Test API:**
- `POST /auth/register` - Register user baru

**Test Flow:**
1. Buka http://localhost:5173/register
2. Input full name, email, password
3. Klik "Register"
4. Should redirect ke `/dashboard`

---

### **3. Dashboard Page** (`/dashboard`)
**Test API:**
- `GET /dashboard/summary` - Get all dashboard data (net worth, allocation, performance)

**Features:**
- Net worth card dengan breakdown
- Allocation breakdown (percentage per asset type)
- Performance table (ROI, P&L per asset)
- Raw JSON response viewer

**Test Flow:**
1. Login dulu
2. Buka http://localhost:5173/dashboard
3. Should show dashboard metrics
4. Klik "Refresh" untuk reload data

---

### **4. Assets Page** (`/assets`)
**Test API:**
- `GET /assets` - List all assets
- `POST /assets` - Create new asset
- `DELETE /assets/{id}` - Delete asset

**Features:**
- List semua assets
- Add asset form (symbol, name, type, quantity, price)
- Delete asset button
- JSON viewer per asset

**Test Flow:**
1. Buka http://localhost:5173/assets
2. Klik "Add Asset"
3. Fill form:
   - Symbol: `bitcoin`
   - Asset Name: `Bitcoin`
   - Asset Type: `crypto`
   - Quantity: `0.5`
   - Avg Buy Price: `70000`
4. Klik "Create Asset"
5. Should appear in list
6. Test delete dengan klik "Delete"

---

### **5. Transactions Page** (`/transactions`)
**Test API:**
- `GET /transactions` - List all transactions
- `POST /transactions` - Create new transaction
- `GET /assets` - Get assets for dropdown

**Features:**
- List semua transactions
- Add transaction form (asset, type, quantity, price)
- Transaction history dengan detail
- JSON viewer per transaction

**Test Flow:**
1. Buka http://localhost:5173/transactions
2. Klik "Add Transaction"
3. Fill form:
   - Asset: Select dari dropdown
   - Type: `buy` atau `sell`
   - Quantity: `0.1`
   - Price per Unit: `80000`
4. Klik "Create Transaction"
5. Should appear in list

**Note:** Perlu add asset dulu sebelum bisa create transaction

---

### **6. Insights Page** (`/insights`)
**Test API:**
- `GET /insights` - Rule-based insights
- `GET /insights/ai` - AI insights (Gemini)
- `POST /insights/ai/refresh` - Refresh AI insights

**Features:**
- Rule-based analysis dengan health score
- AI-powered insights dari Gemini
- SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
- Action plan
- Risk assessment

**Test Flow:**
1. Buka http://localhost:5173/insights
2. Should show rule-based insights
3. Klik "Refresh AI" untuk generate AI insights
4. Wait 2-5 seconds (Gemini API call)
5. Should show AI analysis

**Note:** Perlu add assets dulu untuk dapat insights

---

## 🧪 Complete Test Flow

### **Scenario: Test All APIs**

1. **Register** (`/register`)
   - Create new user
   - Auto-login after register

2. **Add Assets** (`/assets`)
   - Add Bitcoin: `bitcoin`, `crypto`, `0.5`, `70000`
   - Add Bank BCA: `BBCA.JK`, `stock_id`, `100`, `8500`
   - Add Cash: `IDR`, `cash`, `300000`, `1`

3. **Add Transactions** (`/transactions`)
   - Buy Bitcoin: `0.5`, `70000`
   - Buy BBCA: `100`, `8500`

4. **Check Dashboard** (`/dashboard`)
   - Should show net worth
   - Should show allocation (crypto, stock, cash)
   - Should show performance (ROI, P&L)

5. **Check Insights** (`/insights`)
   - Should show rule-based insights
   - Click "Refresh AI" for Gemini insights
   - Should show SWOT analysis

6. **Logout**
   - Click "Logout" button
   - Should redirect to `/login`

---

## 🐛 Troubleshooting

### **Error: "Network Error" atau "Failed to fetch"**
**Problem:** Backend tidak running atau CORS issue

**Solution:**
1. Check backend running: http://localhost:8000/docs
2. Check CORS settings di backend `.env`:
   ```
   FRONTEND_URL=http://localhost:5173
   ```
3. Restart backend server

---

### **Error: "401 Unauthorized"**
**Problem:** Token expired atau invalid

**Solution:**
1. Logout dan login lagi
2. Clear localStorage:
   ```javascript
   localStorage.clear()
   ```
3. Refresh page

---

### **Error: "No assets yet"**
**Problem:** Belum ada assets di database

**Solution:**
1. Go to `/assets`
2. Add asset dulu
3. Baru bisa test dashboard, transactions, insights

---

### **AI Insights tidak muncul**
**Problem:** Gemini API key tidak configured atau belum ada assets

**Solution:**
1. Check backend `.env`:
   ```
   GEMINI_API_KEY=your-api-key
   ```
2. Add assets dulu
3. Click "Refresh AI"
4. Wait 2-5 seconds

---

## 📊 API Endpoints Tested

### **Authentication** ✅
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/refresh` (auto via interceptor)
- POST `/auth/logout`
- GET `/users/me`

### **Assets** ✅
- GET `/assets`
- POST `/assets`
- DELETE `/assets/{id}`

### **Transactions** ✅
- GET `/transactions`
- POST `/transactions`

### **Dashboard** ✅
- GET `/dashboard/summary` (net worth + allocation + performance)

### **Insights** ✅
- GET `/insights` (rule-based)
- GET `/insights/ai` (Gemini AI)
- POST `/insights/ai/refresh`

### **Not Tested Yet:**
- PUT `/assets/{id}` - Update asset
- GET `/assets/{id}` - Get single asset
- DELETE `/transactions/{id}` - Delete transaction
- GET `/prices/{symbol}` - Get price
- GET `/prices/search/crypto` - Search crypto
- GET `/dashboard/wealth-history` - Wealth history
- POST `/auth/google` - Google OAuth

---

## 🎯 Next Steps

### **If All Tests Pass:**
✅ Backend API working perfectly!  
✅ Ready untuk build proper UI dengan DESIGN.md  
✅ Ready untuk production deployment  

### **If Some Tests Fail:**
1. Check backend logs
2. Check browser console (F12)
3. Check network tab untuk API responses
4. Fix backend issues
5. Re-test

---

## 📝 Notes

- UI ini **simple & functional** - bukan final design
- Focus pada **testing API**, bukan UI/UX
- Semua responses ditampilkan dalam JSON untuk debugging
- Error messages ditampilkan untuk troubleshooting

---

## 🚀 Ready to Test!

1. Start backend: `python -m uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Open: http://localhost:5173
4. Register → Add Assets → Test All Features!

