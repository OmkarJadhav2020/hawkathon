/**
 * NearDoc — Database Seed Script
 * Run: npx ts-node prisma/seed.ts   OR   npx tsx prisma/seed.ts
 *
 * Inserts a demo patient, doctor, ASHA worker, pharmacy with stock,
 * consultations, health records, and a prescription — all into Neon DB.
 * This is the ONLY place demo data lives. The app code has zero hardcoded data.
 */

import "dotenv/config";
import { PrismaClient } from "../node_modules/.prisma/client/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NearDoc database...");

  // ─── 1. Users ─────────────────────────────────────────────────────────────
  const patient = await prisma.user.upsert({
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
  });
  console.log("✅ Patient:", patient.name, "| ID:", patient.id);

  const doctorUser = await prisma.user.upsert({
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
  });

  await prisma.doctorProfile.upsert({
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
  });
  console.log("✅ Doctor:", doctorUser.name, "| ID:", doctorUser.id);

  const ashaUser = await prisma.user.upsert({
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
  });

  await prisma.ashaWorkerProfile.upsert({
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
  });
  console.log("✅ ASHA:", ashaUser.name);

  const pharmacyUser = await prisma.user.upsert({
    where: { phone: "+919876000003" },
    update: {},
    create: {
      phone: "+919876000003",
      name: "City Life Medicos",
      role: "PHARMACY",
      village: "Nabha",
      district: "Patiala",
    },
  });

  const pharmacy = await prisma.pharmacyProfile.upsert({
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
  });
  console.log("✅ Pharmacy:", pharmacy.name);

  const adminUser = await prisma.user.upsert({
    where: { phone: "+919876000099" },
    update: {},
    create: {
      phone: "+919876000099",
      name: "District Health Officer",
      role: "ADMIN",
      district: "Patiala",
    },
  });
  console.log("✅ Admin:", adminUser.name);

  // ─── 2. Pharmacy Stock ───────────────────────────────────────────────────
  const medicines = [
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

  for (const med of medicines) {
    await prisma.pharmacyStock.upsert({
      where: {
        id: (await prisma.pharmacyStock.findFirst({ where: { pharmacyId: pharmacy.id, medicineName: med.name } }))?.id ?? "none",
      },
      update: { quantity: med.qty, price: med.price, inStock: med.inStock },
      create: {
        pharmacyId: pharmacy.id,
        medicineName: med.name,
        genericName: med.generic,
        quantity: med.qty,
        unit: med.unit,
        price: med.price,
        inStock: med.inStock,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log("✅ Pharmacy stock:", medicines.length, "medicines upserted");

  // ─── 3. Consultations ────────────────────────────────────────────────────
  const past1 = await prisma.consultation.create({
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
  });

  await prisma.consultation.create({
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
  });

  // Upcoming consultation
  await prisma.consultation.create({
    data: {
      patientId: patient.id,
      doctorId: doctorUser.id,
      status: "PENDING",
      symptoms: ["Routine check", "Diabetes follow-up"],
      connectionMode: "VIDEO",
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    },
  });
  console.log("✅ Consultations: 3 created (2 past, 1 upcoming)");

  // ─── 4. Health Records ───────────────────────────────────────────────────
  await prisma.healthRecord.createMany({
    data: [
      {
        patientId: patient.id,
        type: "LAB_RESULT",
        title: "Blood Sugar Test (HbA1c)",
        description: "HbA1c: 6.2% — Pre-diabetic range. Advised lifestyle changes and monitoring.",
        doctorName: doctorUser.name,
        fileUrl: null,
      },
      {
        patientId: patient.id,
        type: "LAB_RESULT",
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
    skipDuplicates: true,
  });
  console.log("✅ Health records: 4 upserted");

  // ─── 5. Prescription ─────────────────────────────────────────────────────
  await prisma.prescription.create({
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
  });
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
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
