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
import { cn } from './lib/utils';
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

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (confirm('Yakin ingin logout dari sistem?')) {
      setIsAuthenticated(false);
      localStorage.removeItem('isAuth');
      setActiveView('login');
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
      dashboard: 'Dashboard Admin',
      products: 'Manajemen Produk',
      pos: 'Kasir / PoS',
      history: 'Riwayat Transaksi',
      report: 'Laporan Penjualan',
      settings: 'Pengaturan Toko',
      logs: 'Log Sistem',
      storefront: 'Halaman Depan',
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
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Menyiapkan Database...</p>
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
    return <Login onLogin={handleLogin} onBackToStore={() => setActiveView('storefront')} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar 
        activeView={activeView} 
        setActiveView={(view) => {
          setActiveView(view);
          setIsMobileSidebarOpen(false);
        }} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        setIsOpen={setIsMobileSidebarOpen}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out min-w-0",
        collapsed ? "md:ml-20" : "md:ml-[280px]"
      )}>
        <Header 
          activeViewLabel={getActiveLabel()} 
          onQuickEntry={() => setActiveView('products')}
          onViewStore={() => setActiveView('storefront')}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
        />
        
        <div className="p-4 md:p-8 relative">
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
