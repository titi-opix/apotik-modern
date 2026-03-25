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
  TrendingUp,
  AlertCircle,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Download
} from "lucide-react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { 
      label: "TOTAL OBAT", 
      value: "1,284", 
      icon: Package, 
      color: "bg-blue-50 text-blue-600",
      trend: "+12.5%",
      trendColor: "bg-green-100 text-green-700",
      href: "/inventory"
    },
    { 
      label: "TRANSAKSI HARI INI", 
      value: "48", 
      icon: ShoppingCart, 
      color: "bg-indigo-50 text-indigo-600",
      status: "Up to date",
      statusColor: "bg-blue-50 text-blue-600",
      href: "/pos"
    },
    { 
      label: "STOK RENDAH", 
      value: "18", 
      icon: AlertCircle, 
      color: "bg-red-50 text-red-600 border-l-4 border-red-500",
      status: "Critical",
      statusColor: "bg-red-100 text-red-700",
      href: "/inventory"
    },
    { 
      label: "PELANGGAN BARU", 
      value: "12", 
      icon: Users, 
      color: "bg-green-50 text-green-600",
      status: "New",
      statusColor: "bg-green-100 text-green-700",
      href: "/pos" // Assuming customers are managed or seen in POS/Sales
    },
  ];

  const recentActivities = [
    {
      type: "stock",
      title: "Penerimaan Stok Baru",
      desc: "Paracetamol 500mg (10 Box)",
      time: "10 Menit Lalu",
      user: "Suster Maria",
      icon: Package,
      iconColor: "bg-blue-50 text-blue-600"
    },
    {
      type: "alert",
      title: "Alert: Stok Kritis",
      desc: "Amoxicillin tinggal 5 strip tersisa.",
      time: "45 Menit Lalu",
      user: "Sistem Otomatis",
      icon: AlertCircle,
      iconColor: "bg-red-50 text-red-600"
    },
    {
      type: "sale",
      title: "Penjualan Berhasil",
      desc: "Order #882190 - Rp 450.000",
      time: "1 Jam Lalu",
      user: "Dr. Sarah",
      icon: ShoppingCart,
      iconColor: "bg-green-50 text-green-600"
    },
    {
      type: "po",
      title: "Surat Pesanan Dibuat",
      desc: "PBF Kimia Farma - 8 item",
      time: "2 Jam Lalu",
      user: "Sistem",
      icon: FileText,
      iconColor: "bg-slate-50 text-slate-600"
    }
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link 
            key={i} 
            href={stat.href}
            className={`p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all relative overflow-hidden group ${stat.color.includes('border-red-500') ? 'border-l-4 border-red-500' : ''}`}
          >
             <div className="flex justify-between items-start">
               <div className={`p-4 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
                 <stat.icon size={24} />
               </div>
               {stat.trend && (
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${stat.trendColor}`}>
                   {stat.trend}
                 </span>
               )}
               {stat.status && (
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${stat.statusColor}`}>
                   {stat.status}
                 </span>
               )}
             </div>
             <div className="mt-6">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
               <p className="text-3xl font-black text-gray-900 mt-1 tracking-tight">{stat.value}</p>
             </div>
             <div className="absolute top-2 right-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
               <ArrowUpRight size={16} />
             </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Insight Penjualan</h2>
              <p className="text-xs text-gray-400 font-bold mt-1">Laporan performa apotek 7 hari terakhir</p>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-xl">
              <button className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition">Mingguan</button>
              <button className="px-6 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-100">Bulanan</button>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 px-4">
            {[30, 60, 45, 85, 55, 45, 100].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="relative w-full">
                   {i === 6 && (
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg">
                       Rp 10.4M
                     </div>
                   )}
                   <div 
                    className={`w-full rounded-t-2xl transition-all duration-500 cursor-pointer ${
                      i === 3 ? "bg-emerald-400" : i === 6 ? "bg-blue-900" : "bg-blue-200 group-hover:bg-blue-300"
                    }`}
                    style={{ height: `${h * 1.5}px` }}
                  />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Aktivitas Terbaru</h2>
            <Link href="/reports" className="text-xs font-bold text-blue-600 hover:underline">Lihat Semua</Link>
          </div>

          <div className="flex-1 space-y-6">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex gap-4 group cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl ${act.iconColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <act.icon size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-gray-900 tracking-tight">{act.title}</h4>
                  <p className="text-xs text-gray-400 font-bold mt-0.5 line-clamp-1">{act.desc}</p>
                  <p className="text-[10px] text-gray-300 font-bold mt-2 flex items-center gap-2">
                    <Clock size={10} />
                    {act.time} • Oleh {act.user}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-50">
            <div className="bg-blue-50/50 p-6 rounded-3xl relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-sm font-black text-blue-900">Review Bulanan</h4>
                <p className="text-xs text-blue-700 font-medium mt-1 leading-relaxed">Laporan kinerja apotek periode Oktober sudah siap.</p>
                <button 
                  onClick={() => window.open("/reports/monthly/oktober", "_blank")}
                  className="mt-4 w-full bg-blue-900 text-white py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-black transition shadow-lg active:scale-95 text-center"
                >
                  <Download size={14} />
                  Download PDF
                </button>
              </div>
              <TrendingUp className="absolute -bottom-2 -right-2 text-blue-100 -rotate-12 group-hover:scale-125 transition-transform" size={80} />
            </div>
          </div>
        </div>
      </div>

      {/* Integration Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Integrasi Regulasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: "KFA Browser", 
              desc: "Kamus Farmasi & Alat Kesehatan Indonesia Resmi Kemenkes.", 
              color: "text-blue-600",
              bgColor: "bg-blue-50/50",
              href: "https://satusehat.kemkes.go.id/kfa-browser",
              isExternal: true
            },
            { 
              title: "SIPNAP Report", 
              desc: "Pelaporan Narkotika & Psikotropika otomatis ke sistem nasional.", 
              color: "text-emerald-600",
              bgColor: "bg-emerald-50/50",
              href: "/compliance"
            },
            { 
              title: "SIMONA", 
              desc: "Sistem Monitoring Advokasi Tenaga Kefarmasian terintegrasi.", 
              color: "text-orange-600",
              bgColor: "bg-orange-50/50",
              href: "/compliance"
            }
          ].map((card, i) => (
            <Link 
              key={i} 
              href={card.href}
              {...(card.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-2xl ${card.bgColor} ${card.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <Search size={24} />
              </div>
              <h3 className={`text-lg font-black tracking-tight ${card.color}`}>{card.title}</h3>
              <p className="text-xs text-gray-400 font-bold mt-2 leading-relaxed">{card.desc}</p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-gray-900 transition-colors">
                Buka Modul
                <ArrowUpRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
