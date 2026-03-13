const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function checkIds() {
  try {
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' },
      select: { id: true, name: true }
    });
    fs.writeFileSync('db-out.txt', 'Doctors in DB: ' + JSON.stringify(doctors, null, 2) + '\n');
    
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      select: { id: true, name: true }
    });
    fs.appendFileSync('db-out.txt', 'Patients in DB: ' + JSON.stringify(patients, null, 2) + '\n');
  } catch (err) {
    fs.writeFileSync('db-err.txt', err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkIds();
