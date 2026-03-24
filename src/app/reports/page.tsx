"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { 
  ArrowLeft, 
  Download, 
  FileSpreadsheet, 
  Loader2, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Calendar,
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from "lucide-react";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const downloadReport = async (type: 'SALES' | 'STOCK' | 'EXPENSES') => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal mengambil data");

      const wb = XLSX.utils.book_new();

      if (type === 'SALES') {
        const salesData = data.transactions.map((t: any) => ({
          "No. Invoice": t.invoiceNumber,
          "Tanggal": new Date(t.createdAt).toLocaleString('id-ID'),
          "Pasien": t.patient?.name || "-",
          "Dokter": t.doctorName || "-",
          "Total Bayar": t.totalAmount,
          "Metode": t.paymentMethod,
          "Item": t.items.map((i: any) => `${i.product.name} (${i.quantity})`).join(", ")
        }));
        const ws = XLSX.utils.json_to_sheet(salesData);
        XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");
        XLSX.writeFile(wb, `Laporan_Penjualan_${new Date().toLocaleDateString()}.xlsx`);
      }

      if (type === 'STOCK') {
        const stockData = data.products.flatMap((p: any) => 
          p.batches.map((b: any) => ({
            "Kode KFA": p.kfaCode || "-",
            "Nama Produk": p.name,
            "Kategori": p.category,
            "No. Batch": b.batchNumber || "-",
            "Tgl Kedaluwarsa": new Date(b.expiryDate).toLocaleDateString('id-ID'),
            "Stok Sisa": b.currentQuantity,
            "Satuan": p.unit || "Unit"
          }))
        );
        const ws = XLSX.utils.json_to_sheet(stockData);
        XLSX.utils.book_append_sheet(wb, ws, "Laporan Stok FEFO");
        XLSX.writeFile(wb, `Laporan_Stok_${new Date().toLocaleDateString()}.xlsx`);
      }

      if (type === 'EXPENSES') {
        const expenseData = data.expenses.map((e: any) => ({
          "Tanggal": new Date(e.date).toLocaleDateString('id-ID'),
          "Deskripsi": e.description,
          "Kategori": e.category,
          "Jumlah (Rp)": e.amount
        }));
        const ws = XLSX.utils.json_to_sheet(expenseData);
        XLSX.utils.book_append_sheet(wb, ws, "Laporan Pengeluaran");
        XLSX.writeFile(wb, `Laporan_Pengeluaran_${new Date().toLocaleDateString()}.xlsx`);
      }

    } catch (error: any) {
      alert(`Gagal mengunduh laporan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const reportTypes = [
    {
      id: 'SALES',
      title: 'Laporan Penjualan',
      desc: 'Data transaksi harian, mingguan, dan bulanan.',
      icon: ShoppingCart,
      color: 'bg-green-50 text-green-600',
      btnColor: 'bg-green-600 hover:bg-green-700 shadow-green-100'
    },
    {
      id: 'STOCK',
      title: 'Laporan Stok (FEFO)',
      desc: 'Data sisa stok berdasarkan tanggal kedaluwarsa.',
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
      btnColor: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
    },
    {
      id: 'EXPENSES',
      title: 'Laporan Pengeluaran',
      desc: 'Rincian biaya operasional dan pengeluaran apotek.',
      icon: DollarSign,
      color: 'bg-purple-50 text-purple-600',
      btnColor: 'bg-purple-600 hover:bg-purple-700 shadow-purple-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight italic">Pusat Laporan Excel</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Ekspor data operasional apotek</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl text-blue-700">
          <ShieldCheck size={18} />
          <span className="text-xs font-black uppercase">Data Terenkripsi</span>
        </div>
      </header>

      <main className="p-8 max-w-5xl mx-auto w-full space-y-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-white to-gray-50/50">
          <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-100 shrink-0 rotate-3">
            <FileSpreadsheet size={48} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Kelola Laporan Bisnis Anda</h2>
            <p className="text-gray-500 leading-relaxed text-sm max-w-md">
              Unduh data apotek Anda dalam format Excel untuk analisis lebih lanjut, pembukuan pajak, atau pelaporan internal.
            </p>
          </div>
          <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
            <TrendingUp size={16} />
            Data Realtime
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <div key={report.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between h-[300px]">
              <div>
                <div className={`w-14 h-14 ${report.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300`}>
                  <report.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{report.title}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{report.desc}</p>
              </div>
              
              <button 
                onClick={() => downloadReport(report.id as any)}
                disabled={loading}
                className={`w-full py-4 ${report.btnColor} text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 mt-6 shadow-lg`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    <Download size={16} />
                    Unduh Excel
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex gap-4 items-start">
          <Calendar className="text-orange-500 shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-black text-orange-900 uppercase tracking-widest mb-1">Catatan</h4>
            <p className="text-xs text-orange-700 leading-relaxed font-medium">
              Laporan yang dihasilkan mencakup seluruh data yang ada di database hingga detik ini. Untuk laporan periodik, Anda dapat melakukan pemfilteran manual menggunakan Microsoft Excel atau Google Sheets.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
