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
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by #ID"
              className="w-full pl-12 pr-4 py-3.5 bg-white/80 backdrop-blur-xl border border-blue-200/90 rounded-2xl text-sm font-medium focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-300/50 text-gray-900 transition-all placeholder-gray-400 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_2px_8px_rgba(37,99,235,0.06)]"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilterDrawer(true)}
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer ${
              selectedItemId !== null
                ? 'btn-glass-primary text-white shadow-glass'
                : 'bg-gradient-to-b from-white/95 to-blue-50/70 border-blue-200/90 text-blue-700 hover:from-white hover:to-blue-100 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_2px_8px_rgba(37,99,235,0.08)] backdrop-blur-xl'
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
            <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs font-medium flex items-center justify-center gap-1.5">
              <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <span>No more orders</span>
            </div>
          )}

          {!isLoading && orders.length === 0 && (
            <div className="text-center py-12 px-4 rounded-3xl bg-white/40 dark:bg-gray-850/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-glass">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
                <ReceiptText className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">No orders found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {searchQuery || selectedItemId !== null
                  ? 'No orders match your search or filter criteria'
                  : 'Click the + button below to create your first Vyapar order.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (+) for Desktop (Mobile uses the center glass dock FAB) */}
      <button
        type="button"
        onClick={() => navigate('/vyapar/create')}
        className="btn-glass-primary hidden md:flex fixed bottom-8 right-6 z-40 w-14 h-14 rounded-2xl items-center justify-center"
        aria-label="Create Vyapar"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-sky-50/50 dark:bg-gray-700/50">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
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
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-4 md:p-6 bg-gray-50 min-w-0">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm glass-card rounded-3xl p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Filter by Item</h3>
              <button
                type="button"
                onClick={() => setShowFilterDrawer(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800 transition-colors"
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
                    ? 'bg-sky-500/15 text-sky-900 dark:text-sky-300 border border-sky-400/40 shadow-2xs'
                    : 'hover:bg-white/60 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
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
                      ? 'bg-sky-500/15 text-sky-900 dark:text-sky-300 border border-sky-400/40 shadow-2xs'
                      : 'hover:bg-white/60 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
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
