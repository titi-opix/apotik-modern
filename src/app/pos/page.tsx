"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  ShoppingCart, 
  User, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

interface Product {
  id: string;
  kfaCode: string;
  name: string;
  brandName: string;
  category: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Patient Info
  const [patientNik, setPatientNik] = useState("");
  const [patientName, setPatientName] = useState("");
  const [isNppDetected, setIsNppDetected] = useState(false);
  
  // Checkout Status
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

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

  useEffect(() => {
    const hasNpp = cart.some(item => 
      item.category === 'NARKOTIKA' || item.category === 'PSIKOTROPIKA'
    );
    setIsNppDetected(hasNpp);
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.kfaCode?.includes(searchQuery)
  );

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (isNppDetected && (!patientNik || !patientName)) {
      alert("Obat NPP terdeteksi. Harap isi NIK dan Nama Pasien sesuai resep.");
      return;
    }

    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          patientNik,
          patientName,
          paymentMethod: "CASH", // Default for now
        }),
      });

      if (res.ok) {
        setCheckoutSuccess(true);
        setCart([]);
        setPatientNik("");
        setPatientName("");
        fetchProducts(); // Refresh stock
      } else {
        const error = await res.json();
        alert(`Checkout gagal: ${error.error}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (checkoutSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaksi Berhasil!</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Invoice telah dicetak dan data telah disinkronkan ke SatuSehat & SIPNAP.
        </p>
        <button 
          onClick={() => setCheckoutSuccess(false)}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
        >
          Transaksi Baru
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Kasir (Point of Sale)</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">Kasir Aktif</p>
            <p className="text-sm font-bold text-gray-900">Apoteker Utama</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            A
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Section: Product Selection */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Scan barcode atau cari nama obat/KFA..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-4.5 text-gray-400" size={22} />
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-500 hover:shadow-md transition text-left group disabled:opacity-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        product.category === 'NARKOTIKA' ? 'bg-red-50 text-red-600' :
                        product.category === 'PSIKOTROPIKA' ? 'bg-orange-50 text-orange-600' :
                        'bg-green-50 text-green-600'
                      }`}>
                        {product.category}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">#{product.kfaCode}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{product.brandName}</p>
                    <div className="mt-4 flex justify-between items-end">
                      <p className="text-lg font-black text-gray-900">Rp {product.price.toLocaleString()}</p>
                      <p className={`text-xs font-bold ${product.stock < 10 ? 'text-orange-500' : 'text-gray-400'}`}>
                        Stok: {product.stock}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Cart & Checkout */}
        <div className="w-[450px] bg-white border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShoppingCart size={20} className="text-blue-600" />
              Keranjang Belanja
              <span className="ml-auto bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-xs">
                {cart.length} Item
              </span>
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                <ShoppingCart size={48} className="mb-4" />
                <p>Keranjang masih kosong</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">Rp {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-white rounded transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-white rounded transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Patient Info for NPP/SatuSehat */}
          <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User size={18} className="text-gray-400" />
              <h3 className="text-sm font-bold text-gray-700">Data Pasien (SatuSehat)</h3>
            </div>
            
            {isNppDetected && (
              <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl flex gap-3 mb-2">
                <AlertCircle size={18} className="text-orange-500 shrink-0" />
                <p className="text-[10px] text-orange-700 leading-tight">
                  <strong>Peringatan NPP:</strong> Keranjang berisi obat Narkotika/Psikotropika. NIK dan Nama Pasien wajib diisi untuk pelaporan SIPNAP.
                </p>
              </div>
            )}

            <input 
              type="text" 
              placeholder="NIK Pasien (16 digit)"
              value={patientNik}
              onChange={(e) => setPatientNik(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input 
              type="text" 
              placeholder="Nama Lengkap Pasien"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Checkout Footer */}
          <div className="p-6 border-t border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="text-gray-900 font-bold">Rp {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-black">
              <span className="text-gray-900">Total</span>
              <span className="text-blue-600">Rp {totalAmount.toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Bayar & Selesai
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
