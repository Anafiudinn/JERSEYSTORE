import React, { useState, useEffect, useMemo } from 'react';
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
  ShieldCheck,
  Truck,
  Headphones,
  User,
  ShoppingBasket,
  Star,
  ChevronRight,
  ChevronDown,
  Filter
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface StorefrontProps {
  onAdminLogin: () => void;
}

export const Storefront: React.FC<StorefrontProps> = ({ onAdminLogin }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Logic State
  const [viewMode, setViewMode] = useState<'home' | 'catalog' | 'about'>('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const loadProducts = async () => {
      const all = await db.products.toArray();
      setProducts(all);
    };
    loadProducts();

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

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

  const updateCartQuantity = (id: number, size: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-blue-600 selection:text-white">
      {/* 1. Navbar Pro */}
      <nav className={cn(
        "fixed top-0 inset-x-0 z-[100] transition-all duration-500 px-6 md:px-12 py-6 flex items-center justify-between",
        (isScrolled || viewMode === 'catalog') ? "bg-white/90 backdrop-blur-xl border-b border-slate-100 py-4 shadow-sm" : "bg-transparent"
      )}>
        {/* Logo Kiri */}
        <div 
          onClick={() => { setViewMode('home'); window.scrollTo(0,0); }}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">JerseySphere</span>
        </div>

        {/* Menu Tengah */}
        <div className="hidden lg:flex items-center gap-10">
          {[
            { name: 'Beranda', mode: 'home' },
            { name: 'Katalog', mode: 'catalog' },
            { name: 'Tentang Kami', mode: 'about' }
          ].map((item) => (
            <button 
              key={item.name} 
              onClick={() => {
                setViewMode(item.mode as any);
                window.scrollTo(0, 0);
              }}
              className={cn(
                "text-[11px] font-black uppercase tracking-[0.2em] transition-colors relative group",
                (viewMode === item.mode) ? "text-blue-600" : "text-slate-500 hover:text-blue-600"
              )}
            >
              {item.name}
              <span className={cn(
                "absolute -bottom-1 left-0 h-0.5 bg-blue-600 transition-all group-hover:w-full",
                (viewMode === item.mode) ? "w-full" : "w-0"
              )} />
            </button>
          ))}
        </div>

        {/* Ikon Kanan */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => { setViewMode('catalog'); window.scrollTo(0,0); }}
            className="p-2 text-slate-900 hover:text-blue-600 transition-colors active:scale-90"
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-slate-900 hover:text-blue-600 transition-colors relative active:scale-90 group"
          >
            <ShoppingBasket className="w-5 h-5" />
            <span className={cn(
              "absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center transition-transform",
              cart.length > 0 ? "scale-100" : "scale-0"
            )}>
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </button>
          <button 
            onClick={onAdminLogin}
            className="p-2 text-slate-900 hover:text-blue-600 transition-colors active:scale-90"
            title="Kelola Inventori"
          >
            <User className="w-5 h-5" />
          </button>
          <button 
            className="lg:hidden p-2 text-slate-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Section V2 */}
            <section className="relative min-h-[90vh] flex items-center pt-24 px-6 md:px-20 overflow-hidden bg-white">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 -skew-x-12 translate-x-1/4 pointer-events-none" />
              <div className="max-w-4xl relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-8"
                >
                  <span className="inline-block px-5 py-2 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
                    Authentic Wear 2024/25
                  </span>
                  <h1 className="text-6xl md:text-9xl font-black text-black leading-[0.85] tracking-tighter uppercase">
                    Buktikan<br />
                    <span className="text-blue-600 italic">Loyalitasmu.</span>
                  </h1>
                  <p className="text-slate-500 text-lg md:text-xl max-w-xl font-medium leading-relaxed">
                    Jersey Sphere menyediakan koleksi jersey premium dengan detail yang presisi. 
                    Dari lapangan hijau hingga gaya jalanan, bawa semangat tim kebanggaanmu kemana saja.
                  </p>
                  <div className="flex flex-wrap gap-5 pt-4">
                    <button 
                      onClick={() => setViewMode('catalog')}
                      className="px-10 py-5 bg-black text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-600/30 transition-all flex items-center gap-3 active:scale-95 group"
                    >
                      Belanja Sekarang
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                      onClick={() => setViewMode('catalog')}
                      className="px-10 py-5 bg-white border-2 border-slate-100 text-black font-black text-xs uppercase tracking-widest rounded-full hover:border-black transition-all active:scale-95"
                    >
                      Koleksi Terbaru
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Decorative Element */}
              <div className="absolute right-0 bottom-0 select-none pointer-events-none hidden lg:block translate-y-1/4">
                <h2 className="text-[25vw] font-black text-slate-100 uppercase tracking-tighter leading-none">JS2024</h2>
              </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 bg-white border-y border-slate-50">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
                {[
                  { value: '10k+', label: 'Produk Terjual' },
                  { value: '500+', label: 'Mitra UMKM' },
                  { value: '99%', label: 'Pelanggan Puas' }
                ].map((stat, i) => (
                  <div key={i} className="text-center space-y-2">
                    <h3 className="text-6xl font-black text-black tracking-tighter">{stat.value}</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Teaser */}
            <section className="py-24 px-6 bg-slate-50">
              <div className="max-w-7xl mx-auto space-y-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="space-y-4">
                    <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em]">Featured Collections</span>
                    <h2 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">Pilihan Terbaik</h2>
                  </div>
                  <button 
                    onClick={() => setViewMode('catalog')}
                    className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors underline decoration-blue-600/20 underline-offset-8"
                  >
                    Lihat Semua Katalog
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {products.slice(0, 4).map((product, i) => (
                    <motion.div 
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group cursor-pointer bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                      onClick={() => {
                        setSelectedProduct(product);
                        setSelectedSize('');
                        setActiveImageIdx(0);
                      }}
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-slate-50 mb-6">
                        <img 
                          src={product.images?.[0] || 'https://picsum.photos/seed/jersey/400/500'} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="px-2 space-y-2">
                        <h4 className="font-bold text-slate-900 text-sm uppercase truncate">{product.name}</h4>
                        <div className="flex justify-between items-center">
                          <p className="font-black text-blue-600 text-base">{formatCurrency(product.price)}</p>
                          <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        ) : viewMode === 'catalog' ? (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-32 pb-24 px-6 md:px-12 bg-white"
          >
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              <div className="text-center space-y-4 mb-20">
                 <h2 className="text-6xl md:text-8xl font-black text-black tracking-tighter uppercase leading-[0.85]">
                  Eksplorasi<br/><span className="text-slate-200">Katalog</span>
                </h2>
              </div>

              {/* Filters & Search */}
              <div className="w-full max-w-6xl space-y-12 mb-20">
                <div className="relative group">
                   <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6 group-focus-within:text-blue-600 transition-colors" />
                   <input 
                    type="text" 
                    placeholder="Cari jersey tim favoritmu..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full py-8 pl-20 pr-10 bg-slate-50 border-2 border-slate-100 rounded-[3rem] text-xl font-medium focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-[12px] focus:ring-blue-600/5 transition-all shadow-inner"
                   />
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  {['Semua', 'Premier League', 'La Liga', 'Serie A', 'Ligue 1', 'Bundesliga', 'Nasional'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat === 'Semua' ? 'All' : (cat === 'Nasional' ? 'National' : cat))}
                      className={cn(
                        "px-8 py-4 rounded-full text-[12px] font-black uppercase tracking-widest border-2 transition-all",
                        (activeCategory === cat || (activeCategory === 'All' && cat === 'Semua') || (activeCategory === 'National' && cat === 'Nasional'))
                          ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20" 
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catalog Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 w-full">
                {filteredProducts.map((product) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={product.id}
                    className="group cursor-pointer bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-50"
                    onClick={() => {
                      setSelectedProduct(product);
                      setSelectedSize('');
                      setActiveImageIdx(0);
                    }}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-slate-100 mb-6 group-hover:bg-blue-50 transition-colors">
                      <img src={product.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute top-4 left-4">
                         <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full">{product.category}</span>
                      </div>
                    </div>
                    <div className="px-2 space-y-2">
                       <h4 className="font-bold text-slate-900 text-[13px] uppercase truncate">{product.name}</h4>
                       <div className="flex justify-between items-center">
                          <p className="font-black text-blue-600 text-[15px]">{formatCurrency(product.price)}</p>
                          <ShoppingBasket className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-40 text-center opacity-40">
                  <ShoppingBag className="w-20 h-20 mx-auto mb-4" />
                  <p className="text-xl font-black uppercase tracking-widest">Produk tidak tersedia</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="about"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-32 pb-24"
          >
            {/* 12. Luxury About Section */}
            <div className="max-w-7xl mx-auto px-6 space-y-24">
              <div className="flex flex-col lg:flex-row gap-20 items-center">
                <div className="flex-1 space-y-8">
                  <div className="space-y-4">
                    <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em]">Sejarah Kami</span>
                    <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none uppercase">
                      Warisan <span className="text-slate-200">JerseySphere</span>
                    </h2>
                  </div>
                  <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed italic border-l-4 border-blue-600 pl-8">
                    "Dimulainya perjalanan kami di tahun 2020 dengan mimpi sederhana: Menghubungkan penggemar sepak bola dengan kualitas jersey yang tak tertandingi."
                  </p>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Sejak tahun 2020, JerseySphere telah menjadi lebih dari sekadar toko. Kami adalah kurator sejarah sepak bola. Setiap jahitan, setiap badge, dan setiap kain dipilih secara manual untuk mewakili semangat tim kebanggaan Anda. Kami percaya bahwa jersey bukanlah sekadar pakaian, melainkan identitas dan loyalitas.
                  </p>
                </div>
                <div className="flex-1 w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative group">
                  <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply" />
                </div>
              </div>

              {/* Partners Section */}
              <div className="space-y-16">
                <div className="text-center space-y-4">
                   <h3 className="text-3xl font-black uppercase tracking-tighter">Kemitraan Strategis</h3>
                   <p className="text-slate-400 font-medium max-w-2xl mx-auto uppercase text-[10px] tracking-[0.2em]">Bekerja sama dengan brand & komunitas global sejak hari pertama</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { title: "Apparel Global", desc: "Kolaborasi dengan penyedia apparel internasional untuk menjamin akses koleksi player & fan version terbaru." },
                    { title: "Komunitas Ultras", desc: "Bekerja sama dengan komunitas suporter untuk mendistribusikan jersey tim nasional dan lokal." },
                    { title: "Logistik Kilat", desc: "Partner pengiriman yang memastikan jersey Anda sampai dalam kondisi sempurna dalam waktu 24-48 jam." },
                    { title: "Program UMKM", desc: "Mendukung 500+ mitra UMKM dalam ekosistem produksi merchandise sepak bola berkualitas." }
                  ].map((partner, i) => (
                    <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4 hover:bg-blue-600 group transition-all duration-500 shadow-sm border border-slate-100">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-white transition-all shadow-sm">
                        <Star className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-black text-black group-hover:text-white uppercase tracking-tight">{partner.title}</h4>
                      <p className="text-slate-400 text-xs font-medium group-hover:text-blue-50 leading-relaxed transition-colors">
                        {partner.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone */}
              <div className="py-20 bg-black rounded-[4rem] px-12 md:px-24 flex flex-col md:flex-row items-center justify-between gap-12 text-white overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 blur-[120px] opacity-30 -translate-y-1/2 translate-x-1/2" />
                 <div className="space-y-4 relative z-10 text-center md:text-left">
                    <h3 className="text-4xl font-black tracking-tighter uppercase">Menuju Masa Depan</h3>
                    <p className="text-slate-400 font-medium max-w-md">Kami terus berkembang untuk menjadi destinasi jersey nomor satu di Asia Tenggara pada tahun 2030.</p>
                 </div>
                 <div className="flex gap-12 relative z-10">
                    <div className="text-center">
                       <p className="text-5xl font-black tracking-tighter">2020</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Didirikan</p>
                    </div>
                    <div className="text-center">
                       <p className="text-5xl font-black tracking-tighter">5th</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Ulang Tahun</p>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Common Sections */}
      <section className="py-24 px-6 bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
          {[
            { icon: ShieldCheck, title: "Originalitas Terjamin", desc: "Setiap produk melewati pengecekan kualitas untuk memastikan detail autentik." },
            { icon: Truck, title: "Pengiriman Kilat", desc: "Kerja sama dengan ekspedisi terpercaya untuk sampai di tanganmu tepat waktu." },
            { icon: Headphones, title: "Support 24/7", desc: "Layanan pelanggan siap membantu segala kebutuhan dan kendalamu kapan saja." }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-6 group">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                <feature.icon className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-black uppercase tracking-tight">{feature.title}</h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2 lg:col-span-1 space-y-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><ShoppingBag className="w-5 h-5" /></div>
                <span className="text-xl font-black tracking-tighter uppercase italic">JerseySphere</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Bawa semangat tim kebanggaanmu kemana saja dengan koleksi premium dari JerseySphere Terpercaya Sejak 2020.</p>
            </div>
            {/* Simple static links for demo */}
            <div className="space-y-8">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Tautan Cepat</h5>
              <ul className="space-y-4">
                {['Beranda', 'Katalog', 'Promo'].map(link => (
                  <li key={link}><button onClick={() => setViewMode(link.toLowerCase() === 'katalog' ? 'catalog' : 'home')} className="text-slate-400 hover:text-white transition-colors text-sm font-bold tracking-tight uppercase tracking-widest">{link}</button></li>
                ))}
              </ul>
            </div>
            <div className="space-y-8">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Bantuan</h5>
              <ul className="space-y-4">
                {['Status Pesanan', 'Kebijakan Retur', 'Hubungi Kami'].map(link => (
                  <li key={link}><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-bold tracking-tight uppercase tracking-widest">{link}</a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-8">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Kemitraan</h5>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">Bergabung dengan jaringan mitra global kami untuk mendistribusikan semangat sepak bola.</p>
              <div className="flex gap-4">
                <Instagram className="w-4 h-4 text-slate-700 hover:text-white cursor-pointer" />
                <Twitter className="w-4 h-4 text-slate-700 hover:text-white cursor-pointer" />
                <Facebook className="w-4 h-4 text-slate-700 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 text-center md:text-left flex flex-col md:flex-row justify-between gap-6">
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">&copy; 2024 JerseySphere Authentic Store. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

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
                className="absolute top-6 right-6 z-10 p-2 bg-slate-100 rounded-full hover:scale-110 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full md:w-1/2 bg-slate-50 relative">
                <img src={selectedProduct.images?.[activeImageIdx]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>

              <div className="flex-1 p-12 overflow-y-auto space-y-8 flex flex-col">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{selectedProduct.category}</span>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">{selectedProduct.name}</h3>
                  <p className="text-3xl font-black">{formatCurrency(selectedProduct.price)}</p>
                </div>

                <div className="space-y-8 flex-1">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Ukuran</h5>
                      <span className="text-[9px] font-black text-blue-600 uppercase underline underline-offset-4 decoration-blue-600/20 cursor-pointer">Panduan Ukuran</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {Object.entries(selectedProduct.stocks || {}).map(([size, qty]) => (
                         <button 
                          key={size}
                          disabled={(qty as number) <= 0}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "min-w-14 h-14 rounded-2xl text-[11px] font-black transition-all border-2 flex flex-col items-center justify-center",
                            (qty as number) <= 0 
                              ? "bg-slate-50 text-slate-200 border-slate-100 opacity-50 cursor-not-allowed" 
                              : selectedSize === size 
                              ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105" 
                              : "bg-white border-slate-100 text-slate-900 hover:border-slate-300 hover:scale-105"
                          )}
                         >
                           <span>{size}</span>
                           {(qty as number) > 0 && (qty as number) < 5 && (
                             <span className="text-[8px] opacity-70 mt-1">Sisa {qty}</span>
                           )}
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* Product Description Section - ADDED HERE */}
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Deskripsi Produk</h5>
                    <div className="prose prose-slate prose-sm font-medium text-slate-500 leading-relaxed italic">
                      <p>
                        {selectedProduct.description || 
                          `Jersey ${selectedProduct.name} edisi player/fan version. Menggunakan teknologi material terbaru untuk sirkulasi udara maksimal. Cocok untuk koleksi maupun digunakan saat pertandingan. Setiap pembelian termasuk jaminan originalitas dan packaging premium.`
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!selectedSize}
                  onClick={() => addToCart(selectedProduct, selectedSize)}
                  className="w-full bg-black text-white font-black py-5 rounded-[2rem] text-xs uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Masukkan Keranjang</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 z-[150] bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[200] shadow-2xl flex flex-col">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Keranjang</h3>
                  <button onClick={() => setIsCartOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
                       <ShoppingBasket className="w-16 h-16 opacity-20" />
                       <p className="font-bold uppercase tracking-widest text-xs">Keranjang Anda Kosong</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 group">
                        <div className="w-20 h-24 bg-slate-50 rounded-xl overflow-hidden shrink-0">
                          <img src={item.images?.[0]} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-bold text-xs uppercase truncate leading-tight">{item.name}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.selectedSize} | Qty: {item.quantity}</p>
                          <p className="font-black text-blue-600 text-sm">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.id!, item.selectedSize)}><X className="w-4 h-4 text-slate-300 hover:text-rose-500" /></button>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pembayaran</span>
                    <span className="text-2xl font-black tracking-tighter">{formatCurrency(cartTotal)}</span>
                  </div>
                  <button disabled={cart.length === 0} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50">Checkout Sekarang</button>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
