import React, { useState, useEffect, useMemo } from 'react';
import { db, type Product, type CartItem, type Transaction } from '../lib/db';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus, 
  CreditCard, 
  Banknote, 
  CheckCircle2,
  X,
  Package,
  User,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ReceiptModal } from './ReceiptModal';

export const POSView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'other'>('cash');
  
  const [customerName, setCustomerName] = useState('');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const all = await db.products.toArray();
    setProducts(all);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const changeAmount = useMemo(() => Math.max(0, amountPaid - cartTotal), [amountPaid, cartTotal]);

  const addToCart = (product: Product, size: string) => {
    const availableStock = (product.stocks || {})[size] || 0;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      
      if (existing) {
        if (existing.quantity >= availableStock) {
          alert(`Stok ukuran ${size} sudah mencapai batas!`);
          return prev;
        }
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === size) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      
      if (availableStock <= 0) {
        alert(`Stok ukuran ${size} saat ini kosong.`);
        return prev;
      }

      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      const uniqueId = `${item.id}-${item.selectedSize}`;
      if (uniqueId === cartItemId) {
        const product = products.find(p => p.id === item.id);
        const availableStock = (product?.stocks || {})[item.selectedSize] || 0;
        
        const newQty = Math.max(1, item.quantity + delta);
        if (delta > 0 && newQty > availableStock) {
          alert('Stok tidak cukup!');
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => `${item.id}-${item.selectedSize}` !== cartItemId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'cash' && amountPaid < cartTotal) {
      alert('Uang masuk kurang dari total belanja!');
      return;
    }
    
    const transaction: Transaction = {
      items: cart,
      total: cartTotal,
      customerName: customerName || 'General Customer',
      amountPaid: paymentMethod === 'cash' ? amountPaid : cartTotal,
      change: paymentMethod === 'cash' ? changeAmount : 0,
      timestamp: Date.now(),
      paymentMethod
    };

    const id = await db.transactions.add(transaction);
    const savedTx = await db.transactions.get(id);
    
    // Update stock specifically for each size
    for (const item of cart) {
      if (item.id) {
        const p = await db.products.get(item.id);
        if (p) {
          const updatedStocks = { ...(p.stocks || {}) };
          updatedStocks[item.selectedSize] = Math.max(0, (updatedStocks[item.selectedSize] || 0) - item.quantity);
          await db.products.update(item.id, { stocks: updatedStocks });
        }
      }
    }

    await db.logs.add({
      action: 'New Sale',
      details: `Successful size-aware sale to ${transaction.customerName}.`,
      timestamp: Date.now(),
      type: 'info'
    });

    setLastTransaction(savedTx || transaction);
    setShowReceipt(true);
    setCart([]);
    setCustomerName('');
    setAmountPaid(0);
    loadProducts();
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
      <ReceiptModal 
        isOpen={showReceipt} 
        onClose={() => setShowReceipt(false)} 
        transaction={lastTransaction} 
      />

      {/* Products Selection */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8 bg-[#fdfdfd]">
        <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm sticky top-0 z-10 backdrop-blur-md bg-white/90">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari jersey favorit Anda..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-accent/20 transition-all font-semibold"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Premier League', 'La Liga', 'Serie A', 'Ligue 1', 'Bundesliga', 'National'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border",
                  activeCategory === cat 
                    ? "bg-accent text-white border-accent shadow-lg shadow-accent/20" 
                    : "bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100 hover:border-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => {
            const totalStock = (Object.values(product.stocks || {}) as number[]).reduce((a: number, b: number) => a + b, 0);
            return (
              <motion.div
                layout
                key={product.id}
                className="bg-white group rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:border-accent/20 transition-all flex flex-col"
              >
                <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden group-hover:shadow-inner transition-all">
                  <img 
                    src={product.images?.[0]} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    referrerPolicy="no-referrer"
                    alt="" 
                  />
                  
                  {/* Size Selection Overlay on Hover */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 backdrop-blur-[2px]">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-3">Pilih Ukuran:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(product.stocks || {}).map(sz => {
                        const szStock = (product.stocks as any)?.[sz] || 0;
                        return (
                          <button
                            key={sz}
                            disabled={szStock <= 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, sz);
                            }}
                            className={cn(
                              "w-10 h-10 rounded-xl text-[11px] font-black transition-all flex items-center justify-center border",
                              szStock > 0 
                                ? "bg-white/10 border-white/20 text-white hover:bg-accent hover:border-accent hover:scale-110" 
                                : "bg-white/5 border-transparent text-white/20 cursor-not-allowed"
                            )}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {totalStock <= 5 && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-rose-500 text-white text-[10px] font-black uppercase tracking-tighter rounded-xl shadow-lg">
                      LIMIT: {totalStock} TOTAL
                    </div>
                  )}
                </div>
                
                <div className="p-6 space-y-3">
                  <h4 className="font-black text-slate-900 text-sm truncate leading-tight group-hover:text-accent transition-colors">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <p className="font-black text-accent text-lg tracking-tighter">{formatCurrency(product.price)}</p>
                    <span className="text-[10px] font-extrabold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg uppercase tracking-widest">{product.category}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Checkout Sidebar */}
      <div className="w-full lg:w-[480px] bg-slate-950 shadow-2xl flex flex-col border-l border-white/5 relative z-20 font-sans">
        <div className="p-8 border-b border-white/5 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl shadow-accent/20">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight leading-none">Checkout</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Transaction Details</p>
            </div>
          </div>
          <button onClick={() => setCart([])} className="p-3 text-slate-500 hover:text-rose-400 transition-colors bg-white/5 rounded-xl">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <User className="w-3 h-3" /> Pelanggan Atas Nama
            </label>
            <input 
              type="text" 
              placeholder="Masukkan nama pelanggan..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:ring-2 focus:ring-accent/40 transition-all outline-none"
            />
          </div>

          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Order Summary</label>
            <AnimatePresence mode="popLayout">
              {cart.map(item => {
                const uniqueId = `${item.id}-${item.selectedSize}`;
                return (
                  <motion.div
                    key={uniqueId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white/5 border border-white/5 p-4 rounded-3xl flex items-center gap-4 group hover:bg-white/[0.08] transition-colors"
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 shrink-0 shadow-inner">
                      <img src={item.images?.[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-white text-sm font-bold truncate mb-1 leading-tight">{item.name}</h5>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-white bg-accent px-2 py-0.5 rounded-lg uppercase tracking-widest border border-accent/20">{item.selectedSize}</span>
                        <span className="text-xs font-black text-slate-400">{formatCurrency(item.price)}</span>
                      </div>
                    </div>
                    <div className="flex items-center bg-slate-800 rounded-2xl p-1 gap-1 border border-white/5">
                      <button onClick={() => updateQuantity(uniqueId, -1)} className="p-1.5 text-slate-400 hover:text-white transition-colors"><Minus className="w-4 h-4" /></button>
                      <span className="text-sm font-black text-white px-2 min-w-[24px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(uniqueId, 1)} className="p-1.5 text-slate-400 hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => removeFromCart(uniqueId)} className="p-2 text-slate-700 hover:text-rose-500 transition-colors lg:opacity-0 group-hover:opacity-100">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {cart.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-700 space-y-4 opacity-40 italic">
                <Package className="w-20 h-20" strokeWidth={1.5} />
                <p className="font-black tracking-tight text-center text-lg">Your cart is calling...</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Bottom Section */}
        <div className="p-8 bg-slate-900 border-t border-white/5 space-y-8 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
              <span className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">Total Belanja</span>
              <span className="text-3xl font-black text-white tracking-tighter">{formatCurrency(cartTotal)}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'cash', icon: Banknote, label: 'Cash' },
                { id: 'transfer', icon: CreditCard, label: 'Bank' },
                { id: 'other', icon: ShoppingBag, label: 'QRIS' }
              ].map(method => (
                <button 
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-3xl border-2 transition-all active:scale-95",
                    paymentMethod === method.id 
                      ? "bg-accent border-accent text-white shadow-xl shadow-accent/20" 
                      : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                  )}
                >
                  <method.icon className="w-6 h-6" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">{method.label}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'cash' && cartTotal > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 bg-white/5 p-6 rounded-[32px] border border-white/5 shadow-inner"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 italic">Uang Masuk (Nominal)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">Rp</span>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={amountPaid || ''}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-xl font-black focus:ring-2 focus:ring-emerald-500/40 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center px-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Uang Kembali</span>
                  <span className={cn(
                    "text-lg font-black tracking-tighter",
                    amountPaid >= cartTotal ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {formatCurrency(changeAmount)}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          <button 
            disabled={cart.length === 0 || (paymentMethod === 'cash' && amountPaid < cartTotal)}
            onClick={handleCheckout}
            className="w-full bg-accent hover:bg-accent/90 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black py-6 rounded-[32px] text-lg tracking-tight shadow-2xl shadow-accent/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            <span>PROCESS TRANSACTION</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
