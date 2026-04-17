import React, { useState, useEffect } from 'react';
import { db, type ShopSettings } from '../lib/db';
import { 
  Store, 
  MapPin, 
  Phone, 
  Coins, 
  Save, 
  Bell, 
  ShieldCheck,
  Globe,
  Camera,
  Percent,
  TrendingUp,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.settings.toCollection().first().then(setSettings).finally(() => setLoading(false));
  }, []);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    // Pastikan kita mengupdate record utama (ID 1)
    const settingsToSave = { ...settings, id: 1 };
    await db.settings.put(settingsToSave);
    
    // Update local state agar konsisten
    setSettings(settingsToSave);
    
    alert('Pengaturan berhasil disimpan!');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-accent rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-accent/20">
              <Info className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Profil Aplikasi</h3>
              <p className="text-sm font-semibold text-slate-500">Informasi identitas aplikasi & sistem</p>
            </div>
          </div>
          <button onClick={saveSettings} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10">
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>

        <form className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={saveSettings}>
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Nama Toko</label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                value={settings?.storeName || ''} 
                onChange={e => setSettings(s => s ? {...s, storeName: e.target.value} : null)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Nomor Telepon</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                value={settings?.phone || ''}
                onChange={e => setSettings(s => s ? {...s, phone: e.target.value} : null)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Alamat Lengkap</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
              <textarea 
                rows={3}
                value={settings?.address || ''}
                onChange={e => setSettings(s => s ? {...s, address: e.target.value} : null)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-accent/20 transition-all resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Mata Uang</label>
            <div className="relative">
              <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select 
                value={settings?.currency || 'IDR'}
                onChange={e => setSettings(s => s ? {...s, currency: e.target.value} : null)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-accent/20 transition-all outline-none"
              >
                <option value="IDR">Rupiah (IDR)</option>
                <option value="USD">Dollar (USD)</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Margin Profit</h3>
              <p className="text-sm font-semibold text-slate-500">Atur standar keuntungan otomatis</p>
            </div>
          </div>
          <button onClick={saveSettings} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-600/10">
            <Save className="w-4 h-4" />
            Simpan Margin
          </button>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Tipe Margin</label>
            <div className="relative">
              <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select 
                value={settings?.marginType || 'percentage'}
                onChange={e => setSettings(s => s ? {...s, marginType: e.target.value as 'percentage' | 'nominal'} : null)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
              >
                <option value="percentage">Persentase (%)</option>
                <option value="nominal">Nominal (Rp)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">
              Nilai Margin {settings?.marginType === 'percentage' ? '(%)' : '(Rp)'}
            </label>
            <div className="relative">
              <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="number" 
                value={settings?.marginValue || 0}
                onChange={e => setSettings(s => s ? {...s, marginValue: Number(e.target.value)} : null)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Bell, title: 'Notifikasi', desc: 'Kelola peringatan stok rendah & laporan harian' },
          { icon: ShieldCheck, title: 'Keamanan', desc: 'Atur password admin & akses database' },
          { icon: Globe, title: 'Bahasa', desc: 'Ubah bahasa antarmuka sistem' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm cursor-pointer hover:border-accent transition-all group">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 mb-4 group-hover:bg-accent group-hover:text-white transition-all">
              <item.icon className="w-5 h-5" />
            </div>
            <h4 className="font-black text-slate-900 leading-tight mb-1">{item.title}</h4>
            <p className="text-[11px] font-semibold text-slate-400 leading-relaxed uppercase tracking-wider">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ReportView: React.FC = () => {
  const data = [
    { name: 'Mon', revenue: 4500000, profit: 2100000 },
    { name: 'Tue', revenue: 5200000, profit: 2400000 },
    { name: 'Wed', revenue: 4800000, profit: 2200000 },
    { name: 'Thu', revenue: 6100000, profit: 3100000 },
    { name: 'Fri', revenue: 5900000, profit: 2800000 },
    { name: 'Sat', revenue: 8900000, profit: 4500000 },
    { name: 'Sun', revenue: 9500000, profit: 5100000 },
  ];

  const categoryData = [
    { name: 'National', value: 400 },
    { name: 'Premier League', value: 300 },
    { name: 'La Liga', value: 300 },
    { name: 'Serie A', value: 200 },
  ];

  const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Revenue vs Profit</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-xs font-bold text-slate-500 uppercase">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-500 uppercase">Profit</span>
              </div>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} tickFormatter={val => `Rp${val/1000000}M`} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Kategori Terlaris</h3>
          <div className="flex-1 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={140}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Total Share</span>
              <span className="text-4xl font-black text-slate-900 tracking-tighter">1,200</span>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">UP 12%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">{cat.name}</p>
                  <p className="font-bold text-slate-800 text-sm">{(cat.value / 1200 * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
