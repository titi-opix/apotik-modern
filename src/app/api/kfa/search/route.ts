import { NextResponse } from "next/server";

// Mock data based on KFA browser structure
const MOCK_KFA_DATA = [
  {
    kfaCode: "93000001",
    name: "Paracetamol 500 mg Tablet",
    brandName: "Sanmol",
    genericName: "Paracetamol",
    form: "Tablet",
    strength: "500 mg",
    category: "REGULER",
  },
  {
    kfaCode: "93000002",
    name: "Amoxicillin 500 mg Kaplet",
    brandName: "Amoxil",
    genericName: "Amoxicillin",
    form: "Kaplet",
    strength: "500 mg",
    category: "REGULER",
  },
  {
    kfaCode: "93000003",
    name: "Diazepam 5 mg Tablet",
    brandName: "Valium",
    genericName: "Diazepam",
    form: "Tablet",
    strength: "5 mg",
    category: "PSIKOTROPIKA",
  },
  {
    kfaCode: "93000004",
    name: "Codeine 10 mg Tablet",
    brandName: "Codipront",
    genericName: "Codeine",
    form: "Tablet",
    strength: "10 mg",
    category: "NARKOTIKA",
  },
  {
    kfaCode: "93001234",
    name: "Candesartan Cilexetil 8 mg Tablet",
    brandName: "Candecur",
    genericName: "Candesartan Cilexetil",
    form: "Tablet",
    strength: "8 mg",
    category: "REGULER",
  },
  {
    kfaCode: "93001235",
    name: "Candesartan Cilexetil 16 mg Tablet",
    brandName: "Blopress",
    genericName: "Candesartan Cilexetil",
    form: "Tablet",
    strength: "16 mg",
    category: "REGULER",
  },
  {
    kfaCode: "93005678",
    name: "Amlodipine Besilate 5 mg Tablet",
    brandName: "Norvask",
    genericName: "Amlodipine Besilate",
    form: "Tablet",
    strength: "5 mg",
    category: "REGULER",
  },
  {
    kfaCode: "93005679",
    name: "Amlodipine Besilate 10 mg Tablet",
    brandName: "Amlogrix",
    genericName: "Amlodipine Besilate",
    form: "Tablet",
    strength: "10 mg",
    category: "REGULER",
  },
  {
    kfaCode: "93009901",
    name: "Metformin HCl 500 mg Tablet",
    brandName: "Glucophage",
    genericName: "Metformin Hydrochloride",
    form: "Tablet",
    strength: "500 mg",
    category: "REGULER",
  },
  {
    kfaCode: "93009902",
    name: "Metformin HCl 850 mg Tablet",
    brandName: "Glumin",
    genericName: "Metformin Hydrochloride",
    form: "Tablet",
    strength: "850 mg",
    category: "REGULER",
  },
  {
    kfaCode: "93011101",
    name: "Cetirizine HCl 10 mg Tablet",
    brandName: "Ryzen",
    genericName: "Cetirizine Hydrochloride",
    form: "Tablet",
    strength: "10 mg",
    category: "REGULER",
  },
  {
    kfaCode: "93022201",
    name: "Omeprazole 20 mg Kapsul",
    brandName: "Prilosec",
    genericName: "Omeprazole",
    form: "Kapsul",
    strength: "20 mg",
    category: "REGULER",
  },
  {
    kfaCode: "93033301",
    name: "Simvastatin 10 mg Tablet",
    brandName: "Zocor",
    genericName: "Simvastatin",
    form: "Tablet",
    strength: "10 mg",
    category: "REGULER",
  },
  {
    kfaCode: "93033302",
    name: "Simvastatin 20 mg Tablet",
    brandName: "Simvakor",
    genericName: "Simvastatin",
    form: "Tablet",
    strength: "20 mg",
    category: "REGULER",
  },
  {
    kfaCode: "93044401",
    name: "Alprazolam 0.5 mg Tablet",
    brandName: "Xanax",
    genericName: "Alprazolam",
    form: "Tablet",
    strength: "0.5 mg",
    category: "PSIKOTROPIKA",
  },
  {
    kfaCode: "93044402",
    name: "Alprazolam 1 mg Tablet",
    brandName: "Alganax",
    genericName: "Alprazolam",
    form: "Tablet",
    strength: "1 mg",
    category: "PSIKOTROPIKA",
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase();

  if (!query) {
    return NextResponse.json([]);
  }

  // In a real scenario, this would be a fetch to:
  // https://api.kemkes.go.id/kfa/v1/products?name=${query}
  
  const results = MOCK_KFA_DATA.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.kfaCode.includes(query) ||
      item.brandName.toLowerCase().includes(query)
  );

  return NextResponse.json(results);
}
