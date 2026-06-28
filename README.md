# MediCore AI – Smart Pharmacy Management System

MediCore AI is a next-generation healthcare pharmacy management terminal designed to resolve traditional inventory and planning challenges. Traditional pharmacies face manual tracking errors, inventory shrinkage due to unexpected expiration, and lack of future demand planning. MediCore AI solves these problems through intelligent POS automation, secure role-based workspaces, and predictive machine learning models.

---

## 🚀 Core Value Proposition

### 1. Smart Medicine Inventory & Alerts
- Real-time stock level categorization:
  - 🟢 **Safe Stock** (Above the threshold limit)
  - 🟡 **Low Stock** (At or below the threshold limit)
  - 🔴 **Critical Stock** (10 units or less, triggers automatic reorders)
- Configurable settings panel for Admin to dynamically customize stock thresholds and default tax rates.
- Voice-enabled microphone lookups using the native **Web Speech API** for hands-free pharmacist workflows.

### 2. Intelligent POS Billing & Automatic Stock Decrement
- Quick-add cart system with customer detail capture.
- Automatic tax calculation with configurable **GST percentages** (e.g. 18%).
- Automatic actions: Completing a transaction automatically decrements the active database stock, registers a historical receipt, and recalculates real-time demand forecasts.
- Custom vector-drawn compliance receipt with a **scannable QR Code** for digital claims and customer records.

### 3. Sourcing & Supplier Registry
- Manage chemical manufacturers, suppliers, contacts, and active supplied generic medicine lists.

### 4. Advanced AI & Predictive Forecasting Engine
- **Demand Forecasting Engine**: Computes weighted **Least-Squares Linear Regression** models on previous months' sales history to accurately project next-month medicine demand.
- **Expiry Risk Predictor**: Evaluates the mathematical ratio of **Months to Expiry** vs. **Months to Sell Stock** (based on average sales velocity):
  $$\text{Months to Sell} = \frac{\text{Current Stock}}{\text{Average Monthly Sales}}$$
  Provides automated alerts when there is a high probability of batches expiring before sale.
- **Smart Reorders**: Generates quick reorder guidelines which can be approved and replenished instantly by the Admin.

### 5. Interactive NLP AI Assistant
- Live chatbot terminal allowing pharmacists and admins to query the database using natural language:
  - *"What medicines are low in stock?"*
  - *"Show medicines expiring this month"*
  - *"Generate sales report"*
  - *"Search Paracetamol"*

---

## 🔒 Security & Role-Based Workspaces

The platform employs a salted **10-round bcrypt password hashing** model with a synchronized terminal audit trail logging all successful and unauthorized access attempts.

### 👑 Admin Privileges
- Add, update, and delete medications from the database.
- Approve reorder recommendations to instantly replenish medicine stock levels.
- Register secondary pharmacist or staff accounts from the Admin terminal.
- View security access and authentication logs.
- Customize general low-stock alert thresholds.

### 💊 Pharmacist Privileges
- Search active medications and check generic formula details.
- Access the sales billing terminal to process checkout transactions.
- View stock and expiry alerts (safeguards protect against dispensing expired batches).

---

## 📂 System Architecture & Technologies

- **Frontend**: React 19, Next.js (App Router), Tailwind CSS.
- **Database**: PostgreSQL connected via Drizzle ORM.
- **Authentication**: Salted Bcrypt password hashing.
- **Voice Lookups**: Native Web Speech Recognition.
- **AI Forecasting**: Custom JavaScript Least-Squares mathematical forecasting.

---

## 🛠️ Step-by-Step Local Setup Guide

Follow these steps to run MediCore AI locally on your terminal:

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup PostgreSQL Connection
Create or edit your `.env` file in the project root:
```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

### 3. Push Database Schema
Apply the tables, foreign keys, and security schemas directly to your local instance using Drizzle Kit:
```bash
npx drizzle-kit push
```

### 4. Run the Production Build
Compile and verify Next.js routes:
```bash
npm run build
```

### 5. Start the Live Server
Start the local NextJS production server:
```bash
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Access Credentials

The database contains default pre-seeded demo accounts. Click the quick-access buttons on the Sign In screen to load them instantly:
- **Admin**: Username: `admin` / Password: `admin123`
- **Pharmacist**: Username: `pharmacist` / Password: `pharmacist123`

---
*MediCore AI – Empowering Pharmacies with Intelligent Healthcare Sourcing.*
