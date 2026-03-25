import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const employees = await prisma.employee.findMany()
  console.log("Employees found:", employees.length)
  if (employees.length > 0) {
    console.log("Fields in first employee:", Object.keys(employees[0]))
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
