"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Activity, 
  Package, 
  ShoppingCart, 
  Users, 
  Search, 
  BarChart3, 
  ShieldCheck,
  Database,
  Loader2,
  Settings
} from "lucide-react";


export default function Home() {
  const [seeding, setSeeding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { label: "Total Obat", value: "1,234", icon: Package, color: "text-blue-600" },
    { label: "Transaksi Hari Ini", value: "48", icon: ShoppingCart, color: "text-green-600" },
    { label: "Stok Rendah", value: "12", icon: Activity, color: "text-orange-600" },
    { label: "Pelanggan Baru", value: "15", icon: Users, color: "text-purple-600" },
  ];

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed");
      const data = await res.json();
      if (res.ok) {
        alert("Basis data berhasil diinisialisasi!");
        window.location.href = "/inventory";
      } else {
        alert(`Gagal: ${data.error || "Unknown server error"}`);
      }
    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setSeeding(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Apotek Modern Dashboard</h1>
            <p className="text-gray-500 mt-1">Sistem Manajemen Obat & Alkes Terintegrasi</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleSeed}
              disabled={seeding}
              className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 transition flex items-center gap-2 font-medium"
            >
              {seeding ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
              Inisialisasi Data
            </button>
            <Link 
              href="/inventory" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Package size={20} />
              Kelola Stok
            </Link>
            <Link 
              href="/pos" 
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Kasir (POS)
            </Link>
            <Link 
              href="/settings" 
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Settings size={20} />
              Pengaturan
            </Link>
          </div>

        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2 text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Integrations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <ShieldCheck className="text-blue-600" />
                Integrasi Regulasi (Kemenkes)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/inventory" className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition group cursor-pointer">
                  <h3 className="font-bold text-blue-700">KFA Browser</h3>
                  <p className="text-sm text-gray-500 mt-1">Pencarian obat standar SatuSehat</p>
                </Link>
                <Link href="/compliance" className="p-4 rounded-lg border border-gray-200 hover:border-green-300 transition group cursor-pointer">
                  <h3 className="font-bold text-green-700">SIPNAP Report</h3>
                  <p className="text-sm text-gray-500 mt-1">Laporan otomatis Narkotika & Psikotropika</p>
                </Link>
                <Link href="/compliance" className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition group cursor-pointer">
                  <h3 className="font-bold text-purple-700">SIMONA</h3>
                  <p className="text-sm text-gray-500 mt-1">Sinkronisasi data Obat & Alkes</p>
                </Link>
              </div>
            </section>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Activity className="text-orange-600" />
                Aktivitas Terbaru
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                        P
                      </div>
                      <div>
                        <p className="font-medium">Paracetamol 500mg (10 Box)</p>
                        <p className="text-xs text-gray-500">Transaksi #INV-2024-001 • 5 menit yang lalu</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-green-600">+Rp 150.000</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Search className="text-gray-400" />
                Cari Obat (KFA)
              </h2>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Masukkan kode KFA atau nama obat..." 
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">
                Pencarian terintegrasi dengan SatuSehat KFA Browser
              </p>
            </section>

            <section className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-lg text-white">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 />
                Insight Penjualan
              </h2>
              <div className="mt-6 h-32 flex items-end gap-2">
                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-white/20 rounded-t-md hover:bg-white/40 transition-all cursor-pointer" 
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <p className="text-sm mt-4 text-blue-100">
                Penjualan naik 12% dibandingkan minggu lalu
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
