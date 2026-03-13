const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function checkLabOrders() {
  try {
    const orders = await prisma.healthRecord.findMany({
      where: { type: 'LAB_RESULT' },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    fs.writeFileSync('lab-orders-check.txt', JSON.stringify(orders, null, 2));
  } catch (err) {
    fs.writeFileSync('lab-orders-err.txt', err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkLabOrders();
