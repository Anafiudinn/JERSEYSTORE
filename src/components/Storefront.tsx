import React, { useState, useEffect } from 'react';
import { db, type Product, type CartItem } from '../lib/db';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ArrowRight, 
  Instagram, 
  Twitter, 
  Facebook,
  Star,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface StorefrontProps {
  onAdminLogin: () => void;
}

export const Storefront: React.FC<StorefrontProps> = ({ onAdminLogin }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [viewMode, setViewMode] = useState<'home' | 'catalog'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    loadProducts();
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadProducts = async () => {
    const all = await db.products.toArray();
    setProducts(all);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product, size: string) => {
    if (!size) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === size) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
    setIsCartOpen(true);
    setSelectedProduct(null);
  };

  const removeFromCart = (id: number, size: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === size)));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-accent selection:text-white">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 inset-x-0 z-[100] transition-all duration-500 px-6 py-4 flex items-center justify-between",
        (isScrolled || viewMode === 'catalog') ? "bg-white/80 backdrop-blur-xl border-b border-slate-100 py-3 shadow-sm" : "bg-transparent"
      )}>
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setViewMode('home')}
            className="text-2xl font-black tracking-tighter text-accent flex items-center gap-2 text-left"
          >
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span>JERSEYSPHERE</span>
          </button>
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setViewMode('home')}
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-accent",
                viewMode === 'home' ? "text-accent" : "text-slate-400"
              )}
            >
              Home
            </button>
            <button 
              onClick={() => setViewMode('catalog')}
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-accent",
                viewMode === 'catalog' ? "text-accent" : "text-slate-400"
              )}
            >
              All Products
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onAdminLogin}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-accent transition-colors hidden sm:block"
          >
            Admin Panel
          </button>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-slate-900 hover:text-accent transition-all active:scale-90"
          >
            <ShoppingBag className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
          <button className="md:hidden p-2 text-slate-900">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Content Switcher */}
      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        {viewMode === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Section */}
            <section className="relative h-[90vh] overflow-hidden bg-slate-950 flex items-center px-6 md:px-20">
              <div className="absolute inset-0 z-0">
                <img 
                  src="https://picsum.photos/seed/football-stadium/1920/1080?blur=4" 
                  className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                  role="presentation"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
              </div>

              <div className="relative z-10 max-w-4xl space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-6 uppercase">
                    Wear Your <span className="text-accent underline decoration-accent/30 underline-offset-8">Passion.</span><br />
                    Define History.
                  </h1>
                  <p className="text-slate-400 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
                    Dapatkan koleksi jersey sepak bola premium terlengkap. Dari liga top dunia hingga tim nasional favoritmu. Kualitas authentic, stok selalu update.
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="flex flex-wrap gap-4"
                >
                  <button 
                    onClick={() => setViewMode('catalog')}
                    className="px-10 py-5 bg-accent text-white font-black text-sm uppercase tracking-widest rounded-full shadow-2xl shadow-accent/40 hover:scale-110 active:scale-95 transition-all flex items-center gap-3 group"
                  >
                    <span>View All Products</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </button>
                  <button className="px-10 py-5 bg-white/10 backdrop-blur-md text-white font-black text-sm uppercase tracking-widest rounded-full border border-white/10 hover:bg-white/20 transition-all">
                    Latest Arrivals
                  </button>
                </motion.div>
              </div>

              {/* Floating Accent Text */}
              <div className="absolute right-0 bottom-20 vertical-rl hidden lg:block select-none pointer-events-none">
                <span className="text-[12vw] font-black text-white/5 uppercase tracking-tighter leading-none">
                  AUTHENTIC JERSEY 24/25
                </span>
              </div>
            </section>

            {/* Features Bar */}
            <div className="bg-slate-50 py-10 border-b border-slate-100">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { icon: ShieldCheck, title: "Original Quality", desc: "Produk original player/fan version dengan detail autentik." },
                  { icon: Truck, title: "Fast Delivery", desc: "Pengiriman kilat ke seluruh Indonesia dengan packing aman." },
                  { icon: RotateCcw, title: "Easy Returns", desc: "Garansi penukaran size jika tidak sesuai dengan syarat berlaku." }
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-accent shadow-sm shrink-0">
                      <f.icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">{f.title}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed font-medium">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Teaser */}
            <section className="py-24 max-w-7xl mx-auto px-6 space-y-16">
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <span className="text-accent font-black text-[10px] uppercase tracking-[0.3em]">Featured Selection</span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Most Wanted This Season</h2>
                <p className="text-slate-500 font-medium">Beberapa koleksi terpopuler yang menjadi incaran para fans saat ini. Pastikan Anda tidak melewatkannya.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.slice(0, 4).map((product) => (
                  <div 
                    key={product.id} 
                    className="group"
                    onClick={() => {
                      setSelectedProduct(product);
                      setSelectedSize('');
                      setActiveImageIdx(0);
                    }}
                  >
                    <div className="relative aspect-[3/4] rounded-[28px] overflow-hidden bg-slate-100 mb-6 shadow-sm hover:shadow-xl transition-all duration-700">
                      <img src={product.images?.[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-black text-xs uppercase tracking-widest border border-white/40 px-6 py-2 rounded-full backdrop-blur-sm">View</span>
                      </div>
                    </div>
                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight truncate">{product.name}</h4>
                    <p className="text-accent font-black text-sm">{formatCurrency(product.price)}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => setViewMode('catalog')}
                  className="px-12 py-4 border-2 border-slate-900 text-slate-900 font-black text-xs uppercase tracking-widest rounded-full hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                >
                  See All Collections
                </button>
              </div>
            </section>

            {/* Info Section */}
            <section className="bg-slate-50 py-24 overflow-hidden border-y border-slate-100">
              <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
                <div className="flex-1 space-y-8">
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">THE QUALITY IS IN THE <span className="text-accent underline decoration-accent/20">DETAILS</span>.</h2>
                  <p className="text-slate-500 text-lg font-medium leading-relaxed">
                    Setiap produk yang kami tawarkan telah melewati pemeriksaan kualitas yang ketat. Kami memastikan detail seperti badge, jahitan, dan material kain sesuai dengan standar kolektor jersey.
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <h5 className="font-black text-slate-900 text-xs uppercase tracking-widest">Premium Fabric</h5>
                       <p className="text-slate-400 text-[10px] font-bold">Teknologi sirkulasi udara optimal untuk kenyamanan maksimal.</p>
                    </div>
                    <div className="space-y-2">
                       <h5 className="font-black text-slate-900 text-xs uppercase tracking-widest">Authentic Badge</h5>
                       <p className="text-slate-400 text-[10px] font-bold">Detail logo tim dan sponsor yang presisi dan tahan lama.</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 w-full aspect-video rounded-[40px] overflow-hidden shadow-2xl relative group">
                   <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                   <div className="absolute inset-0 bg-accent/20 mix-blend-multiply" />
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="py-24 max-w-7xl mx-auto px-6 space-y-16"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12 pt-12">
              <div className="space-y-4">
                <button 
                  onClick={() => setViewMode('home')}
                  className="text-accent font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Back to Home
                </button>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Collections</h2>
                <div className="h-1.5 w-20 bg-accent rounded-full" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl justify-end">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 pr-6 py-3 bg-slate-100 border-none rounded-full text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-accent/20 w-full sm:w-64 transition-all"
                  />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0">
                  {['All', 'Premier League', 'La Liga', 'Serie A', 'Ligue 1', 'Bundesliga', 'National'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                        activeCategory === cat 
                          ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
                          : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={product.id}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(product);
                      setSelectedSize('');
                      setActiveImageIdx(0);
                    }}
                  >
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 mb-3 shadow-sm hover:shadow-xl transition-all duration-500">
                      <img 
                        src={product.images?.[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center">
                        <p className="text-white font-black text-[8px] uppercase tracking-widest translate-y-2 group-hover:translate-y-0 transition-transform">Quick View</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-[11px] leading-tight uppercase tracking-tight group-hover:text-accent transition-colors truncate">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center">
                        <p className="font-black text-accent text-[11px]">{formatCurrency(product.price)}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{product.category.split(' ').map(w => w[0]).join('')}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-40 text-center space-y-4">
                <Search className="w-16 h-16 mx-auto text-slate-200" />
                <div className="space-y-1">
                  <p className="text-xl font-black text-slate-900">No products found</p>
                  <p className="text-slate-400 font-medium">Try choosing a different category or search term.</p>
                </div>
                <button 
                  onClick={() => setActiveCategory('All')}
                  className="text-accent font-black text-xs uppercase tracking-widest hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[150] bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[200] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-slate-900" />
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Cart</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 italic text-center px-10">
                    <ShoppingBag className="w-20 h-20 opacity-20" />
                    <p className="text-xl font-black text-slate-400">Your cart is empty</p>
                    <p className="text-sm">Start browsing our collection to add items here.</p>
                  </div>
                ) : (
                  cart.map((item, i) => (
                    <motion.div 
                      layout
                      key={`${item.id}-${item.selectedSize}`}
                      className="flex gap-4 group"
                    >
                      <div className="w-24 h-32 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                        <img src={item.images?.[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <h4 className="font-black text-slate-900 text-sm uppercase leading-tight line-clamp-2 pr-4">{item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.id!, item.selectedSize)}
                            className="text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded-lg uppercase tracking-widest">{item.selectedSize}</span>
                          <span className="text-slate-400 text-xs font-bold">Qty: {item.quantity}</span>
                        </div>
                        <p className="font-black text-accent">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total Amount</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(cartTotal)}</span>
                </div>
                <button 
                  disabled={cart.length === 0}
                  className="w-full bg-accent text-white font-black py-5 rounded-[24px] text-sm uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 group"
                >
                  <span>Checkout Now</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                  Safe & Secure • COD Available • Worldwide Shipping
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 z-[250] bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-5xl md:h-[80vh] bg-white z-[300] shadow-2xl rounded-[40px] overflow-hidden flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/10 backdrop-blur-md text-white md:text-slate-900 md:bg-slate-100 rounded-full hover:scale-110 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Gallery */}
              <div className="w-full md:w-1/2 h-80 md:h-full bg-slate-50 relative group">
                <img 
                  src={selectedProduct.images?.[activeImageIdx]} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="absolute bottom-8 inset-x-0 flex justify-center gap-2">
                    {selectedProduct.images.map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveImageIdx(i)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          activeImageIdx === i ? "bg-accent w-6" : "bg-white/40"
                        )}
                      />
                    ))}
                  </div>
                )}
                
                <div className="absolute top-8 left-8">
                  <span className="bg-accent text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">In Stock</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8 flex flex-col">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">{selectedProduct.category}</p>
                  <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">
                    {selectedProduct.name}
                  </h3>
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">(2.4k Reviews)</span>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <p className="text-3xl font-black text-slate-900">{formatCurrency(selectedProduct.price)}</p>
                  <div className="h-px bg-slate-100 w-full" />
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Description</h5>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                      {selectedProduct.description || "The " + selectedProduct.name + " combines performance with timeless style, perfect for both matches and casual wear."}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Select Size</h5>
                      <button className="text-[9px] font-bold text-accent uppercase underline decoration-accent/30 underline-offset-4">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedProduct.stocks || {}).map(([size, qty]) => (
                        <button
                          key={size}
                          disabled={(qty as number) <= 0}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "min-w-12 h-12 rounded-xl text-xs font-black transition-all border-2",
                            (qty as number) <= 0 
                              ? "bg-slate-50 text-slate-200 border-slate-100 cursor-not-allowed"
                              : selectedSize === size
                              ? "bg-accent border-accent text-white shadow-lg shadow-accent/20 scale-110"
                              : "bg-white border-slate-100 text-slate-900 hover:border-slate-300"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                  <button 
                    disabled={!selectedSize}
                    onClick={() => addToCart(selectedProduct, selectedSize)}
                    className="flex-1 bg-slate-900 text-white font-black py-5 rounded-[24px] text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add To Cart</span>
                  </button>
                  <button 
                    className="w-16 h-16 bg-white border-2 border-slate-100 rounded-px hidden sm:flex items-center justify-center text-slate-900 hover:border-slate-900 transition-all rounded-[24px]"
                    aria-label="Add to favorites"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer (Only on Home) */}
      {viewMode === 'home' && (
        <footer className="bg-slate-950 pt-24 pb-12 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-16 border-b border-white/5 pb-16">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black tracking-tighter">JERSEYSPHERE</h3>
            </div>
            <p className="text-slate-400 max-w-sm font-medium leading-relaxed">
              Toko jersey sepak bola terpercaya sejak 2020. Kami berkomitmen menyajikan kualitas terbaik untuk para penggemar sepak bola di seluruh Indonesia.
            </p>
            
            <div className="w-full h-48 rounded-[32px] overflow-hidden border border-white/10 shadow-2xl relative group grayscale hover:grayscale-0 transition-all duration-700">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15865.176463990666!2d106.8173468!3d-6.224424!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e4e9a56767%3A0x6a0f76973347c6e!2sStadion%20Utama%20Gelora%20Bung%20Karno!5e0!3m2!1sid!2sid!4v1713290000000!5m2!1sid!2sid" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-[32px]"
                />
                <div className="absolute inset-0 pointer-events-none border-[12px] border-slate-950/20 rounded-[32px]" />
            </div>

            <div className="flex gap-4">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-accent transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="font-black text-xs uppercase tracking-[0.2em] text-white/40">Quick Links</h5>
            <ul className="space-y-4">
              {['Home', 'Collections', 'Featured', 'About Us', 'Contact'].map(l => (
                <li key={l}>
                  <button 
                    onClick={() => setViewMode(l === 'Collections' ? 'catalog' : 'home')}
                    className="font-bold text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h5 className="font-black text-xs uppercase tracking-[0.2em] text-white/40">Legal</h5>
            <ul className="space-y-4">
              {['Privacy Policy', 'Terms or Service', 'Refund Policy', 'Shipping Policy'].map(l => (
                <li key={l}>
                  <a href="#" className="font-bold text-slate-400 hover:text-white transition-colors text-sm">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
              &copy; 2026 JerseySphere Authentic Store. All rights reserved.
            </p>
            <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] animate-pulse">
              by ahmad anafi khoiirudin
            </p>
          </div>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verified Merchant</span>
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
};
