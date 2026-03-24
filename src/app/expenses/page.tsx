"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Trash2, 
  Loader2, 
  DollarSign, 
  Calendar, 
  Tag, 
  FileText,
  X,
  CreditCard,
  PieChart
} from "lucide-react";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "OPERASIONAL",
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    setMounted(true);
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (Array.isArray(data)) {
        setExpenses(data);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          description: "",
          amount: "",
          category: "OPERASIONAL",
          date: new Date().toISOString().split('T')[0],
        });
        fetchExpenses();
      }
    } catch (error) {
      alert("Gagal menyimpan pengeluaran");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalThisMonth = expenses.reduce((sum, e) => {
    const expenseDate = new Date(e.date);
    const now = new Date();
    if (expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()) {
      return sum + e.amount;
    }
    return sum;
  }, 0);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pengeluaran Apotek</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Manajemen Biaya Operasional</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={20} />
          Catat Pengeluaran
        </button>
      </header>

      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Total Bulan Ini</p>
              <p className="text-xl font-black text-gray-900">Rp {totalThisMonth.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
              <Calendar size={28} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Jumlah Transaksi</p>
              <p className="text-xl font-black text-gray-900">{expenses.length} Catatan</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
              <PieChart size={28} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Kategori Terbanyak</p>
              <p className="text-xl font-black text-gray-900">Operasional</p>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari pengeluaran atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                  <th className="px-8 py-5">Tanggal</th>
                  <th className="px-8 py-5">Deskripsi</th>
                  <th className="px-8 py-5">Kategori</th>
                  <th className="px-8 py-5">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-6 h-16 bg-gray-50/50"></td>
                    </tr>
                  ))
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold">
                      Belum ada data pengeluaran.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition group">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className="text-xs font-bold text-gray-900">
                          {new Date(expense.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-gray-700">{expense.description}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-black text-gray-900">Rp {expense.amount.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Tambah Pengeluaran */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Catat Pengeluaran</h2>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1 text-opacity-70">Detail Biaya Operasional</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-600 transition shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Deskripsi Biaya *</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Contoh: Bayar Listrik Agustus"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Kategori *</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-bold text-gray-700 text-sm"
                    >
                      <option value="OPERASIONAL">Operasional</option>
                      <option value="GAJI">Gaji Karyawan</option>
                      <option value="LISTRIK-AIR">Listrik & Air</option>
                      <option value="SEWA">Sewa Tempat</option>
                      <option value="SUPPLIES">Perlengkapan</option>
                      <option value="LAINNYA">Lainnya</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Tanggal *</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Jumlah (Rp) *</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="Masukkan nominal..."
                    className="w-full pl-12 pr-4 py-5 bg-blue-50/30 border border-blue-50 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition font-black text-2xl text-blue-600 placeholder:text-blue-200"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-200 transition active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 disabled:opacity-50 transition active:scale-95 shadow-xl shadow-blue-200"
                >
                  {isSaving ? <Loader2 className="animate-spin inline mr-2" size={18} /> : "Simpan Biaya"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
