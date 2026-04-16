import React, { useState, useEffect } from 'react';
import { db, type Transaction, type SystemLog } from '../lib/db';
import { 
  FileText, 
  Calendar, 
  ChevronRight, 
  ExternalLink,
  Info,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
  Download
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
import { ReceiptModal } from './ReceiptModal';

export const HistoryView: React.FC = () => {
  const [data, setData] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  useEffect(() => {
    db.transactions.orderBy('timestamp').reverse().toArray().then(setData);
  }, []);

  const downloadCSV = () => {
    if (data.length === 0) return;
    
    const headers = ['TX ID', 'Date', 'Customer', 'Items', 'Total', 'Payment Method'];
    const rows = data.map(tx => [
      `#TX-${tx.id?.toString().padStart(6, '0')}`,
      new Date(tx.timestamp).toLocaleString('id-ID'),
      tx.customerName || 'General Customer',
      tx.items.map(i => `${i.name} (${i.selectedSize}) x${i.quantity}`).join('; '),
      tx.total,
      tx.paymentMethod
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `JerseySphere_Transactions_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewDetails = (tx: Transaction) => {
    setSelectedTx(tx);
    setShowReceipt(true);
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      <ReceiptModal 
        isOpen={showReceipt} 
        onClose={() => setShowReceipt(false)} 
        transaction={selectedTx} 
      />
      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Transactions</h3>
          <div className="flex gap-2">
            <button 
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-100 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-8 py-4">Transaction ID</th>
                <th className="px-8 py-4">Timestamp</th>
                <th className="px-8 py-4">Items</th>
                <th className="px-8 py-4">Total</th>
                <th className="px-8 py-4">Payment</th>
                <th className="px-8 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-900 font-mono text-sm">#TX-{tx.id?.toString().padStart(6, '0')}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(tx.timestamp).toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-black uppercase">
                      {tx.items.reduce((a, b) => a + b.quantity, 0)} Items
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-black text-slate-900">{formatCurrency(tx.total)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      tx.paymentMethod === 'cash' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => viewDetails(tx)}
                      className="p-2 text-slate-400 hover:text-accent transition-all hover:bg-slate-100 rounded-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="p-20 text-center text-slate-300">
              <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="font-bold">Belum ada transaksi tercatat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  
  useEffect(() => {
    db.logs.orderBy('timestamp').reverse().toArray().then(setLogs);
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-rose-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Audit Logs</h3>
          <button onClick={() => db.logs.clear().then(() => setLogs([]))} className="text-rose-600 text-sm font-bold hover:underline">Clear History</button>
        </div>
        <div className="p-4 space-y-2">
          {logs.map(log => (
            <div key={log.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <div className="mt-1">{getIcon(log.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-800 text-sm">{log.action}</h4>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-slate-550 leading-relaxed font-medium text-slate-500">{log.details}</p>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="p-20 text-center text-slate-300">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="font-bold">Log sistem kosong</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function History({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  );
}
