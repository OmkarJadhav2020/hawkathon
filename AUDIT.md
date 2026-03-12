# NearDoc — Complete System Audit

> Last updated: 2026-03-13 · Version 1.0 Beta

---

## Status Legend

- ✅ **Working** — end-to-end functional with real DB
- 🟡 **Partial** — functional but missing one feature or has a known limitation
- 🟠 **Simulated** — renders correctly, data is fake / no real backend action
- 🔴 **Broken** — crashes, 404, or does nothing

---

## Test Credentials

| Role | Phone | Name | Dashboard |
|------|-------|------|-----------|
| Patient | `7767827080` | Rajesh Kumar | `/dashboard/patient` |
| Doctor | `9876000001` | Dr. Ananya Sharma | `/dashboard/doctor` |
| ASHA | `9876000002` | Sunita Devi | `/dashboard/asha` |
| Pharmacy | `9876000003` | City Life Medicos | `/dashboard/pharmacy` |
| Admin | `9876000099` | District Health Officer | `/dashboard/admin` |

---

## 1. Login (`/`)

| Item | Status | Detail |
|------|--------|--------|
| Login form UI | ✅ | Phone input + role tabs |
| Clickable credential cards | ✅ | Click any card to auto-fill |
| DB lookup on submit | ✅ | `POST /api/auth/login` — finds user by phone+role |
| Wrong number → error | ✅ | 404 with credentials hint shown |
| localStorage stored | ✅ | userId, userName, role, pharmacyId, ashaId, doctorProfileId |
| Role-based routing | ✅ | Each role → correct dashboard |
| OTP | ✅ Removed | Intentionally skipped for testing |

---

## 2. Patient Dashboard (`/dashboard/patient`)

| Item | Status | Detail |
|------|--------|--------|
| Patient name from DB | ✅ | `GET /api/patient/dashboard?userId=` |
| Upcoming appointment card | ✅ | Real PENDING consultations |
| Reschedule button | 🟠 | Toast only — no backend reschedule endpoint |
| Cancel button | 🟠 | Toast only — no backend cancel endpoint |
| Recent health records | ✅ | 5 latest from DB |
| Blood group / allergies | ✅ | Real patient profile |
| Add Vital Reading modal | 🟡 | `POST /api/patient/dashboard` — may need check |
| Buy Medicine link | ✅ | Links to `/dashboard/patient/pharmacy` |
| Ambulance button | ✅ | `tel:108` — real dialler link |
| Health tip | ✅ | Cycles daily (static array) |
| Mobile bottom nav | ✅ | All 4 tabs link correctly |

---

## 3. Patient Appointments (`/dashboard/patient/appointments`)

| Item | Status | Detail |
|------|--------|--------|
| Upcoming consultations list | ✅ | PENDING + IN_PROGRESS from DB |
| Past consultations | ✅ | COMPLETED from DB |
| Available doctors | ✅ | Real doctors from DB |
| Book appointment | ✅ | `POST /api/appointments` — creates Consultation row |
| View Rx link | ✅ | Links to `/dashboard/prescription?consultId=` |

---

## 4. AI Symptom Checker (`/dashboard/patient/symptoms`)

| Item | Status | Detail |
|------|--------|--------|
| Chat input + send | ✅ | `POST /api/triage` → Gemini AI |
| Triage result | ✅ | Returns HOME_CARE / TELECONSULT / EMERGENCY |
| AI fallback if no key | 🟡 | Returns mock response |

---

## 5. Consultation Room (`/dashboard/patient/consultation?id=...`)

| Item | Status | Detail |
|------|--------|--------|
| Consultation data loaded | ✅ | `GET /api/consultations?id=` |
| Video feed UI | ✅ | Real WebRTC via `PeerJS` (browser-to-browser) |
| Camera toggle button | ✅ | Mutes/unmutes video tracks |
| Mic toggle button | ✅ | Mutes/unmutes audio tracks |
| Bandwidth monitor | ✅ | Real bitrate calculated via `RTCPeerConnection.getStats()` |
| Auto downgrades video→audio→text | ✅ | Triggers based on measured Kbps ranges (<300, <100, <20) |
| Secure chat | ✅ | Real-time chat sent over PeerJS `DataConnection` channel |
| Write Rx button | ✅ | Links to `/dashboard/prescription/new?consultId=` |
| End Call button | ✅ | `PATCH /api/consultations` → status=COMPLETED, redirects home |
| **Real WebRTC video** | ✅ | Implemented using the `peerjs.com` free STUN/signaling cloud |


---

## 6. Health Records List (`/dashboard/patient/records`)

| Item | Status | Detail |
|------|--------|--------|
| Health records list | ✅ | Real from DB |
| Patient QR health card | ✅ | Generated using `qrcode` library |
| Record cards clickable | ✅ | Links to `/dashboard/patient/records/[id]` |
| QR save / print | ✅ | Download QR image + `window.print()` |
| Allergy tags | ✅ | Real from patient profile |
| Consultation history | ✅ | COMPLETED consultations |
| View Rx from consultation | ✅ | Links to prescription page |

---

## 7. Individual Record Detail (`/dashboard/patient/records/[id]`)

| Item | Status | Detail |
|------|--------|--------|
| Page loads | ✅ | **NEW** — was 404 before |
| Record detail from DB | ✅ | `GET /api/records?id=` |
| QR code per record | ✅ | Generated with `qrcode` library |
| Patient info shown | ✅ | Name, village, blood group |
| Print button | ✅ | `window.print()` |
| Download QR | ✅ | Saves PNG |
| File download | ✅ | Opens `fileUrl` if set |

---

## 8. Medicine Finder (`/dashboard/patient/pharmacy`)

| Item | Status | Detail |
|------|--------|--------|
| Medicine search | ✅ | Filters real `PharmacyStock` from DB |
| Stock levels shown | ✅ | Real quantities |
| Find nearby pharmacy | 🟡 | Shows seeded pharmacy location only |

---

## 9. Doctor Workstation (`/dashboard/doctor`)

| Item | Status | Detail |
|------|--------|--------|
| Patient queue | ✅ | Real PENDING + IN_PROGRESS consultations |
| Patient search | ✅ | Debounced filter on real data |
| Doctor name dynamic | ✅ | From localStorage |
| Today's summary stats | ✅ | Real counts from DB |
| Start Consultation | ✅ | PATCH → PENDING to IN_PROGRESS |
| Active patient info | ✅ | Real name, village, blood group, symptoms |
| Consultation notes | ✅ | Save button → PATCH /api/consultations |
| Join Video Call button | ✅ | Navigates to shared `PeerJS` video room when IN_PROGRESS |
| Prescription tab | ✅ | Links to `/dashboard/prescription/new?consultId=` |
| Lab orders tab | ✅ | 8 quick-select tests with toast |
| End consultation | ✅ | PATCH → COMPLETED |
| Completed consultations | ✅ | Shows today's COMPLETED list |
| Print button | ✅ | `window.print()` |
| View Records link | ✅ | Links to `/dashboard/patient/records` |
| Logout button | ✅ | Clears localStorage + redirect |
| AI summary of patient | 🟡 | Symptoms shown; AI auto-summary not generated |

---

## 10. Prescription — Create (`/dashboard/prescription/new?consultId=...`)

| Item | Status | Detail |
|------|--------|--------|
| Loads patient from DB | ✅ | `GET /api/consultations?id=` → patient info |
| Doctor name from localStorage | ✅ | Fixed |
| Add / remove medicines | ✅ | Dynamic list |
| Issue prescription | ✅ | `POST /api/prescription` → saves to Prisma DB |
| SMS after save | 🟡 | Only if Twilio `.env` vars set |
| Error handling | ✅ | Toast on failure |
| Suspense wrapper | ✅ | Fixed — no hydration error |

---

## 11. Prescription — View (`/dashboard/prescription?consultId=...`)

| Item | Status | Detail |
|------|--------|--------|
| Load from DB | ✅ | `GET /api/prescription?consultId=` |
| Patient + medicine details | ✅ | From DB |
| Print prescription | ✅ | `window.print()` |
| QR code | ✅ | Generated with `qrcode` |
| SMS send | 🟡 | Only if Twilio configured |

---

## 12. ASHA Worker Dashboard (`/dashboard/asha`)

| Item | Status | Detail |
|------|--------|--------|
| Profile from DB | ✅ | `GET /api/asha?ashaId=` |
| Patient table | ✅ | Real patients from assigned villages |
| New Registration button | ✅ | **NEW** — opens full modal form |
| Registration modal | ✅ | Name/phone/gender/blood group/village/DOB |
| Saves to DB | ✅ | `POST /api/sync/asha-batch` → creates User (PATIENT role) |
| Sync Now button | ✅ | **NEW** — `POST /api/asha/sync` → marks SYNCED + updates lastSyncAt |
| Sync Queue view | ✅ | Shows pending items, Sync All button |
| Patients view | ✅ | Card grid for each patient |
| Resources view | ✅ | 4 content cards (static) |
| Proxy Book | 🟠 | Toast only — no real appointment booking for ASHA |
| Logout | 🔴 | Button missing — add `localStorage.clear(); router.push('/')` |

---

## 13. ASHA Village Map (`/dashboard/asha/map`)

| Item | Status | Detail |
|------|--------|--------|
| Map renders | ✅ | Leaflet map with real Punjab coordinates |
| Village markers | 🟡 | Seeded village pins only |
| Outreach tasks list | 🟠 | Static hardcoded tasks |
| "Start New Visit" | 🟡 | Navigates to `/dashboard/asha` |
| Task completion | 🔴 | Not wired to DB |

---

## 14. Pharmacy Stock Manager (`/dashboard/pharmacy`)

| Item | Status | Detail |
|------|--------|--------|
| Medicine table | ✅ | Real `PharmacyStock` from DB |
| Search filter | ✅ | Real-time filter |
| Update stock form | ✅ | `POST /api/sync/pharmacy-stock` → saves to DB |
| Low stock alert | ✅ | Shows when qty ≤ 20 |
| Send Alert button | 🟠 | Toast only |
| Edit button per row | ✅ | Pre-fills the update form |
| Reorder button | 🟠 | Toast only |
| Export report | ✅ | `window.print()` |
| Pharmacy name in header | ✅ | From stock data |
| pharmacyId from localStorage | ✅ | Set on login |

---

## 15. Admin Dashboard (`/dashboard/admin`)

| Item | Status | Detail |
|------|--------|--------|
| Total patients / doctors | ✅ | Real from DB |
| Consultations count | ✅ | Real from DB |
| Recent consultations table | ✅ | Last 10 from DB |
| Triage distribution | ✅ | Chart from DB |
| Top villages | ✅ | Patient count per village |
| Doctor availability | ✅ | Live from DoctorProfile |
| ASHA sync status | ✅ | Real lastSync timestamps |
| Export button | ✅ | `window.print()` |

---

## 16. API Routes

| Route | Method | Status | |
|-------|--------|--------|-|
| `/api/auth/login` | POST | ✅ | phone+role → DB lookup |
| `/api/patient/dashboard` | GET | ✅ | patient home data |
| `/api/patient/dashboard` | POST | 🟡 | add vital — needs verify |
| `/api/appointments` | GET | ✅ | consultations |
| `/api/appointments` | POST | ✅ | book consult |
| `/api/consultations` | GET `?id=` | ✅ | single consult |
| `/api/consultations` | GET `?doctorId=` | ✅ | doctor queue |
| `/api/consultations` | GET `?patientId=` | ✅ | patient history |
| `/api/consultations` | PATCH | ✅ | update status/notes |
| `/api/prescription` | POST | ✅ | save to DB + SMS |
| `/api/prescription` | GET `?id=` | ✅ | fetch by id |
| `/api/prescription` | GET `?consultId=` | ✅ | fetch by consult |
| `/api/records` | GET `?userId=` | ✅ | health records list |
| `/api/records` | GET `?id=` | ✅ | single record |
| `/api/triage` | POST | ✅ | Gemini AI triage |
| `/api/asha` | GET | ✅ | ASHA profile + patients |
| `/api/asha/sync` | POST | ✅ | sync queue processing |
| `/api/sync/asha-batch` | POST | ✅ | register patients in DB |
| `/api/sync/asha-batch` | GET | ✅ | pending count |
| `/api/sync/pharmacy-stock` | GET | ✅ | all stock |
| `/api/sync/pharmacy-stock` | POST | ✅ | update stock |
| `/api/admin/stats` | GET | ✅ | full analytics |

---

## 17. What Still Needs Building

### Medium Priority
| Feature | What's Needed |
|---------|--------------|
| Patient reschedule | `PATCH /api/consultations?id=` with new `scheduledAt` |
| ASHA map task cards wired | DB table for outreach tasks + API |
| Individual record → edit title | `PATCH /api/records?id=` |
| ASHA proxy book appointment | `POST /api/appointments` from ASHA dashboard |

### Requires External Services
| Feature | Blocker |
|---------|---------|
| Real SMS delivery | Need Twilio credentials in `.env` |
| Real AI triage | Need `GOOGLE_GENERATIVE_AI_API_KEY` in `.env` |

---

## 18. TypeScript Status

```
npx tsc --noEmit → ✅ Zero errors
```
