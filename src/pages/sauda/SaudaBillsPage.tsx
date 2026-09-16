import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download,
  Loader2,
  X, 
  Info, 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  Calendar, 
  Package, 
  Users, 
  Check,
  ChevronDown,
  Palette
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PageHeader } from '../../components/layout/PageHeader';
import { SaudaNoteTemplate } from '../../components/pdf/SaudaNoteTemplate';
import { GlassDatePicker } from '../../components/common/GlassDatePicker';
import { GoogleAutocompleteInput } from '../../components/common/GoogleAutocompleteInput';
import { saudaService, type SaudaFilters } from '../../services/saudaService';
import { itemService } from '../../services/itemService';
import { partyService } from '../../services/partyService';
import { companyService } from '../../services/companyService';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import type { SaudaOrder, Item, Party } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const SaudaBillsPage: React.FC = () => {
  const { currentCompany, currentFinancialYear } = useApp();
  const { t } = useLanguage();
  const { palette } = useTheme();
  const toast = useToast();

  const previewRef = useRef<HTMLDivElement>(null);

  const [orders, setOrders] = useState<SaudaOrder[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<SaudaOrder | null>(null);

  // Collapsible customization panel (collapsed by default for mobile and clean UX)
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);

  // Modal Temp Filters
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempDate, setTempDate] = useState<string>('');
  const [tempItemId, setTempItemId] = useState<number | null>(null);
  const [tempPartyId, setTempPartyId] = useState<number | null>(null);

  const [activeTemplate, setActiveTemplate] = useState<1 | 2 | 3 | 4>(
    currentCompany?.pdfTemplate || 1
  );
  const [activeColor, setActiveColor] = useState<string>(
    currentCompany?.saudaNoteColor || 'RED'
  );
  const [showSignature, setShowSignature] = useState<boolean>(
    currentCompany?.showSignature !== false
  );

  useEffect(() => {
    if (currentCompany) {
      setShowSignature(currentCompany.showSignature !== false);
    }
  }, [currentCompany?.id]);

  useEffect(() => {
    itemService.getAll().then(setItems);
    partyService.getAll().then(setParties);
  }, []);

  const fetchOrders = async () => {
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
      // Only keep selected order if it still exists in the fetched list, do not auto-select on load
      if (selectedOrder) {
        const matching = data.find(o => o.id === selectedOrder.id);
        setSelectedOrder(matching || null);
      } else {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Failed to fetch orders in SaudaBillsPage', err);
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

  const handleSelectOrder = (order: SaudaOrder) => {
    setSelectedOrder(order);
    // Smooth scroll down to preview on mobile/tablet so user immediately sees it
    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!selectedOrder) return;
    const element = document.getElementById('printable-sauda-note');
    if (!element) {
      window.print();
      return;
    }
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, Math.min(imgHeight, pageHeight));
      heightLeft -= pageHeight;

      while (heightLeft > 5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, Math.min(imgHeight, pageHeight));
        heightLeft -= pageHeight;
      }

      const safeDoNo = String(selectedOrder.doNo || selectedOrder.id || 'Order').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`VyaparNote_DO_${safeDoNo}.pdf`);
      toast.showToast('Vyapar Note PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF download error:', err);
      toast.showToast('Could not download PDF directly, opening print dialog', 'info');
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSignatureChange = async (checked: boolean) => {
    setShowSignature(checked);
    if (currentCompany?.id) {
      try {
        await companyService.update(currentCompany.id, { showSignature: checked });
        currentCompany.showSignature = checked;
      } catch (err) {
        console.error('Failed to update signature preference', err);
      }
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      <PageHeader
        title="VYAPAR BILLS & NOTES"
      />

      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
        {/* Collapsible Template & Color Selector Bar (Collapsed by default on mobile) */}
        <div className="glass-panel rounded-2xl md:rounded-3xl shadow-glass-card overflow-hidden border border-[#DCE6F2] dark:border-slate-800 transition-all duration-200">
          {/* Collapsible Header Button */}
          <button
            type="button"
            onClick={() => setIsSettingsExpanded(prev => !prev)}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40 cursor-pointer"
            aria-expanded={isSettingsExpanded}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/60">
                <Palette className="w-4 h-4 stroke-[2.3]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                  <span>PDF Template & Styling</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    T{activeTemplate}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-2xs inline-block"
                    style={{
                      backgroundColor:
                        activeColor === 'RED' ? '#DC2626' :
                        activeColor === 'ORANGE' ? '#FF9800' :
                        activeColor === 'BLUE' ? '#2563EB' :
                        activeColor === 'GREEN' ? '#059669' : '#111827'
                    }}
                    title={`Color: ${activeColor}`}
                  />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Tap to {isSettingsExpanded ? 'hide' : 'change'} template, note color, & signature
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hidden sm:inline uppercase tracking-wider">
                {isSettingsExpanded ? 'Collapse' : 'Customize'}
              </span>
              <div className={`p-1.5 rounded-lg text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isSettingsExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </button>

          {/* Expanded Customizer Content */}
          {isSettingsExpanded && (
            <div className="p-4 sm:p-5 border-t border-[#DCE6F2] dark:border-slate-800/80 space-y-4 bg-slate-50/40 dark:bg-slate-900/20 animate-in fade-in duration-200">
              {/* PDF Template: Full Width Row (No empty right space) */}
              <div className="space-y-1.5 w-full">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  <span>PDF Template Layout:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold text-[11px]">
                    Template {activeTemplate} Selected
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 w-full">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setActiveTemplate(num as 1 | 2 | 3 | 4)}
                      className={`h-9 w-full rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        activeTemplate === num
                          ? 'btn-glass-primary text-white shadow-glass scale-[1.02]'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-[#DCE6F2] dark:border-slate-700 shadow-2xs'
                      }`}
                    >
                      Template {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note Color: Full Width Row (No empty right space) */}
              <div className="space-y-1.5 w-full">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  <span>Note Color:</span>
                  <span
                    className="text-xs font-extrabold flex items-center gap-1.5"
                    style={{
                      color:
                        activeColor === 'RED' ? '#DC2626' :
                        activeColor === 'ORANGE' ? '#FF9800' :
                        activeColor === 'BLUE' ? '#2563EB' :
                        activeColor === 'GREEN' ? '#059669' : '#111827'
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{
                        backgroundColor:
                          activeColor === 'RED' ? '#DC2626' :
                          activeColor === 'ORANGE' ? '#FF9800' :
                          activeColor === 'BLUE' ? '#2563EB' :
                          activeColor === 'GREEN' ? '#059669' : '#111827'
                      }}
                    />
                    {activeColor}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 w-full">
                  {[
                    { label: 'RED', hex: '#DC2626', name: 'Red' },
                    { label: 'ORANGE', hex: '#FF9800', name: 'Orange' },
                    { label: 'BLUE', hex: '#2563EB', name: 'Blue' },
                    { label: 'GREEN', hex: '#059669', name: 'Green' },
                    { label: 'BLACK', hex: '#111827', name: 'Black' },
                  ].map(col => (
                    <button
                      key={col.label}
                      type="button"
                      onClick={() => setActiveColor(col.label)}
                      className={`h-9 w-full rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        activeColor === col.label
                          ? 'ring-2 ring-blue-500 bg-blue-50/70 dark:bg-blue-950/50 border-blue-400 font-black shadow-xs scale-[1.02]'
                          : 'bg-white dark:bg-slate-800 border-[#DCE6F2] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs'
                      }`}
                      title={col.name}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white/40"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hidden sm:inline">
                        {col.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Signature in Vyapar Note PDF Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-[#DCE6F2] dark:border-slate-700 cursor-pointer select-none">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Show signature in Vyapar Note PDF
                </span>
                <input
                  type="checkbox"
                  id="billShowSignature"
                  checked={showSignature}
                  onChange={e => handleSignatureChange(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              {/* Download & Print Action Buttons inside Settings if order is selected */}
              {selectedOrder && (
                <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-[#DCE6F2]/60 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="btn-glass-primary flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl cursor-pointer shadow-md disabled:opacity-60"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 stroke-[2.4]" />
                    )}
                    <span>{isDownloading ? 'Downloading PDF...' : 'Download PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List & Filter Tools (1 Col) */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Select Vyapar Order ({orders.length})
              </div>
            </div>

            {/* Search Bar, Filter Button & Reset Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('sauda.searchPlaceholder', 'Search DO#, Item, Seller, Buyer, Location, City...')}
                  className="input-sauda !pl-9 !pr-8 text-xs font-semibold"
                />
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2] transition-colors" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    title="Clear Search"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>
                )}
              </div>

              {/* Filter Popup Button */}
              <button
                type="button"
                onClick={handleOpenFilterModal}
                className={`relative h-11 w-11 rounded-xl border flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer ${
                  activeFiltersCount > 0
                    ? 'btn-glass-primary text-white shadow-glass'
                    : 'bg-white/90 dark:bg-slate-800/90 border-[#DCE6F2] dark:border-slate-700/80 text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-slate-800 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_2px_8px_rgba(37,99,235,0.06)] dark:shadow-none backdrop-blur-xl'
                }`}
                title={t('sauda.filterOrders', 'Filter Vyapar Orders')}
                aria-label="Filter orders"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 bg-red-500 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-md animate-in zoom-in-50">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Reset Button: Icon on mobile, Label + Icon on desktop */}
              <button
                type="button"
                onClick={handleResetAll}
                className={`h-11 px-3 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 font-bold text-xs ${
                  hasAnyFilterOrSearch
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'bg-white/90 dark:bg-[#111827]/90 border-[#DCE6F2] dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_1px_3px_rgba(37,99,235,0.04)] dark:shadow-none'
                }`}
                title="Reset Search & Filters"
                aria-label="Reset Search and Filters"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.3]" />
                <span className="hidden sm:inline uppercase tracking-wider font-extrabold text-[11px]">
                  {t('common.reset', 'Reset')}
                </span>
              </button>
            </div>

            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 animate-in fade-in duration-200">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Filters:
                </span>

                {selectedDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
                    <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>{formatDate(selectedDate)}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedDate('')}
                      className="hover:text-red-500 p-0.5 rounded-full cursor-pointer transition-colors"
                      title="Remove Date filter"
                    >
                      <X className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  </span>
                )}

                {selectedItemId !== null && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
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
                      <X className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  </span>
                )}

                {selectedPartyId !== null && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
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
                      <X className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-0.5 uppercase tracking-wider"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Orders Cards List */}
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-0.5">
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className={`p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all min-w-0 overflow-hidden ${
                    selectedOrder?.id === order.id
                      ? 'border-2 border-blue-600 dark:border-blue-400 shadow-glass-hover bg-blue-50/70 dark:bg-blue-950/40 backdrop-blur-md'
                      : 'glass-card-interactive'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-bold gap-2 min-w-0">
                    <span className="text-slate-900 dark:text-slate-100 truncate flex-1" title={`#${order.id} • ${order.itemName}`}>
                      #{order.id} • {order.itemName}
                    </span>
                    <span className="shrink-0 font-extrabold text-blue-600 dark:text-blue-400">
                      {formatCurrency(order.totalBillAmount)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex justify-between items-center gap-2 min-w-0">
                    <span className="truncate flex-1" title={`${order.sellerName} ➔ ${order.buyerName}`}>
                      {order.sellerName} ➔ {order.buyerName}
                    </span>
                    <span className="shrink-0">{formatDate(order.date)}</span>
                  </div>
                </div>
              ))}

              {orders.length > 0 && (
                <div className="text-center py-4 text-slate-400 dark:text-slate-500 text-xs font-medium flex items-center justify-center gap-1.5">
                  <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span>No more orders</span>
                </div>
              )}

              {orders.length === 0 && (
                <div className="p-8 text-center glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <FileSpreadsheet className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <div className="font-bold text-slate-700 dark:text-slate-200 text-xs">No Vyapar orders found</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {hasAnyFilterOrSearch
                      ? 'No orders match your search or filter criteria. Click Reset to clear filters.'
                      : 'No orders found for selected company & financial year.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Active Order Live PDF Preview Pane */}
          {selectedOrder ? (
            <div ref={previewRef} className="lg:col-span-2 min-w-0 animate-in fade-in duration-300">
              <div className="glass-panel p-3.5 sm:p-4 md:p-6 rounded-3xl shadow-glass-card space-y-4">
                {/* Preview Top Header & Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#DCE6F2] dark:border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide truncate">
                      #{selectedOrder.id} • {selectedOrder.itemName}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                      DO #{selectedOrder.doNo || selectedOrder.id}
                    </span>
                  </div>

                  {/* Actions: Download PDF, Print, Close */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* DOWNLOAD PDF */}
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={isDownloading}
                      className="btn-glass-primary flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-black rounded-xl cursor-pointer shadow-md disabled:opacity-60 active:scale-95 transition-all"
                      title="Download PDF"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 stroke-[2.4]" />
                      )}
                      <span>{isDownloading ? 'Saving...' : 'Download PDF'}</span>
                    </button>

                    {/* PRINT */}
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-3 sm:px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
                      title="Print"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Print</span>
                    </button>

                    {/* CLOSE PREVIEW BUTTON */}
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Close Preview"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* The Note Template */}
                <div className="overflow-x-auto pb-2">
                  <SaudaNoteTemplate
                    order={selectedOrder}
                    company={currentCompany || undefined}
                    color={activeColor}
                    template={activeTemplate}
                    showSignature={showSignature}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* When no order is selected: Only shown on desktop (lg+), hidden on mobile so screen is clean! */
            <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center p-16 text-center glass-card rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 min-h-[420px]">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-inner">
                <FileSpreadsheet className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Select an Order to Preview</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Click on any Vyapar order card on the left to view, download as PDF, or print its confirmation note.
              </p>
            </div>
          )}
        </div>
      </div>

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
