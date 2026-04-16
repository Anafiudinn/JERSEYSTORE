import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  BarChart3, 
  Settings, 
  FileText,
  ChevronLeft,
  Search,
  Plus,
  LogOut,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type ViewType = 'dashboard' | 'products' | 'pos' | 'history' | 'report' | 'settings' | 'logs' | 'storefront' | 'login';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'storefront', label: 'View Storefront', icon: Globe },
  { id: 'products', label: 'Manajemen Produk', icon: Package },
  { id: 'pos', label: 'Kasir / PoS', icon: ShoppingCart },
  { id: 'history', label: 'Riwayat Transaksi', icon: History },
  { id: 'report', label: 'Laporan', icon: BarChart3 },
  { id: 'settings', label: 'Pengaturan Toko', icon: Settings },
  { id: 'logs', label: 'System Log', icon: FileText },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, collapsed, setCollapsed, onLogout }) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-full bg-slate-950 text-white z-50 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 shadow-2xl"
    >
      <div className="p-6 flex items-center justify-between mb-8">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-none text-white">JerseySphere</h1>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Admin Panel</span>
            </div>
          </motion.div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white",
            collapsed && "mx-auto"
          )}
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform duration-300", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as ViewType)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group relative",
              activeView === item.id 
                ? "bg-accent text-white shadow-lg shadow-accent/20" 
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", activeView === item.id ? "text-white" : "group-hover:scale-110 transition-transform")} />
            {!collapsed && (
              <span className="font-medium text-sm whitespace-nowrap overflow-hidden">
                {item.label}
              </span>
            )}
            {activeView === item.id && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-2xl bg-slate-900 overflow-hidden transition-all duration-300",
          collapsed && "justify-center px-0"
        )}>
          <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0 border-2 border-slate-600" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-white">Ahmad Hanafie</p>
              <p className="text-[11px] text-slate-500 truncate">Store Manager</p>
            </div>
          )}
        </div>
        <button 
          onClick={onLogout}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all group",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="text-sm font-bold">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export const Header: React.FC<{ 
  activeViewLabel: string, 
  onQuickEntry?: () => void,
  onViewStore?: () => void
}> = ({ activeViewLabel, onQuickEntry, onViewStore }) => {
  return (
    <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{activeViewLabel}</h2>
        <p className="text-sm text-slate-500 font-medium">Selamat datang kembali, Ahmad.</p>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onViewStore}
          className="flex items-center gap-2 text-slate-600 hover:text-accent font-bold text-sm px-4 py-2.5 rounded-xl transition-all"
        >
          <Globe className="w-4 h-4" />
          <span>View Site</span>
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="relative group hidden md:block">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="pl-10 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent w-64 rounded-xl text-sm transition-all"
          />
        </div>

        <button 
          onClick={onQuickEntry}
          className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-accent/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Quick Entry</span>
        </button>
      </div>
    </header>
  );
};
