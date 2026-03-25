"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Loader2, 
  Trash2, 
  ShoppingCart, 
  Calendar, 
  User, 
  ChevronRight,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (res.ok && data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string, invoice: string) => {
    if (!confirm(`Hapus transaksi ${invoice}? Stok obat akan dikembalikan otomatis.`)) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchTransactions();
      } else {
        const errorData = await res.json();
        alert(`Gagal: ${errorData.error}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan.");
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Riwayat Transaksi</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Daftar penjualan dan manajemen data</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari invoice atau nama pasien..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
              <p>Belum ada data transaksi.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-wider font-black">
                  <th className="px-8 py-4">TANGGAL</th>
                  <th className="px-8 py-4">INVOICE</th>
                  <th className="px-8 py-4">PASIEN / DOKTER</th>
                  <th className="px-8 py-4 text-right">TOTAL</th>
                  <th className="px-8 py-4">METODE</th>
                  <th className="px-8 py-4">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">
                          {new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(t.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                        {t.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                          <User size={14} className="text-gray-400" />
                          {t.patient?.name || "Umum"}
                        </div>
                        {t.doctorName && (
                          <span className="text-[10px] text-gray-400 font-medium ml-5">
                            dr. {t.doctorName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-sm font-black text-gray-900">
                        Rp {t.totalAmount.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg",
                        t.paymentMethod === 'CASH' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      )}>
                        {t.paymentMethod}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDeleteTransaction(t.id, t.invoiceNumber)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                          title="Hapus Transaksi"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-100">
        <div>
          <h3 className="text-lg font-black mb-1">Mencari Laporan Excel?</h3>
          <p className="text-blue-100 text-sm font-medium">Anda dapat mengunduh laporan penjualan lengkap dalam format Excel di halaman Laporan.</p>
        </div>
        <Link 
          href="/reports" 
          className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition shadow-lg shadow-blue-700/20 active:scale-95 whitespace-nowrap"
        >
          Ke Pusat Laporan
        </Link>
      </div>
    </div>
  );
}
