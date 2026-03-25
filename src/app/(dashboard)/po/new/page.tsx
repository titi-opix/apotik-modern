"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  Truck, 
  ShoppingCart,
  FileText
} from "lucide-react";

interface PBF {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number; // Sale price (to be used as reference)
  unit: string | null;
}

interface POItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // Purchase price
}

// Sub-component to handle search params
function NewPOContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPbfId = searchParams.get("pbfId");

  const [pbfList, setPbfList] = useState<PBF[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPbf, setSelectedPbf] = useState(initialPbfId || "");
  const [cart, setCart] = useState<POItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pbfRes, prodRes] = await Promise.all([
        fetch("/api/pbf"),
        fetch("/api/products")
      ]);
      const [pbfData, prodData] = await Promise.all([
        pbfRes.json(),
        prodRes.json()
      ]);
      setPbfList(pbfData || []);
      setProducts(prodData || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const addToCart = (product: Product) => {
    if (cart.find(item => item.productId === product.id)) return;
    setCart([...cart, {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price * 0.8 // Default estimate: 80% of sale price
    }]);
  };

  const updateItem = (productId: string, field: 'quantity' | 'price', value: number) => {
    setCart(prev => prev.map(item =>
      item.productId === productId ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleSave = async () => {
    if (!selectedPbf || cart.length === 0) {
      alert("Harap pilih distributor dan tambahkan minimal 1 item.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/po", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pbfId: selectedPbf,
          items: cart
        }),
      });

      if (res.ok) {
        router.push("/po");
      } else {
        const err = await res.json();
        alert(`Gagal: ${err.error}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan PO.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/po" className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Buat Surat Pesanan Baru</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Lengkapi daftar pengadaan obat</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || cart.length === 0}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Simpan Surat Pesanan
        </button>
      </header>

      <main className="p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 outline-none">

        {/* Left: Product Selection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-[600px]">
            <div className="flex items-center gap-2 mb-6">
              <Search className="text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari obat untuk dipesan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm bg-gray-50 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {filteredProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 hover:bg-blue-50 bg-gray-50 rounded-xl transition group">
                  <div className="truncate pr-2">
                    <p className="text-sm font-bold text-gray-700 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400">Harga Jual: Rp {p.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="p-2 bg-white text-blue-600 rounded-lg border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: PO Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* PBF Selector */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest mb-2">
              <Truck size={16} />
              Pilih Distributor (PBF)
            </div>
            <select
              value={selectedPbf}
              onChange={(e) => setSelectedPbf(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">-- Pilih Distributor --</option>
              {pbfList.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* PO Items */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
            <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900 font-black text-xs uppercase tracking-widest">
                <ShoppingCart size={16} className="text-blue-600" />
                Daftar Pesanan
              </div>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                {cart.length} Jenis Produk
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="py-20 text-center text-gray-300 italic text-sm">
                  Keranjang pesanan masih kosong.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-800 mb-2 truncate">{item.productName}</p>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Jumlah</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.productId, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm font-bold text-blue-600"
                          />
                        </div>
                        <div className="flex-[2]">
                          <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Harga Beli Est. (Rp)</label>
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) => updateItem(item.productId, 'price', parseInt(e.target.value) || 0)}
                            className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm font-bold text-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-3 text-red-300 hover:text-red-500 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 border-t border-gray-100 bg-blue-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Total Estimasi</p>
                  <p className="text-xl font-black text-gray-900 leading-none mt-1">Rp {totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Main Page Component
export default function NewPOPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}>
      <NewPOContent />
    </Suspense>
  );
}
