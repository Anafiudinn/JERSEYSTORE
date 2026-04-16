import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Package, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      onLogin();
    } else {
      setError('Invalid credentials. Hint: admin / admin123');
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-accent rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-accent/40 mb-8">
            <Package className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none">JerseySphere</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs px-2 leading-relaxed">Secure Admin Access Portal</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[48px] shadow-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 italic">Username</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors w-5 h-5" />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-white text-sm font-bold focus:ring-2 focus:ring-accent/40 transition-all outline-none"
                placeholder="Enter username..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 italic">Password</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors w-5 h-5" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-white text-sm font-bold focus:ring-2 focus:ring-accent/40 transition-all outline-none"
                placeholder="Enter password..."
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-rose-400 text-xs font-bold text-center bg-rose-400/10 py-3 rounded-xl border border-rose-400/20"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-white font-black py-5 rounded-[24px] text-lg tracking-tight shadow-2xl shadow-accent/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            <span>SIGN IN TO SYSTEM</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="text-center pt-8">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">End-to-End Encrypted Session</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
