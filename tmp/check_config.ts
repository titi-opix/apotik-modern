import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const configs = await (prisma as any).configuration.findMany()
  console.log('--- CONFIGURATIONS ---')
  console.log(JSON.stringify(configs, null, 2))
  console.log('----------------------')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
