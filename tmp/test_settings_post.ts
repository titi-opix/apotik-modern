import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const settings = {
    pharmacy_name: "Apotek Modern Terverifikasi",
    apoteker_name: "Jaran Goyang (Apoteker)",
    apoteker_sipa: "123/SIPA/2024",
    apoteker_strap: "456/STRA/2024"
  }

  console.log('--- TESTING SETTINGS POST ---')
  for (const [key, value] of Object.entries(settings)) {
    const result = await (prisma as any).configuration.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
    console.log(`Upserted ${key}: ${result.value}`)
  }
  console.log('------------------------------')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
