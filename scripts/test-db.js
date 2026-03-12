const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const count = await prisma.user.count()
    console.log('Successfully connected! User count:', count)
  } catch (e) {
    console.error('Error name:', e.name)
    console.error('Error message:', e.message)
    console.error('Full Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
