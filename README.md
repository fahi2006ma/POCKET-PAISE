# Pocket Paise 🌸✨
> **Personal Finance Management Web Application**  
> *"Plan · Track · Thrive ♡"*

Pocket Paise is a personal finance management web application designed with a soft pastel aesthetic, Indian Rupee (₹) currency formatting, responsive layouts, and automated financial insights.

Built strictly according to the **Software Requirements Specification (SRS) v1.0** and the **First UI Draft**.

---

## 🎨 Technology Stack

- **Frontend**: React 19 + Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti, Axios, React Router 7.
- **Backend**: Python 3.14 + Django 6, Django REST Framework (DRF), SimpleJWT (Token Authentication), django-cors-headers, ReportLab (PDF export).
- **Database**: SQLite (local development) / PostgreSQL 15+ compatible via Django ORM.

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Start
In a PowerShell terminal:
```powershell
cd backend
python manage.py migrate
python manage.py seed_data      # Seeds demo data matching the UI draft
python manage.py runserver 127.0.0.1:8000
```

The Django REST API runs at `http://127.0.0.1:8000/api/v1/`.

### 2. Frontend Setup & Start
In a separate terminal:
```powershell
cd frontend
npm install
npm run dev
```

The React frontend starts at `http://localhost:5173`.

---

## 🔑 Pre-Seeded Demonstration Account

You can click **"Instant Login with Demo Data"** on the login page or enter:
- **Email**: `dreamer@pocketpaise.com`
- **Password**: `Password123!`

### Demo Highlights (Matching the First UI Draft):
- **Total Balance**: ₹24,580 (`↑ +8%`)
- **Total Income**: ₹18,000 (`↑ +12%`)
- **Total Expenses**: ₹13,420 (`↑ +5%`)
- **Savings**: ₹11,160 (`↑ +15%`)
- **Spending Overview Donut Chart**: ₹13,420 spent across Food & Dining (32%), Shopping (28%), Travel (18%), Bills (12%), and Others (10%).
- **Monthly Trend Chart**: Switchable between Income and Expense over 6 months with callout badge.
- **Financial Health Score**: 92 / 100 (*"Excellent! You're a smart spender 💚"*).
- **Recent Transactions**: Burger King (-₹350), Zudio (-₹1,200), Bus Ticket (-₹100), Part-time Work (+₹5,000).
- **Savings Goal**: "Next Trip ✈️" (₹25,000 target, 40% saved, ₹10,000 remaining).
- **Quick Actions**: Add Expense, Add Income, Set Budget, View Reports.
- **Global Search**: Press `Ctrl + K` anytime to instantly search transactions and categories.

---

## 📑 Feature Inventory & Pages (SRS v1.0)

| Page | Route | Description |
|---|---|---|
| **P1 Landing** | `/` | Product introduction, feature cards, one-click demo launcher |
| **P2 Register** | `/register` | Account creation with input validation |
| **P3 Login** | `/login` | Secure JWT authentication & demo button |
| **P4 Forgot Password** | `/forgot-password` | Dispatches password reset link |
| **P5 Reset Password** | `/reset-password/:token` | Secure password update |
| **P6 Verify Email** | `/verify-email/:token` | Account activation confirmation |
| **P7 Dashboard** | `/dashboard` | Flagship UI matching first draft with live charts, score & goals |
| **P8 Add Transaction** | `/transactions/new` (or Modal) | Expense / Income form with amount, category, payment method, recurring |
| **P9 Transactions** | `/transactions` | Full table with search, filters, pagination, edit, delete & CSV export |
| **P10 Budgets** | `/budgets` | Category limits with progress bars, 80%/100% alerts, copy last month |
| **P11 Reports** | `/reports` | Summaries, charts, savings rate, PDF & CSV download |
| **P12 Goals** | `/goals` | Savings targets, contribution tracker with confetti celebrations |
| **P13 Insights** | `/insights` | Score formula breakdown ($Score = 0.4S + 0.3B + 0.3G$) & smart tips |
| **P14 Settings** | `/settings` | Profile, custom categories, change password, export data, delete account |

---

## 🧪 Running Automated Tests

Run backend test cases (TC-01 through TC-11):
```powershell
cd backend
python manage.py test
```
