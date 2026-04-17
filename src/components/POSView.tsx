import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db, type Product, type CartItem, type Transaction } from '../lib/db';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus, 
  CreditCard, 
  Banknote, 
  X,
  Package,
  User,
  ArrowRight,
  ShoppingBag,
  Monitor,
  Zap
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
  const [scanMode, setScanMode] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
    // Autofocus search on load
    searchInputRef.current?.focus();

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearch('');
        searchInputRef.current?.focus();
      }
      if (e.key === 'F1') {
        e.preventDefault();
        setPaymentMethod('cash');
      }
      if (e.key === 'F2') {
        e.preventDefault();
        setPaymentMethod('other'); // Assuming QRIS
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadProducts = async () => {
    const all = await db.products.toArray();
    setProducts(all);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                           p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  // Scan Mode Logic: Automatically add to cart if SKU matches exactly
  useEffect(() => {
    if (scanMode && search.trim().length > 2) {
      const exactMatch = products.find(p => p.sku === search.trim());
      if (exactMatch) {
        // Find first size with stock
        const sizes = Object.entries(exactMatch.stocks || {});
        const firstAvailable = sizes.find(([_, qty]) => (qty as number) > 0);
        if (firstAvailable) {
          addToCart(exactMatch, firstAvailable[0]);
          setSearch(''); // Clear search after auto-add
        }
      }
    }
  }, [search, scanMode, products]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const changeAmount = useMemo(() => Math.max(0, amountPaid - cartTotal), [amountPaid, cartTotal]);

  const addToCart = (product: Product, size: string) => {
    const availableStock = (product.stocks || {})[size] || 0;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      
      if (existing) {
        if (existing.quantity >= availableStock) {
          return prev;
        }
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === size) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      
      if (availableStock <= 0) return prev;
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
        if (delta > 0 && newQty > availableStock) return item;
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
    if (paymentMethod === 'cash' && amountPaid < cartTotal) return;
    
    const transaction: Transaction = {
      items: cart,
      total: cartTotal,
      customerName: customerName || 'Pelanggan Umum',
      amountPaid: paymentMethod === 'cash' ? amountPaid : cartTotal,
      change: paymentMethod === 'cash' ? changeAmount : 0,
      timestamp: Date.now(),
      paymentMethod
    };

    const id = await db.transactions.add(transaction);
    const savedTx = await db.transactions.get(id);
    
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

    setLastTransaction(savedTx || transaction);
    setShowReceipt(true);
    setCart([]);
    setCustomerName('');
    setAmountPaid(0);
    loadProducts();
    searchInputRef.current?.focus();
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-white font-sans text-slate-900 overflow-hidden">
      <ReceiptModal 
        isOpen={showReceipt} 
        onClose={() => setShowReceipt(false)} 
        transaction={lastTransaction} 
      />

      {/* Main POS Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Sticky Utility Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Cari Produk atau Scan Barcode/SKU... (ESC untuk hapus)" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-100 border-2 border-transparent rounded-xl text-sm font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none md:text-base"
              />
              <button 
                onClick={() => setScanMode(!scanMode)}
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  scanMode ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-200 text-slate-500"
                )}
              >
                <Zap className={cn("w-3 h-3", scanMode && "fill-white")} />
                <span className="hidden sm:inline">Auto-Scan</span>
              </button>
            </div>
            
            <div className="hidden xl:flex items-center gap-6 px-4 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shortcuts</span>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-600"><kbd className="bg-white px-1.5 py-0.5 border border-slate-200 rounded text-xs shadow-sm">F1</kbd> Tunai</span>
                    <span className="text-[10px] font-bold text-slate-600"><kbd className="bg-white px-1.5 py-0.5 border border-slate-200 rounded text-xs shadow-sm">F2</kbd> QRIS</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {['All', 'Premier League', 'La Liga', 'Serie A', 'Ligue 1', 'Bundesliga', 'National'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  activeCategory === cat 
                    ? "bg-slate-900 text-white" 
                    : "text-slate-500 hover:bg-slate-200"
                )}
              >
                {cat === 'All' ? 'Semua' : (cat === 'National' ? 'Nasional' : cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Product List View */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 hover:border-blue-600 hover:shadow-lg transition-all group"
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-50 shrink-0 overflow-hidden border border-slate-100">
                    <img src={product.images?.[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-[11px] font-black text-slate-900 leading-tight truncate uppercase tracking-tight">{product.name}</h4>
                    <p className="text-xs font-black text-blue-600">{formatCurrency(product.price)}</p>
                  </div>
                </div>

                {/* Quick Add Sizes */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(sz => {
                    const qty = (product.stocks?.[sz] as number) || 0;
                    return (
                      <button
                        key={sz}
                        disabled={qty <= 0}
                        onClick={() => addToCart(product, sz)}
                        className={cn(
                          "flex-1 min-w-[32px] h-8 rounded-lg text-[10px] font-black transition-all border shrink-0",
                          qty > 0 
                            ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white" 
                            : "bg-slate-100 border-transparent text-slate-300 cursor-not-allowed opacity-50"
                        )}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
               <Monitor className="w-16 h-16 mb-4 opacity-20" />
               <p className="text-sm font-black uppercase tracking-widest text-slate-400">Produk tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Checkout Sidebar */}
      <div className="w-full lg:w-[420px] bg-white border-l border-slate-200 flex flex-col shadow-2xl z-40">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-blue-400" />
            <h3 className="font-black text-sm uppercase tracking-widest">Detail Pesanan</h3>
          </div>
          <button onClick={() => setCart([])} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-400 transition-colors">
            Hapus Semua
          </button>
        </div>

        {/* Responsive Cart List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          <div className="divide-y divide-slate-100">
            {cart.map(item => {
              const uniqueId = `${item.id}-${item.selectedSize}`;
              return (
                  <div key={uniqueId} className="flex items-center gap-4 group hover:bg-slate-50 transition-colors p-4 rounded-3xl border border-transparent hover:border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shrink-0 overflow-hidden shadow-sm">
                      <img src={item.images?.[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h5 className="text-[11px] font-black text-slate-900 leading-tight uppercase truncate">{item.name}</h5>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-wider">{item.selectedSize}</span>
                        <span className="text-[11px] font-black text-slate-400">{formatCurrency(item.price)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <div className="flex items-center bg-slate-100 rounded-xl h-8 overflow-hidden scale-90 origin-right">
                        <button onClick={() => updateQuantity(uniqueId, -1)} className="px-2 hover:bg-slate-200 text-slate-500 transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="px-2 text-xs font-black text-slate-900 border-x border-slate-200/50 min-w-[30px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(uniqueId, 1)} className="px-2 hover:bg-slate-200 text-slate-500 transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(uniqueId)} 
                        className="flex items-center gap-1.5 px-2 py-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
              );
            })}
          </div>

          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-200 p-10 text-center space-y-4">
              <Package className="w-12 h-12 opacity-50" />
              <p className="text-[10px] font-black uppercase tracking-widest">Keranjang masih kosong</p>
            </div>
          )}
        </div>

        {/* Fixed Footer Payment Area */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-6">
          <input 
            type="text" 
            placeholder="Nama Pelanggan (opsional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
          />

          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-slate-200 pb-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bayar</span>
               <span className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(cartTotal)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', icon: Banknote, label: 'Tunai (F1)' },
                { id: 'transfer', icon: CreditCard, label: 'Transfer' },
                { id: 'other', icon: ShoppingBag, label: 'QRIS (F2)' }
              ].map(method => (
                <button 
                  key={method.id}
                  onClick={() => {
                    setPaymentMethod(method.id as any);
                    if (method.id !== 'cash') setAmountPaid(cartTotal);
                    else setAmountPaid(0);
                  }}
                  className={cn(
                    "flex flex-col items-center py-3 rounded-xl border-2 transition-all",
                    paymentMethod === method.id 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                  )}
                >
                  <method.icon className="w-4 h-4 mb-1" />
                  <span className="text-[8px] font-black uppercase leading-[0.2em]">{method.label}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'cash' && cartTotal > 0 && (
              <div className="space-y-3 bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm border-b-4 border-b-blue-600/20 active:translate-y-[1px] transition-all">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Tunai Masuk</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                    <input 
                      type="text" 
                      placeholder="0"
                      value={amountPaid === 0 ? '' : amountPaid.toLocaleString('id-ID')}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        setAmountPaid(rawValue ? parseInt(rawValue, 10) : 0);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && amountPaid >= cartTotal) {
                          handleCheckout();
                        }
                      }}
                      className="w-40 text-right bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-slate-900 text-lg font-black outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center px-1 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kembalian</span>
                  <span className={cn("text-xl font-black tracking-tighter", amountPaid >= cartTotal ? "text-emerald-600" : "text-rose-500")}>
                    {formatCurrency(changeAmount)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button 
            disabled={cart.length === 0 || (paymentMethod === 'cash' && amountPaid < cartTotal)}
            onClick={handleCheckout}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <span>PROSES TRANSAKSI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
