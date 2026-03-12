# GraamSehat — Full Dead-End & Broken Items Audit

> Last audited: 2026-03-12. Every file read manually. Nothing assumed.

---

## How to read this doc

- 🔴 **Broken** — completely non-functional, crashes or does nothing
- 🟠 **Fake** — renders fine but uses hardcoded mock data, not DB
- 🟡 **Incomplete** — partial implementation, missing a key piece
- ✅ **Working** — actually functional end-to-end

---

## 1. Authentication & Session (`src/app/page.tsx`)

| # | Item | Status | Detail |
|---|------|--------|--------|
| 1.1 | Send OTP button | 🟠 Fake | `await setTimeout(1000)` — no SMS API called, no OTP generated |
| 1.2 | Verify OTP | 🔴 Broken | Any 6 digits work. No verification. No user created in DB. |
| 1.3 | Session/cookie | 🔴 Broken | Nothing stored. Refresh = logged out. |
| 1.4 | Route protection | 🔴 Broken | `/dashboard/admin` accessible without login — anyone can visit |
| 1.5 | Pharmacy role | ✅ Fixed | Role selector now includes Pharmacy |
| 1.6 | Admin role | ✅ Fixed | Role selector now includes Admin |
| **Fix file** | `src/app/page.tsx` + new `src/app/api/auth/route.ts` | | |

---

## 2. Patient Dashboard (`src/app/dashboard/patient/page.tsx`)

| # | Item | Status | Detail |
|---|------|--------|--------|
| 2.1 | "Namaste, Rajesh!" | ✅ Fixed | Fetches user profile from session/DB API |
| 2.2 | Upcoming appointment card | ✅ Fixed | Fetches real `pending` consultations from DB |
| 2.3 | Reschedule / Cancel buttons | ✅ Fixed | Triggers informative toast messages |
| 2.4 | Recent Health Records | ✅ Fixed | Fetches real 5 latest records from DB |
| 2.5 | Download button on records | ✅ Fixed | Opens `fileUrl` or shows alert if missing |
| 2.6 | Vitals (HR, BP, Temp) | ✅ Fixed | Reads blood group/allergies/village from patient profile |
| 2.7 | "Add New Reading" button | ✅ Fixed | Opens modal and POSTs vital reading to DB |
| 2.8 | Notifications bell | ✅ Fixed | Shows informative toast |
| 2.9 | "View All" (health records) | ✅ Fixed | Links correctly to `/dashboard/patient/records` |
| 2.10 | Emergency "Call Ambulance (108)" | ✅ Fixed | Now `<a href="tel:108">` and calls dialer |
| 2.11 | Privacy Policy / Help Center links | ✅ Fixed | Footer links to `/offline` (valid route) |
| **Fix files** | `src/app/dashboard/patient/page.tsx` + `src/app/api/patient/dashboard/route.ts` | | |

---

## 3. Appointments (`src/app/dashboard/patient/appointments/page.tsx`)

| # | Item | Status | Detail |
|---|------|--------|--------|
| 3.1 | Upcoming appointments | 🟠 Fake | `const upcoming = [...]` hardcoded 2 appointments |
| 3.2 | Past consultations | 🟠 Fake | `const past = [...]` hardcoded 3 records |
| 3.3 | Available doctors list | 🟠 Fake | `const doctors = [...]` hardcoded — not from `DoctorProfile` |
| 3.4 | "Book" button on doctor card | 🟡 Incomplete | Links to `/dashboard/patient/consultation` but never creates `Consultation` row in DB |
| 3.5 | Reschedule button | 🔴 Dead | `<button>` no onClick |
| 3.6 | Cancel button | 🔴 Dead | `<button>` no onClick |
| 3.7 | "View Rx" link on past consults | 🟡 Incomplete | Links to `/dashboard/prescription` — always same mock prescription |
| **Fix files** | `src/app/dashboard/patient/appointments/page.tsx` + `src/app/api/appointments/route.ts` (new) | | |

---

## 4. AI Symptom Checker (`src/app/dashboard/patient/symptoms/page.tsx`)

| # | Item | Status | Detail |
|---|------|--------|--------|
| 4.1 | **AI chat responses** | 🔴 Broken | **Never calls `/api/triage`!** Uses hardcoded `setTimeout` mock responses |
| 4.2 | Triage result | 🟠 Fake | Always returns `TELECONSULT / 65% / Common Flu` after 3 messages regardless of input |
| 4.3 | "Book Teleconsult" pill | 🔴 Dead | `onClick={() => sendMessage("Book Teleconsult")}` just adds text to chat, doesn't navigate |
| 4.4 | "Speak with a GP – Book" link | ✅ Works | Links correctly to `/dashboard/patient/appointments` |
| 4.5 | "Find Nearby Pharmacy" link | ✅ Works | Links correctly to `/dashboard/patient/pharmacy` |
| **Fix files** | `src/app/dashboard/patient/symptoms/page.tsx` — replace mock with real `fetch("/api/triage", ...)` | | |

---

## 5. Consultation Room (`src/app/dashboard/patient/consultation/page.tsx`)

| # | Item | Status | Detail |
|---|------|--------|--------|
| 5.1 | Video feed | 🟡 Incomplete | `getUserMedia` works but no peer connection (WebRTC needs signaling) |
| 5.2 | Camera / Mic toggle buttons | ✅ Work | UI state toggles correctly |
| 5.3 | Mode switching (Video→Audio→Text) | ✅ Works | UI state switches correctly |
| 5.4 | Live timer | ✅ Works | Counts up correctly |
| 5.5 | Chat messages | 🟠 Fake | Messages stored in local state only — not sent to doctor |
| 5.6 | Patient summary panel | 🟠 Fake | Hardcoded patient data |
| 5.7 | "Send Prescription" button | 🔴 Dead | No onClick — never calls `/api/prescription` |
| 5.8 | "End Call" button | 🟡 Incomplete | Changes status to "Ended" but no DB update, no Socket.IO disconnect |
| **Fix files** | Needs Socket.IO server (`src/server.ts`), signaling logic, and `POST /api/prescription` call | | |

---

## 6. Health Records (`src/app/dashboard/patient/records/page.tsx`)

| # | Item | Status | Detail |
|---|------|--------|--------|
| 6.1 | All health records shown | 🟠 Fake | Hardcoded `const records = [...]` — not from `HealthRecord` table |
| 6.2 | Conditions / Allergies | 🟠 Fake | Hardcoded `["Hypertension", "Type 2 Diabetes"]` etc. |
| 6.3 | QR health card | 🟡 Incomplete | QR generates but encodes hardcoded data object, not real user record |
| 6.4 | "Download PDF" button | 🔴 Dead | Button present, `window.print()` not called |
| 6.5 | "Add New Record" button | 🔴 Dead | No page or modal behind it |
| 6.6 | Consultation history table | 🟠 Fake | Hardcoded 3 rows |
| **Fix files** | `src/app/dashboard/patient/records/page.tsx` — fetch from `GET /api/records?userId=...` (new) | | |

---

## 7. Medicine Finder (`src/app/dashboard/patient/pharmacy/page.tsx`)

| # | Item | Status | Detail |
|---|------|--------|--------|
| 7.1 | Medicine search | 🟡 Incomplete | Filters local hardcoded array only — never calls `GET /api/sync/pharmacy-stock?medicine=...` |
| 7.2 | Stock table | 🟠 Fake | Hardcoded `const mockMedicines = [...]` — not from `PharmacyStock` |
| 7.3 | "Order Now" button | 🔴 Dead | No onClick |
| 7.4 | "Home Delivery" CTA | 🔴 Dead | No action |
| **Fix files** | `src/app/dashboard/patient/pharmacy/page.tsx` — use `GET /api/sync/pharmacy-stock` | | |

---

## 8. e-Prescription (`src/app/dashboard/prescription/page.tsx`)

| # | Item | Status | Detail |
|---|------|--------|--------|
| 8.1 | Prescription data | 🟠 Fake | Hardcoded patient, doctor, medicines — not from `Prescription` table |
| 8.2 | QR code | 🔴 Broken | Shows `<span material-symbol>qr_code</span>` icon placeholder — not a real QR |
| 8.3 | SMS "Delivered" status | 🟠 Fake | Hardcoded "Delivered" text — Twilio not configured |
| 8.4 | Print button | ✅ Works | `window.print()` correctly called |
| 8.5 | Download button | 🔴 Dead | No `onClick` — nothing downloads |
| 8.6 | Share button | 🔴 Dead | No `onClick` |
| 8.7 | Pharmacy map | 🔴 Broken | Shows a grey box with a map icon — no real map |
| 8.8 | "Order Pickup" button | 🔴 Dead | No onClick |
| 8.9 | "Request Home Delivery" button | 🔴 Dead | No onClick |
| 8.10 | `/dashboard/prescription/new` | 🔴 404 | Doctor workstation links here — page does not exist |
| **Fix files** | `src/app/dashboard/prescription/page.tsx` — fetch by `?id=` param; `src/app/dashboard/prescription/new/page.tsx` (create) | | |

---

## 9. Doctor Workstation (`src/app/dashboard/doctor/page.tsx`)

| # | Item | Status | Detail |
|---|------|--------|--------|
| 9.1 | Patient queue ("8 WAITING") | 🟠 Fake | Hardcoded — not from `Consultation` table |
| 9.2 | Active patient data | 🟠 Fake | Hardcoded object — not from DB |
| 9.3 | AI-generated summary | 🟠 Fake | Hardcoded string `triage:` field — not from Gemini |
| 9.4 | "Start Consultation" button | 🔴 Dead | No onClick — never updates DB or starts WebRTC |
| 9.5 | Consultation notes textarea | 🟡 Incomplete | Local state only — "Save Record" button does nothing |
| 9.6 | "Save Record" button | 🔴 Dead | No onClick, never calls DB |
| 9.7 | Prescription tab | 🟡 Incomplete | Shows placeholder + link to `/dashboard/prescription/new` which is a 404 |
| 9.8 | Lab Orders tab | 🔴 Dead | Shows placeholder only, no form |
| 9.9 | Patient search input | 🔴 Dead | Local input, no query to DB |
| 9.10 | "View Full Record" button | 🔴 Dead | No onClick |
| 9.11 | Print button | 🔴 Dead | No onClick |
| 9.12 | Patient Records / Telemedicine nav links | 🔴 Dead | `href="#"` placeholders |
| **Fix files** | Major rework needed — wire to `GET /api/consultations`, `PATCH /api/consultations/[id]` | | |

---

## 10. ASHA Worker Dashboard (`src/app/dashboard/asha/page.tsx`)

| # | Item | Status | Detail |
|---|------|--------|--------|
| 10.1 | Patient table | 🟠 Fake | `const patients = [...]` — 3 hardcoded rows |
| 10.2 | Stats (42 registered, 8 pending) | 🟠 Fake | Hardcoded numbers |
| 10.3 | **"New Registration" button** | 🔴 Dead | No onClick, no modal, never calls `/api/sync/asha-batch` |
| 10.4 | **"Sync Now" button** | 🔴 Dead | No onClick |
| 10.5 | "Proxy Book" button | 🔴 Dead | No onClick |
| 10.6 | Sync progress bar (85%) | 🟠 Fake | `const [syncProgress] = useState(85)` — never changes |
| 10.7 | Sidebar nav (Camps, Patients, Resources) | 🔴 Dead | `setActiveNav()` changes highlight only — no content changes |
| 10.8 | "View All Library" link | 🔴 Dead | `href="#"` |
| 10.9 | Education cards | 🔴 Dead | `cursor-pointer` but no click handler |
| **Fix files** | `src/app/dashboard/asha/page.tsx` — add registration modal + real API call | | |

---

## 11. ASHA Village Map (`src/app/dashboard/asha/map/page.tsx`)

| # | Item | Status | Detail |
|---|------|--------|--------|
| 11.1 | Map background | 🟠 Fake | CSS grid lines — not a real map (no Leaflet/Mapbox) |
| 11.2 | Village markers | 🟠 Fake | Hardcoded 4 positions — not from DB or GPS |
| 11.3 | Search input | 🔴 Dead | No handler |
| 11.4 | Zoom +/- buttons | 🔴 Dead | No handler |
| 11.5 | "My Location" button | 🔴 Dead | No `navigator.geolocation` call |
| 11.6 | "START NEW VISIT" button | 🔴 Dead | No onClick |
| 11.7 | Outreach task cards | 🔴 Dead | Chevron button has no handler |
| 11.8 | Sync status (8 pending) | 🟠 Fake | Hardcoded |
| **Fix files** | Integrate Leaflet.js for real map; wire tasks to DB | | |

---

## 12. Pharmacy Stock Manager (`src/app/dashboard/pharmacy/page.tsx`)

| # | Item | Status | Detail |
|---|------|--------|--------|
| 12.1 | Medicine table | 🟠 Fake | `const STOCK = [...]` — 10 hardcoded rows, not from `PharmacyStock` |
| 12.2 | Web update form | 🟡 Incomplete | `handleUpdate` sets `updated=true` locally — never calls any API |
| 12.3 | "Export Report" button | 🔴 Dead | No onClick |
| 12.4 | "Add Medicine" button | 🔴 Dead | No onClick |
| 12.5 | "Send Alert" (low stock) | 🔴 Dead | No onClick |
| 12.6 | "Edit" button per row | 🔴 Dead | No onClick |
| 12.7 | "Reorder" button on out-of-stock | 🔴 Dead | No onClick |
| 12.8 | Recent update log | 🟠 Fake | Hardcoded `const LOG = [...]` |
| **Fix files** | `src/app/dashboard/pharmacy/page.tsx` — wire form to `POST /api/sync/pharmacy-stock` | | |

---

## 13. Admin Dashboard (`src/app/dashboard/admin/page.tsx`)

| # | Item | Status | Detail |
|---|------|--------|--------|
| 13.1 | All KPI numbers | 🟠 Fake | Hardcoded: 1284 consultations, 342 patients, etc. |
| 13.2 | Monthly chart bars | 🟠 Fake | Hardcoded height percentages |
| 13.3 | Triage distribution | 🟠 Fake | Hardcoded 58/28/14 |
| 13.4 | Village table data | 🟠 Fake | Hardcoded 5 villages |
| 13.5 | Doctor availability | 🟠 Fake | Hardcoded 4 doctors |
| 13.6 | ASHA sync queue | 🟠 Fake | Hardcoded 3 ASHA workers |
| 13.7 | Date filter / export buttons | 🔴 Dead | No onClick handlers |
| **Fix files** | `src/app/dashboard/admin/page.tsx` + `GET /api/admin/stats` (new) | | |

---

## 14. Offline Mode (`src/app/offline/page.tsx`)

| # | Item | Status | Detail |
|---|------|--------|--------|
| 14.1 | "Try Again Now" button | 🟡 Incomplete | Resets countdown locally — never checks real connectivity |
| 14.2 | "Network Settings" link | 🔴 Dead | Links to `/dashboard/patient` not actual settings |
| 14.3 | Queued actions list | 🟠 Fake | Hardcoded 3 items — not from IndexedDB/Dexie |
| 14.4 | Auto-retry actually retrying | 🔴 Dead | Countdown UI only — no `navigator.onLine` check |
| **Fix files** | Add `navigator.onLine` + `window.addEventListener("online", ...)` | | |

---

## 15. API Routes

| # | Route | Status | Detail |
|---|-------|--------|--------|
| 15.1 | `POST /api/triage` | ✅ Works | Calls Gemini — **but symptom page never uses it** |
| 15.2 | `POST /api/prescription` | 🟡 Incomplete | Route exists, Twilio creds missing — falls back to console.log |
| 15.3 | `POST /api/sync/asha-batch` | 🟡 Incomplete | Route exists but no page calls it |
| 15.4 | `GET /api/sync/pharmacy-stock` | 🟡 Incomplete | Route exists but pharmacy page uses hardcoded array |
| 15.5 | `POST /api/sync/pharmacy-stock` | 🟡 Incomplete | Route exists but pharmacy form never calls it |
| 15.6 | `GET /api/appointments` | 🔴 Missing | No route — needed by appointments page |
| 15.7 | `POST /api/appointments` | 🔴 Missing | No route — needed for booking |
| 15.8 | `GET /api/records` | 🔴 Missing | No route — needed by health records page |
| 15.9 | `GET /api/admin/stats` | 🔴 Missing | No route — needed by admin dashboard |
| 15.10 | `GET /api/consultations` | 🔴 Missing | No route — needed by doctor workstation |
| 15.11 | `PATCH /api/consultations/[id]` | 🔴 Missing | No route — needed to save doctor notes |
| 15.12 | `/api/auth` | 🔴 Missing | No auth API at all |

---

## 16. Missing Pages (404s)

| # | URL | Missing | Referenced from |
|---|-----|---------|-----------------|
| 16.1 | `/dashboard/prescription/new` | 🔴 404 | Doctor workstation "Create Prescription" link |
| 16.2 | `/dashboard/patient/records/[id]` | 🔴 404 | Future: View individual record |

---

## 17. Prisma / DB

| # | Item | Status | Detail |
|---|------|--------|--------|
| 17.1 | Neon DB connected | ✅ Done | Migration applied 2026-03-12 |
| 17.2 | Tables created | ✅ Done | 9 tables in `neondb` |
| 17.3 | `@prisma/client` used anywhere | 🔴 No | Not a single page or API imports PrismaClient |
| 17.4 | Prisma Client initialization | 🔴 Missing | No `src/lib/prisma.ts` singleton file |

---

## Summary: Fix Priority Order

### Phase 1 — Foundation (do these first, everything depends on them)
1. Create `src/lib/prisma.ts` — Prisma singleton
2. Build auth: `POST /api/auth/login` → create/find User in DB, return JWT cookie
3. Add `middleware.ts` to protect all `/dashboard/*` routes
4. Fix login page to actually call auth API

### Phase 2 — Wire existing UI to existing APIs
5. Symptom checker → call `POST /api/triage` (API exists, page just ignores it)
6. Pharmacy stock form → call `POST /api/sync/pharmacy-stock`
7. ASHA registration → call `POST /api/sync/asha-batch`
8. Consultation room "Send Prescription" → call `POST /api/prescription`
9. Patient pharmacy search → call `GET /api/sync/pharmacy-stock?medicine=...`
10. Offline page → use `navigator.onLine` + `addEventListener("online")`
11. Emergency button → `<a href="tel:108">`

### Phase 3 — Build missing APIs + connect dashboards
12. `src/lib/prisma.ts` singleton
13. `GET /api/appointments` + `POST /api/appointments`
14. `GET /api/records?userId=`
15. `GET /api/consultations` + `PATCH /api/consultations/[id]`
16. `GET /api/admin/stats`
17. Connect all dashboards to real DB data

### Phase 4 — Advanced features
18. WebRTC signaling (Socket.IO server)
19. Real QR code on e-Prescription (react-qrcode-logo)
20. Create `/dashboard/prescription/new` page
21. Real Leaflet map in ASHA map page
22. Twilio credentials for SMS

---

> **Total broken/fake items found: 82**  
> **Working end-to-end: 8** (page routing, Gemini API, DB connection, print, nav links, timer, mode toggle, camera toggle)
