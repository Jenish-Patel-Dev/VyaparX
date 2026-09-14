import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Calendar, Share2, Trash2 } from 'lucide-react';
import type { SaudaOrder } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

interface SaudaCardProps {
  order: SaudaOrder;
  onShare: (order: SaudaOrder) => void;
  onDelete: (order: SaudaOrder) => void;
}

export const SaudaCard: React.FC<SaudaCardProps> = ({
  order,
  onShare,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { palette } = useTheme();

  return (
    <div 
      className="glass-card p-3.5 sm:p-4.5 transition-all duration-300 hover:border-blue-400/60 dark:hover:border-blue-500/50 hover:-translate-y-0.5 overflow-hidden"
    >
      {/* Top Header: Item Name Badge + Bill Rate */}
      <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
        <span 
          className="px-2.5 sm:px-3 py-1 font-black text-xs rounded-xl uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_2px_6px_rgba(37,99,235,0.06)] dark:shadow-none truncate max-w-[60%]"
          title={order.itemName}
        >
          {order.itemName}
        </span>
        <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 shrink-0 text-right">
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">BILL RATE:</span>
          {formatCurrency(order.billRate, 0)}
        </div>
      </div>

      {/* Seller & Buyer 2-Column Glass Subcards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-3 min-w-0">
        {/* Seller Subcard */}
        <div className="min-w-0 bg-emerald-500/10 dark:bg-emerald-950/30 backdrop-blur-xl p-2.5 sm:p-3 rounded-2xl border border-emerald-500/25 dark:border-emerald-800/40 flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(16,185,129,0.06)] dark:shadow-none overflow-hidden">
          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 tracking-wider">SELLER</span>
          <div 
            className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm mt-0.5 truncate uppercase"
            title={order.sellerName}
          >
            {order.sellerName}
          </div>
          <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-1 truncate">
            COMM: {order.sellerCommissionRate}% {order.sellerCity ? `• ${order.sellerCity}` : ''}
          </div>
        </div>

        {/* Buyer Subcard */}
        <div className="min-w-0 bg-sky-500/10 dark:bg-sky-950/30 backdrop-blur-xl p-2.5 sm:p-3 rounded-2xl border border-sky-500/25 dark:border-sky-800/40 flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(14,165,233,0.06)] dark:shadow-none overflow-hidden">
          <span className="text-[10px] font-black text-sky-700 dark:text-sky-400 tracking-wider">BUYER</span>
          <div 
            className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm mt-0.5 truncate uppercase"
            title={order.buyerName}
          >
            {order.buyerName}
          </div>
          <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-1 truncate">
            COMM: {order.buyerCommissionRate}% {order.buyerCity ? `• ${order.buyerCity}` : ''}
          </div>
        </div>
      </div>

      {/* Quantity & Unit Row */}
      <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold mb-2.5 min-w-0 flex-wrap">
        <Scale className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
        <span className="truncate">QUANTITY: {Number(order.quantity).toFixed(2)}</span>
        <span className="text-slate-500 dark:text-slate-400 font-normal">{order.unit}</span>
      </div>

      {/* Date, ID & Action Buttons Row */}
      <div className="flex items-center justify-between gap-2 py-1 mb-2 min-w-0 flex-wrap">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-0 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold shrink-0 text-blue-600 dark:text-blue-400">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{formatDate(order.date)}</span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-bold shrink-0">#DO: {order.doNo || order.id}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onShare(order);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center transition-all active:scale-95 shadow-xs"
            title="Share Vyapar PDF"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onDelete(order);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 flex items-center justify-center transition-all active:scale-95 shadow-xs"
            title="Delete Vyapar"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Tap to view or edit link */}
      <div 
        onClick={() => navigate(`/vyapar/edit/${order.id}`)}
        className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 pt-2.5 border-t border-[#DCE6F2] dark:border-slate-800 transition-colors"
      >
        Tap to view or edit
      </div>
    </div>
  );
};
