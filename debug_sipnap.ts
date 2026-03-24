import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const movements = await prisma.stockMovement.findMany({
    include: { product: true },
    take: 10
  })
  console.log(JSON.stringify(movements, null, 2))
  
  const productCount = await prisma.product.count({
    where: { category: { in: ["NARKOTIKA", "PSIKOTROPIKA"] } }
  })
  console.log("Narkotika/Psikotropika Product Count:", productCount)
}

main().catch(console.error).finally(() => prisma.$disconnect())
