const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function checkConsultations() {
  try {
    const consultations = await prisma.consultation.findMany({
      where: { patientId: 'cmmo7ahq10000ky04qzwzkacs' },
      include: { doctor: true }
    });
    fs.writeFileSync('consultations-out.txt', JSON.stringify(consultations, null, 2));
  } catch (err) {
    fs.writeFileSync('consultations-err.txt', err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkConsultations();
