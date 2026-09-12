import React, { useState, useEffect } from 'react';
import { Truck, Search, Plus, CheckCircle2, Clock, AlertCircle, Info } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DispatchModal } from '../../components/operations/DispatchModal';
import { saudaService } from '../../services/saudaService';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import type { SaudaOrder } from '../../types';
import { formatDate } from '../../utils/formatters';

export const SaudaDispatchPage: React.FC = () => {
  const { currentCompany, currentFinancialYear } = useApp();
  const { palette } = useTheme();
  const [orders, setOrders] = useState<SaudaOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SaudaOrder | null>(null);

  const fetchOrders = async () => {
    const data = await saudaService.getAll({
      companyId: currentCompany?.id,
      financialYear: currentFinancialYear,
      query: searchQuery,
    });
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, [currentCompany?.id, currentFinancialYear, searchQuery]);

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      <PageHeader
        title="Vyapar Dispatch"
        subtitle="Manage dispatch tracking, vehicle numbers, and delivery status"
        onRefresh={fetchOrders}
      />

      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by #ID, party or item..."
            className="input-vyapar pl-12 pr-4 py-3.5 text-sm font-medium"
          />
        </div>

        {/* Dispatch Orders List */}
        <div className="space-y-3">
          {orders.map(order => {
            const dispatched = order.dispatchedQuantity || 0;
            const remaining = Math.max(0, order.quantity - dispatched);
            const isCompleted = order.dispatchStatus === 'Completed' || remaining === 0;

            return (
              <div
                key={order.id}
                className="glass-card rounded-3xl p-4 sm:p-5 border border-white/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all hover:shadow-glass-hover min-w-0 overflow-hidden"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span 
                      className="text-xs font-black px-2.5 py-0.5 rounded-xl backdrop-blur-xs shrink-0"
                      style={{ backgroundColor: palette.light, color: palette.text }}
                    >
                      #{order.id}
                    </span>
                    <span className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate max-w-[180px] sm:max-w-xs" title={order.itemName}>{order.itemName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[120px]">({order.itemQuality})</span>
                  </div>

                  <div className="text-xs text-gray-600 dark:text-gray-300 break-words">
                    <strong>Seller:</strong> {order.sellerName} ➔ <strong>Buyer:</strong> {order.buyerName}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs pt-1">
                    <span className="text-gray-500 dark:text-gray-400 shrink-0">Order: <strong>{order.quantity} {order.unit}</strong></span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold shrink-0">Dispatched: {dispatched}</span>
                    <span className="text-amber-700 dark:text-amber-400 font-bold shrink-0">Remaining: {remaining}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 pt-2 sm:pt-0">
                  <span
                    className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md ${
                      isCompleted
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                        : dispatched > 0
                        ? 'bg-blue-500/15 border border-blue-500/30 text-blue-800 dark:text-blue-300'
                        : 'bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{order.dispatchStatus || 'Pending'}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="btn-glass-primary py-2 sm:py-2.5 px-3.5 sm:px-4 font-bold text-xs rounded-2xl flex items-center gap-1.5"
                  >
                    <Truck className="w-4 h-4 shrink-0" />
                    <span>Dispatch</span>
                  </button>
                </div>
              </div>
            );
          })}

          {orders.length > 0 && (
            <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs font-medium flex items-center justify-center gap-1.5">
              <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <span>No more orders</span>
            </div>
          )}

          {orders.length === 0 && (
            <div className="text-center py-12 px-4 rounded-3xl bg-white/40 dark:bg-gray-850/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-glass">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-3">
                <Truck className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">No dispatch orders found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {searchQuery ? 'No orders match your search criteria' : 'All orders are dispatched or no orders exist.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <DispatchModal
          isOpen={Boolean(selectedOrder)}
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  );
};
