import React, { useRef, useEffect } from 'react';
import { db, type Transaction } from '../lib/db';
import { X, Printer, CheckCircle2, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, transaction }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col print:shadow-none print:rounded-none print:max-h-none"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between print:hidden">
          <h3 className="font-black text-slate-900 tracking-tight">E-Struk</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" title="Tutup (ESC/Enter)">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 print:p-4" ref={receiptRef}>
          <div className="text-center space-y-2 mb-8">
            <div className="w-16 h-16 bg-accent text-white rounded-2xl flex items-center justify-center mx-auto mb-4 print:w-12 print:h-12">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">JerseySphere</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Official Jersey Store</p>
            <div className="text-[11px] text-slate-500 font-medium">
              Jl. Sepak Bola No. 10, Jakarta<br/>
              0812-3456-7890
            </div>
          </div>

          <div className="border-t border-b border-dashed border-slate-200 py-4 mb-6 space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-400 uppercase tracking-wider">Tanggal</span>
              <span className="text-slate-900">{new Date(transaction.timestamp).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-400 uppercase tracking-wider">Pelanggan</span>
              <span className="text-slate-900">{transaction.customerName || 'Pelanggan Umum'}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-400 uppercase tracking-wider">ID Transaksi</span>
              <span className="text-slate-900">#TX-{transaction.id?.toString().padStart(6, '0')}</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate leading-tight">{item.name}</p>
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-black uppercase">{item.selectedSize}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {item.quantity} x {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="text-sm font-black text-slate-900 whitespace-nowrap">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 space-y-3 print:bg-white print:border print:border-slate-200">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-bold">Total Akhir</span>
              <span className="text-xl font-black text-slate-900">{formatCurrency(transaction.total)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold border-t border-slate-200 pt-2">
              <span className="text-slate-400 tracking-wider">Nominal Bayar</span>
              <span className="text-slate-900">{formatCurrency(transaction.amountPaid)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-400 tracking-wider">Kembalian</span>
              <span className="text-slate-900 text-emerald-600 font-black">{formatCurrency(transaction.change)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-400 tracking-wider">Metode Bayar</span>
              <span className="text-slate-900 uppercase font-black">{transaction.paymentMethod === 'cash' ? 'Tunai' : (transaction.paymentMethod === 'transfer' ? 'Transfer' : 'QRIS')}</span>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest print:bg-none print:border print:border-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              LUNAS / PAID
            </div>
            <p className="mt-6 text-[10px] text-slate-400 font-bold italic uppercase tracking-widest">Terima kasih atas pembeliannya!</p>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 flex gap-4 print:hidden">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm transition-all hover:bg-slate-200"
          >
            Tutup (ESC)
          </button>
          <button 
            onClick={handlePrint}
            className="flex-3 flex items-center justify-center gap-2 px-6 py-4 bg-accent text-white rounded-2xl font-black text-sm shadow-xl shadow-accent/20 transition-all active:scale-95"
          >
            <Printer className="w-5 h-5" />
            <span>Cetak Struk</span>
          </button>
        </div>
      </motion.div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #root {
             display: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .fixed {
            position: relative !important;
            background: white !important;
            backdrop-filter: none !important;
          }
          .fixed * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
};
