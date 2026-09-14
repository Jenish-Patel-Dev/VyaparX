import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Printer, Download, Eye, X, Info } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SaudaNoteTemplate } from '../../components/pdf/SaudaNoteTemplate';
import { saudaService } from '../../services/saudaService';
import { companyService } from '../../services/companyService';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import type { SaudaOrder } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const SaudaBillsPage: React.FC = () => {
  const { currentCompany, currentFinancialYear } = useApp();
  const { palette } = useTheme();
  const [orders, setOrders] = useState<SaudaOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<SaudaOrder | null>(null);
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
    saudaService
      .getAll({
        companyId: currentCompany?.id,
        financialYear: currentFinancialYear,
      })
      .then(data => {
        setOrders(data);
        if (data.length > 0 && !selectedOrder) {
          setSelectedOrder(data[0]);
        }
      });
  }, [currentCompany?.id, currentFinancialYear]);

  const handlePrint = () => {
    window.print();
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
        title="Vyapar Bills & Notes"
        subtitle="Manage and generate printable trade confirmation notes"
      />

      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        {/* Template & Color Selector Bar */}
        <div className="p-4 md:p-5 glass-panel rounded-3xl shadow-glass-card flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">PDF Template:</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setActiveTemplate(num as 1 | 2 | 3 | 4)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeTemplate === num
                      ? 'btn-glass-primary text-white shadow-glass'
                      : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-[#DCE6F2] dark:border-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Note Color:</span>
            <div className="flex gap-1.5">
              {[
                { label: 'RED', hex: '#DC2626' },
                { label: 'ORANGE', hex: '#FF9800' },
                { label: 'BLUE', hex: '#2563EB' },
                { label: 'GREEN', hex: '#059669' },
                { label: 'BLACK', hex: '#111827' },
              ].map(col => (
                <button
                  key={col.label}
                  type="button"
                  onClick={() => setActiveColor(col.label)}
                  style={{ backgroundColor: col.hex }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    activeColor === col.label ? 'scale-125 border-slate-900 dark:border-white ring-2 ring-blue-300 dark:ring-blue-600' : 'border-transparent'
                  }`}
                  title={col.label}
                />
              ))}
            </div>
          </div>

          {/* Show Signature in Vyapar Note PDF Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none py-1">
            <input
              type="checkbox"
              id="billShowSignature"
              checked={showSignature}
              onChange={e => handleSignatureChange(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Show signature in Vyapar Note PDF
            </span>
          </label>

          {selectedOrder && (
            <button
              type="button"
              onClick={handlePrint}
              className="btn-glass-primary flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          )}
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List (1 Col) */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              Select Vyapar Order ({orders.length})
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
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
                  <p className="text-[11px] text-slate-400 mt-1">No orders found for selected company & financial year.</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Order Live PDF Preview (2 Cols) */}
          <div className="lg:col-span-2 min-w-0">
            {selectedOrder ? (
              <div className="glass-panel p-3 sm:p-4 md:p-6 rounded-3xl shadow-glass-card overflow-x-auto">
                <SaudaNoteTemplate
                  order={selectedOrder}
                  company={currentCompany || undefined}
                  color={activeColor}
                  template={activeTemplate}
                  showSignature={showSignature}
                />
              </div>
            ) : (
              <div className="p-16 text-center glass-card rounded-3xl text-slate-400 text-sm">
                Select an order from the left list to view its Vyapar Note
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
