"use strict";
/**
 * GraamSehat — Database Seed Script
 * Run: npx ts-node prisma/seed.ts   OR   npx tsx prisma/seed.ts
 *
 * Inserts a demo patient, doctor, ASHA worker, pharmacy with stock,
 * consultations, health records, and a prescription — all into Neon DB.
 * This is the ONLY place demo data lives. The app code has zero hardcoded data.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var patient, doctorUser, ashaUser, pharmacyUser, pharmacy, adminUser, medicines, _i, medicines_1, med, past1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🌱 Seeding GraamSehat database...");
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { phone: "+917767827080" },
                            update: {},
                            create: {
                                phone: "+917767827080",
                                name: "Rajesh Kumar",
                                role: "PATIENT",
                                gender: "Male",
                                bloodGroup: "B+",
                                village: "Nabha, Punjab",
                                district: "Patiala",
                                allergies: ["Penicillin"],
                                dateOfBirth: new Date("1990-06-15"),
                            },
                        })];
                case 1:
                    patient = _a.sent();
                    console.log("✅ Patient:", patient.name, "| ID:", patient.id);
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { phone: "+919876000001" },
                            update: {},
                            create: {
                                phone: "+919876000001",
                                name: "Dr. Ananya Sharma",
                                role: "DOCTOR",
                                gender: "Female",
                                village: "Patiala",
                                district: "Patiala",
                            },
                        })];
                case 2:
                    doctorUser = _a.sent();
                    return [4 /*yield*/, prisma.doctorProfile.upsert({
                            where: { userId: doctorUser.id },
                            update: {},
                            create: {
                                userId: doctorUser.id,
                                specialization: "General Physician",
                                registrationNo: "MCI-12345",
                                isAvailable: true,
                                rating: 4.8,
                                totalRatings: 124,
                            },
                        })];
                case 3:
                    _a.sent();
                    console.log("✅ Doctor:", doctorUser.name, "| ID:", doctorUser.id);
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { phone: "+919876000002" },
                            update: {},
                            create: {
                                phone: "+919876000002",
                                name: "Sunita Devi",
                                role: "ASHA",
                                gender: "Female",
                                village: "Nabha, Punjab",
                                district: "Patiala",
                            },
                        })];
                case 4:
                    ashaUser = _a.sent();
                    return [4 /*yield*/, prisma.ashaWorkerProfile.upsert({
                            where: { userId: ashaUser.id },
                            update: {},
                            create: {
                                userId: ashaUser.id,
                                villagesAssigned: ["Nabha", "Sirhind", "Morinda"],
                                district: "Patiala",
                                totalCamps: 18,
                                isOnline: true,
                                lastSyncAt: new Date(),
                            },
                        })];
                case 5:
                    _a.sent();
                    console.log("✅ ASHA:", ashaUser.name);
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { phone: "+919876000003" },
                            update: {},
                            create: {
                                phone: "+919876000003",
                                name: "City Life Medicos",
                                role: "PHARMACY",
                                village: "Nabha",
                                district: "Patiala",
                            },
                        })];
                case 6:
                    pharmacyUser = _a.sent();
                    return [4 /*yield*/, prisma.pharmacyProfile.upsert({
                            where: { userId: pharmacyUser.id },
                            update: {},
                            create: {
                                userId: pharmacyUser.id,
                                name: "City Life Medicos",
                                address: "Main Bazaar, Nabha, Punjab 147201",
                                lat: 30.3769,
                                lng: 76.1536,
                                isOpen: true,
                                phone: "+911765501234",
                            },
                        })];
                case 7:
                    pharmacy = _a.sent();
                    console.log("✅ Pharmacy:", pharmacy.name);
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { phone: "+919876000099" },
                            update: {},
                            create: {
                                phone: "+919876000099",
                                name: "District Health Officer",
                                role: "ADMIN",
                                district: "Patiala",
                            },
                        })];
                case 8:
                    adminUser = _a.sent();
                    console.log("✅ Admin:", adminUser.name);
                    medicines = [
                        { name: "Paracetamol 500mg", generic: "Acetaminophen", qty: 200, unit: "tablets", price: 1.5, inStock: true },
                        { name: "Amoxicillin 500mg", generic: "Amoxicillin", qty: 80, unit: "capsules", price: 8, inStock: true },
                        { name: "Metformin 500mg", generic: "Metformin HCl", qty: 150, unit: "tablets", price: 3, inStock: true },
                        { name: "Amlodipine 5mg", generic: "Amlodipine", qty: 12, unit: "tablets", price: 5, inStock: true },
                        { name: "Azithromycin 250mg", generic: "Azithromycin", qty: 0, unit: "tablets", price: 15, inStock: false },
                        { name: "ORS Sachets", generic: "Oral Rehydration Salts", qty: 300, unit: "sachets", price: 2, inStock: true },
                        { name: "Cough Syrup 100ml", generic: "Dextromethorphan", qty: 45, unit: "bottles", price: 35, inStock: true },
                        { name: "Vitamin D3 60K IU", generic: "Cholecalciferol", qty: 5, unit: "capsules", price: 12, inStock: true },
                        { name: "Pantoprazole 40mg", generic: "Pantoprazole", qty: 90, unit: "tablets", price: 4, inStock: true },
                        { name: "Iron + Folic Acid", generic: "Ferrous Sulfate", qty: 250, unit: "tablets", price: 1, inStock: true },
                    ];
                    _i = 0, medicines_1 = medicines;
                    _a.label = 9;
                case 9:
                    if (!(_i < medicines_1.length)) return [3 /*break*/, 12];
                    med = medicines_1[_i];
                    return [4 /*yield*/, prisma.pharmacyStock.create({
                            data: {
                                pharmacyId: pharmacy.id,
                                medicineName: med.name,
                                genericName: med.generic,
                                quantity: med.qty,
                                unit: med.unit,
                                price: med.price,
                                inStock: med.inStock,
                                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                            },
                        })];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 9];
                case 12:
                    console.log("✅ Pharmacy stock:", medicines.length, "medicines added");
                    return [4 /*yield*/, prisma.consultation.create({
                            data: {
                                patientId: patient.id,
                                doctorId: doctorUser.id,
                                status: "COMPLETED",
                                symptoms: ["Fever", "Body ache", "Cough"],
                                triageCategory: "TELECONSULT",
                                notes: "Patient had viral fever lasting 3 days. Prescribed paracetamol and rest.",
                                connectionMode: "VIDEO",
                                scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                                startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                                completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
                            },
                        })];
                case 13:
                    past1 = _a.sent();
                    return [4 /*yield*/, prisma.consultation.create({
                            data: {
                                patientId: patient.id,
                                doctorId: doctorUser.id,
                                status: "COMPLETED",
                                symptoms: ["High BP", "Dizziness"],
                                triageCategory: "TELECONSULT",
                                notes: "BP: 140/90. Advised Amlodipine 5mg. Lifestyle modification advised.",
                                connectionMode: "VIDEO",
                                scheduledAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                                startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                                completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
                            },
                        })];
                case 14:
                    _a.sent();
                    // Upcoming consultation
                    return [4 /*yield*/, prisma.consultation.create({
                            data: {
                                patientId: patient.id,
                                doctorId: doctorUser.id,
                                status: "PENDING",
                                symptoms: ["Routine check", "Diabetes follow-up"],
                                connectionMode: "VIDEO",
                                scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                            },
                        })];
                case 15:
                    // Upcoming consultation
                    _a.sent();
                    console.log("✅ Consultations: 3 created (2 past, 1 upcoming)");
                    // ─── 4. Health Records ───────────────────────────────────────────────────
                    return [4 /*yield*/, prisma.healthRecord.createMany({
                            data: [
                                {
                                    patientId: patient.id,
                                    type: "LAB",
                                    title: "Blood Sugar Test (HbA1c)",
                                    description: "HbA1c: 6.2% — Pre-diabetic range. Advised lifestyle changes and monitoring.",
                                    doctorName: doctorUser.name,
                                    fileUrl: null,
                                },
                                {
                                    patientId: patient.id,
                                    type: "LAB",
                                    title: "Complete Blood Count (CBC)",
                                    description: "Hb: 13.2 g/dL — Mild anemia noted. Iron supplementation advised.",
                                    doctorName: doctorUser.name,
                                    fileUrl: null,
                                },
                                {
                                    patientId: patient.id,
                                    type: "VACCINATION",
                                    title: "COVID-19 Vaccination — Dose 3",
                                    description: "Booster dose administered. Certificate issued.",
                                    doctorName: "PHC Nabha",
                                    fileUrl: null,
                                },
                                {
                                    patientId: patient.id,
                                    type: "PRESCRIPTION",
                                    title: "Fever Treatment — Dr. Ananya Sharma",
                                    description: "Prescribed Paracetamol 500mg TDS + ORS for 5 days.",
                                    doctorName: doctorUser.name,
                                    fileUrl: null,
                                },
                            ],
                        })];
                case 16:
                    // ─── 4. Health Records ───────────────────────────────────────────────────
                    _a.sent();
                    console.log("✅ Health records: 4 created");
                    // ─── 5. Prescription ─────────────────────────────────────────────────────
                    return [4 /*yield*/, prisma.prescription.create({
                            data: {
                                consultationId: past1.id,
                                patientId: patient.id,
                                doctorName: doctorUser.name,
                                diagnosis: "Viral Fever with body ache. 3-day history.",
                                instructions: "Complete full course. Drink warm fluids. Rest for 48 hours.",
                                medicines: [
                                    { name: "Paracetamol 500mg", dosage: "1 tablet thrice daily after meals", frequency: "TDS", days: 5, quantity: "15 tablets" },
                                    { name: "ORS Sachets", dosage: "1 sachet dissolved in 1L water, drink throughout day", frequency: "PRN", days: 3, quantity: "3 sachets" },
                                    { name: "Cough Syrup", dosage: "10ml twice daily", frequency: "BD", days: 5, quantity: "1 bottle" },
                                ],
                                smsDelivered: false,
                                smsPhone: patient.phone,
                            },
                        })];
                case 17:
                    // ─── 5. Prescription ─────────────────────────────────────────────────────
                    _a.sent();
                    console.log("✅ Prescription created");
                    console.log("\n🎉 Seed complete! All real data is now in the Neon DB.");
                    console.log("──────────────────────────────────────────────────");
                    console.log("Patient ID:", patient.id);
                    console.log("Doctor  ID:", doctorUser.id);
                    console.log("ASHA    ID:", ashaUser.id);
                    console.log("Admin   ID:", adminUser.id);
                    console.log("──────────────────────────────────────────────────");
                    console.log("👉 Use this as userId in the app:", patient.id);
                    console.log("   Or store it: localStorage.setItem('userId', '" + patient.id + "')");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) { console.error("❌ Seed failed:", e); process.exit(1); })
    .finally(function () { return prisma.$disconnect(); });
