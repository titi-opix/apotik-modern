"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Database,
  DollarSign,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  ShieldCheck,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Inisialisasi Data", href: "/" },
  { icon: Package, label: "Kelola Stok", href: "/inventory" },
  { icon: ShoppingCart, label: "Kasir (POS)", href: "/pos" },
  { icon: DollarSign, label: "Pengeluaran", href: "/expenses" },
  { icon: FileSpreadsheet, label: "Laporan", href: "/reports" },
  { icon: Truck, label: "Distributor (PBF)", href: "/pbf" },
  { icon: FileText, label: "Surat Pesanan (PO)", href: "/po" },
  { icon: Users, label: "Karyawan", href: "/employees" },
  { icon: ShieldCheck, label: "Kepatuhan (Compliance)", href: "/compliance" },
  { icon: Settings, label: "Pengaturan", href: "/settings" },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="w-72 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Package size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Apotek Modern</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">The Clinical Editorial</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
                )}
                <item.icon
                  size={20}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                <span className="text-sm tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pharmacy Intelligence</p>
          <Link href="/reports" className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition active:scale-95 flex items-center justify-center">
            Lihat Analitik
          </Link>
        </div>
      </div>
    </div>
  );
}
