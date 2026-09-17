import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Calendar, Trash2, Pencil, User, Package, ChevronRight } from 'lucide-react';
import { TapIcon } from '../common/TapIcon';
import type { SaudaOrder } from '../../types';
import { formatCurrency, formatDate, formatDoNo } from '../../utils/formatters';

interface SaudaCardProps {
  order: SaudaOrder;
  onShare?: (order: SaudaOrder) => void;
  onDelete: (order: SaudaOrder) => void;
}

export const SaudaCard: React.FC<SaudaCardProps> = ({
  order,
  onDelete,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/vyapar/bills?orderId=${order.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="p-4 sm:p-5 rounded-3xl border border-blue-500/30 dark:border-blue-500/30 bg-white/90 dark:bg-[#0c1a2e]/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(37,99,235,0.08)] dark:shadow-[0_0_25px_rgba(37,99,235,0.12)] transition-all duration-300 hover:border-blue-400/60 dark:hover:border-blue-400/50 hover:-translate-y-0.5 overflow-hidden cursor-pointer group"
    >
      {/* Top Header: Item Pill Badge, DO Number on Left; Bill Rate on Right */}
      <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
          {/* Commodity Pill Badge */}
          <span 
            className="px-3.5 py-1.5 font-black text-xs sm:text-sm rounded-2xl uppercase tracking-wider bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.35)] flex items-center gap-1.5 shrink-0"
            title={order.itemName}
          >
            <Package className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{order.itemName}</span>
          </span>

          {/* DO Number */}
          <span className="text-xs sm:text-sm font-extrabold text-slate-500 dark:text-slate-400 tracking-wide shrink-0">
            {formatDoNo(order.doNo, order.id)}
          </span>
        </div>

        {/* Bill Rate */}
        <div className="text-right shrink-0">
          <div className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider leading-tight">
            BILL RATE
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {formatCurrency(order.billRate, 0)}
          </div>
        </div>
      </div>

      {/* Seller & Buyer 2-Column Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 my-3 sm:my-3.5 min-w-0">
        {/* Seller Box */}
        <div className="min-w-0 bg-emerald-500/10 dark:bg-emerald-950/25 p-2.5 sm:p-3 rounded-2xl border border-emerald-500/30 dark:border-emerald-800/40 flex flex-col justify-between shadow-2xs overflow-hidden">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-emerald-500/40 bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider leading-none mb-0.5">
                SELLER
              </div>
              <div 
                className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate uppercase"
                title={order.sellerName}
              >
                {order.sellerName}
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-500/20 dark:border-emerald-800/30 my-2" />

          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate uppercase">
            COMM {order.sellerCommissionRate}% {order.sellerCity ? `• ${order.sellerCity}` : (order.sellerLocation ? `• ${order.sellerLocation}` : '')}
          </div>
        </div>

        {/* Buyer Box */}
        <div className="min-w-0 bg-blue-500/10 dark:bg-blue-950/25 p-2.5 sm:p-3 rounded-2xl border border-blue-500/30 dark:border-blue-800/40 flex flex-col justify-between shadow-2xs overflow-hidden">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-blue-500/40 bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] sm:text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider leading-none mb-0.5">
                BUYER
              </div>
              <div 
                className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate uppercase"
                title={order.buyerName}
              >
                {order.buyerName}
              </div>
            </div>
          </div>

          <div className="border-t border-blue-500/20 dark:border-blue-800/30 my-2" />

          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate uppercase">
            COMM {order.buyerCommissionRate}% {order.buyerCity ? `• ${order.buyerCity}` : (order.buyerLocation ? `• ${order.buyerLocation}` : '')}
          </div>
        </div>
      </div>

      {/* Bottom Section: Quantity & Date on Left; Edit & Delete Buttons on Right */}
      <div className="flex items-center justify-between gap-3 pt-1 min-w-0">
        {/* Left Column: Stacked Quantity & Trade Date */}
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          {/* Quantity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl border border-blue-500/30 dark:border-blue-500/30 bg-blue-500/10 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Scale className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                QUANTITY
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                {Number(order.quantity).toFixed(2)} / {order.unit || '100'}
              </div>
            </div>
          </div>

          {/* Trade Date */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl border border-blue-500/30 dark:border-blue-500/30 bg-blue-500/10 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Calendar className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                TRADE DATE
              </div>
              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                {formatDate(order.date)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit & Delete Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Edit Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/vyapar/edit/${order.id}`);
            }}
            className="flex flex-col items-center justify-center w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            title="Edit Vyapar"
          >
            <Pencil className="w-4 h-4 stroke-[2.2] mb-0.5" />
            <span>Edit</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(order);
            }}
            className="flex flex-col items-center justify-center w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            title="Delete Vyapar"
          >
            <Trash2 className="w-4 h-4 stroke-[2.2] mb-0.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Tap to View or Edit Footer */}
      <div 
        className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400 dark:text-slate-400 font-medium pt-3 mt-3 border-t border-slate-200 dark:border-slate-800/80 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
      >
        <TapIcon className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
        <span>Tap to view or edit</span>
        <ChevronRight className="w-3.5 h-3.5 stroke-[2.2] shrink-0 ml-0.5" />
      </div>
    </div>
  );
};
