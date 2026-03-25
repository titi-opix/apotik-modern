"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Plus, Filter, Download, Loader2, Search, X, Trash2 } from "lucide-react";
import KfaSearch from "./KfaSearch";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  kfaCode: string | null;
  name: string;
  category: string;
  stock: number;
  price: number;
  unit: string | null;
  expiryDate: string | null;
}

const COMMON_UNITS = [
  "Tablet", "Kapsul", "Kaplet", "Pcs", "Strip", "Box", "Botol", "Tube", "Ampul", "Vial", "Supp", "Sachet", "Galon"
];

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    kfaCode: "",
    brandName: "",
    genericName: "",
    category: "REGULER",
    price: "",
    stock: "",
    unit: "Box",
    expiryDate: "",
    batchNumber: "",
  });

  const [updateData, setUpdateData] = useState({
    quantity: "",
    expiryDate: "",
    batchNumber: "",
    reason: "PURCHASE",
    pbfName: "",
    invoiceNumber: "",
  });

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("API failure");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]); // Fallback to empty list
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          stock: parseInt(formData.stock) || 0,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          name: "",
          kfaCode: "",
          brandName: "",
          genericName: "",
          category: "REGULER",
          price: "",
          stock: "",
          unit: "Box",
          expiryDate: "",
          batchNumber: "",
        });
        fetchProducts();
      } else {
        const errorData = await res.json();
        alert(`Gagal: ${errorData.error}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan produk.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        setIsUpdateModalOpen(false);
        setUpdateData({
          quantity: "",
          expiryDate: "",
          batchNumber: "",
          reason: "PURCHASE",
          pbfName: "",
          invoiceNumber: "",
        });
        fetchProducts();
      } else {
        const errorData = await res.json();
        alert(`Gagal: ${errorData.error}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${name}"? Semua data stok dan mutasi terkait akan ikut terhapus.`)) return;
    
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchProducts();
      } else {
        const errorData = await res.json();
        alert(`Gagal menghapus: ${errorData.error}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus produk.");
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredInventory = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.kfaCode?.includes(searchTerm)
  );

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
        <p className="text-gray-500">Memuat Halaman Inventaris...</p>
      </div>
    </div>;
  }

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Kelola Inventaris</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Manajemen Stok & Integrasi KFA</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] md:text-xs font-black text-gray-600 hover:bg-gray-50 transition shadow-sm active:scale-95">
              <Download size={16} />
              Export SIMONA
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] md:text-xs font-black hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-95"
            >
              <Plus size={16} />
              Tambah Produk
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: KFA Integration */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Package size={20} />
                  </div>
                  Cari KFA Browser
                </h2>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-black tracking-widest uppercase">
                  LIVE API
                </span>
              </div>
              <p className="text-xs text-gray-400 font-bold mb-8 leading-relaxed">
                Gunakan fitur ini untuk mencari data obat yang sudah terstandar oleh Kemenkes SatuSehat.
              </p>
              <KfaSearch />
            </div>

            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
              <h3 className="font-black text-sm tracking-tight mb-2 relative z-10">💡 Tips Kepatuhan</h3>
              <p className="text-xs text-blue-100 font-medium leading-relaxed relative z-10">
                Pastikan setiap obat golongan Narkotika dan Psikotropika memiliki kode KFA yang valid agar laporan SIPNAP dapat dihasilkan secara otomatis.
              </p>
              <Package className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-125 transition-transform" size={100} />
            </div>
          </div>

          {/* Right Column: Inventory Table */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Stok Apotek Anda</h2>
              <div className="flex w-full md:w-auto gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Cari stok..." 
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="p-2 text-gray-400 border border-gray-200 rounded-lg hover:text-blue-600 transition">
                  <Filter size={18} />
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto scrollbar-hide">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Tidak ada hasil. Cari dan tambah obat dari KFA Browser di sebelah kiri.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                      <th className="px-6 py-4">Nama Produk</th>
                      <th className="px-6 py-4">Golongan</th>
                      <th className="px-6 py-4">Stok</th>
                      <th className="px-6 py-4">Harga</th>
                      <th className="px-6 py-4">Tgl Kedaluwarsa (ED)</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition cursor-pointer">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-400">#KFA-{item.kfaCode}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            item.category === 'NARKOTIKA' ? 'bg-red-50 text-red-600' :
                            item.category === 'PSIKOTROPIKA' ? 'bg-orange-50 text-orange-600' :
                            'bg-green-50 text-green-600'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{item.stock}</span>
                          <span className="text-xs text-gray-400 ml-1">{item.unit || "Box"}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          Rp {item.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${
                            item.expiryDate && new Date(item.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 3))
                              ? 'text-red-600 font-bold'
                              : 'text-gray-600'
                          }`}>
                            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-xs font-bold ${
                            item.stock > 10 ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              item.stock > 10 ? 'bg-green-500' : 'bg-orange-500'
                            }`} />
                            {item.stock > 10 ? 'Aman' : 'Kritis'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(item);
                                setIsUpdateModalOpen(true);
                              }}
                              className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition"
                            >
                              Update Stok
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(item.id, item.name);
                              }}
                              disabled={isDeleting === item.id}
                              className={cn(
                                "p-1.5 rounded-lg transition",
                                isDeleting === item.id ? "text-gray-300 bg-gray-50" : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                              )}
                              title="Hapus Produk"
                            >
                              {isDeleting === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
        </div>
      </div>

      {/* Modal Tambah Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Tambah Produk Baru</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Nama Produk *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: Paracetamol 500mg"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Kode KFA (Opsional)</label>
                  <input 
                    type="text" 
                    value={formData.kfaCode}
                    onChange={(e) => setFormData({...formData, kfaCode: e.target.value})}
                    placeholder="Contoh: 93000001"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Nomor Batch (Opsional)</label>
                <input 
                  type="text" 
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                  placeholder="Contoh: BATCH-001"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Nama Merk</label>
                  <input 
                    type="text" 
                    value={formData.brandName}
                    onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                    placeholder="Contoh: Sanmol"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Golongan *</label>
                  <select 
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  >
                    <option value="REGULER">REGULER</option>
                    <option value="PSIKOTROPIKA">PSIKOTROPIKA</option>
                    <option value="NARKOTIKA">NARKOTIKA</option>
                    <option value="ALKES">ALKES</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Harga Jual (Rp) *</label>
                  <input 
                    type="number" 
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Stok Awal *</label>
                  <input 
                    type="number" 
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    placeholder="0"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Satuan *</label>
                  <select 
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium"
                  >
                    {COMMON_UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Tgl Kedaluwarsa (ED) *</label>
                  <input 
                    type="date" 
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Update Stok */}
      {isUpdateModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Update Stok</h2>
                <p className="text-xs text-blue-600 font-bold">{selectedProduct.name}</p>
              </div>
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateStock} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Jumlah Stok Tambahan *</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={updateData.quantity}
                  onChange={(e) => setUpdateData({...updateData, quantity: e.target.value})}
                  placeholder="Masukkan jumlah..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Nomor Batch Baru</label>
                <input 
                  type="text"
                  value={updateData.batchNumber}
                  onChange={(e) => setUpdateData({...updateData, batchNumber: e.target.value})}
                  placeholder="Contoh: BATCH-AUG-24"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Tanggal Kedaluwarsa *</label>
                <input 
                  type="date" 
                  required
                  value={updateData.expiryDate}
                  onChange={(e) => setUpdateData({...updateData, expiryDate: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Nama PBF (Opsional)</label>
                  <input 
                    type="text" 
                    value={updateData.pbfName}
                    onChange={(e) => setUpdateData({...updateData, pbfName: e.target.value})}
                    placeholder="Contoh: Kimia Farma"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">No. Faktur (Opsional)</label>
                  <input 
                    type="text" 
                    value={updateData.invoiceNumber}
                    onChange={(e) => setUpdateData({...updateData, invoiceNumber: e.target.value})}
                    placeholder="INV-XXX"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Alasan Penambahan</label>
                <select 
                  value={updateData.reason}
                  onChange={(e) => setUpdateData({...updateData, reason: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="PURCHASE">Pembelian dari PBF</option>
                  <option value="RETURN">Retur Pelanggan</option>
                  <option value="ADJUSTMENT">Koreksi Stok (Opname)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Simpan Stok"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
