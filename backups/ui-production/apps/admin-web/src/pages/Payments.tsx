import React from 'react';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';

export const Payments: React.FC = () => {
  const transactions = [
    { txnId: 'TXN_881920', orderId: 'ORD_99182', amount: 24.95, gateway: 'STRIPE', status: 'SUCCESS', date: '2026-07-24' },
    { txnId: 'TXN_881921', orderId: 'ORD_99181', amount: 58.40, gateway: 'UPI', status: 'SUCCESS', date: '2026-07-24' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Payments & Transactions</h1>
        <p className="text-xs text-slate-400">Payment gateway transactions, refunds & failed payment auditing</p>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/60 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-3.5 font-semibold">Txn ID</th>
              <th className="px-6 py-3.5 font-semibold">Order ID</th>
              <th className="px-6 py-3.5 font-semibold">Amount</th>
              <th className="px-6 py-3.5 font-semibold">Gateway</th>
              <th className="px-6 py-3.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {transactions.map((t) => (
              <tr key={t.txnId} className="hover:bg-slate-800/30">
                <td className="px-6 py-4 font-mono font-bold text-slate-100">{t.txnId}</td>
                <td className="px-6 py-4 font-mono text-slate-400">{t.orderId}</td>
                <td className="px-6 py-4 font-bold text-emerald-400">${t.amount.toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-400">{t.gateway}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
