"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, ShieldCheck, Database, Building2, Key, Info, Trash2, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [settings, setSettings] = useState({
    satusehat_client_id: "",
    satusehat_client_secret: "",
    satusehat_organization_id: "",
    pharmacy_name: "Apotek Modern",
    pharmacy_address: "",
    pharmacy_phone: "",
    pharmacy_city: "",
    pharmacy_nib: "",
    pharmacy_sia: "",
    apoteker_name: "",
    apoteker_sipa: "",
    apoteker_serkom: "",
    apoteker_strap: "",
    pharmacy_sipttk: "",
    pharmacy_npwp: "",
  });

  useEffect(() => {
    setMounted(true);
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        alert("Pengaturan berhasil disimpan.");
      } else {
        const error = await res.json();
        alert(`Gagal menyimpan: ${error.error}`);
      }
    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleResetData = async () => {
    const confirmation = confirm("PERINGATAN KRITIS: Anda akan menghapus SELURUH data transaksi, stok, pasien, dan pengeluaran. Tindakan ini TIDAK DAPAT dibatalkan. Apakah Anda yakin?");
    
    if (!confirmation) return;

    const finalConfirm = prompt("Ketik 'RESET' untuk mengonfirmasi penghapusan seluruh data:");
    if (finalConfirm !== "RESET") return;

    setResetting(true);
    try {
      const res = await fetch("/api/settings/reset", {
        method: "POST",
      });

      if (res.ok) {
        alert("Seluruh data berhasil dibersihkan.");
        window.location.reload();
      } else {
        const error = await res.json();
        alert(`Gagal reset: ${error.error}`);
      }
    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setResetting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-blue-600 transition"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
              <p className="text-sm text-gray-500">Konfigurasi integrasi dan identitas apotek</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Simpan Perubahan
          </button>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Card: SatuSehat */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <ShieldCheck size={20} />
              </div>
              <h2 className="font-bold text-gray-900">Kredensial SatuSehat Kemenkes</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Key size={14} className="text-gray-400" />
                    Client ID
                  </label>
                  <input 
                    type="text" 
                    name="satusehat_client_id"
                    value={settings.satusehat_client_id}
                    onChange={handleChange}
                    placeholder="Masukkan Client ID" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Key size={14} className="text-gray-400" />
                    Client Secret
                  </label>
                  <input 
                    type="password" 
                    name="satusehat_client_secret"
                    value={settings.satusehat_client_secret}
                    onChange={handleChange}
                    placeholder="••••••••••••••••" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Building2 size={14} className="text-gray-400" />
                  Organization ID
                </label>
                <input 
                  type="text" 
                  name="satusehat_organization_id"
                  value={settings.satusehat_organization_id}
                  onChange={handleChange}
                  placeholder="ID Organisasi (contoh: 1000252)" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl text-blue-700 text-sm">
                <Info className="flex-shrink-0 mt-0.5" size={18} />
                <p>
                  Kredensial ini digunakan untuk autentikasi ke platform SatuSehat. Pastikan Anda menggunakan Client ID dan Secret untuk lingkungan (Environment) yang sesuai (Sandbox atau Production).
                </p>
              </div>
            </div>
          </section>

          {/* Card: Profile */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Database size={20} />
              </div>
              <h2 className="font-bold text-gray-900">Profil Apotek</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nama Apotek</label>
                <input 
                  type="text" 
                  name="pharmacy_name"
                  value={settings.pharmacy_name}
                  onChange={handleChange}
                  placeholder="Nama Apotek Anda" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Nomor Telepon</label>
                  <input 
                    type="text" 
                    name="pharmacy_phone"
                    value={settings.pharmacy_phone}
                    onChange={handleChange}
                    placeholder="0812..." 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Kota/Kabupaten</label>
                  <input 
                    type="text" 
                    name="pharmacy_city"
                    value={settings.pharmacy_city}
                    onChange={handleChange}
                    placeholder="Contoh: Jakarta Selatan" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    <ShieldCheck size={14} /> NIB (Nomor Induk Berusaha)
                  </label>
                  <input 
                    type="text" 
                    name="pharmacy_nib"
                    value={settings.pharmacy_nib}
                    onChange={handleChange}
                    placeholder="Masukkan NIB" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-blue-50/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    <ShieldCheck size={14} /> SIA (Surat Izin Apotek)
                  </label>
                  <input 
                    type="text" 
                    name="pharmacy_sia"
                    value={settings.pharmacy_sia}
                    onChange={handleChange}
                    placeholder="Masukkan No. SIA" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-blue-50/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    <ShieldCheck size={14} /> SIPA (No. Izin Praktik Apoteker)
                  </label>
                  <input 
                    type="text" 
                    name="apoteker_sipa"
                    value={settings.apoteker_sipa}
                    onChange={handleChange}
                    placeholder="Masukkan No. SIPA" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-blue-50/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    <ShieldCheck size={14} /> No. Sertifikat Kompetensi (SERKOM)
                  </label>
                  <input 
                    type="text" 
                    name="apoteker_serkom"
                    value={settings.apoteker_serkom}
                    onChange={handleChange}
                    placeholder="Masukkan No. SERKOM" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-blue-50/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    <ShieldCheck size={14} /> STRAP (Surat Tanda Registrasi)
                  </label>
                  <input 
                    type="text" 
                    name="apoteker_strap"
                    value={settings.apoteker_strap}
                    onChange={handleChange}
                    placeholder="Masukkan No. STRAP" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-blue-50/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    <ShieldCheck size={14} /> SIPTTK (Tenaga Teknis Keff.)
                  </label>
                  <input 
                    type="text" 
                    name="pharmacy_sipttk"
                    value={settings.pharmacy_sipttk}
                    onChange={handleChange}
                    placeholder="Masukkan No. SIPTTK" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-blue-50/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-50 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">NPWP (Perusahaan/Pribadi)</label>
                  <input 
                    type="text" 
                    name="pharmacy_npwp"
                    value={settings.pharmacy_npwp}
                    onChange={handleChange}
                    placeholder="Masukkan Nomor NPWP" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Nama Apoteker Penanggung Jawab</label>
                  <input 
                    type="text" 
                    name="apoteker_name"
                    value={settings.apoteker_name}
                    onChange={handleChange}
                    placeholder="Nama Lengkap Apoteker" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Alamat Lengkap</label>
                <textarea 
                  name="pharmacy_address"
                  value={settings.pharmacy_address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Alamat lengkap apotek..." 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>

              {/* Danger Zone moved inside form for better visibility */}
              <div className="mt-12 p-8 bg-red-50 rounded-2xl border border-red-100 space-y-4">
                <div className="flex items-center gap-3 text-red-900">
                  <AlertTriangle size={24} />
                  <h2 className="text-xl font-bold">ZONA BERBAHAYA (Reset Data)</h2>
                </div>
                <p className="text-sm text-red-700 leading-relaxed">
                  Tombol di bawah ini akan menghapus <strong>SELURUH</strong> data produk, stok, transaksi, pasien, dan pengeluaran. 
                  Ini berguna jika Anda ingin membersihkan data uji coba. Tindakan ini tidak dapat dibatalkan.
                </p>
                <button 
                  type="button"
                  onClick={handleResetData}
                  disabled={resetting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-red-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-black transition shadow-lg shadow-red-200 disabled:opacity-50"
                >
                  {resetting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                  Hapus & Reset Seluruh Data Program
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
