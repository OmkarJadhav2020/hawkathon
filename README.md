# GraamSehat — Rural Telemedicine Platform

> **AI-powered, offline-first telemedicine platform built for rural India.**  
> Connects patients, ASHA workers, doctors, and pharmacies via live WebRTC consultations, SMS prescriptions, and an offline-capable Progressive Web App.

---

## 🚀 Quick Test — All Local Routes

> Server must be running: `npm run dev` → http://localhost:3000

| Role | Page | URL |
|------|------|-----|
| **All** | Login (OTP + Role Select) | [localhost:3000](http://localhost:3000) |
| **Patient** | Dashboard | [localhost:3000/dashboard/patient](http://localhost:3000/dashboard/patient) |
| **Patient** | Appointments | [localhost:3000/dashboard/patient/appointments](http://localhost:3000/dashboard/patient/appointments) |
| **Patient** | AI Symptom Checker | [localhost:3000/dashboard/patient/symptoms](http://localhost:3000/dashboard/patient/symptoms) |
| **Patient** | Consultation Room (WebRTC) | [localhost:3000/dashboard/patient/consultation](http://localhost:3000/dashboard/patient/consultation) |
| **Patient** | Health Records + QR Card | [localhost:3000/dashboard/patient/records](http://localhost:3000/dashboard/patient/records) |
| **Patient** | Medicine Availability | [localhost:3000/dashboard/patient/pharmacy](http://localhost:3000/dashboard/patient/pharmacy) |
| **Patient** | e-Prescription Viewer | [localhost:3000/dashboard/prescription](http://localhost:3000/dashboard/prescription) |
| **Doctor** | Workstation | [localhost:3000/dashboard/doctor](http://localhost:3000/dashboard/doctor) |
| **ASHA** | Worker Dashboard | [localhost:3000/dashboard/asha](http://localhost:3000/dashboard/asha) |
| **ASHA** | Village Outreach Map | [localhost:3000/dashboard/asha/map](http://localhost:3000/dashboard/asha/map) |
| **Pharmacy** | Stock Manager | [localhost:3000/dashboard/pharmacy](http://localhost:3000/dashboard/pharmacy) |
| **Admin** | Analytics Dashboard | [localhost:3000/dashboard/admin](http://localhost:3000/dashboard/admin) |
| **System** | Offline Mode Fallback | [localhost:3000/offline](http://localhost:3000/offline) |

---

## 📁 Project Structure

```
graamsehat-app/
├── src/
│   └── app/
│       ├── page.tsx                          # Login page (OTP + role selector)
│       ├── offline/
│       │   └── page.tsx                      # Offline mode fallback UI
│       ├── dashboard/
│       │   ├── patient/
│       │   │   ├── page.tsx                  # Patient home dashboard
│       │   │   ├── appointments/page.tsx     # Appointment booking & history
│       │   │   ├── symptoms/page.tsx         # AI symptom checker (Gemini)
│       │   │   ├── consultation/page.tsx     # WebRTC video/audio/text room
│       │   │   ├── records/page.tsx          # Health records + offline QR card
│       │   │   └── pharmacy/page.tsx         # Medicine availability finder
│       │   ├── doctor/
│       │   │   └── page.tsx                  # Doctor workstation
│       │   ├── asha/
│       │   │   ├── page.tsx                  # ASHA worker dashboard
│       │   │   └── map/page.tsx              # Village outreach map
│       │   ├── pharmacy/
│       │   │   └── page.tsx                  # Pharmacy stock manager
│       │   ├── prescription/
│       │   │   └── page.tsx                  # e-Prescription viewer
│       │   └── admin/
│       │       └── page.tsx                  # Admin analytics dashboard
│       ├── api/
│       │   ├── triage/
│       │   │   └── route.ts                  # POST /api/triage
│       │   ├── prescription/
│       │   │   └── route.ts                  # POST /api/prescription (SMS)
│       │   └── sync/
│       │       ├── asha-batch/route.ts       # POST /api/sync/asha-batch
│       │       └── pharmacy-stock/route.ts   # GET/POST /api/sync/pharmacy-stock
│       ├── globals.css                       # Tailwind v4 design system
│       └── layout.tsx                        # Root layout (fonts, metadata)
├── prisma/
│   ├── schema.prisma                         # Database models
│   └── migrations/                           # Migration history
├── prisma.config.ts                          # Prisma v7 config (DB URL, migrations path)
├── .env                                      # Environment variables (never commit!)
├── .env.example                              # Template for contributors
├── next.config.ts                            # Next.js config
├── postcss.config.mjs                        # Tailwind v4 PostCSS config
└── package.json
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router, Server + Client Components) |
| **Styling** | Tailwind CSS v4 (via `@import "tailwindcss"` in CSS) |
| **Icons** | Google Material Symbols Outlined |
| **Fonts** | Public Sans (Google Fonts) |
| **Database** | PostgreSQL on [Neon](https://neon.tech) (serverless, free) |
| **ORM** | Prisma v7 |
| **State** | Zustand (client-side) |
| **Offline** | Dexie.js (IndexedDB wrapper) |
| **Real-time** | Socket.IO + WebRTC (peer-to-peer video) |
| **AI** | Google Gemini API (free tier via AI Studio) |
| **SMS** | Twilio (free trial tier) |
| **QR Codes** | `react-qrcode-logo` |
| **PWA** | `next-pwa` |

---

## 🗄️ Database Schema (Prisma)

### Models

```
User               — All roles: PATIENT, ASHA, DOCTOR, PHARMACY, ADMIN
AshaWorkerProfile  — ASHA-specific data (villages, camps, sync status)
DoctorProfile      — Doctor-specific data (specialization, availability, rating)
PharmacyProfile    — Pharmacy metadata (name, location, contact)
Consultation       — Teleconsultation sessions (status, mode, AI triage result)
HealthRecord       — Patient records (lab results, prescriptions, vaccinations, QR data)
Prescription       — Digital e-prescriptions (medicines JSON, SMS delivery status)
PharmacyStock      — Real-time medicine inventory per pharmacy
OfflineSyncQueue   — ASHA offline records waiting to sync (Dexie → server)
```

### Key Enums
- `Role`: `PATIENT | ASHA | DOCTOR | PHARMACY | ADMIN`
- `ConsultationStatus`: `PENDING | IN_PROGRESS | COMPLETED | CANCELLED`
- `TriageCategory`: `HOME_CARE | TELECONSULT | EMERGENCY`
- `SyncStatus`: `PENDING | SYNCED | FAILED`

---

## 🔌 API Routes

### `POST /api/triage`
AI-powered symptom triage using Google Gemini.

**Request:**
```json
{
  "symptoms": ["fever", "headache", "body ache"],
  "patientAge": 35,
  "patientGender": "male"
}
```
**Response:**
```json
{
  "category": "TELECONSULT",
  "condition": "Common Viral Illness",
  "probability": 78,
  "recommendations": ["Rest", "Paracetamol 500mg", "Drink fluids"],
  "followUpIn": "24 hours"
}
```
> **Fallback:** If Gemini key is missing, uses rule-based offline logic (checks symptom keywords like "chest pain", "bleeding", "fever").

---

### `POST /api/prescription`
Sends prescription SMS to patient via Twilio.

**Request:**
```json
{
  "patientPhone": "+919876543210",
  "patientName": "Rajesh Kumar",
  "doctorName": "Dr. Amit Verma",
  "prescriptionId": "RX-001",
  "medicines": [
    { "name": "Paracetamol 500mg", "dosage": "1 tablet twice daily" }
  ],
  "instructions": "Take after meals"
}
```
**Response:** `{ "success": true, "smsSent": true, "sid": "SM..." }`  
> **Fallback:** If Twilio not configured, logs SMS preview to console and returns `"smsSent": false` with a `"preview"` field.

---

### `POST /api/sync/asha-batch`
Queues offline ASHA patient registrations for sync.

**Request:**
```json
{
  "ashaWorkerId": "asha_001",
  "records": [
    { "name": "Kamla Devi", "age": 28, "village": "Khaira Kalan", "symptoms": "fever" }
  ]
}
```

---

### `POST /api/sync/pharmacy-stock`
Pharmacy pushes stock update.

```json
{
  "pharmacyId": "pharma_001",
  "items": [{ "medicineName": "Paracetamol 500mg", "quantity": 200 }]
}
```

### `GET /api/sync/pharmacy-stock?medicine=paracetamol`
Cross-pharmacy medicine availability search.

```json
{
  "medicine": "paracetamol",
  "pharmacies": [{ "pharmacyId": "pharma_001", "inStock": true, "quantity": 200 }]
}
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```env
# PostgreSQL — Neon (free at neon.tech)
DATABASE_URL="postgresql://user:pass@host/neondb?sslmode=require"

# Redis — Upstash (free at upstash.com)
REDIS_URL="redis://..."

# NextAuth
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google Gemini — free at aistudio.google.com
GOOGLE_GEMINI_API_KEY="AIza..."

# Twilio — free trial at twilio.com
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."
```

> **Without any keys:** App runs fully. AI uses offline rules. SMS logs to console. Only `DATABASE_URL` is needed to persist data.

---

## 🚀 Getting Started

```bash
# 1. Clone & install
git clone https://github.com/your-org/graamsehat-app.git
cd graamsehat-app
npm install

# 2. Setup environment
cp .env.example .env
# → Fill in DATABASE_URL from neon.tech (free)

# 3. Run database migrations
npx prisma migrate dev --name init

# 4. Start dev server
npm run dev
# → Open http://localhost:3000
```

---

## 🏥 User Flows

### Patient
```
Login (OTP) → Patient Dashboard
  → AI Symptom Checker → Book Appointment
  → Join Consultation Room (WebRTC: Video → Audio → Text based on bandwidth)
  → Receive e-Prescription (SMS + QR code)
  → View Health Records (works offline via QR card)
  → Find Medicine at nearby pharmacy
```

### ASHA Worker
```
Login → ASHA Dashboard
  → Register patients offline (saved to IndexedDB via Dexie)
  → Upload batch when WiFi → POST /api/sync/asha-batch
  → Village Outreach Map → view today's high-risk/pending/visited households
  → Book proxy teleconsultation for patient without smartphone
```

### Doctor
```
Login → Workstation
  → View patient queue → Start consultation
  → Read AI-generated patient summary
  → Write clinical notes
  → Issue e-Prescription → SMS via Twilio → sent to patient
```

### Pharmacy
```
Login → Stock Manager
  → Update stock via web form or SMS ("STOCK paracetamol 50")
  → POST /api/sync/pharmacy-stock
  → Patients and ASHA workers see live availability
```

---

## 📡 Offline Architecture

```
Patient/ASHA goes offline
    │
    ▼
Actions queued to IndexedDB (Dexie.js)
    │
    ▼
/offline page shown (what works vs what doesn't)
    │
    ├── Health Records → readable from local cache
    ├── AI Symptom Checker → offline rule-based logic
    └── ASHA Registration → saved locally
    │
    ▼
WiFi restored → auto-sync → POST /api/sync/asha-batch
```

---

## 🔐 Security Notes

- Aadhaar is **never stored plain text** — only hashed (`aadhaarHash`, SHA-256)
- Prescriptions have `signatureHash` for QR verification
- QR card data: compressed JSON, **not yet encrypted** (TODO before prod)
- All Neon connections: `sslmode=require`
- ⚠️ API routes **do not yet have auth middleware** — add NextAuth session checks before production deployment

---

## 🤝 Contributing

### Open areas

| What | Where |
|------|-------|
| 🔐 Auth middleware | `src/app/api/*/route.ts` — add `getServerSession()` |
| 📊 Real DB charts | `src/app/dashboard/admin/page.tsx` — connect Prisma queries |
| 🗺️ Real map tiles | `src/app/dashboard/asha/map/page.tsx` — integrate Leaflet |
| 💬 Real-time chat | `src/app/dashboard/patient/consultation/page.tsx` — Socket.IO |
| 📱 PWA Service Worker | `next.config.ts` — finalize `next-pwa` config |
| 🌐 i18n | Add Hindi / Punjabi with `next-intl` |
| 📞 USSD controller | `src/app/api/ussd/route.ts` — Twilio USSD for feature phones |
| 🧪 Tests | `tests/` — Playwright e2e for login + triage |

### Code conventions
- Pages → `src/app/dashboard/[role]/page.tsx`
- APIs → `src/app/api/[name]/route.ts`
- Icons → `<span className="material-symbols-outlined">icon_name</span>`
- Brand color → `text-primary` / `bg-primary` (`#00C9A7`)
- No inline styles — Tailwind classes only

---

## 📦 Key Dependencies

```json
{
  "prisma": "^7",           "@prisma/client": "^7",
  "dexie": "^4",            "zustand": "^5",
  "socket.io": "^4",        "socket.io-client": "^4",
  "react-qrcode-logo": "^3", "qrcode": "^1",
  "next-pwa": "^5",         "ioredis": "^5"
}
```

---

## 🌐 Deploy to Vercel (Free)

```bash
npm i -g vercel && vercel
```

Set these in Vercel dashboard → Settings → Environment Variables:
`DATABASE_URL`, `GOOGLE_GEMINI_API_KEY`, `TWILIO_*`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

---

## 📱 SMS Stock Update Format

Pharmacies can update stock **without internet** via SMS:
```
STOCK [medicine] [quantity]

STOCK paracetamol 50
STOCK metformin 30
STOCK amlodipine 100
```
Send to configured Twilio number → parsed by `/api/sync/pharmacy-stock`.

---

## 📄 License

MIT — Free to use, modify, distribute.  
**Built for Bharat 🇮🇳** — Healthcare for the last mile.
