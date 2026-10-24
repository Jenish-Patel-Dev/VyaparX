import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Download, Loader2, Share2 } from 'lucide-react';
import { SaudaNoteTemplate } from '../pdf/SaudaNoteTemplate';
import { companyService } from '../../services/companyService';
import { partyService } from '../../services/partyService';
import { downloadSaudaNotePdf, printSaudaNote } from '../../utils/saudaPdfService';
import { formatDoNo } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import type { SaudaOrder, Company, Party } from '../../types';

interface TradeSlipModalProps {
  order: SaudaOrder | null;
  onClose: () => void;
}

export const TradeSlipModal: React.FC<TradeSlipModalProps> = ({ order, onClose }) => {
  const toast = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [seller, setSeller] = useState<Party | null>(null);
  const [buyer, setBuyer] = useState<Party | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  useEffect(() => {
    if (!order) return;
    let isMounted = true;
    setIsLoadingDetails(true);

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }

    const loadSlipData = async () => {
      try {
        const [comp, sel, buy] = await Promise.all([
          // 1. Fetch Company
          (async () => {
            if (order.companyId) {
              const c = await companyService.getById(order.companyId);
              if (c) return c;
            }
            if (order.userEmail) {
              const allComps = await companyService.getAll(order.userEmail);
              return allComps.find((c) => c.id === order.companyId) || allComps[0];
            }
            return undefined;
          })(),
          // 2. Fetch Seller Party
          (async () => {
            if (order.sellerId) {
              const s = await partyService.getById(order.sellerId);
              if (s) return s;
            }
            if (order.userEmail) {
              const allParties = await partyService.getAll(order.userEmail);
              return allParties.find(
                (p) =>
                  p.id === order.sellerId ||
                  (order.sellerName && p.name.trim().toLowerCase() === order.sellerName.trim().toLowerCase())
              );
            }
            return undefined;
          })(),
          // 3. Fetch Buyer Party
          (async () => {
            if (order.buyerId) {
              const b = await partyService.getById(order.buyerId);
              if (b) return b;
            }
            if (order.userEmail) {
              const allParties = await partyService.getAll(order.userEmail);
              return allParties.find(
                (p) =>
                  p.id === order.buyerId ||
                  (order.buyerName && p.name.trim().toLowerCase() === order.buyerName.trim().toLowerCase())
              );
            }
            return undefined;
          })(),
        ]);

        if (isMounted) {
          setCompany(comp || null);
          setSeller(sel || null);
          setBuyer(buy || null);
        }
      } catch (err) {
        console.warn('Error loading company or party details for trade slip:', err);
      } finally {
        if (isMounted) {
          setIsLoadingDetails(false);
          // Scroll back to top once content is rendered
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = 0;
            }
          }, 50);
        }
      }
    };

    loadSlipData();

    return () => {
      isMounted = false;
    };
  }, [order]);

  if (!order) return null;

  const handlePrint = () => {
    if (order) {
      printSaudaNote(order, 'printable-sauda-note', seller, buyer);
    } else {
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    if (!order) return;
    setIsDownloadingPdf(true);
    try {
      const success = await downloadSaudaNotePdf(
        order,
        company,
        company?.saudaNoteColor || 'RED',
        company?.pdfTemplate || 1,
        company?.showSignature !== false,
        seller,
        buyer
      );
      if (success) {
        toast.success('Vyapar Note PDF downloaded successfully!');
      } else {
        toast.error('Failed to download PDF');
      }
    } catch (err) {
      console.error('PDF download error:', err);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in print:hidden"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#E8EDF3] dark:bg-[#20242D] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden print:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:px-6 border-b border-black/[0.06] dark:border-white/10 flex items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base tracking-tight truncate">
                Vyapar Note {formatDoNo(order.doNo, order.id)} Preview
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {order.userEmail} • {order.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf || isLoadingDetails}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              title="Download PDF"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {isDownloadingPdf ? 'Downloading...' : 'Download PDF'}
              </span>
            </button>

            {/* Print Note Button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isLoadingDetails}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
              title="Print Note"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Note</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Scrollable Slip Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-auto p-3 sm:p-5 md:p-6 bg-slate-100/60 dark:bg-[#181C24] custom-scrollbar"
        >
          {isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center py-28 gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
                Loading Contract Details...
              </span>
            </div>
          ) : (
            <div className="w-fit min-w-[640px] lg:min-w-0 lg:w-full max-w-2xl mx-auto rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 bg-white mb-10 overflow-hidden">
              <div ref={printRef} className="w-full bg-white text-black">
                <SaudaNoteTemplate
                  order={order}
                  company={company || undefined}
                  seller={seller || undefined}
                  buyer={buyer || undefined}
                  color={company?.saudaNoteColor || 'RED'}
                  template={company?.pdfTemplate || 1}
                  showSignature={company?.showSignature !== false}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
