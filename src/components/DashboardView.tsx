import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

const stats = [
  { label: 'Total Penjualan', value: 124500000, icon: DollarSign, trend: '+12.5%', isUp: true },
  { label: 'Total Pesanan', value: 156, icon: TrendingUp, trend: '+5.4%', isUp: true },
  { label: 'Pelanggan', value: 89, icon: Users, trend: '-2.1%', isUp: false },
  { label: 'Inventori', value: 432, icon: Package, trend: '+0.8%', isUp: true },
];

const chartData = [
  { name: 'Mon', sales: 4000000 },
  { name: 'Tue', sales: 3000000 },
  { name: 'Wed', sales: 5000000 },
  { name: 'Thu', sales: 2780000 },
  { name: 'Fri', sales: 1890000 },
  { name: 'Sat', sales: 8390000 },
  { name: 'Sun', sales: 9490000 },
];

const trendingProducts = [
  { name: 'Man Utd Home 24/25', category: 'Premier League', sales: 45, price: 850000 },
  { name: 'Indonesia Home 2024', category: 'National', sales: 32, price: 750000 },
  { name: 'Real Madrid Away', category: 'La Liga', sales: 28, price: 900000 },
];

export const DashboardView: React.FC = () => {
  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-600">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                stat.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-slate-500 font-semibold text-sm mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black tracking-tight">
                {stat.label.includes('Sales') ? formatCurrency(stat.value) : stat.value.toLocaleString()}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Performa Pendapatan</h3>
              <p className="text-sm text-slate-500 font-medium">Laporan penjualan dalam seminggu terakhir</p>
            </div>
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 focus:ring-2 focus:ring-accent/20">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(val) => `Rp${val / 1000000}M`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  formatter={(val: number) => [formatCurrency(val), 'Penjualan']}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#2563eb" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">Trending Jersey</h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 space-y-6">
            {trendingProducts.map((product, idx) => (
              <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex-shrink-0 relative overflow-hidden">
                  <img src={`https://picsum.photos/seed/${idx}/100/100`} alt="" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{product.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 text-sm">{product.sales} terjual</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rp{product.price/1000}k</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-3.5 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all">
            Lihat Semua Produk
          </button>
        </div>
      </div>
    </div>
  );
};


