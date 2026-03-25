"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  X, 
  Loader2,
  MoreVertical
} from "lucide-react";

interface PBF {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  pic: string | null;
}

export default function PBFPage() {
  const [pbfList, setPbfList] = useState<PBF[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    pic: "",
  });

  useEffect(() => {
    setMounted(true);
    fetchPBF();
  }, []);

  const fetchPBF = async () => {
    try {
      const res = await fetch("/api/pbf");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPbfList(data);
      }
    } catch (error) {
      console.error("Failed to fetch PBF:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/pbf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", address: "", phone: "", pic: "" });
        fetchPBF();
      }
    } catch (error) {
      alert("Gagal menyimpan PBF");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPBF = pbfList.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.pic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Daftar PBF</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Pedagang Besar Farmasi (Distributor)</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={20} />
          Tambah Distributor
        </button>
      </header>

      <main className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8 relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari distributor atau nama PIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm animate-pulse h-48"></div>
            ))
          ) : filteredPBF.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400 font-bold bg-white rounded-[2.5rem] border border-gray-100">
              Belum ada data distributor. Silakan tambahkan PBF pertama Anda.
            </div>
          ) : (
            filteredPBF.map((pbf) => (
              <div key={pbf.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative">
                <button className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-600 transition">
                  <MoreVertical size={18} />
                </button>
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition duration-300">
                  <Truck size={28} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-4">{pbf.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-xs text-gray-500">
                    <User size={14} className="mt-0.5 text-blue-400" />
                    <span className="font-bold text-gray-700">PIC: {pbf.pic || "-"}</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-gray-500">
                    <Phone size={14} className="mt-0.5 text-blue-400" />
                    <span>{pbf.phone || "-"}</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-gray-500">
                    <MapPin size={14} className="mt-0.5 text-blue-400" />
                    <span className="leading-relaxed truncate-2-lines">{pbf.address || "-"}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 flex gap-3">
                  <Link 
                    href={`/po/new?pbfId=${pbf.id}`}
                    className="flex-1 py-3 bg-gray-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-blue-600 hover:text-white transition"
                  >
                    Buat PO
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal Tambah PBF */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Tambah PBF</h2>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1 text-opacity-70">Data Distributor Baru</p>
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
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Nama PBF (Distributor) *</label>
                <div className="relative">
                  <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: PT. Kimia Farma Trading"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Nama PIC (Sales)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text" 
                      value={formData.pic}
                      onChange={(e) => setFormData({...formData, pic: e.target.value})}
                      placeholder="Nama sales..."
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-gray-700 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Telepon / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="08123xxx"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-gray-700 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Alamat Kantor</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-gray-300" size={18} />
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Alamat lengkap distributor..."
                    rows={3}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-gray-700 text-sm"
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
                  {isSaving ? <Loader2 className="animate-spin inline mr-2" size={18} /> : "Simpan Distributor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
