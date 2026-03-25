"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle,
  Truck,
  ChevronRight,
  Loader2
} from "lucide-react";

interface PO {
  id: string;
  poNumber: string;
  pbfId: string;
  pbf: { name: string, phone: string | null, address: string | null };
  status: string;
  totalAmount: number;
  orderDate: string;
  items: Array<{
    id: string;
    product: { name: string };
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

export default function POPage() {
  const [poList, setPoList] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    fetchPO();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const fetchPO = async () => {
    try {
      const res = await fetch("/api/po");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPoList(data);
      }
    } catch (error) {
      console.error("Failed to fetch PO:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/po/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setSelectedPO(null);
        fetchPO();
      }
    } catch (error) {
      alert("Gagal memperbarui status");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredPO = poList.filter(p => 
    p.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.pbf.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-gray-100 text-gray-600";
      case "ORDERED": return "bg-blue-100 text-blue-600";
      case "RECEIVED": return "bg-green-600 text-white";
      case "CANCELLED": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #po-print-area, #po-print-area * { visibility: visible; }
          #po-print-area { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
        }
      `}</style>
      
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Surat Pesanan (PO)</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Manajemen Pengadaan Barang</p>
          </div>
        </div>
        <Link 
          href="/po/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={20} />
          Buat PO Baru
        </Link>
      </header>

      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari No. PO atau Distributor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium shadow-sm"
            />
          </div>
        </div>

        {/* PO List Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="px-8 py-5 text-center w-16">Icon</th>
                <th className="px-8 py-5">Nomor PO</th>
                <th className="px-8 py-5">Distributor (PBF)</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5">Total Est.</th>
                <th className="px-8 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6 h-16 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : filteredPO.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-32 text-center text-gray-400 font-bold">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <FileText size={48} />
                      <p>Belum ada riwayat pesanan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPO.map((po) => (
                  <tr 
                    key={po.id} 
                    onClick={() => setSelectedPO(po)}
                    className="hover:bg-gray-50 transition group cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusStyle(po.status)} bg-opacity-20`}>
                        <FileText size={18} />
                      </div>
                    </td>
                    <td className="px-8 py-5 font-black text-gray-900 tracking-tight">{po.poNumber}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-gray-300" />
                        <span className="font-bold text-gray-700">{po.pbf.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusStyle(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold text-gray-900">Rp {po.totalAmount.toLocaleString()}</td>
                    <td className="px-8 py-5 text-center">
                      <button className="p-2 text-gray-300 group-hover:text-blue-600 transition">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Detail PO */}
      {selectedPO && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">{selectedPO.poNumber}</h2>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1 text-opacity-70">
                  Detail Surat Pesanan • {new Date(selectedPO.orderDate).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedPO(null)}
                className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-600 transition shadow-sm"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distributor</label>
                  <p className="font-black text-gray-900 text-lg">{selectedPO.pbf.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedPO.pbf.address || "Alamat tidak tersedia"}</p>
                </div>
                <div className="text-right">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Pesanan</label>
                  <div className="mt-1 flex justify-end gap-2">
                    <button 
                      onClick={handlePrint}
                      className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition flex items-center gap-2"
                    >
                      <Plus size={12} className="rotate-45" /> {/* Use as Print icon placeholder or similar */}
                      Cetak PO
                    </button>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${getStatusStyle(selectedPO.status)}`}>
                      {selectedPO.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-100 rounded-3xl overflow-hidden">
                {/* ... existing table ... */}
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Nama Produk</th>
                      <th className="px-6 py-4 text-center">Qty</th>
                      <th className="px-6 py-4 text-right">Harga Satuan</th>
                      <th className="px-6 py-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedPO.items.map((item) => (
                      <tr key={item.id} className="text-sm">
                        <td className="px-6 py-4 font-bold text-gray-700">{item.product.name}</td>
                        <td className="px-6 py-4 text-center font-bold text-blue-600">{item.quantity}</td>
                        <td className="px-6 py-4 text-right font-medium">Rp {item.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-black text-gray-900">Rp {item.subtotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50/50">
                    <tr className="font-black text-gray-900">
                      <td colSpan={3} className="px-6 py-4 text-right text-xs uppercase">Total Estimasi</td>
                      <td className="px-6 py-4 text-right text-lg">Rp {selectedPO.totalAmount.toLocaleString()}</td>
                    </tr>
                    {selectedPO.status === "PENDING" && (
                    <tr>
                      <td colSpan={4} className="p-6">
                        <div className="flex gap-4">
                          <button 
                            onClick={() => handleUpdateStatus(selectedPO.id, "ORDERED")}
                            disabled={isUpdating}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                          >
                            Tandai Dipesan
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(selectedPO.id, "CANCELLED")}
                            disabled={isUpdating}
                            className="flex-1 py-3 bg-gray-100 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition"
                          >
                            Batalkan
                          </button>
                        </div>
                      </td>
                    </tr>
                    )}
                    {selectedPO.status === "ORDERED" && (
                    <tr>
                      <td colSpan={4} className="p-6">
                        <button 
                          onClick={() => handleUpdateStatus(selectedPO.id, "RECEIVED")}
                          disabled={isUpdating}
                          className="w-full py-4 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Barang Sudah Diterima
                        </button>
                      </td>
                    </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print-only PO Document */}
      {selectedPO && (
        <div id="po-print-area" className="hidden print:block p-10 text-black bg-white">
          <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">{settings.pharmacy_name || "APOTEK MODERN"}</h1>
              <p className="text-sm font-bold">{settings.pharmacy_address || "Alamat Apotek Belum Diatur"}</p>
              <p className="text-sm font-bold">Telp: {settings.pharmacy_phone || "-"}</p>
              <div className="flex gap-4">
                <p className="text-xs font-bold uppercase tracking-tight">SIA: {settings.pharmacy_sia || "-"}</p>
                <p className="text-xs font-bold uppercase tracking-tight">NIB: {settings.pharmacy_nib || "-"}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-black uppercase">Surat Pesanan (PO)</h2>
              <p className="font-bold">No: {selectedPO.poNumber}</p>
              <p className="font-bold">Tgl: {new Date(selectedPO.orderDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mb-8 p-4 bg-gray-50 border border-black rounded-lg">
            <p className="font-bold text-xs uppercase text-gray-400 mb-1">Kepada Yth,</p>
            <p className="font-black text-lg leading-tight">{selectedPO.pbf.name}</p>
            <p className="text-sm font-medium">{selectedPO.pbf.address || "Alamat Distributor"}</p>
          </div>

          <table className="w-full border-collapse border border-black mb-8">
            <thead>
              <tr className="bg-gray-100 font-black text-[10px] text-center uppercase">
                <th className="border border-black px-3 py-2 w-12">No</th>
                <th className="border border-black px-3 py-2">Nama Barang / Deskripsi</th>
                <th className="border border-black px-3 py-2 w-24">Qty</th>
                <th className="border border-black px-3 py-2 w-24">Satuan</th>
                <th className="border border-black px-3 py-2">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {selectedPO.items.map((item, idx) => (
                <tr key={item.id} className="text-sm text-center">
                  <td className="border border-black px-3 py-2 font-medium">{idx + 1}</td>
                  <td className="border border-black px-3 py-2 text-left font-black">{item.product.name}</td>
                  <td className="border border-black px-3 py-2 font-black">{item.quantity}</td>
                  <td className="border border-black px-3 py-2 font-medium">UNIT</td>
                  <td className="border border-black px-3 py-2"></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-24">
            <div className="text-center w-72">
              <p className="font-bold mb-24 opacity-80">{settings.pharmacy_city || "Kota"}, {new Date().toLocaleDateString()}</p>
              <p className="text-xs font-bold uppercase tracking-widest mt-1">SIPA: {settings.apoteker_sipa || "-"}</p>
              <p className="text-xs font-bold uppercase tracking-widest">STRA: {settings.apoteker_strap || "-"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
