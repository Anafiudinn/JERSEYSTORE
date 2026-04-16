import React, { useState, useEffect } from 'react';
import { X, Package, Tag, Layers, Database, Image as ImageIcon, Upload } from 'lucide-react';
import { db, type Product } from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSuccess, productToEdit }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: 'Premier League',
    price: 0,
    stocks: { 'S': 0, 'M': 0, 'L': 0, 'XL': 0 },
    images: [],
    description: '',
  });

  const [displayPrice, setDisplayPrice] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
      setDisplayPrice(productToEdit.price.toString());
    } else {
      setFormData({
        name: '',
        sku: '',
        category: 'Premier League',
        price: 0,
        stocks: { 'S': 0, 'M': 0, 'L': 0, 'XL': 0 },
        images: [],
        description: '',
      });
      setDisplayPrice('');
    }
  }, [productToEdit, isOpen]);

  const generateSKU = (name: string, category: string) => {
    const prefix = category.substring(0, 3).toUpperCase();
    const namePart = name.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${namePart}-${random}`;
  };

  const handlePriceChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    setDisplayPrice(numericValue);
    setFormData(prev => ({ ...prev, price: Number(numericValue) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ 
            ...prev, 
            images: [...(prev.images || []), reader.result as string] 
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const updateStock = (size: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      stocks: {
        ...(prev.stocks || {}),
        [size]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData };
      
      if (!productToEdit) {
        data.sku = generateSKU(data.name || 'JER', data.category || 'GEN');
      }

      if (productToEdit?.id) {
        await db.products.update(productToEdit.id, data);
      } else {
        await db.products.add(data as Product);
      }
      
      await db.logs.add({
        action: productToEdit ? 'Update Product' : 'Add Product',
        details: `${productToEdit ? 'Updated' : 'Added'} ${formData.name}`,
        timestamp: Date.now(),
        type: 'info'
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Gagal menyimpan produk');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {productToEdit ? 'Edit Jersey' : 'Tambah Jersey Baru'}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Product Information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 italic">Nama Jersey</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="cth: Arsenal Home 24/25"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent/20 transition-all font-sans"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 italic">Kategori</label>
            <div className="relative">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent/20 transition-all appearance-none outline-none"
              >
                <option>Premier League</option>
                <option>La Liga</option>
                <option>Serie A</option>
                <option>Ligue 1</option>
                <option>Bundesliga</option>
                <option>National</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 italic">Harga Jersey (Rp)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 pointer-events-none pr-2 border-r border-slate-200">
                <span className="text-[10px] font-black">Rp</span>
              </div>
              <input 
                required
                type="text" 
                value={Number(displayPrice).toLocaleString('id-ID')}
                onChange={e => handlePriceChange(e.target.value)}
                placeholder="cth: 150.000"
                className="w-full pl-14 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 italic flex items-center gap-2">
              <Package className="w-3 h-3" /> Inventory by Size
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                <div key={sz} className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest">{sz}</p>
                  <input 
                    type="number" 
                    value={formData.stocks?.[sz] || 0}
                    onChange={e => updateStock(sz, Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-center text-sm font-black focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 italic">Deskripsi Produk</label>
            <textarea 
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Jelaskan detail jersey ini (bahan, fitur, dll)..."
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent/20 transition-all resize-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 italic">Upload Foto Jersey (Bisa Lebih Dari Satu)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <AnimatePresence>
                {(formData.images || []).map((img, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 group shadow-sm border border-slate-100"
                  >
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 py-1 bg-black/40 backdrop-blur-sm text-[8px] text-white font-black text-center uppercase tracking-widest">
                      Slide {idx + 1}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <label className="aspect-square cursor-pointer">
                <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-accent transition-all group">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-accent group-hover:text-white transition-all">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center px-2">Tambah Foto</span>
                </div>
                <input 
                  multiple
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-2 pt-6 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-8 py-3 bg-accent text-white rounded-xl font-black text-sm shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
            >
              {productToEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
