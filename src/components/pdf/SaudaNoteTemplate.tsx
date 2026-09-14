import React from 'react';
import type { SaudaOrder, Company, Party } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface SaudaNoteProps {
  order: Partial<SaudaOrder>;
  company?: Partial<Company>;
  seller?: Partial<Party>;
  buyer?: Partial<Party>;
  color?: string;
  template?: 1 | 2 | 3 | 4;
  showSignature?: boolean;
}

export const SaudaNoteTemplate: React.FC<SaudaNoteProps> = ({
  order,
  company,
  seller,
  buyer,
  color = 'GREEN',
  template = 1,
  showSignature = true,
}) => {
  const colorStyles: Record<string, { border: string; text: string; bg: string; headerBg: string; headerText: string; hex: string }> = {
    GREEN: { border: 'border-emerald-700', text: 'text-emerald-800', bg: 'bg-emerald-50/70', headerBg: 'bg-[#e2f3e5]', headerText: 'text-[#165028]', hex: '#15803d' },
    BLUE: { border: 'border-blue-700', text: 'text-blue-800', bg: 'bg-blue-50/70', headerBg: 'bg-[#e0edfd]', headerText: 'text-[#1e40af]', hex: '#2563EB' },
    RED: { border: 'border-red-700', text: 'text-red-800', bg: 'bg-red-50/70', headerBg: 'bg-[#fee2e2]', headerText: 'text-[#991b1b]', hex: '#DC2626' },
    ORANGE: { border: 'border-orange-700', text: 'text-orange-800', bg: 'bg-orange-50/70', headerBg: 'bg-[#ffedd5]', headerText: 'text-[#9a3412]', hex: '#ea580c' },
    BLACK: { border: 'border-slate-800', text: 'text-slate-900', bg: 'bg-slate-100/70', headerBg: 'bg-[#e2e8f0]', headerText: 'text-[#0f172a]', hex: '#0f172a' },
  };

  const activeTheme = colorStyles[color?.toUpperCase() || 'GREEN'] || colorStyles.GREEN;

  const compName = company?.name || 'PATIDAR FIBERS SOLUTION';
  const compAddr = company?.address || 'PALIYAD ROAD BOTAD';
  const compCityState = `${company?.city || 'BOTAD'}, ${company?.state || 'GUJARAT'}${company?.pinCode ? ' - ' + company.pinCode : ''}`;
  const compPhone = company?.contactNumber || '9574823170';

  const orderDoNo = order.doNo || `${(order.date || '').replace(/-/g, '')}${String(order.id || 1).padStart(3, '0')}`;

  const formatLongDate = (dateStr?: string) => {
    if (!dateStr) return '09 APRIL 2026';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
    }
    return dateStr;
  };
  const billDateLong = formatLongDate(order.date);

  const itemName = order.itemName || 'COTTON';
  const itemQuality = order.itemQuality || 'A-1';
  const quantity = order.quantity || 100;
  const unit = order.unit || 'CANDY';
  const billRate = order.billRate || 3723;
  const totalAmount = order.totalBillAmount || quantity * billRate;
  const payTerms = order.paymentTerms || '15';

  const sellerName = order.sellerName || seller?.name || 'VIVEK';
  const sellerGst = seller?.gstNumber || order.sellerContactPerson || 'Kbashjsa323';
  const sellerLoc = order.sellerLocation || seller?.address || 'Ahmedabad';
  const sellerCity = order.sellerCity || seller?.city || '';
  const sellerFullLocation = [sellerLoc, sellerCity].filter(Boolean).join(', ') || 'Ahmedabad';
  const sellerComm = `${order.sellerCommissionRate ?? 2.4} %`;

  const buyerName = order.buyerName || buyer?.name || 'JENISH';
  const buyerGst = buyer?.gstNumber || order.buyerContactPerson || 'Kbashjsa323';
  const buyerLoc = order.buyerLocation || buyer?.address || 'Botad';
  const buyerCity = order.buyerCity || buyer?.city || '';
  const buyerFullLocation = [buyerLoc, buyerCity].filter(Boolean).join(', ') || 'Botad';
  const buyerComm = `${order.buyerCommissionRate ?? 2.3} %`;

  const rdValue = order.rdValue || 'A-1';
  const stapleLength = order.stapleLength || '30';
  const mic = order.mic || '4-5';
  const trash = order.trashPercent ? `${order.trashPercent} %` : '3.5 %';
  const moisture = order.moisturePercent ? `${order.moisturePercent} %` : '5.3 %';

  // TEMPLATE 1: Exact Confirmation of Sales & Purchase (Matches Uploaded Image)
  if (template === 1) {
    return (
      <div 
        id="printable-sauda-note" 
        className="bg-white p-7 sm:p-9 rounded-xl border border-gray-300 shadow-sm max-w-2xl mx-auto text-xs text-black font-sans leading-normal"
        style={{ minHeight: '840px' }}
      >
        {/* Top Header: Logo on left, Company Name & Subtitle centered */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b-2 border-emerald-800">
          <div className="w-14 h-14 shrink-0 rounded-full border-2 border-emerald-700 flex items-center justify-center p-1 bg-emerald-50 overflow-hidden">
            {company?.logo ? (
              <img src={company.logo} alt={compName} className="w-full h-full object-contain rounded-full" />
            ) : (
              <svg viewBox="0 0 48 48" className="w-10 h-10 text-emerald-800" fill="currentColor">
                <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M24 10 C18 16 16 26 24 38 C32 26 30 16 24 10 Z" fill="currentColor" opacity="0.85" />
                <circle cx="24" cy="24" r="4" fill="#ffffff" />
              </svg>
            )}
          </div>
          <div className="text-center flex-1 pr-14">
            <h1 className="text-xl sm:text-2xl font-black text-emerald-800 uppercase tracking-wide">
              {compName}
            </h1>
            <p className="text-xs font-extrabold text-gray-800 tracking-tight mt-0.5">
              Confirmation of Sales & Purchase
            </p>
          </div>
        </div>

        {/* DO NO. */}
        <div className="text-right py-2">
          <span className="font-black text-xs text-gray-900 tracking-wide">
            DO NO. : {orderDoNo}
          </span>
        </div>

        {/* Content Tables matching exact uploaded image */}
        <div className="space-y-4">
          {/* 1. Transaction Overview */}
          <div className="border border-black overflow-hidden">
            <div className={`${activeTheme.headerBg} ${activeTheme.headerText} text-center font-black py-1 text-xs uppercase tracking-wide border-b border-black`}>
              Transaction Overview
            </div>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Bill Date</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{billDateLong}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Broker Name</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{compName}</td>
                </tr>
                <tr>
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Commodity / Item Name</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{itemName}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Buyer Information */}
          <div className="border border-black overflow-hidden">
            <div className={`${activeTheme.headerBg} ${activeTheme.headerText} text-center font-black py-1 text-xs uppercase tracking-wide border-b border-black`}>
              Buyer Information
            </div>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Buyer Name</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900 uppercase">{buyerName}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">GST Number</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{buyerGst}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Shipping Location</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{buyerFullLocation}</td>
                </tr>
                <tr>
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Buyer Commission %</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-bold text-gray-900">{buyerComm}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Seller Information */}
          <div className="border border-black overflow-hidden">
            <div className={`${activeTheme.headerBg} ${activeTheme.headerText} text-center font-black py-1 text-xs uppercase tracking-wide border-b border-black`}>
              Seller Information
            </div>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Seller Name</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900 uppercase">{sellerName}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">GST Number</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{sellerGst}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Pickup Location</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{sellerFullLocation}</td>
                </tr>
                <tr>
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Seller Commission %</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-bold text-gray-900">{sellerComm}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. Material & Quality */}
          <div className="border border-black overflow-hidden">
            <div className={`${activeTheme.headerBg} ${activeTheme.headerText} text-center font-black py-1 text-xs uppercase tracking-wide border-b border-black`}>
              Material & Quality
            </div>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Quality</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{itemQuality}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Quantity</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{quantity} {unit}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Rate (Per {unit})</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-bold text-gray-900">{billRate} Rs.</td>
                </tr>
                <tr>
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Payment Terms (Days)</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{payTerms}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. Technical Parameters */}
          <div className="border border-black overflow-hidden">
            <div className={`${activeTheme.headerBg} ${activeTheme.headerText} text-center font-black py-1 text-xs uppercase tracking-wide border-b border-black`}>
              Technical Parameters
            </div>
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">RD Value</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{rdValue}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Staple Length (MM)</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{stapleLength}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Mic</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{mic}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Trash %</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{trash}</td>
                </tr>
                <tr>
                  <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Moisture %</td>
                  <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{moisture}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-3 border-t border-gray-400 flex items-center justify-between text-[11px] font-bold text-gray-600">
          <span>1 | P a g e</span>
          {showSignature && (
            <span className="text-right">Authorized Signatory • {compName}</span>
          )}
        </div>
      </div>
    );
  }

  // TEMPLATE 2: Modern Table / Columnar Layout (Includes All Data)
  if (template === 2) {
    return (
      <div 
        id="printable-sauda-note" 
        className="bg-white p-7 rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto text-xs text-gray-800 font-sans"
      >
        <div className="p-4 rounded-xl text-white mb-4 flex justify-between items-center" style={{ backgroundColor: activeTheme.hex }}>
          <div>
            <h2 className="text-lg font-black tracking-wide">{compName}</h2>
            <p className="text-[10px] opacity-90">{compAddr}, {compCityState}</p>
          </div>
          <div className="text-right text-[10px]">
            <div className="font-black text-sm">DO NO. : {orderDoNo}</div>
            <div>{billDateLong}</div>
          </div>
        </div>

        {/* Parties Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
            <div className="font-black text-[11px]" style={{ color: activeTheme.hex }}>SELLER INFORMATION</div>
            <div className="font-bold text-gray-900 uppercase">{sellerName}</div>
            <div className="text-[10px] text-gray-600">GST: {sellerGst}</div>
            <div className="text-[10px] text-gray-600">Pickup: {sellerFullLocation}</div>
            <div className="text-[10px] font-bold text-gray-900 pt-0.5">Commission: {sellerComm}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
            <div className="font-black text-[11px]" style={{ color: activeTheme.hex }}>BUYER INFORMATION</div>
            <div className="font-bold text-gray-900 uppercase">{buyerName}</div>
            <div className="text-[10px] text-gray-600">GST: {buyerGst}</div>
            <div className="text-[10px] text-gray-600">Shipping: {buyerFullLocation}</div>
            <div className="text-[10px] font-bold text-gray-900 pt-0.5">Commission: {buyerComm}</div>
          </div>
        </div>

        {/* Commodity Table */}
        <table className="w-full border-collapse border border-gray-200 text-[11px] mb-4">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border border-gray-200 p-2 text-left">Commodity Item</th>
              <th className="border border-gray-200 p-2 text-left">Quality</th>
              <th className="border border-gray-200 p-2 text-right">Quantity</th>
              <th className="border border-gray-200 p-2 text-right">Rate</th>
              <th className="border border-gray-200 p-2 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 p-2 font-bold">{itemName}</td>
              <td className="border border-gray-200 p-2">{itemQuality}</td>
              <td className="border border-gray-200 p-2 text-right font-semibold">{quantity} {unit}</td>
              <td className="border border-gray-200 p-2 text-right">{billRate} Rs.</td>
              <td className="border border-gray-200 p-2 text-right font-black" style={{ color: activeTheme.hex }}>
                {formatCurrency(totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Technical Parameters Grid */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
          <div className="font-black text-[11px] mb-2" style={{ color: activeTheme.hex }}>TECHNICAL PARAMETERS</div>
          <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
            <div className="border border-gray-200 bg-white p-1.5 rounded">
              <div className="text-gray-500">RD VALUE</div>
              <div className="font-bold">{rdValue}</div>
            </div>
            <div className="border border-gray-200 bg-white p-1.5 rounded">
              <div className="text-gray-500">STAPLE (MM)</div>
              <div className="font-bold">{stapleLength}</div>
            </div>
            <div className="border border-gray-200 bg-white p-1.5 rounded">
              <div className="text-gray-500">MIC</div>
              <div className="font-bold">{mic}</div>
            </div>
            <div className="border border-gray-200 bg-white p-1.5 rounded">
              <div className="text-gray-500">TRASH %</div>
              <div className="font-bold">{trash}</div>
            </div>
            <div className="border border-gray-200 bg-white p-1.5 rounded">
              <div className="text-gray-500">MOISTURE %</div>
              <div className="font-bold">{moisture}</div>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-gray-600 mb-4">
          <strong>Payment Terms:</strong> {payTerms} Days
        </div>

        {showSignature && (
          <div className="mt-8 flex justify-between items-end text-[10px] pt-4 border-t border-gray-200">
            <div className="text-gray-400">1 | Page • Prepared by VyaparX</div>
            <div className="text-center font-semibold text-gray-800">
              <div className="h-8 border-b border-gray-400 w-36 mb-1"></div>
              <div>Authorized Signatory</div>
              <div className="text-[9px] text-gray-500">For {compName}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // TEMPLATE 3: Executive Clean Card Layout
  if (template === 3) {
    return (
      <div 
        id="printable-sauda-note" 
        className="bg-white p-7 rounded-2xl border border-gray-200 shadow-sm max-w-2xl mx-auto text-xs text-gray-800 font-sans"
      >
        <div className="border-b-2 pb-4 mb-4 flex justify-between items-start" style={{ borderColor: activeTheme.hex }}>
          <div>
            <h1 className="text-xl font-black" style={{ color: activeTheme.hex }}>{compName}</h1>
            <p className="text-[10px] text-gray-500 font-medium">Confirmation of Sales & Purchase</p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full inline-block">
              DO NO. : {orderDoNo}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">{billDateLong}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 space-y-1">
            <div className="text-gray-400 font-bold text-[10px] uppercase">Seller (Party A)</div>
            <div className="text-sm font-bold text-gray-900 uppercase">{sellerName}</div>
            <div className="text-[10px] text-gray-600">Pickup: {sellerFullLocation}</div>
            <div className="text-[10px] font-semibold text-emerald-700">Commission: {sellerComm}</div>
          </div>
          <div className="p-3.5 rounded-xl border border-gray-100 bg-gray-50 space-y-1">
            <div className="text-gray-400 font-bold text-[10px] uppercase">Buyer (Party B)</div>
            <div className="text-sm font-bold text-gray-900 uppercase">{buyerName}</div>
            <div className="text-[10px] text-gray-600">Shipping: {buyerFullLocation}</div>
            <div className="text-[10px] font-semibold text-sky-700">Commission: {buyerComm}</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm text-gray-900">{itemName} ({itemQuality})</span>
            <span className="text-base font-black" style={{ color: activeTheme.hex }}>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="text-[11px] text-gray-600 flex justify-between">
            <span>Quantity: <strong>{quantity} {unit}</strong></span>
            <span>Rate: <strong>{billRate} Rs.</strong></span>
            <span>Payment: <strong>{payTerms} Days</strong></span>
          </div>
        </div>

        {/* Technical Parameters */}
        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 mb-4">
          <div className="font-bold text-[10px] text-gray-500 uppercase mb-1.5">Technical Parameters</div>
          <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
            <div><span className="text-gray-400 block">RD:</span> <strong>{rdValue}</strong></div>
            <div><span className="text-gray-400 block">Length:</span> <strong>{stapleLength} mm</strong></div>
            <div><span className="text-gray-400 block">Mic:</span> <strong>{mic}</strong></div>
            <div><span className="text-gray-400 block">Trash:</span> <strong>{trash}</strong></div>
            <div><span className="text-gray-400 block">Moisture:</span> <strong>{moisture}</strong></div>
          </div>
        </div>

        {showSignature && (
          <div className="pt-4 flex justify-between items-end text-[10px] border-t border-gray-100">
            <span className="text-gray-400">1 | Page</span>
            <div className="text-center font-medium text-gray-600">
              <div className="w-28 border-b border-gray-300 pb-6 mb-1"></div>
              <span>For {compName}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // TEMPLATE 4: Compact Official Voucher
  return (
    <div 
      id="printable-sauda-note" 
      className="bg-white p-7 rounded-xl border-4 shadow-sm max-w-2xl mx-auto text-xs font-sans"
      style={{ borderColor: activeTheme.hex }}
    >
      <div className="text-center border-b pb-3 mb-3" style={{ borderColor: activeTheme.hex }}>
        <h2 className="text-lg font-black uppercase tracking-wider" style={{ color: activeTheme.hex }}>
          {compName}
        </h2>
        <p className="text-[10px] text-gray-500">{compAddr} • {compCityState} • Phone: {compPhone}</p>
        <div className="mt-1 font-bold text-xs uppercase tracking-widest text-gray-800">
          Confirmation DO NO. : {orderDoNo} • Date: {billDateLong}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-[11px]">
        <div className="border border-gray-200 p-2.5 rounded-lg space-y-0.5">
          <div className="font-bold text-[10px] uppercase text-emerald-700">Seller Details</div>
          <div className="font-black text-gray-900 uppercase">{sellerName}</div>
          <div className="text-[10px] text-gray-600">Pickup: {sellerFullLocation}</div>
          <div className="text-[10px] font-bold text-gray-900">Commission: {sellerComm}</div>
        </div>
        <div className="border border-gray-200 p-2.5 rounded-lg space-y-0.5">
          <div className="font-bold text-[10px] uppercase text-sky-700">Buyer Details</div>
          <div className="font-black text-gray-900 uppercase">{buyerName}</div>
          <div className="text-[10px] text-gray-600">Shipping: {buyerFullLocation}</div>
          <div className="text-[10px] font-bold text-gray-900">Commission: {buyerComm}</div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-3 mb-3">
        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
          <div>
            <div className="text-gray-400">COMMODITY</div>
            <div className="font-bold text-gray-900 text-xs">{itemName}</div>
          </div>
          <div>
            <div className="text-gray-400">QUALITY</div>
            <div className="font-bold text-gray-900 text-xs">{itemQuality}</div>
          </div>
          <div>
            <div className="text-gray-400">QTY</div>
            <div className="font-bold text-gray-900 text-xs">{quantity} {unit}</div>
          </div>
          <div>
            <div className="text-gray-400">RATE</div>
            <div className="font-bold text-gray-900 text-xs">{billRate} Rs.</div>
          </div>
        </div>
      </div>

      {/* Technical Parameters */}
      <div className="border border-gray-200 rounded-lg p-2.5 mb-3 text-[10px]">
        <div className="font-bold text-gray-500 uppercase mb-1">Technical Parameters</div>
        <div className="grid grid-cols-5 gap-1 text-center font-semibold">
          <div>RD: {rdValue}</div>
          <div>Length: {stapleLength}mm</div>
          <div>Mic: {mic}</div>
          <div>Trash: {trash}</div>
          <div>Moisture: {moisture}</div>
        </div>
      </div>

      <div className="text-[10px] text-gray-600 space-y-0.5 mb-3">
        <div><strong>Payment Terms:</strong> {payTerms} Days</div>
      </div>

      {showSignature && (
        <div className="flex justify-between items-end mt-4 pt-2 border-t border-gray-100 text-[10px]">
          <div className="text-gray-400">1 | Page</div>
          <div className="font-bold text-gray-700">Authorized Signature • {compName}</div>
        </div>
      )}
    </div>
  );
};
