import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const userCount = await prisma.user.count()
    console.log('Successfully connected! User count:', userCount)
  } catch (e: any) {
    console.error('Connection error message:', e.message)
    console.error('Connection error stack:', e.stack)
    console.error('Full error object:', JSON.stringify(e, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main()
