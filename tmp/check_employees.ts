import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const employees = await prisma.employee.findMany()
  console.log('--- EMPLOYEES ---')
  console.log(JSON.stringify(employees, null, 2))
  console.log('------------------')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
