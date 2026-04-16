import React, { useState, useEffect } from 'react';
import { db, type Product } from '../lib/db';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  AlertCircle,
  Package
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ProductModal } from './ProductModal';

export const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await db.products.toArray();
      setProducts(allProducts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const deleteProduct = async (id?: number) => {
    if (!id || !confirm('Yakin ingin menghapus produk ini?')) return;
    await db.products.delete(id);
    await db.logs.add({
      action: 'Delete Product',
      details: `Product with ID ${id} deleted.`,
      timestamp: Date.now(),
      type: 'warning'
    });
    loadProducts();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadProducts}
        productToEdit={editingProduct}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari nama jersey atau SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-accent/20 transition-all font-medium"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['All', 'Premier League', 'La Liga', 'Serie A', 'Ligue 1', 'Bundesliga', 'National'].map(cat => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  category === cat ? "bg-white text-accent shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-bold text-sm shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={product.id}
              className="bg-white group rounded-[28px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img 
                  src={product.images?.[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => openEditModal(product)}
                    className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-slate-600 hover:text-accent transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-slate-600 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-black uppercase tracking-widest text-slate-900 rounded-full shadow-sm">
                    {product.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div>
                  <h3 className="font-black text-slate-900 leading-snug mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                    <span className="bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">{product.sku}</span>
                    <span>•</span>
                    <div className="flex gap-1">
                      {Object.entries(product.stocks || {}).filter(([_, qty]) => (qty as number) > 0).map(([sz]) => (
                        <span key={sz} className="text-[9px] px-1 bg-slate-50 border border-slate-100 rounded">{sz}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-auto">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Price</p>
                    <p className="text-lg font-black text-accent">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-right">Total Stock</p>
                    <div className="flex items-center gap-1.5 justify-end">
                      {(() => {
                        const total = (Object.values(product.stocks || {}) as number[]).reduce((a: number, b: number) => a + b, 0);
                        return (
                          <>
                            <div className={`w-2 h-2 rounded-full ${total > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <p className="font-bold text-slate-800">{total} pcs</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-accent rounded-full animate-spin" />
            <p className="font-bold">Memuat data produk...</p>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 gap-4">
            <Package className="w-20 h-20" />
            <div className="text-center">
              <p className="text-xl font-bold text-slate-500">Tidak ada produk ditemukan</p>
              <p className="text-sm font-medium">Coba gunakan kata kunci pencarian lain.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
