# NearDoc — Developer Setup & Testing Guide

> Rural Health Telemedicine Platform · Next.js 14 · Prisma · Neon PostgreSQL

---

## Quick Start

```bash
git clone <repo-url>
cd neardoc-app
npm install
npx prisma generate
npm run dev
```

Open **http://localhost:3000**

---

## Environment Variables

Create `.env.local` in the root of `neardoc-app/`:

```env
# Required — Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host/neardoc?sslmode=require"

# Optional — Gemini AI (for symptom triage)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Optional — Twilio SMS (for prescription delivery)
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

---

## Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to your Neon DB (creates all tables)
npx prisma db push

# Seed with test data (5 users + stock + consultations)
node seed.js
```

---

## Test Credentials

After running `node seed.js`, use these accounts:

| Role | Phone to Enter | Name | Dashboard URL |
|------|---------------|------|---------------|
| **Patient** | `7767827080` | Rajesh Kumar | `/dashboard/patient` |
| **Doctor** | `9876000001` | Dr. Ananya Sharma | `/dashboard/doctor` |
| **ASHA Worker** | `9876000002` | Sunita Devi | `/dashboard/asha` |
| **Pharmacy** | `9876000003` | City Life Medicos | `/dashboard/pharmacy` |
| **Admin** | `9876000099` | District Health Officer | `/dashboard/admin` |

> **Tip:** The login page shows clickable cards — just click the role card to auto-fill.  
> Enter phone **without** country code (the app adds +91 automatically).

---

## Architecture

```
neardoc-app/
├── src/app/
│   ├── page.tsx                         # Login page
│   ├── api/
│   │   ├── auth/login/route.ts          # POST login (phone + role)
│   │   ├── consultations/route.ts       # GET/PATCH consultations
│   │   ├── appointments/route.ts        # GET/POST appointments
│   │   ├── prescription/route.ts        # GET/POST prescriptions
│   │   ├── records/route.ts             # GET health records
│   │   ├── asha/route.ts                # GET ASHA dashboard data
│   │   ├── asha/sync/route.ts           # POST sync ASHA queue
│   │   ├── admin/stats/route.ts         # GET admin analytics
│   │   ├── patient/dashboard/route.ts   # GET patient home
│   │   ├── sync/asha-batch/route.ts     # POST register patients
│   │   ├── sync/pharmacy-stock/route.ts # GET/POST medicine stock
│   │   └── triage/route.ts              # POST AI symptom check
│   └── dashboard/
│       ├── doctor/page.tsx              # Doctor workstation
│       ├── patient/page.tsx             # Patient home
│       ├── patient/consultation/        # Video consultation room
│       ├── patient/records/[id]/        # Single record detail
│       ├── asha/page.tsx                # ASHA dashboard
│       ├── asha/map/page.tsx            # Village map
│       ├── pharmacy/page.tsx            # Pharmacy stock
│       ├── admin/page.tsx               # Admin analytics
│       └── prescription/               # View & create prescriptions
├── prisma/schema.prisma                 # DB schema
├── seed.js                              # Seed script (compiled)
└── .env.local                           # Your secrets
```

---

## Key Flows to Test

### 1. Patient Books Appointment
1. Login as Patient (`7767827080`)
2. Go to `Appointments` → Book with Dr. Ananya Sharma
3. Check Doctor dashboard — new PENDING consultation appears

### 2. Doctor Starts Consultation
1. Login as Doctor (`9876000001`)
2. See patient queue with PENDING consultation
3. Click **Start Consultation** → status becomes IN_PROGRESS
4. Type notes, click **Save Record**
5. Go to **Prescription** tab → click "Write Prescription" → fill form → submit

### 3. Patient Views Prescription
1. Login as Patient
2. Go to `Records` tab → click any lab/prescription card → see detail page with QR code

### 4. ASHA Registers a Villager
1. Login as ASHA (`9876000002`)
2. Click **New Registration** → fill name, phone, village → submit
3. Patient appears in table immediately (saved to Neon DB)

### 5. ASHA Sync
1. On ASHA dashboard → click **Sync Now**
2. Toast shows `Synced N records` and `lastSyncAt` updates

### 6. Pharmacy Updates Stock
1. Login as Pharmacy (`9876000003`)
2. Fill "Quick Web Update" form → Update Stock
3. Stock table refreshes with new quantity

---

## Notes for Developers

- **No OTP** — login is phone + role selection only (for testing simplicity)
- **Video Call** — Uses PeerJS free cloud STUN/TURN servers for real browser-to-browser WebRTC connection without needing a custom signaling server.
- **Adaptive Bitrate** — The video call room uses `RTCPeerConnection.getStats()` to measure bitrate and dynamically switches between Video, Audio, and Text Chat.
- **SMS** — prescriptions are saved to DB; SMS sends only if Twilio env vars are set
- **AI Triage** — works if `GOOGLE_GENERATIVE_AI_API_KEY` is set; otherwise returns mock response
- **Prisma** — uses Neon serverless PostgreSQL with `@prisma/client` 6.2.1

---

## Prisma Schema Tables

| Table | Purpose |
|-------|---------|
| `users` | All roles: PATIENT, DOCTOR, ASHA, PHARMACY, ADMIN |
| `doctor_profiles` | Doctor specialization, rating, availability |
| `asha_worker_profiles` | Villages assigned, sync status |
| `pharmacy_profiles` | Name, address, coordinates |
| `pharmacy_stocks` | Medicine inventory |
| `consultations` | PENDING → IN_PROGRESS → COMPLETED |
| `prescriptions` | Linked to consultations, JSON medicines array |
| `health_records` | LAB / PRESCRIPTION / VACCINATION / VITAL |
| `offline_sync_queue` | ASHA batch registrations |

---

## Commands

```bash
npm run dev          # Dev server (http://localhost:3000)
npx prisma studio    # Browse DB in browser
npx prisma db push   # Push schema changes (no migration files)
npx tsc --noEmit     # TypeScript check (should be zero errors)
node seed.js         # Re-seed test data
```
