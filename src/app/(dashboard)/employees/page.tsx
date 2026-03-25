"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Users, 
  User, 
  Phone, 
  MapPin, 
  X, 
  Loader2,
  MoreVertical,
  Briefcase,
  DollarSign,
  IdCard,
  Trash2,
  Edit,
  ShieldCheck,
  Lock
} from "lucide-react";

interface Employee {
  id: string;
  nik: string;
  name: string;
  role: string;
  username: string;
  phone: string | null;
  address: string | null;
  salary: number | null;
  serkom: string | null;
  stra: string | null;
  sipa: string | null;
  strttk: string | null;
  sipttk: string | null;
  isActive: boolean;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    nik: "",
    username: "",
    password: "",
    name: "",
    role: "STAFF",
    phone: "",
    address: "",
    salary: "",
    serkom: "",
    stra: "",
    sipa: "",
    strttk: "",
    sipttk: "",
  });

  useEffect(() => {
    setMounted(true);
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmployees(data);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      nik: "",
      username: "",
      password: "",
      name: "",
      role: "STAFF",
      phone: "",
      address: "",
      salary: "",
      serkom: "",
      stra: "",
      sipa: "",
      strttk: "",
      sipttk: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      nik: employee.nik,
      username: employee.username || "",
      password: "", // Jangan tampilkan password lama
      name: employee.name,
      role: employee.role,
      phone: employee.phone || "",
      address: employee.address || "",
      salary: employee.salary?.toString() || "",
      serkom: employee.serkom || "",
      stra: employee.stra || "",
      sipa: employee.sipa || "",
      strttk: employee.strttk || "",
      sipttk: employee.sipttk || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : "/api/employees";
      const method = editingEmployee ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchEmployees();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Gagal menyimpan data karyawan");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus karyawan ini?")) return;
    
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchEmployees();
      } else {
        alert("Gagal menghapus karyawan");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus");
    }
  };

  const handleApplyToSettings = async (emp: Employee) => {
    if (!confirm(`Terapkan ${emp.name} sebagai Apoteker Penanggung Jawab di pengaturan apotik?`)) return;
    
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            apoteker_name: emp.name,
            apoteker_sipa: emp.sipa || "",
            apoteker_serkom: emp.serkom || "",
            apoteker_strap: emp.stra || "", // Map STRA to THE STRAP key used in settings/PO
            pharmacy_sipttk: emp.sipttk || "",
            // Also store assistant technician if role is Asisten Apoteker
            ...(emp.role === "ASISTEN APOTEKER" ? { assistant_name: emp.name } : {})
          }
        }),
      });

      if (res.ok) {
        alert("Data apoteker berhasil diperbarui di pengaturan apotik!");
      } else {
        alert("Gagal memperbarui pengaturan");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat sinkronisasi");
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Data Karyawan</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Manajemen SDM Apotik</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-purple-600 text-white px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-purple-700 transition flex items-center gap-2 shadow-xl shadow-purple-100 active:scale-95"
        >
          <Plus size={18} />
          Tambah Karyawan
        </button>
      </div>

      <div className="relative w-full max-w-md group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Cari nama, NIK, atau jabatan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-purple-50 outline-none transition font-bold text-gray-700 shadow-sm"
        />
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm animate-pulse h-48"></div>
            ))
          ) : filteredEmployees.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400 font-bold bg-white rounded-[2.5rem] border border-gray-100">
              Belum ada data karyawan.
            </div>
          ) : (
            filteredEmployees.map((emp) => (
              <div key={emp.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative">
                <div className="absolute top-6 right-6 flex gap-1">
                   <button 
                    onClick={() => openEditModal(emp)}
                    className="p-2 text-gray-300 hover:text-blue-600 transition"
                   >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(emp.id)}
                    className="p-2 text-gray-300 hover:text-red-600 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition duration-300">
                  <User size={28} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-1">{emp.name}</h3>
                <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-4">{emp.role}</p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-xs text-gray-500">
                    <IdCard size={14} className="mt-0.5 text-purple-400" />
                    <span className="font-bold text-gray-700">NIK: {emp.nik}</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-gray-500">
                    <Phone size={14} className="mt-0.5 text-purple-400" />
                    <span>{emp.phone || "-"}</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-gray-500">
                    <MapPin size={14} className="mt-0.5 text-purple-400" />
                    <span className="leading-relaxed truncate-2-lines">{emp.address || "-"}</span>
                  </div>
                  {emp.salary && (
                    <div className="flex items-start gap-3 text-xs text-gray-500 font-bold">
                      <DollarSign size={14} className="mt-0.5 text-green-500" />
                      <span className="text-green-600">Rp {emp.salary.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>

                {(emp.role === "APOTEKER" || emp.role === "ASISTEN APOTEKER") && (emp.serkom || emp.sipa || emp.stra || emp.sipttk || emp.strttk) && (
                  <div className="mt-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={16} className="text-purple-600" />
                      <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Kepatuhan (Compliance)</p>
                    </div>
                    {emp.serkom && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold">
                        <ShieldCheck size={12} className="text-purple-400" />
                        <span>Serkom: {emp.serkom}</span>
                      </div>
                    )}
                    {emp.stra && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold">
                        <ShieldCheck size={12} className="text-purple-400" />
                        <span>STRA: {emp.stra}</span>
                      </div>
                    )}
                    {emp.sipa && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold">
                        <ShieldCheck size={12} className="text-purple-400" />
                        <span>SIPA: {emp.sipa}</span>
                      </div>
                    )}
                    {emp.strttk && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold">
                        <ShieldCheck size={12} className="text-purple-400" />
                        <span>STRTTK: {emp.strttk}</span>
                      </div>
                    )}
                    {emp.sipttk && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold">
                        <ShieldCheck size={12} className="text-purple-400" />
                        <span>SIPTTK: {emp.sipttk}</span>
                      </div>
                    )}
                    {emp.role === "APOTEKER" && (
                      <button 
                        onClick={() => handleApplyToSettings(emp)}
                        className="mt-2 w-full py-2 bg-purple-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-700 transition shadow-sm active:scale-95"
                      >
                        Terapkan ke Data Apotik
                      </button>
                    )}
                  </div>
                )}

                {!emp.isActive && (
                  <div className="mt-4 px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-tighter rounded-full w-fit">
                    Non-Aktif
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Tambah/Edit Karyawan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-purple-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editingEmployee ? "Edit Karyawan" : "Tambah Karyawan"}</h2>
                <p className="text-xs text-purple-600 font-bold uppercase tracking-widest mt-1 text-opacity-70">Data SDM Apotik</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-600 transition shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NIK *</label>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                      type="text" 
                      required
                      value={formData.nik}
                      onChange={(e) => setFormData({...formData, nik: e.target.value})}
                      placeholder="NIK sesuai KTP"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-gray-700 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jabatan</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-gray-700 text-sm appearance-none"
                    >
                      <option value="ADMIN">ADMIN (Full Access)</option>
                      <option value="APOTEKER">APOTEKER (Penanggung Jawab)</option>
                      <option value="ASISTEN APOTEKER">ASISTEN APOTEKER (Tenaga Teknis)</option>
                      <option value="STAFF">STAFF (Kasir)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                      type="text" 
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="username_login"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-gray-700 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{editingEmployee ? "Password (Kosongkan jika tidak diubah)" : "Password *"}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                      type="password" 
                      required={!editingEmployee}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-gray-700 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nama Nama Karyawan"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-gray-700 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telepon</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="08123xxx"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-gray-700 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gaji Pokok (Rp)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                      type="number" 
                      value={formData.salary}
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
                      placeholder="3000000"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-gray-700 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alamat Rumah</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 text-gray-300" size={16} />
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Alamat lengkap..."
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-700 text-sm"
                  />
                </div>
              </div>

              {/* Dynamic certification fields based on role */}
              {(formData.role === "APOTEKER" || formData.role === "ASISTEN APOTEKER") && (
                <div className="p-5 bg-purple-50/50 rounded-[2rem] border border-purple-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={18} className="text-purple-600" />
                    <h3 className="text-sm font-black text-gray-900">Sertifikasi & Izin Profesi</h3>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sertifikat Kompetensi (Serkom)</label>
                    <input 
                      type="text" 
                      value={formData.serkom}
                      onChange={(e) => setFormData({...formData, serkom: e.target.value})}
                      placeholder="No. Serkom..."
                      className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-gray-700 text-sm"
                    />
                  </div>

                  {formData.role === "APOTEKER" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">STRA (Bukan STRAP)</label>
                        <input 
                          type="text" 
                          value={formData.stra}
                          onChange={(e) => setFormData({...formData, stra: e.target.value})}
                          placeholder="No. STRA..."
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-gray-700 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SIPA</label>
                        <input 
                          type="text" 
                          value={formData.sipa}
                          onChange={(e) => setFormData({...formData, sipa: e.target.value})}
                          placeholder="No. SIPA..."
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-gray-700 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {formData.role === "ASISTEN APOTEKER" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">STRTTK</label>
                        <input 
                          type="text" 
                          value={formData.strttk}
                          onChange={(e) => setFormData({...formData, strttk: e.target.value})}
                          placeholder="No. STRTTK..."
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-gray-700 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SIPTTK</label>
                        <input 
                          type="text" 
                          value={formData.sipttk}
                          onChange={(e) => setFormData({...formData, sipttk: e.target.value})}
                          placeholder="No. SIPTTK..."
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-bold text-gray-700 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-black text-xs hover:bg-gray-200 transition active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-black text-xs hover:bg-purple-700 disabled:opacity-50 transition active:scale-95 shadow-xl shadow-purple-200"
                >
                  {isSaving ? <Loader2 className="animate-spin inline mr-2" size={16} /> : (editingEmployee ? "Simpan Perubahan" : "Simpan Karyawan")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
