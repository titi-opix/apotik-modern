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
  Loader2,
  ShieldCheck,
  Printer,
  X
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
  const [doctorName, setDoctorName] = useState("");
  const [doctorSip, setDoctorSip] = useState("");
  const [isNppDetected, setIsNppDetected] = useState(false);
  
  // Checkout Status
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

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
          doctorName,
          doctorSip,
          paymentMethod: "CASH", // Default for now
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setLastTransaction({
          ...result,
          items: cart // Original cart items for display
        });
        setCheckoutSuccess(true);
        setCart([]);
        setPatientNik("");
        setPatientName("");
        setDoctorName("");
        setDoctorSip("");
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

  if (checkoutSuccess && lastTransaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-receipt, #printable-receipt * {
              visibility: visible;
            }
            #printable-receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              margin: 0;
              background: white;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* Success Alert (No Print) */}
        <div className="no-print flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">Transaksi Berhasil!</h1>
          <p className="text-sm text-gray-500 text-center">Data telah tersimpan dan stok telah diperbarui sesuai FEFO.</p>
        </div>

        {/* Receipt Component */}
        <div id="printable-receipt" className="bg-white w-full max-w-[350px] shadow-2xl rounded-2xl overflow-hidden border border-gray-100 font-mono text-sm">
          <div className="p-6 border-b border-dashed border-gray-200 text-center">
            <h2 className="text-lg font-black uppercase tracking-widest text-blue-600 mb-1">Apotik Modern</h2>
            <p className="text-[10px] text-gray-500 leading-tight uppercase">Jl. Raya Farmasi No. 123<br/>Telp: (021) 555-0123</p>
          </div>

          <div className="p-4 space-y-2 border-b border-dashed border-gray-200 bg-gray-50/30">
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>{new Date(lastTransaction.createdAt).toLocaleString('id-ID')}</span>
              <span className="font-bold text-gray-900">{lastTransaction.invoiceNumber}</span>
            </div>
            {lastTransaction.patientName && (
              <div className="text-[10px] flex justify-between">
                <span className="text-gray-400">Pasien:</span>
                <span className="font-bold">{lastTransaction.patientName}</span>
              </div>
            )}
            {lastTransaction.doctorName && (
              <div className="text-[10px] flex justify-between">
                <span className="text-gray-400">Dokter:</span>
                <span className="font-bold">{lastTransaction.doctorName}</span>
              </div>
            )}
          </div>

          <div className="p-4 space-y-3">
            {lastTransaction.items.map((item: any, idx: number) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold text-gray-800">
                  <span className="truncate max-w-[200px]">{item.name}</span>
                  <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-gray-400">
                  {item.quantity} x Rp {item.price.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-blue-50/50 border-t border-dashed border-blue-100 space-y-2">
            <div className="flex justify-between text-base font-black text-blue-900">
              <span>TOTAL</span>
              <span>Rp {lastTransaction.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] text-blue-600 font-bold uppercase italic">
              <span>Metode Bayar</span>
              <span>{lastTransaction.paymentMethod || "TUNAI"}</span>
            </div>
          </div>

          <div className="p-6 text-center text-[10px] text-gray-400 border-t border-dashed border-gray-100 uppercase italic">
            <p>*** Terima Kasih ***</p>
            <p className="mt-1">Semoga Cepat Sembuh</p>
          </div>
        </div>

        {/* Action Buttons (No Print) */}
        <div className="no-print mt-8 flex gap-4 w-full max-w-[350px]">
          <button 
            onClick={() => window.print()}
            className="flex-1 bg-gray-900 text-white px-6 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition active:scale-95 shadow-xl"
          >
            <Printer size={18} />
            Cetak Struk
          </button>
          <button 
            onClick={() => {
              setCheckoutSuccess(false);
              setLastTransaction(null);
            }}
            className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition active:scale-95 shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
          >
            Selesai
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-120px)] overflow-hidden gap-8 animate-in fade-in duration-500">
        {/* Left Section: Product Selection */}
        <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
          <div className="space-y-8">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Scan barcode atau cari nama obat/KFA..." 
                className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-blue-50 outline-none transition font-bold text-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={22} />
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 text-left group disabled:opacity-50 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase ${
                        product.category === 'NARKOTIKA' ? 'bg-red-50 text-red-600' :
                        product.category === 'PSIKOTROPIKA' ? 'bg-orange-50 text-orange-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {product.category}
                      </span>
                      <span className="text-[10px] text-gray-300 font-black tracking-tighter">#KFA-{product.kfaCode}</span>
                    </div>
                    <h3 className="font-black text-gray-900 group-hover:text-blue-600 transition tracking-tight text-lg mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{product.brandName}</p>
                    <div className="mt-6 flex justify-between items-center">
                      <p className="text-xl font-black text-gray-900">Rp {product.price.toLocaleString()}</p>
                      <div className="text-right">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${product.stock < 10 ? 'text-orange-500' : 'text-gray-400'}`}>
                          Stok Tersedia
                        </p>
                        <p className={`text-sm font-black ${product.stock < 10 ? 'text-orange-600' : 'text-gray-900'}`}>{product.stock}</p>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white translate-y-20 group-hover:translate-y-0 transition-transform duration-300">
                      <Plus size={24} />
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

          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                  <ShoppingCart size={40} />
                </div>
                <p className="font-black text-xs uppercase tracking-widest text-gray-400">Keranjang masih kosong</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-5 rounded-[2rem] border border-gray-50 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-gray-900 leading-tight mb-1">{item.name}</h4>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Rp {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-xl transition text-gray-500"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-black text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-xl transition text-gray-500"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
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

            <div className="flex items-center gap-2 mt-2 mb-2">
              <ShieldCheck size={18} className="text-gray-400" />
              <h3 className="text-sm font-bold text-gray-700">Data Resep (Dokter)</h3>
            </div>
            <input 
              type="text" 
              placeholder="Nama Dokter"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input 
              type="text" 
              placeholder="Nomor SIP Dokter"
              value={doctorSip}
              onChange={(e) => setDoctorSip(e.target.value)}
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
      </div>
    </>
  );
}
