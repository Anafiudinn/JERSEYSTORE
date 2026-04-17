import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Package, ArrowRight, Home, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onLogin: () => void;
  onBackToStore?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBackToStore }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      onLogin();
    } else {
      setError('Kredensial salah. Gunakan: admin / admin123');
    }
  };

  const quickLogin = () => {
    setUsername('admin');
    setPassword('admin123');
    setTimeout(() => {
      onLogin();
    }, 500);
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/20 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-blue-600 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-600/40 mb-8 border border-white/10 group">
            <Package className="w-10 h-10 group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none uppercase italic">JerseySphere</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] px-2 leading-relaxed">Sistem Inventori & POS Premium</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 italic">Username</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-white text-sm font-bold focus:ring-2 focus:ring-blue-500/40 transition-all outline-none"
                placeholder="Username admin..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 italic">Password</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-white text-sm font-bold focus:ring-2 focus:ring-blue-500/40 transition-all outline-none"
                placeholder="Password..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2">
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-[20px] text-sm tracking-[0.1em] shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group uppercase"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              type="button"
              onClick={quickLogin}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-4 rounded-[20px] text-sm tracking-[0.1em] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group uppercase"
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Quick Login (Admin)</span>
            </button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">Atau</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <button 
            type="button"
            onClick={onBackToStore}
            className="w-full bg-transparent border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 font-black py-3 rounded-[16px] text-[11px] tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group uppercase"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>

          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-rose-400 text-[11px] font-bold text-center bg-rose-400/10 py-3 rounded-xl border border-rose-400/20"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </form>

        <div className="text-center pt-8">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Akses Terenkripsi & Terlindungi</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
