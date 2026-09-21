import React from 'react';
import type { SaudaOrder, Company, Party } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { formatSaudaFooterDateTime } from '../../utils/saudaPdfService';

interface SaudaNoteProps {
  order: Partial<SaudaOrder>;
  company?: Partial<Company>;
  seller?: Partial<Party>;
  buyer?: Partial<Party>;
  color?: string;
  template?: 1 | 2;
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

  const compName = company?.name || 'COMPANY NAME';
  const compAddr = company?.address || 'Address';
  const compCityState = `${company?.city || 'City'}, ${company?.state || 'State'}${company?.pinCode ? ' - ' + company.pinCode : ''}`;
  const compPhone = company?.contactNumber || '9876543210';
  const compEmail = company?.email || 'xyzdemotest@gmail.com';

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

  const itemName = order.itemName || 'COMMODITY NAME';
  const itemQuality = order.itemQuality || 'A-1';
  const quantity = order.quantity || 100;
  const unit = order.unit || 'CANDY';
  const billRate = order.billRate || 3723;
  const totalAmount = order.totalBillAmount || (quantity * billRate);
  const payTerms = order.paymentTerms || '15';

  const sellerName = order.sellerName || seller?.name || 'SELLER NAME';
  const sellerGst = seller?.gstNumber || order.sellerContactPerson || '24XXXXXXXXXX1Z5';
  const sellerLoc = order.sellerLocation || seller?.address || 'Address';
  const sellerCity = order.sellerCity || seller?.city || '';
  const sellerFullLocation = [sellerLoc, sellerCity].filter(Boolean).join(', ') || 'Address, City';
  const sellerComm = `${order.sellerCommissionRate ?? 2.5} %`;

  const buyerName = order.buyerName || buyer?.name || 'BUYER NAME';
  const buyerGst = buyer?.gstNumber || order.buyerContactPerson || '24XXXXXXXXXX1Z5';
  const buyerLoc = order.buyerLocation || buyer?.address || 'Address';
  const buyerCity = order.buyerCity || buyer?.city || '';
  const buyerFullLocation = [buyerLoc, buyerCity].filter(Boolean).join(', ') || 'Address, City';
  const buyerComm = `${order.buyerCommissionRate ?? 2.5} %`;

  const rdValue = order.rdValue || 'A-1';
  const stapleLength = order.stapleLength || '30';
  const mic = order.mic || '4-5';
  const trash = order.trashPercent ? `${order.trashPercent} %` : '3.5 %';
  const moisture = order.moisturePercent ? `${order.moisturePercent} %` : '5.3 %';

  // Live Dynamic Date-Time formatted as: "21 September 2026 11:23 am" (auto-updates continuously)
  const [liveDateTime, setLiveDateTime] = React.useState<string>(() => formatSaudaFooterDateTime());

  React.useEffect(() => {
    setLiveDateTime(formatSaudaFooterDateTime());
    const interval = setInterval(() => {
      setLiveDateTime(formatSaudaFooterDateTime());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Standard Unified Footer Across All Templates
  const renderUnifiedFooter = () => (
    <div className="mt-auto pt-3 border-t border-gray-300 flex items-center justify-between text-[10px] text-gray-500 font-medium tracking-normal select-none">
      <span className="font-bold text-gray-700 tracking-wider">VyaparX</span>
      <span className="font-semibold text-gray-600">Page 1 of 1</span>
      <span className="note-footer-datetime font-medium text-gray-500">{liveDateTime}</span>
    </div>
  );

  // ====================================================================================
  // TEMPLATE 1: Exact Confirmation of Sales & Purchase (Full Page A4, Table-Fixed Alignment)
  // ====================================================================================
  if (template === 1) {
    return (
      <div 
        id="printable-sauda-note" 
        className="bg-white p-5 sm:p-6 md:p-8 w-full min-w-[640px] lg:min-w-0 max-w-2xl mx-auto text-xs text-black leading-normal flex flex-col justify-between print:min-w-0 print:w-full print:p-0 print:border-none print:shadow-none print:max-w-none print:rounded-none print:m-0"
        style={{ 
          minHeight: '960px',
          fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
        }}
      >
        <div>
          {/* Top Header: Company details centered, no left logo */}
          <div className="text-center pb-2.5 border-b-2" style={{ borderColor: activeTheme.hex }}>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide" style={{ color: activeTheme.hex, lineHeight: '28px' }}>
              {compName}
            </h1>
            <p className="text-[11px] text-gray-700 font-medium mt-0.5" style={{ lineHeight: '16px' }}>
              {compAddr}, {compCityState}
            </p>
            <p className="text-[10px] text-gray-600 font-medium" style={{ lineHeight: '14px' }}>
              Phone: {compPhone} • {compEmail}
            </p>
          </div>

          {/* DO NO. */}
          <div className="text-right py-2">
            <span className="font-black text-xs text-gray-900 tracking-wide" style={{ lineHeight: '16px' }}>
              DO NO. : {orderDoNo}
            </span>
          </div>

          {/* Content Tables matching exact uploaded image */}
          <div className="space-y-3.5">
            {/* 1. Transaction Overview */}
            <div className="border border-black overflow-hidden">
              <div className={`${activeTheme.headerBg} ${activeTheme.headerText} text-center font-black py-1 text-xs uppercase tracking-wide border-b border-black`}>
                Transaction Overview
              </div>
              <table className="w-full text-xs border-collapse table-fixed">
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
              <table className="w-full text-xs border-collapse table-fixed">
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
              <table className="w-full text-xs border-collapse table-fixed">
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
              <table className="w-full text-xs border-collapse table-fixed">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Quality</td>
                    <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{itemQuality}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="w-2/5 p-1.5 px-2.5 font-bold border-r border-black">Quantity</td>
                    <td className="w-3/5 p-1.5 px-2.5 font-semibold text-gray-900">{quantity}</td>
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
              <table className="w-full text-xs border-collapse table-fixed">
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
        </div>

        {/* Bottom Section: Authorized Signatory (No 'For {compName}') & Unified Footer */}
        <div className="mt-auto pt-4 note-bottom-section">
          {showSignature && (
            <div className="flex justify-end pb-3">
              <div className="text-center font-bold text-xs text-gray-800">
                <div className="w-48 border-b border-gray-400 mb-1"></div>
                <div>Authorized Signatory</div>
              </div>
            </div>
          )}
          {renderUnifiedFooter()}
        </div>
      </div>
    );
  }

  // ====================================================================================
  // TEMPLATE 2: Modern Executive Corporate Sauda Contract (Pure Flexbox, Zero Grid Misalignment)
  // ====================================================================================
  return (
    <div 
      id="printable-sauda-note" 
      className="bg-white p-5 sm:p-6 md:p-8 w-full min-w-[640px] lg:min-w-0 max-w-2xl mx-auto text-xs text-gray-800 leading-normal flex flex-col justify-between print:min-w-0 print:w-full print:p-0 print:border-none print:shadow-none print:max-w-none print:rounded-none print:m-0"
      style={{ 
        minHeight: '960px',
        fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
      }}
    >
      <div>
        {/* Top Header Row: ONLY Company Details (Clean, no DO/Date crowding) */}
        <div className="flex items-center justify-center pb-3 border-b-2" style={{ borderColor: activeTheme.hex }}>
          {company?.logo ? (
            <div 
              className="w-14 h-14 shrink-0 rounded-xl border flex items-center justify-center p-1 bg-gray-50 overflow-hidden shadow-2xs mr-3.5" 
              style={{ borderColor: activeTheme.hex }}
            >
              <img src={company.logo} alt={compName} className="w-full h-full object-contain rounded-lg" />
            </div>
          ) : null}
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight" style={{ color: activeTheme.hex, lineHeight: '28px' }}>
              {compName}
            </h1>
            <p className="text-[11px] text-gray-600 font-medium mt-0.5" style={{ lineHeight: '16px' }}>
              {compAddr}, {compCityState}
            </p>
            <p className="text-[10px] text-gray-500 font-medium" style={{ lineHeight: '14px' }}>
              Phone: {compPhone} • {compEmail}
            </p>
          </div>
        </div>

        {/* Separate Sub-Bar: DO NO and Sauda Date */}
        <div className="mt-3.5 flex items-center justify-between pb-0.5">
          <div 
            className="px-3 py-1.5 rounded-lg text-white font-black text-xs tracking-wider shadow-2xs shrink-0" 
            style={{ backgroundColor: activeTheme.hex, lineHeight: '16px' }}
          >
            DO NO. : {orderDoNo}
          </div>

          <div 
            className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-800 text-[11px] font-bold shrink-0"
            style={{ lineHeight: '16px' }}
          >
            Date: <span className="font-extrabold text-gray-900">{billDateLong}</span>
          </div>
        </div>

        {/* Parties Cards - Two-column 49% layout with explicit margins and line-heights */}
        <div className="flex justify-between mt-3.5">
          {/* Seller Box */}
          <div className="w-[49%] p-3 rounded-xl border border-gray-200 bg-[#f8fafc] flex flex-col justify-between" style={{ minHeight: '135px' }}>
            <div>
              <div 
                className="text-[11px] font-black uppercase tracking-wider pb-1 border-b border-gray-200 mb-1.5" 
                style={{ color: activeTheme.hex, lineHeight: '14px' }}
              >
                Seller Details
              </div>
              <div className="text-sm font-extrabold text-gray-900 uppercase mb-1.5 break-words" style={{ lineHeight: '18px' }}>
                {sellerName}
              </div>
              <div className="text-xs text-gray-700 mb-1.5 break-words" style={{ lineHeight: '16px' }}>
                <span className="font-semibold text-gray-500">GSTIN: </span>
                <span className="font-bold text-gray-900">{sellerGst}</span>
              </div>
              <div className="text-xs text-gray-700 mb-1.5 break-words" style={{ lineHeight: '16px' }}>
                <span className="font-semibold text-gray-500">Dispatch / Pickup: </span>
                <span className="font-medium text-gray-800">{sellerFullLocation}</span>
              </div>
            </div>
            <div className="text-xs pt-1.5 text-gray-800 flex items-center justify-between border-t border-gray-200/80 mt-1" style={{ lineHeight: '16px' }}>
              <span className="font-semibold text-gray-500">Seller Commission:</span>
              <span className="font-black px-2 py-0.5 rounded bg-white border border-gray-200" style={{ color: activeTheme.hex, lineHeight: '14px' }}>
                {sellerComm}
              </span>
            </div>
          </div>

          {/* Buyer Box */}
          <div className="w-[49%] p-3 rounded-xl border border-gray-200 bg-[#f8fafc] flex flex-col justify-between" style={{ minHeight: '135px' }}>
            <div>
              <div 
                className="text-[11px] font-black uppercase tracking-wider pb-1 border-b border-gray-200 mb-1.5" 
                style={{ color: activeTheme.hex, lineHeight: '14px' }}
              >
                Buyer Details
              </div>
              <div className="text-sm font-extrabold text-gray-900 uppercase mb-1.5 break-words" style={{ lineHeight: '18px' }}>
                {buyerName}
              </div>
              <div className="text-xs text-gray-700 mb-1.5 break-words" style={{ lineHeight: '16px' }}>
                <span className="font-semibold text-gray-500">GSTIN: </span>
                <span className="font-bold text-gray-900">{buyerGst}</span>
              </div>
              <div className="text-xs text-gray-700 mb-1.5 break-words" style={{ lineHeight: '16px' }}>
                <span className="font-semibold text-gray-500">Delivery / Shipping: </span>
                <span className="font-medium text-gray-800">{buyerFullLocation}</span>
              </div>
            </div>
            <div className="text-xs pt-1.5 text-gray-800 flex items-center justify-between border-t border-gray-200/80 mt-1" style={{ lineHeight: '16px' }}>
              <span className="font-semibold text-gray-500">Buyer Commission:</span>
              <span className="font-black px-2 py-0.5 rounded bg-white border border-gray-200" style={{ color: activeTheme.hex, lineHeight: '14px' }}>
                {buyerComm}
              </span>
            </div>
          </div>
        </div>

        {/* Commodity & Financial Overview Table */}
        <div className="mt-3.5 border border-gray-300 rounded-xl overflow-hidden">
          <div 
            className="px-3 py-1.5 font-black text-xs uppercase tracking-wider border-b border-gray-300" 
            style={{ backgroundColor: activeTheme.headerBg, color: activeTheme.headerText, lineHeight: '16px' }}
          >
            Material & Transaction Overview
          </div>
          <table className="w-full text-xs border-collapse table-fixed">
            <thead>
              <tr className="bg-gray-100/90 text-gray-700 font-bold border-b border-gray-300 text-[11px]">
                <th className="p-2 text-center w-10 border-r border-gray-200" style={{ verticalAlign: 'middle', lineHeight: '16px' }}>Sr.</th>
                <th className="p-2 text-left w-2/5 border-r border-gray-200" style={{ verticalAlign: 'middle', lineHeight: '16px' }}>Commodity Item Description</th>
                <th className="p-2 text-left w-1/6 border-r border-gray-200" style={{ verticalAlign: 'middle', lineHeight: '16px' }}>Quality</th>
                <th className="p-2 text-right w-1/6 border-r border-gray-200" style={{ verticalAlign: 'middle', lineHeight: '16px' }}>Quantity</th>
                <th className="p-2 text-right w-1/6 border-r border-gray-200" style={{ verticalAlign: 'middle', lineHeight: '16px' }}>Rate ({unit})</th>
                <th className="p-2 text-right w-1/5" style={{ verticalAlign: 'middle', lineHeight: '16px' }}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="p-2 text-center font-bold text-gray-500 border-r border-gray-200" style={{ verticalAlign: 'middle', lineHeight: '18px' }}>01</td>
                <td className="p-2 font-extrabold text-gray-900 border-r border-gray-200 break-words" style={{ verticalAlign: 'middle', lineHeight: '18px' }}>{itemName}</td>
                <td className="p-2 font-semibold text-gray-800 border-r border-gray-200 break-words" style={{ verticalAlign: 'middle', lineHeight: '18px' }}>{itemQuality}</td>
                <td className="p-2 text-right font-bold text-gray-900 border-r border-gray-200" style={{ verticalAlign: 'middle', lineHeight: '18px' }}>{quantity}</td>
                <td className="p-2 text-right font-bold text-gray-900 border-r border-gray-200" style={{ verticalAlign: 'middle', lineHeight: '18px' }}>{billRate} Rs.</td>
                <td className="p-2 text-right font-black text-xs" style={{ verticalAlign: 'middle', lineHeight: '18px', color: activeTheme.hex }}>
                  {formatCurrency(totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="bg-gray-50 p-2.5 px-3 flex items-center justify-between text-xs border-t border-gray-200">
            <div className="flex items-center text-[11px] text-gray-700" style={{ lineHeight: '16px' }}>
              <span><strong>Payment Terms:</strong> {payTerms} Days</span>
              <span className="mx-2">•</span>
              <span><strong>Unit:</strong> {unit}</span>
            </div>
            <div className="text-right" style={{ lineHeight: '16px' }}>
              <span className="font-bold text-gray-700 mr-2">Net Bill Amount:</span>
              <span className="text-xs font-black" style={{ color: activeTheme.hex }}>
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Technical Parameters Matrix - Pure Flexbox (Perfect alignment) */}
        <div className="mt-3.5 border border-gray-300 rounded-xl overflow-hidden">
          <div 
            className="px-3 py-1 font-black text-xs uppercase tracking-wider border-b border-gray-300" 
            style={{ backgroundColor: activeTheme.headerBg, color: activeTheme.headerText, lineHeight: '16px' }}
          >
            Technical & Quality Parameters
          </div>
          <div className="flex divide-x divide-gray-300 text-center bg-white">
            <div className="w-1/5 p-2" style={{ verticalAlign: 'middle', lineHeight: '16px' }}>
              <div className="text-[10px] font-bold text-gray-500 uppercase" style={{ lineHeight: '14px' }}>RD Value</div>
              <div className="text-xs font-black text-gray-900 mt-1" style={{ lineHeight: '16px' }}>{rdValue}</div>
            </div>
            <div className="w-1/5 p-2" style={{ verticalAlign: 'middle', lineHeight: '16px' }}>
              <div className="text-[10px] font-bold text-gray-500 uppercase" style={{ lineHeight: '14px' }}>Staple Length</div>
              <div className="text-xs font-black text-gray-900 mt-1" style={{ lineHeight: '16px' }}>{stapleLength} mm</div>
            </div>
            <div className="w-1/5 p-2" style={{ verticalAlign: 'middle', lineHeight: '16px' }}>
              <div className="text-[10px] font-bold text-gray-500 uppercase" style={{ lineHeight: '14px' }}>Micronaire</div>
              <div className="text-xs font-black text-gray-900 mt-1" style={{ lineHeight: '16px' }}>{mic}</div>
            </div>
            <div className="w-1/5 p-2" style={{ verticalAlign: 'middle', lineHeight: '16px' }}>
              <div className="text-[10px] font-bold text-gray-500 uppercase" style={{ lineHeight: '14px' }}>Trash %</div>
              <div className="text-xs font-black text-gray-900 mt-1" style={{ lineHeight: '16px' }}>{trash}</div>
            </div>
            <div className="w-1/5 p-2" style={{ verticalAlign: 'middle', lineHeight: '16px' }}>
              <div className="text-[10px] font-bold text-gray-500 uppercase" style={{ lineHeight: '14px' }}>Moisture %</div>
              <div className="text-xs font-black text-gray-900 mt-1" style={{ lineHeight: '16px' }}>{moisture}</div>
            </div>
          </div>
        </div>

        {/* Standard Trade Conditions & Terms */}
        <div className="mt-3.5 p-3 rounded-xl border border-gray-200 bg-[#f8fafc] text-[11px] text-gray-600 space-y-1">
          <div className="font-extrabold text-gray-800 uppercase tracking-wider text-[10px]" style={{ lineHeight: '14px' }}>
            Standard Trade Conditions & Terms
          </div>
          <div className="space-y-1 pt-1 leading-relaxed text-[11px]">
            <div>• Payment must be settled within the agreed <strong>{payTerms} days</strong> from delivery date.</div>
            <div>• Weight and sample verification to be conducted at the time of delivery/unloading.</div>
            <div>• Quality, staple length and moisture are subject to standard commodity market arbitration rules.</div>
            <div>• Brokerage is payable to <strong>{compName}</strong> by both parties as stated.</div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Authorized Signatory only (No buyer/seller left side, No 'For {compName}') & Unified Footer */}
      <div className="mt-auto pt-4 note-bottom-section">
        {showSignature && (
          <div className="flex justify-end pb-3">
            <div className="text-center font-bold text-xs text-gray-800" style={{ lineHeight: '16px' }}>
              <div className="w-48 border-b border-gray-400 mb-1"></div>
              <div>Authorized Signatory</div>
            </div>
          </div>
        )}
        {renderUnifiedFooter()}
      </div>
    </div>
  );
};
