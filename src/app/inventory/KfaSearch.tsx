"use client";

import { useState } from "react";
import { Search, Loader2, Plus } from "lucide-react";

interface KfaProduct {
  kfaCode: string;
  name: string;
  brandName: string;
  genericName: string;
  form: string;
  strength: string;
  category: string;
}

export default function KfaSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KfaProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    // Secara otomatis membuka KFA Browser Kemenkes di tab baru
    const kfaUrl = `https://satusehat.kemkes.go.id/kfa-browser/`;
    window.open(kfaUrl, "_blank");

    setLoading(true);
    try {
      const res = await fetch(`/api/kfa/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToInventory = async (product: KfaProduct) => {
    setAdding(product.kfaCode);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...product,
          stock: 0,
          price: 0,
        }),
      });
      if (res.ok) {
        alert(`${product.name} berhasil ditambahkan ke inventaris!`);
        window.location.reload(); // Refresh to see new data
      } else {
        const err = await res.json();
        alert(`Gagal menambahkan: ${err.error}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan.");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari di Kamus KFA (Nama atau Kode)..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <button
          type="submit"
          className="absolute right-2 top-1.5 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition"
        >
          Cari
        </button>
      </form>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin text-blue-600" />
        </div>
      )}

      <div className="grid gap-3">
        {results.map((product) => (
          <div
            key={product.kfaCode}
            className="p-4 border rounded-xl bg-white hover:border-blue-300 transition group"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  KFA: {product.kfaCode}
                </span>
                <h4 className="font-bold text-gray-900 mt-1">{product.name}</h4>
                <p className="text-sm text-gray-500">
                  {product.genericName} • {product.form} • {product.strength}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    product.category === 'NARKOTIKA' ? 'bg-red-100 text-red-700' :
                    product.category === 'PSIKOTROPIKA' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {product.category}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => addToInventory(product)}
                disabled={adding === product.kfaCode}
                className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition disabled:opacity-50"
              >
                {adding === product.kfaCode ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Plus size={20} />
                )}
              </button>
            </div>
          </div>
        ))}
        {!loading && query && results.length === 0 && (
          <p className="text-center text-gray-500 py-4">Tidak ada hasil ditemukan.</p>
        )}
      </div>
    </div>
  );
}
