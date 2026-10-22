# 📒 VyaparX (व्यापारX)

> **Enterprise-Grade Commodity ERP, Trade Billing & Digital Sauda Book Platform**  
> Designed and engineered for agricultural commodity brokers, commission agents, ginners, and traders (Kapas, Cotton Bales, Khol, Grains, Oilseeds, and Mandi trades).

---

## 🌟 Overview

**VyaparX** is a modern, high-performance web and standalone Progressive Web Application (PWA) built with **React 19**, **TypeScript**, and **Google Cloud Firestore**. It digitalizes the traditional brokerage "Sauda Book" ledger, replacing error-prone paper slips with structured, automated, and legally compliant digital trade workflows.

The application features a sleek **Neumorphic design system** supporting both Light and Dark modes, lightning-fast offline-ready performance, 30-day persistent sessions secured by a 6-digit Passcode PIN, and environment-isolated trade disclaimers.

---

## 🚀 Key Features & Modules

### 🏢 1. Multi-Company & Financial Year Management
* **Multi-Firm Architecture**: Seamlessly switch between multiple brokerage firms under one account.
* **Firm Profiles**: Manage firm GSTIN, PAN, Bank Details (IFSC, Account Number, UPI ID), signature, and branding.
* **Financial Year Switching**: Easily navigate across financial years (e.g., `2025-2026`, `2026-2027`) with dynamic ledger segregation.

### 📦 2. Commodity Item Master
* **Pre-configured Agro Items**: Kapas, Cotton Bales, Khol, Grains, Oilseeds, etc.
* **Flexible Units**: Bales, Candies, Quintals, Metric Tons, Bags, and Kgs.
* **Custom Varieties & Grades**: Track moisture, staple length, trash percentage, and quality parameters.
* **Default Brokerage Rates**: Pre-set commission rates per unit or percentage for instant sauda calculations.

### 👥 3. Party (Counterparty) Directory
* **Role Classification**: Categorize counterparties as **Seller**, **Buyer**, or **Both**.
* **Comprehensive Party Records**: Contact person, mobile numbers, business address, APMC Mandi licenses, and GSTIN.
* **Party-Specific Brokerage**: Override default commission rates for specific trading clients.

### 📝 4. 3-Step Sauda Order Wizard
* **Step 1: Item & Pricing**: Commodity selection, quantity, packing unit, rate per unit, gross amount calculation, and delivery dates.
* **Step 2: Seller Details**: Seller party selection, seller commission rate, brokerage amount, dispatch terms, and vehicle details.
* **Step 3: Buyer Details**: Buyer party selection, buyer commission rate, brokerage amount, payment terms, and condition notes.
* **Auto-Calculations**: Instant calculation of total bill amount, dual-party brokerage, and net payable summaries.

### 📄 5. Digital Sauda Slips, Printing & PDF
* **Dual Contract Templates**:
  * *Template 1*: Classic Tabular Confirmation Note (traditional Mandi trade format).
  * *Template 2*: Modern Executive Corporate Vector Contract (official corporate layout).
* **Instant Sharing**: One-click sharing of trade slips via WhatsApp, SMS, or direct download.
* **High-Res Direct Printing**: Formatted print layouts with automatic page break control and company letterhead.

### 📊 6. Brokerage & Financial Reports
* **Party-Wise Brokerage Ledger**: Detailed breakdowns of total orders, physical trade volume, total turnover, and earned brokerage commission.
* **Live Search & Filter**: Instant filtering by party name, date range, or transaction status.
* **Official Bill Printing**: Generate and print consolidated brokerage bills for buyer and seller settlements.

### ⚡ 7. Manage Quick Values
* Accelerate order creation with reusable autocomplete chips for payment terms, delivery conditions, locations, and remarks.

---

## 🔐 Architecture, Security & Reliability

### ☁️ Cloud-Backed Multi-Tenant Database
* Built on **Google Cloud Firestore** (`vyaparx-610fe`).
* **Strict Tenant Scoping**: All entities (`users`, `companies`, `parties`, `items`, `saudaOrders`, `quickValues`, `financialYears`) are scoped to the authenticated user's email.
* Full cloud synchronization across desktop browsers and mobile devices.

### 🔑 30-Day Session & 6-Digit PIN Security
* **Persistent Authentication**: Users remain logged in for 30 days without repeated OTP prompts.
* **6-Digit Security Passcode (PIN)**: Mandatory passcode gate protects confidential trading data upon opening the application.
* **Integrated Forgot PIN Flow**: Reset passcodes seamlessly using 4-digit OTP email verification without account lockout.
* **Smart Write Triggers**: `lastLoginAt` updates strictly upon 6-digit PIN entry, avoiding excessive Firestore writes.

### 🛡️ Strict Environment-Isolated Disclaimer & Terms
* **🌐 Web Browser Mode**: Strictly session-isolated via `sessionStorage`; prompts on every fresh browser session/tab and never leaks into `localStorage`.
* **📱 Installed PWA / App Mode**: Strictly app-isolated via `localStorage`; prompts upon fresh install, remembered across app closes, and resets upon reinstallation.
* **Mandi Trade Terms**: Comprehensive legal conditions tailored for agricultural commodity brokerage (broker liability limitations, moisture/quality testing, weighbridge discrepancies, APMC Mandi tax, and arbitration).

### 📧 Differentiated OTP Email Delivery
* Tailored responsive HTML email templates powered by **Nodemailer**:
  * 🔐 **Login Verification Email**: Royal Blue branding, purpose badge, and portal access notice.
  * 🔑 **PIN Reset Authorization Email**: Emerald/Teal security banner, purpose badge, and passcode authorization advisory.

### 📱 Progressive Web App (PWA) & Instant Scroll
* **Installable on All Platforms**: Android (WebAPK), iOS (Safari A2HS), and Desktop (Chrome / Edge / Brave).
* **PWA Update Notification**: Automatic version check without looping prompts.
* **Global Scroll-To-Top**: Automatic viewport scroll reset on every route navigation, preventing header cutoffs.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite 8](https://vitejs.dev/) |
| **Styling & Design** | [Tailwind CSS 3](https://tailwindcss.com/) (Custom Neumorphic System) |
| **Database** | [Google Cloud Firestore](https://firebase.google.com/docs/firestore) (Firebase Web SDK v13) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **PDF & Canvas Engine** | [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/) |
| **Server / API** | [Express 5](https://expressjs.com/) & [serverless-http](https://github.com/dougmoscrop/serverless-http) |
| **Email Delivery** | [Nodemailer](https://nodemailer.com/) (Gmail SMTP / Custom Host) |
| **Deployment** | [Vercel](https://vercel.com/) / [Netlify](https://www.netlify.com/) |

---

## 📁 Project Directory Structure

```text
VyaparX/
├── api/                   # Serverless entrypoint for Vercel (/api)
│   └── index.ts
├── netlify/               # Serverless functions for Netlify
│   └── functions/api.ts
├── public/                # Static assets, icons, manifest.json & sw.js
│   ├── favicon.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── manifest.json      # PWA manifest with standalone ?mode=pwa
│   └── sw.js              # Service Worker
├── server/                # Backend API & Email Service
│   ├── app.ts             # Express application & API handlers
│   └── emailService.ts    # Nodemailer config & dual OTP HTML templates
├── src/
│   ├── components/
│   │   ├── auth/          # ProtectedRoute component
│   │   ├── common/        # PinLockModal, DisclaimerTermsModal, ScrollToTop, etc.
│   │   ├── layout/        # AppShell, TopHeader, DesktopSidebar, MobileBottomNav
│   │   └── pdf/           # SaudaNoteTemplate rendering
│   ├── context/           # AppContext, AuthContext, ThemeContext, LanguageContext, PwaContext
│   ├── db/                # Firestore collections, config & initial seed data
│   ├── i18n/              # Translations (English, Hindi, Gujarati)
│   ├── lib/               # Firebase app & Firestore initialization
│   ├── pages/
│   │   ├── auth/          # EmailLoginPage, OtpVerificationPage, SetupPinPage
│   │   ├── companies/     # CompaniesListPage, AddEditCompanyPage
│   │   ├── items/         # ItemsListPage, AddEditItemPage
│   │   ├── legal/         # LegalPages (Terms & Conditions, Privacy Policy, How-to-Use)
│   │   ├── parties/       # PartiesListPage, AddEditPartyPage
│   │   ├── profile/       # ProfilePage, PinSecurityPage, ReportsPage, QuickValuesPage
│   │   └── sauda/         # SaudaListPage, CreateSaudaPage, EditSaudaPage, SaudaBillsPage
│   ├── services/          # Cloud Firestore services (company, party, item, sauda, user, etc.)
│   ├── types/             # TypeScript domain types & interfaces
│   ├── utils/             # Platform detection, validators, formatters, PDF services
│   ├── App.tsx            # Main application router & provider layout
│   └── main.tsx           # Application bootstrap
├── vercel.json            # Vercel routing configuration
└── vite.config.ts         # Vite build and dev server config
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Google Cloud Firestore Configuration (Optional override; defaults included in src/lib/firebase.ts)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=vyaparx-610fe.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vyaparx-610fe
VITE_FIREBASE_STORAGE_BUCKET=vyaparx-610fe.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=466142431180
VITE_FIREBASE_APP_ID=1:466142431180:web:cdfa2c56f909cb5ce53f69

# Real OTP Email Delivery (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_character_google_app_password
EMAIL_FROM="VyaparX Security" <your_email@gmail.com>

# Server Secret
JWT_SECRET=your_super_secret_jwt_key
```

> **Note**: If `EMAIL_USER` and `EMAIL_PASSWORD` are not configured in local development, the system runs in Demo Mode with fallback OTP `1234`.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/vyaparx.git
cd vyaparx
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 👨‍💻 Author & Credits

* **Designed & Developed by**: **Jenish Khambhaliya**
* **Role**: Software Developer
* **Support & Contact Email**: [jenishpatel.dev7@gmail.com](mailto:jenishpatel.dev7@gmail.com)

---

## 📄 License

This software and its source code are proprietary. All rights reserved © 2026 **VyaparX**.
