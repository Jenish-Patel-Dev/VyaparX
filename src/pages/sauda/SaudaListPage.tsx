import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  Plus, 
  Info, 
  X, 
  Printer, 
  Download,
  Share2, 
  ReceiptText, 
  RotateCcw, 
  Calendar, 
  Package, 
  Users, 
  Check,
  Loader2 
} from 'lucide-react';
import { 
  downloadSaudaNotePdf, 
  printSaudaNote, 
  formatOrderPdfFileName, 
  formatOrderPdfBaseTitle 
} from '../../utils/saudaPdfService';
import { PageHeader } from '../../components/layout/PageHeader';
import { SaudaCard } from '../../components/sauda/SaudaCard';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SaudaNoteTemplate } from '../../components/pdf/SaudaNoteTemplate';
import { GlassDatePicker } from '../../components/common/GlassDatePicker';
import { GoogleAutocompleteInput } from '../../components/common/GoogleAutocompleteInput';
import { saudaService, type SaudaFilters } from '../../services/saudaService';
import { itemService } from '../../services/itemService';
import { partyService } from '../../services/partyService';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { formatDate, formatDoNo } from '../../utils/formatters';
import { printVyaparReport } from '../../utils/printReportService';
import type { SaudaOrder, Item, Party } from '../../types';

export const SaudaListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const { currentCompany, currentFinancialYear } = useApp();
  const { palette } = useTheme();

  const [orders, setOrders] = useState<SaudaOrder[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [orderToDelete, setOrderToDelete] = useState<SaudaOrder | null>(null);
  const [activeShareOrder, setActiveShareOrder] = useState<SaudaOrder | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);

  // Modal Temp Filters
  const [tempDate, setTempDate] = useState<string>('');
  const [tempItemId, setTempItemId] = useState<number | null>(null);
  const [tempPartyId, setTempPartyId] = useState<number | null>(null);

  useEffect(() => {
    itemService.getAll().then(setItems);
    partyService.getAll().then(setParties);
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const filters: SaudaFilters = {
        companyId: currentCompany?.id,
        financialYear: currentFinancialYear,
        query: searchQuery,
        itemId: selectedItemId || undefined,
        partyId: selectedPartyId || undefined,
        date: selectedDate || undefined,
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
  }, [currentCompany?.id, currentFinancialYear, searchQuery, selectedItemId, selectedPartyId, selectedDate]);

  const activeFiltersCount =
    (selectedDate ? 1 : 0) +
    (selectedItemId !== null ? 1 : 0) +
    (selectedPartyId !== null ? 1 : 0);

  const hasAnyFilterOrSearch = Boolean(searchQuery.trim() || activeFiltersCount > 0);

  const handleResetAll = () => {
    setSearchQuery('');
    setSelectedDate('');
    setSelectedItemId(null);
    setSelectedPartyId(null);
    setTempDate('');
    setTempItemId(null);
    setTempPartyId(null);
  };

  const handleOpenFilterModal = () => {
    setTempDate(selectedDate);
    setTempItemId(selectedItemId);
    setTempPartyId(selectedPartyId);
    setShowFilterModal(true);
  };

  const handleApplyModalFilters = () => {
    setSelectedDate(tempDate);
    setSelectedItemId(tempItemId);
    setSelectedPartyId(tempPartyId);
    setShowFilterModal(false);
  };

  const handleClearModalFilters = () => {
    setTempDate('');
    setTempItemId(null);
    setTempPartyId(null);
    setSelectedDate('');
    setSelectedItemId(null);
    setSelectedPartyId(null);
    setShowFilterModal(false);
  };

  const handleDeleteOrder = async () => {
    if (orderToDelete?.id) {
      try {
        await saudaService.delete(orderToDelete.id);
        toast.success(`Vyapar ${formatDoNo(orderToDelete.doNo, orderToDelete.id)} deleted`);
        setOrderToDelete(null);
        fetchOrders();
      } catch (err) {
        toast.error('Failed to delete Vyapar order');
      }
    }
  };

  const handlePrintPdf = () => {
    if (activeShareOrder) {
      printSaudaNote(activeShareOrder);
    } else {
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    if (!activeShareOrder) return;
    setIsDownloadingPdf(true);
    try {
      const success = await downloadSaudaNotePdf(
        activeShareOrder,
        currentCompany,
        currentCompany?.saudaNoteColor || 'RED',
        currentCompany?.pdfTemplate || 1,
        currentCompany?.showSignature !== false
      );
      if (success) {
        toast.success('Vyapar Note PDF downloaded successfully!');
      }
    } catch (err) {
      console.error('PDF download error:', err);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrintReport = () => {
    const activeFiltersList: string[] = [];
    if (searchQuery.trim()) activeFiltersList.push(`Search: "${searchQuery.trim()}"`);
    if (selectedDate) activeFiltersList.push(`Date: ${formatDate(selectedDate)}`);
    if (selectedItemId !== null) {
      const itm = items.find(i => i.id === selectedItemId);
      if (itm) activeFiltersList.push(`Item: ${itm.name}`);
    }
    if (selectedPartyId !== null) {
      const pty = parties.find(p => p.id === selectedPartyId);
      if (pty) activeFiltersList.push(`Party: ${pty.name}`);
    }

    printVyaparReport({
      orders,
      companyName: currentCompany?.name,
      financialYear: currentFinancialYear,
      filterText: activeFiltersList.length > 0 ? activeFiltersList.join(' • ') : undefined,
    });
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
        onPrint={handlePrintReport}
      />

      <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
        {/* Search Bar, Filter Button & Responsive Reset Button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="relative flex-1 group">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('sauda.searchPlaceholder', 'Search DO#, Item, Seller, Buyer, Location, City...')}
              className="input-sauda !pl-11 !pr-10 text-xs sm:text-sm"
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

          {/* Filter Popup Trigger Button */}
          <button
            type="button"
            onClick={handleOpenFilterModal}
            className={`relative h-11 sm:h-12 w-11 sm:w-12 rounded-xl sm:rounded-2xl border flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer ${
              activeFiltersCount > 0
                ? 'btn-glass-primary text-white shadow-glass'
                : 'bg-white/90 dark:bg-slate-800/90 border-[#DCE6F2] dark:border-slate-700/80 text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-800 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_2px_8px_rgba(37,99,235,0.06)] dark:shadow-none backdrop-blur-xl'
            }`}
            title={t('sauda.filterOrders', 'Filter Vyapar Orders')}
            aria-label="Filter orders"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md animate-in zoom-in-50">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Reset Button: Icon on mobile, Label + Icon on desktop */}
          <button
            type="button"
            onClick={handleResetAll}
            className={`h-11 sm:h-12 px-3 sm:px-4 rounded-xl sm:rounded-2xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 font-bold text-xs sm:text-sm ${
              hasAnyFilterOrSearch
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'bg-white/90 dark:bg-[#111827]/90 border-[#DCE6F2] dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_1px_3px_rgba(37,99,235,0.04)] dark:shadow-none'
            }`}
            title="Reset Search & Filters"
            aria-label="Reset Search and Filters"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.3]" />
            <span className="hidden sm:inline uppercase tracking-wider font-extrabold text-xs">
              {t('common.reset', 'Reset')}
            </span>
          </button>
        </div>

        {/* Active Filter Pills (Removable individually) */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-0.5 animate-in fade-in duration-200">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Filters:
            </span>

            {selectedDate && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
                <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>{formatDate(selectedDate)}</span>
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="hover:text-red-500 p-0.5 rounded-full cursor-pointer transition-colors"
                  title="Remove Date filter"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </span>
            )}

            {selectedItemId !== null && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
                <Package className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="uppercase">
                  {items.find(i => i.id === selectedItemId)?.name || `Item #${selectedItemId}`}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedItemId(null)}
                  className="hover:text-red-500 p-0.5 rounded-full cursor-pointer transition-colors"
                  title="Remove Item filter"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </span>
            )}

            {selectedPartyId !== null && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
                <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="uppercase">
                  {parties.find(p => p.id === selectedPartyId)?.name || `Party #${selectedPartyId}`}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPartyId(null)}
                  className="hover:text-red-500 p-0.5 rounded-full cursor-pointer transition-colors"
                  title="Remove Party filter"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetAll}
              className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1 uppercase tracking-wider"
            >
              Clear All
            </button>
          </div>
        )}

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
                {searchQuery || activeFiltersCount > 0
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
        message={`Are you sure you want to delete Vyapar ${formatDoNo(orderToDelete?.doNo, orderToDelete?.id)} (${orderToDelete?.itemName})? This action cannot be undone.`}
        onConfirm={handleDeleteOrder}
        onCancel={() => setOrderToDelete(null)}
      />

      {/* Share / PDF Preview Modal */}
      {activeShareOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-4xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-[#DCE6F2] dark:border-slate-800 flex items-center justify-between gap-3 bg-blue-50/50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Vyapar Note {formatDoNo(activeShareOrder.doNo, activeShareOrder.id)} Preview
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="btn-glass-primary flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Download PDF"
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{isDownloadingPdf ? 'Downloading...' : 'Download PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="btn-glass-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer"
                  title="Print Note"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveShareOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-auto lg:overflow-x-visible p-3 sm:p-4 md:p-6 bg-slate-50 dark:bg-[#0B1220] min-w-0">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white w-fit min-w-[640px] lg:min-w-0 lg:w-full max-w-2xl mx-auto">
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
        </div>
      )}

      {/* Filter Modal Popup */}
      {showFilterModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 dark:bg-black/70 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowFilterModal(false)}
        >
          <div 
            className="w-full max-w-md bg-white/95 dark:bg-[#111827]/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-[#DCE6F2] dark:border-white/15 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 text-white flex items-center justify-between shadow-glass bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-5 h-5 stroke-[2.3]" />
                <h3 className="font-extrabold text-base tracking-wide uppercase">
                  {t('sauda.filterOrders', 'Filter Vyapar Orders')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="p-1.5 rounded-xl hover:bg-black/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Fields Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 pb-28">
              {/* 1. DATE PICKER */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{t('sauda.filterByDate', 'Filter by Date')}</span>
                </label>
                <GlassDatePicker
                  value={tempDate}
                  onChange={setTempDate}
                  placeholder="Select Order Date"
                />
              </div>

              {/* 2. ITEM GOOGLE-LIKE AUTOCOMPLETE SEARCH */}
              <GoogleAutocompleteInput
                label={t('sauda.filterByItem', 'Commodity Item')}
                icon={<Package className="w-3.5 h-3.5" />}
                placeholder="Type item name to search..."
                allOptionLabel={t('sauda.allCommodities', 'All Commodity Items')}
                options={items.map(itm => ({
                  id: itm.id!,
                  title: itm.name.toUpperCase(),
                  subtitle: itm.unit ? `Unit: ${itm.unit}` : undefined,
                }))}
                selectedId={tempItemId}
                onSelect={id => setTempItemId(id !== null ? Number(id) : null)}
              />

              {/* 3. PARTIES GOOGLE-LIKE AUTOCOMPLETE SEARCH */}
              <GoogleAutocompleteInput
                label={t('sauda.filterByParty', 'Party (Seller / Buyer)')}
                icon={<Users className="w-3.5 h-3.5" />}
                placeholder="Type party name or city to search..."
                allOptionLabel={t('sauda.allParties', 'All Parties')}
                options={parties.map(p => ({
                  id: p.id!,
                  title: p.name.toUpperCase(),
                  subtitle: `${p.city || ''} ${p.state ? '• ' + p.state : ''}`.trim() || undefined,
                  badge: p.mobileNumber || undefined,
                }))}
                selectedId={tempPartyId}
                onSelect={id => setTempPartyId(id !== null ? Number(id) : null)}
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-[#DCE6F2] dark:border-white/10 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-900/60">
              <button
                type="button"
                onClick={handleClearModalFilters}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('sauda.clearFilters', 'Clear Filters')}</span>
              </button>

              <button
                type="button"
                onClick={handleApplyModalFilters}
                className="btn-glass-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{t('sauda.applyFilters', 'Apply Filters')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
