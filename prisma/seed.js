const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      kfaCode: "93000001",
      name: "Paracetamol 500mg",
      brandName: "Sanmol",
      genericName: "Paracetamol",
      category: "REGULER",
      form: "Tablet",
      strength: "500mg",
      unit: "Box",
      stock: 100,
      price: 15000,
    },
    {
      kfaCode: "93000002",
      name: "Amoxicillin 500mg",
      brandName: "Amoxil",
      genericName: "Amoxicillin",
      category: "REGULER",
      form: "Kaplet",
      strength: "500mg",
      unit: "Strip",
      stock: 50,
      price: 20000,
    },
    {
      kfaCode: "93000003",
      name: "Diazepam 5mg",
      brandName: "Valium",
      genericName: "Diazepam",
      category: "PSIKOTROPIKA",
      form: "Tablet",
      strength: "5mg",
      unit: "Tablet",
      stock: 30,
      price: 12000,
    },
    {
      kfaCode: "93000004",
      name: "Codeine 10mg",
      brandName: "Codipront",
      genericName: "Codeine",
      category: "NARKOTIKA",
      form: "Tablet",
      strength: "10mg",
      unit: "Tablet",
      stock: 20,
      price: 35000,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { kfaCode: product.kfaCode },
      update: product,
      create: product,
    });
  }

  console.log("Seed finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
