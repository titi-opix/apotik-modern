"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Printer, ShieldCheck } from "lucide-react";

export default function MonthlyReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetching data for the report
    // In a real app, this would be an API call to /api/reports/monthly
    setTimeout(() => {
      setData({
        pharmacyName: "Apotek Arfian",
        period: "Oktober 2026",
        generatedAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jayapura' }),
        summary: {
          totalSales: 125430000,
          totalTransactions: 432,
          topProduct: "Paracetamol 500mg",
          lowStockAlerts: 5
        },
        transactions: [
          { date: "2026-10-01", id: "INV-001", patient: "Ani", total: 45000 },
          { date: "2026-10-02", id: "INV-002", patient: "Budi", total: 125000 },
          { date: "2026-10-05", id: "INV-003", patient: "Citra", total: 82000 },
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-bold">Menyiapkan Laporan Bulanan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-12 max-w-4xl mx-auto shadow-lg my-8 print:my-0 print:shadow-none print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-blue-600 pb-8 mb-12">
        <div>
          <h1 className="text-4xl font-black text-blue-900 tracking-tight">{data.pharmacyName}</h1>
          <p className="text-lg font-bold text-gray-500 uppercase tracking-widest mt-2 px-1 border-l-4 border-blue-600">Review Bulanan Apotek</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Periode Laporan</p>
          <p className="text-2xl font-black text-gray-900">{data.period}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Penjualan</p>
          <p className="text-2xl font-black text-blue-900">Rp {data.summary.totalSales.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/50">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Transaksi Berhasil</p>
          <p className="text-2xl font-black text-emerald-900">{data.summary.totalTransactions} Order</p>
        </div>
        <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100/50">
          <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Stok Kritis</p>
          <p className="text-2xl font-black text-orange-900">{data.summary.lowStockAlerts} Item</p>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="space-y-8 mb-12">
        <section>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldCheck size={16} />
            Analisis Produk
          </h3>
          <div className="bg-gray-50 p-6 rounded-3xl">
            <p className="text-sm font-bold text-gray-600 italic">"Produk {data.summary.topProduct} menyumbang 24% dari total pendapatan bulan ini. Disarankan untuk menambah supply pada akhir minggu."</p>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileText size={16} />
            Sampel Transaksi
          </h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="py-4 text-xs font-black text-gray-400 uppercase">Tanggal</th>
                <th className="py-4 text-xs font-black text-gray-400 uppercase">Invoice</th>
                <th className="py-4 text-xs font-black text-gray-400 uppercase">Pasien</th>
                <th className="py-4 text-right text-xs font-black text-gray-400 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-bold text-gray-700">
              {data.transactions.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="py-4">{t.date}</td>
                  <td className="py-4 text-blue-600">{t.id}</td>
                  <td className="py-4">{t.patient}</td>
                  <td className="py-4 text-right">Rp {t.total.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-24 pt-8 border-t border-gray-100 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dicetak pada</p>
          <p className="text-xs font-bold text-gray-500">{data.generatedAt} WIT</p>
        </div>
        <div className="text-right">
          <div className="h-20 w-40 border-b-2 border-gray-200 mb-2 grayscale opacity-50" style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/e/e4/Signature_of_Hillary_Clinton.svg")', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}></div>
          <p className="text-xs font-black text-gray-900 uppercase">Apt. Arfian, S.Farm</p>
          <p className="text-[10px] font-bold text-gray-400">Kepala Apoteker</p>
        </div>
      </div>

      {/* Control Actions - Hidden in Print */}
      <div className="fixed bottom-8 right-8 flex gap-4 print:hidden">
        <button 
          onClick={() => window.close()}
          className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-50 shadow-lg active:scale-95 transition-all"
        >
          Tutup
        </button>
        <button 
          onClick={handlePrint}
          className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-black shadow-lg shadow-blue-200 active:scale-95 transition-all"
        >
          <Printer size={18} />
          Cetak / Simpan PDF
        </button>
      </div>
    </div>
  );
}
