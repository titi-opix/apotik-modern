"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, Search, Menu } from "lucide-react";

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  const navItems = [
    { label: "KFA Browser", href: "https://satusehat.kemkes.go.id/kfa-browser", external: true },
    { label: "SIPNAP", href: "https://sipnap.kemkes.go.id", external: true },
    { label: "SIMONA", href: "https://simona.kemkes.go.id/simona_Login/", external: true },
  ];

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4 md:gap-8 flex-1">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition"
          >
            <Menu size={24} />
          </button>
        )}
        <div className="relative w-full max-w-md group hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" size={18} />
          <input 
            type="text" 
            placeholder="Cari Obat (KFA), Transaksi, atau Laporan..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-medium text-sm"
          />
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-bold tracking-tight pb-2 border-b-2 transition-all ${
                  isActive 
                    ? "text-blue-600 border-blue-600" 
                    : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-2xl transition relative">
          <Bell size={20} />
          <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-2xl transition">
          <HelpCircle size={20} />
        </button>
        <div className="h-8 w-[1px] bg-gray-100 mx-2" />
        <Link href="/settings" className="flex items-center gap-3 pl-2 group hover:bg-gray-50 p-2 rounded-2xl transition-colors">
          <div className="text-right hidden md:block">
            <p className="text-sm font-black text-gray-900 leading-none group-hover:text-blue-600 transition-colors">Admin Apotek</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white shadow-sm flex items-center justify-center text-white font-black text-sm group-hover:scale-105 transition-transform">
            A
          </div>
        </Link>
      </div>
    </header>
  );
}
