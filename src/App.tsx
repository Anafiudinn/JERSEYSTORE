/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, Header } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { POSView } from './components/POSView';
import { HistoryView, LogsView } from './components/HistoryAndLogs';
import { SettingsView, ReportView } from './components/SettingsAndReports';
import { Login } from './components/Login';
import { Storefront } from './components/Storefront';
import { seedDatabase } from './lib/db';
import { motion, AnimatePresence } from 'motion/react';

type ViewType = 'dashboard' | 'products' | 'pos' | 'history' | 'report' | 'settings' | 'logs' | 'storefront' | 'login';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('storefront');
  const [collapsed, setCollapsed] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuth') === 'true';
  });

  useEffect(() => {
    const init = async () => {
      await seedDatabase();
      setIsInitializing(false);
    };
    init();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuth', 'true');
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    if (confirm('Yakin ingin logout dari sistem?')) {
      setIsAuthenticated(false);
      localStorage.removeItem('isAuth');
      setActiveView('storefront');
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'products': return <ProductsView />;
      case 'pos': return <POSView />;
      case 'history': return <HistoryView />;
      case 'report': return <ReportView />;
      case 'settings': return <SettingsView />;
      case 'logs': return <LogsView />;
      default: return <DashboardView />;
    }
  };

  const getActiveLabel = () => {
    const labels: Record<ViewType, string> = {
      dashboard: 'Admin Dashboard',
      products: 'Manajemen Produk',
      pos: 'Point of Sale',
      history: 'Riwayat Transaksi',
      report: 'Laporan Penjualan',
      settings: 'Pengaturan Toko',
      logs: 'System Logs',
      storefront: 'Storefront',
      login: 'Login'
    };
    return labels[activeView];
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 flex-col gap-6">
        <div className="w-16 h-16 border-4 border-slate-800 border-t-accent rounded-full animate-spin" />
        <div className="text-center">
          <h1 className="text-white font-black text-2xl tracking-tight mb-2">JerseySphere</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Initializing Database...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && activeView !== 'storefront' && activeView !== 'login') {
    setActiveView('storefront');
  }

  if (activeView === 'storefront') {
    return <Storefront onAdminLogin={() => setActiveView('login')} />;
  }

  if (activeView === 'login' && !isAuthenticated) {
    return (
      <div className="relative">
        <button 
          onClick={() => setActiveView('storefront')}
          className="fixed top-8 left-8 z-[110] px-6 py-3 bg-white text-slate-900 rounded-full font-black text-xs uppercase tracking-widest shadow-xl border border-slate-100 hover:scale-105 transition-all"
        >
          ← Back to Store
        </button>
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        onLogout={handleLogout}
      />
      
      <main 
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ marginLeft: collapsed ? 80 : 280 }}
      >
        <Header 
          activeViewLabel={getActiveLabel()} 
          onQuickEntry={() => setActiveView('products')}
          onViewStore={() => setActiveView('storefront')}
        />
        
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
