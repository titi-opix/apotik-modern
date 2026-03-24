"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { ArrowLeft, FileCheck, ShieldCheck, Database, Send, CheckCircle2, Loader2, Download } from "lucide-react";

export default function CompliancePage() {
  const [mounted, setMounted] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const today = new Date().toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    timeZone: 'Asia/Jayapura'
  });

  const [lastReports, setLastReports] = useState<Record<string, string>>({
    sipnap: today,
    simona: today,
    satusehat: "Real-time",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const convertToCSV = (objArray: any[], id: string) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    
    // Mapping headers to Indonesian
    const headerMap: Record<string, Record<string, string>> = {
      sipnap: {
        id: "ID",
        date: "Tanggal",
        productName: "Nama Obat",
        kfaCode: "Kode KFA",
        category: "Kategori",
        type: "Jenis",
        quantity: "Jumlah",
        unit: "Satuan",
        pbfName: "Nama PBF",
        invoiceNumber: "No. Faktur",
        patientName: "Nama Pasien",
        patientAddress: "Alamat Pasien",
        doctorName: "Nama Dokter",
        doctorSip: "SIP Dokter"
      },
      simona: {
        id: "ID",
        name: "Nama Obat",
        kfaCode: "Kode KFA",
        stock: "Stok",
        unit: "Satuan",
        price: "Harga",
        expiryDate: "Tgl Kadaluarsa"
      }
    };

    const currentMap = headerMap[id] || {};
    const keys = Object.keys(array[0]);
    
    // Create Header Row
    const headerRow = keys.map(k => currentMap[k] || k).join(';');
    str += headerRow + '\r\n';

    // Create Data Rows
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let j = 0; j < keys.length; j++) {
        if (line !== '') line += ';';
        const value = array[i][keys[j]];
        // Escape semicolons and handle nulls
        const formattedValue = value === null || value === undefined ? '' : `"${String(value).replace(/"/g, '""')}"`;
        line += formattedValue;
      }
      str += line + '\r\n';
    }
    return str;
  };

  const handleDownloadReport = async (id: string, name: string) => {
    try {
      setLoadingId(`${id}-download`);
      const res = await fetch(`/api/compliance/${id}`);
      if (!res.ok) throw new Error("Gagal mengambil data untuk laporan");
      
      const data = await res.json();
      
      if (id === "sipnap") {
        if (!data.details || data.details.length === 0) {
          alert("Tidak ada data SIPNAP untuk diunduh.");
          return;
        }

        const wb = XLSX.utils.book_new();
        
        // Sheet 1: Ringkasan Stok (Image 2)
        const summaryHeaders = {
          id: "ID",
          productName: "Nama Obat",
          category: "Kategori",
          kfaCode: "Kode KFA",
          currentStock: "Stok Saat",
          totalSales: "Total Penjualan",
          unit: "Satuan"
        };
        
        const summaryDataArray = data.summary.map((s: any) => ({
          [summaryHeaders.id]: s.id,
          [summaryHeaders.productName]: s.productName,
          [summaryHeaders.category]: s.category,
          [summaryHeaders.kfaCode]: s.kfaCode,
          [summaryHeaders.currentStock]: s.currentStock,
          [summaryHeaders.totalSales]: s.totalSales,
          [summaryHeaders.unit]: s.unit
        }));
        
        const wsSummary = XLSX.utils.json_to_sheet(summaryDataArray);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Stok");

        // Sheet 2: Detail Mutasi (Image 1)
        const detailsHeaders = {
          date: "Tanggal",
          productName: "Nama Obat",
          kfaCode: "Kode KFA",
          category: "Kategori",
          type: "Jenis",
          quantity: "Jumlah",
          unit: "Satuan",
          pbfName: "Nama PBF",
          invoiceNumber: "No. Faktur",
          patientName: "Nama Pasien",
          patientAddress: "Alamat Pasien",
          doctorName: "Nama Dokter",
          doctorSip: "SIP Dokter"
        };

        const detailsDataArray = data.details.map((d: any) => ({
          [detailsHeaders.date]: d.date,
          [detailsHeaders.productName]: d.productName,
          [detailsHeaders.kfaCode]: d.kfaCode,
          [detailsHeaders.category]: d.category,
          [detailsHeaders.type]: d.type,
          [detailsHeaders.quantity]: d.quantity,
          [detailsHeaders.unit]: d.unit,
          [detailsHeaders.pbfName]: d.pbfName,
          [detailsHeaders.invoiceNumber]: d.invoiceNumber,
          [detailsHeaders.patientName]: d.patientName,
          [detailsHeaders.patientAddress]: d.patientAddress,
          [detailsHeaders.doctorName]: d.doctorName,
          [detailsHeaders.doctorSip]: d.doctorSip
        }));

        const wsDetails = XLSX.utils.json_to_sheet(detailsDataArray);
        XLSX.utils.book_append_sheet(wb, wsDetails, "Detail Mutasi");

        XLSX.writeFile(wb, `SIPNAP_Merged_${new Date().toISOString().split('T')[0]}.xlsx`);
        return;
      }

      // Fallback to CSV for other reports
      if (data.length === 0) {
        alert("Tidak ada data untuk diunduh.");
        return;
      }

      const csv = convertToCSV(data, id);
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `draft_${id}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleSendReport = async (id: string) => {
    if (id === "satusehat") {
      alert("Integrasi SatuSehat berjalan secara otomatis (real-time).");
      return;
    }

    setLoadingId(id);
    try {
      // Fetch data first to send
      const dataRes = await fetch(`/api/compliance/${id}`);
      const items = await dataRes.json();

      if (items.length === 0) {
        alert(`Tidak ada data ${id.toUpperCase()} baru untuk dilaporkan.`);
        return;
      }

      // Send to API
      const res = await fetch(`/api/compliance/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: id === "sipnap" ? items.details : items 
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message);
        setLastReports(prev => ({
          ...prev,
          [id]: new Date().toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            timeZone: 'Asia/Jayapura'
          })
        }));

        // Open official portal for manual upload/finalization
        if (id === "sipnap") window.open("https://sipnap.kemkes.go.id", "_blank");
        if (id === "simona") window.open("https://simona.kemkes.go.id/simona_Login/", "_blank");
      } else {
        alert(`Gagal: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const integrations = [
    {
      id: "sipnap",
      name: "SIPNAP (Narkotika & Psikotropika)",
      status: "Ready",
      lastReport: lastReports.sipnap,
      icon: ShieldCheck,
      colorClass: "bg-blue-600",
      lightColorClass: "bg-blue-50 text-blue-600",
      description: "Laporan bulanan mutasi obat golongan NPP ke portal SIPNAP Kemenkes.",
    },
    {
      id: "simona",
      name: "SIMONA (Manajemen Obat & Alkes)",
      status: "Synced",
      lastReport: lastReports.simona,
      icon: Database,
      colorClass: "bg-green-600",
      lightColorClass: "bg-green-50 text-green-600",
      description: "Sinkronisasi ketersediaan stok obat dan alkes real-time.",
    },
    {
      id: "satusehat",
      name: "SatuSehat (RME / HL7 FHIR)",
      status: "Integrated",
      lastReport: lastReports.satusehat,
      icon: FileCheck,
      colorClass: "bg-purple-600",
      lightColorClass: "bg-purple-50 text-purple-600",
      description: "Integrasi Rekam Medis Elektronik dengan platform SatuSehat.",
    },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-10">
          <Link 
            href="/" 
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-blue-600 transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pusat Kepatuhan (Compliance)</h1>
            <p className="text-sm text-gray-500">Integrasi Sistem Informasi Kemenkes RI</p>
          </div>
        </header>

        <div className="space-y-6">
          {integrations.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-6 hover:shadow-md transition">
              <div className={`p-4 rounded-xl ${item.lightColorClass}`}>
                <item.icon size={32} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{item.name}</h2>
                    <p className="text-sm text-gray-500 mt-1 max-w-md">{item.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <CheckCircle2 size={14} />
                      {item.status}
                    </span>
                    <span className="text-[10px] text-gray-400">Terakhir: {item.lastReport}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => handleSendReport(item.id)}
                    disabled={loadingId !== null}
                    className={`flex items-center gap-2 px-4 py-2 ${item.colorClass} text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50`}
                  >
                    {loadingId === item.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Send size={16} />
                    )}
                    Kirim Laporan Sekarang
                  </button>
                  {item.id !== "satusehat" && (
                    <button 
                      onClick={() => handleDownloadReport(item.id, item.name)}
                      disabled={loadingId !== null}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition border border-gray-100 disabled:opacity-50"
                    >
                      {loadingId === `${item.id}-download` ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Download size={16} />
                      )}
                      Unduh Draft (Excel)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-12 p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl text-white">
          <div className="flex justify-between items-center">
            <div className="max-w-md">
              <h2 className="text-xl font-bold mb-2">Automated Compliance</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Sistem kami secara otomatis mendeteksi transaksi obat NPP dan menyiapkannya untuk pelaporan bulanan Anda. Tidak perlu lagi input manual di portal Kemenkes.
              </p>
            </div>
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
              <ShieldCheck size={48} className="text-blue-400" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
