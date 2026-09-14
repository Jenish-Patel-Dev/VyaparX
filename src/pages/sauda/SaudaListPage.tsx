import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Plus, Info, X, Printer, Share2, ReceiptText } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SaudaCard } from '../../components/sauda/SaudaCard';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SaudaNoteTemplate } from '../../components/pdf/SaudaNoteTemplate';
import { saudaService, type SaudaFilters } from '../../services/saudaService';
import { itemService } from '../../services/itemService';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import type { SaudaOrder, Item } from '../../types';

export const SaudaListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentCompany, currentFinancialYear } = useApp();
  const { palette } = useTheme();

  const [orders, setOrders] = useState<SaudaOrder[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [orderToDelete, setOrderToDelete] = useState<SaudaOrder | null>(null);
  const [activeShareOrder, setActiveShareOrder] = useState<SaudaOrder | null>(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Filters
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  useEffect(() => {
    itemService.getAll().then(setItems);
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const filters: SaudaFilters = {
        companyId: currentCompany?.id,
        financialYear: currentFinancialYear,
        query: searchQuery,
        itemId: selectedItemId || undefined,
      };
      const data = await saudaService.getAll(filters);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentCompany?.id, currentFinancialYear, searchQuery, selectedItemId]);

  const handleDeleteOrder = async () => {
    if (orderToDelete?.id) {
      try {
        await saudaService.delete(orderToDelete.id);
        toast.success(`Vyapar #${orderToDelete.id} deleted`);
        setOrderToDelete(null);
        fetchOrders();
      } catch (err) {
        toast.error('Failed to delete Vyapar order');
      }
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-[calc(100vh-60px)] pb-24 md:pb-12">
      {/* Header Replicating Screenshot 23 */}
      <PageHeader
        title={`VYAPAR (${orders.length})`}
        companyInfo={{
          financialYear: currentFinancialYear,
          companyName: currentCompany?.name,
        }}
        onRefresh={fetchOrders}
      />

      <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
        {/* Search Bar & Filter Button (Screenshot 23) */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 group">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by #DO or Party Name"
              className="w-full !pl-11 !pr-10 py-3.5 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border border-[#DCE6F2] dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:bg-white dark:focus:bg-[#172033] focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-300/30 text-slate-900 dark:text-slate-100 transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_2px_8px_rgba(37,99,235,0.06)] dark:shadow-none"
            />
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2] transition-colors" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                title="Clear Search"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilterDrawer(true)}
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer ${
              selectedItemId !== null
                ? 'btn-glass-primary text-white shadow-glass'
                : 'bg-white/90 dark:bg-slate-800/90 border-[#DCE6F2] dark:border-slate-700/80 text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-800 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_2px_8px_rgba(37,99,235,0.06)] dark:shadow-none backdrop-blur-xl'
            }`}
            title="Filter by Commodity Item"
            aria-label="Filter items"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Sauda Cards List */}
        <div className="space-y-4">
          {orders.map(order => (
            <SaudaCard
              key={order.id}
              order={order}
              onShare={o => setActiveShareOrder(o)}
              onDelete={o => setOrderToDelete(o)}
            />
          ))}

          {!isLoading && orders.length > 0 && (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-medium flex items-center justify-center gap-1.5">
              <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>No more orders</span>
            </div>
          )}

          {!isLoading && orders.length === 0 && (
            <div className="text-center py-12 px-4 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-slate-800/60 shadow-glass">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
                <ReceiptText className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No orders found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {searchQuery || selectedItemId !== null
                  ? 'No orders match your search or filter criteria'
                  : 'Click the + button below to create your first Vyapar order.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (+) */}
      <button
        type="button"
        onClick={() => navigate('/vyapar/create')}
        className="btn-glass-primary fixed bottom-20 md:bottom-8 right-6 z-40 w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90"
        aria-label="Create Vyapar"
        title="Create Vyapar"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(orderToDelete)}
        title="Delete Vyapar?"
        message={`Are you sure you want to delete Vyapar #${orderToDelete?.id} (${orderToDelete?.itemName})? This action cannot be undone.`}
        onConfirm={handleDeleteOrder}
        onCancel={() => setOrderToDelete(null)}
      />

      {/* Share / PDF Preview Modal */}
      {activeShareOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-[#DCE6F2] dark:border-slate-800 flex items-center justify-between bg-blue-50/50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Vyapar Note #{activeShareOrder.id} Preview
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="btn-glass-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveShareOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-4 md:p-6 bg-slate-50 dark:bg-[#0B1220] min-w-0">
              <SaudaNoteTemplate
                order={activeShareOrder}
                company={currentCompany || undefined}
                color={currentCompany?.saudaNoteColor || 'RED'}
                template={currentCompany?.pdfTemplate || 1}
                showSignature={currentCompany?.showSignature !== false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal (iOS Glass Sheet) */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm glass-card rounded-3xl p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Filter by Item</h3>
              <button
                type="button"
                onClick={() => setShowFilterDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedItemId(null);
                  setShowFilterDrawer(false);
                }}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all ${
                  selectedItemId === null
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-2xs'
                    : 'hover:bg-white/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                All Commodity Items
              </button>
              {items.map(itm => (
                <button
                  key={itm.id}
                  type="button"
                  onClick={() => {
                    setSelectedItemId(itm.id!);
                    setShowFilterDrawer(false);
                  }}
                  className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all uppercase ${
                    selectedItemId === itm.id
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 shadow-2xs'
                      : 'hover:bg-white/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {itm.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
