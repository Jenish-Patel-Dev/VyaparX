import jsPDF from 'jspdf';
import type { SaudaOrder, Company, Party } from '../types';
import { formatCurrency } from './formatters';

/**
 * Converts a name (item, buyer, seller) into Title-Cased words joined by hyphens (-).
 * - First letter of each word is capitalized.
 * - Words are joined by a hyphen (-).
 * Example: "Hanumant Fiber" -> "Hanumant-Fiber"
 * Example: "KAPAS SHANKAR" -> "Kapas-Shankar"
 * Example: "cotton bales" -> "Cotton-Bales"
 */
export const formatNameToHyphenatedTitleCase = (val?: string | number, fallback = ''): string => {
  if (!val) return fallback;
  const str = String(val).trim();
  if (!str) return fallback;

  // Extract words made of alphanumeric characters
  const words = str
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return fallback;

  return words
    .map(word => {
      const first = word.charAt(0).toUpperCase();
      const rest = word.slice(1).toLowerCase();
      return `${first}${rest}`;
    })
    .join('-');
};

/**
 * Format order details into the required file name:
 * DO_ITEM_SELLER_TO_BUYER_VyparX.pdf
 * Words in item, seller, buyer are hyphen-joined and Title-Cased (e.g. Hanumant-Fiber)
 */
export const formatOrderPdfFileName = (
  order?: Partial<SaudaOrder> | null,
  sellerParty?: Partial<Party> | null,
  buyerParty?: Partial<Party> | null
): string => {
  return `${formatOrderPdfBaseTitle(order, sellerParty, buyerParty)}.pdf`;
};

/**
 * Format order details into base title (without .pdf extension):
 * DO_ITEM_SELLER_TO_BUYER_VyparX
 * Example: 20260914002_Kapas-Shankar_Hanumant-Fiber_TO_Sky-Cotton_VyparX
 */
export const formatOrderPdfBaseTitle = (
  order?: Partial<SaudaOrder> | null,
  sellerParty?: Partial<Party> | null,
  buyerParty?: Partial<Party> | null
): string => {
  if (!order) return 'DO_Item_Seller_TO_Buyer_VyparX';

  const cleanDo = (val?: string | number, fallback = 'DO') => {
    if (!val) return fallback;
    const str = String(val)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    return str || fallback;
  };

  const doNo = cleanDo(order.doNo || order.id, 'DO');
  const item = formatNameToHyphenatedTitleCase(order.itemName, 'Item');
  const seller = formatNameToHyphenatedTitleCase(order.sellerName || sellerParty?.name, 'Seller');
  const buyer = formatNameToHyphenatedTitleCase(order.buyerName || buyerParty?.name, 'Buyer');

  return `${doNo}_${item}_${seller}_TO_${buyer}_VyparX`;
};

/**
 * Format current date & time as: "21 September 2026 11:23 am"
 * Guaranteed to be fresh at the exact moment of print / download.
 */
export const formatSaudaFooterDateTime = (d: Date = new Date()): string => {
  const day = d.getDate();
  const month = d.toLocaleDateString('en-GB', { month: 'long' });
  const year = d.getFullYear();
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  return `${day} ${month} ${year} ${timeStr}`;
};

export interface SaudaColorTheme {
  primary: [number, number, number];
  headerBg: [number, number, number];
  headerText: [number, number, number];
}

export const SAUDA_COLOR_THEMES: Record<string, SaudaColorTheme> = {
  GREEN: { primary: [21, 128, 61], headerBg: [226, 243, 229], headerText: [22, 80, 40] },
  BLUE: { primary: [37, 99, 235], headerBg: [224, 237, 253], headerText: [30, 64, 175] },
  RED: { primary: [220, 38, 38], headerBg: [254, 226, 226], headerText: [153, 27, 27] },
  ORANGE: { primary: [234, 88, 12], headerBg: [255, 237, 213], headerText: [154, 52, 18] },
  BLACK: { primary: [15, 23, 42], headerBg: [226, 232, 240], headerText: [15, 23, 42] },
};

/**
 * Format currency for pure vector PDF rendering.
 * Avoids unicode rupee symbol U+20B9 encoding bugs in standard PDF Type 1 fonts.
 */
export const formatPdfCurrency = (amount: number, decimals: number = 2): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rs. 0.00';
  }
  return formatCurrency(amount, decimals).replace('₹', 'Rs. ');
};

const formatLongDate = (dateStr?: string) => {
  if (!dateStr) return '09 APRIL 2026';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
  }
  return dateStr;
};

/**
 * Generate 100% Vector PDF for Sauda Note.
 * - Uses native vector drawing (doc.text, doc.rect, doc.roundedRect, doc.line)
 * - Zero pixelation / blur on 1000% zoom
 * - Ultra-lightweight file size (~25 KB)
 * - Single-page A4 format (210mm x 297mm)
 */
export const generateSaudaVectorPdf = (
  order: Partial<SaudaOrder>,
  company?: Partial<Company> | null,
  color = 'RED',
  template: 1 | 2 = 1,
  showSignature = true,
  seller?: Partial<Party> | null,
  buyer?: Partial<Party> | null
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const themeKey = (color || 'RED').toUpperCase();
  const theme = SAUDA_COLOR_THEMES[themeKey] || SAUDA_COLOR_THEMES.RED;

  const compName = company?.name || 'COMPANY NAME';
  const compAddr = company?.address || 'Address';
  const compCityState = `${company?.city || 'City'}, ${company?.state || 'State'}${company?.pinCode ? ' - ' + company.pinCode : ''}`;
  const compPhone = company?.contactNumber || '9876543210';
  const compEmail = company?.email || 'xyzdemotest@gmail.com';

  const orderDoNo = order.doNo || `${(order.date || '').replace(/-/g, '')}${String(order.id || 1).padStart(3, '0')}`;
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

  const liveTimeStr = formatSaudaFooterDateTime(new Date());

  const left = 14;
  const right = 196;
  const center = 105;
  const contentWidth = 182;

  if (template === 1) {
    // =========================================================================
    // TEMPLATE 1: Exact Confirmation of Sales & Purchase (Classic Tabular Style)
    // =========================================================================

    // Top Header: Centered Company details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text(compName.toUpperCase(), center, 17, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text(`${compAddr}, ${compCityState}`, center, 22.5, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Phone: ${compPhone} • ${compEmail}`, center, 27, { align: 'center' });

    // Divider line
    doc.setDrawColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.setLineWidth(0.6);
    doc.line(left, 30.5, right, 30.5);

    // DO NO (Right-aligned)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text(`DO NO. : ${orderDoNo}`, right, 36.5, { align: 'right' });

    // Helper to render 2-column table
    let curY = 40;
    const col1W = 72.8; // 40%
    const col2W = 109.2; // 60%

    const renderTableBlock = (title: string, rows: [string, string, boolean?][]) => {
      const hdrH = 5.5;
      const rowH = 6.2;
      const blockH = hdrH + rows.length * rowH;

      // Header row
      doc.setFillColor(theme.headerBg[0], theme.headerBg[1], theme.headerBg[2]);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.rect(left, curY, contentWidth, hdrH, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(theme.headerText[0], theme.headerText[1], theme.headerText[2]);
      doc.text(title.toUpperCase(), center, curY + 3.8, { align: 'center' });

      // Rows
      rows.forEach((row, idx) => {
        const rowY = curY + hdrH + idx * rowH;
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.rect(left, rowY, contentWidth, rowH, 'FD');
        doc.line(left + col1W, rowY, left + col1W, rowY + rowH);

        // Col 1: Label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(17, 24, 39);
        doc.text(row[0], left + 3.5, rowY + 4.3);

        // Col 2: Value
        doc.setFont('helvetica', row[2] ? 'bold' : 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(17, 24, 39);
        const valText = doc.splitTextToSize(row[1], col2W - 7)[0] || row[1];
        doc.text(valText, left + col1W + 3.5, rowY + 4.3);
      });

      curY += blockH + 3.5;
    };

    // 1. Transaction Overview
    renderTableBlock('Transaction Overview', [
      ['Bill Date', billDateLong],
      ['Broker Name', compName],
      ['Commodity / Item Name', itemName],
    ]);

    // 2. Buyer Information
    renderTableBlock('Buyer Information', [
      ['Buyer Name', buyerName.toUpperCase(), true],
      ['GST Number', buyerGst],
      ['Shipping Location', buyerFullLocation],
      ['Buyer Commission %', buyerComm, true],
    ]);

    // 3. Seller Information
    renderTableBlock('Seller Information', [
      ['Seller Name', sellerName.toUpperCase(), true],
      ['GST Number', sellerGst],
      ['Pickup Location', sellerFullLocation],
      ['Seller Commission %', sellerComm, true],
    ]);

    // 4. Material & Quality
    renderTableBlock('Material & Quality', [
      ['Quality', itemQuality],
      ['Quantity', `${quantity}`],
      ['Rate (Per ' + unit + ')', `${billRate} Rs.`, true],
      ['Payment Terms (Days)', payTerms],
    ]);

    // 5. Technical Parameters
    renderTableBlock('Technical Parameters', [
      ['RD Value', rdValue],
      ['Staple Length (MM)', stapleLength],
      ['Mic', mic],
      ['Trash %', trash],
      ['Moisture %', moisture],
    ]);

  } else {
    // =========================================================================
    // TEMPLATE 2: Modern Executive Corporate Sauda Contract (Pure Vector)
    // =========================================================================

    // Top Header Row
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text(compName.toUpperCase(), center, 17, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(75, 85, 99);
    doc.text(`${compAddr}, ${compCityState}`, center, 22.5, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(`Phone: ${compPhone} • ${compEmail}`, center, 27, { align: 'center' });

    // Header bottom divider line
    doc.setDrawColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.setLineWidth(0.6);
    doc.line(left, 30.5, right, 30.5);

    // Sub-bar: DO NO. and Date badges
    const barY = 34.5;
    const barH = 7.5;

    // Left pill: DO NO.
    doc.setFillColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.roundedRect(left, barY, 48, barH, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`DO NO. : ${orderDoNo}`, left + 4, barY + 5.2);

    // Right badge: Date
    const dateBadgeW = 56;
    const dateBadgeX = right - dateBadgeW;
    doc.setFillColor(243, 244, 246);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.roundedRect(dateBadgeX, barY, dateBadgeW, barH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    doc.text('Date: ', dateBadgeX + 4, barY + 5.2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(billDateLong, dateBadgeX + 13, barY + 5.2);

    // Parties Cards (Seller and Buyer)
    const cardY = 45.5;
    const cardW = 88;
    const cardH = 38;
    const cardR = 2;

    // Left Box: Seller
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(left, cardY, cardW, cardH, cardR, cardR, 'FD');

    // Seller Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text('SELLER DETAILS', left + 4, cardY + 5);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(left + 4, cardY + 7, left + cardW - 4, cardY + 7);

    // Seller Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(17, 24, 39);
    const sNameTrunc = doc.splitTextToSize(sellerName.toUpperCase(), cardW - 8)[0] || sellerName.toUpperCase();
    doc.text(sNameTrunc, left + 4, cardY + 12.5);

    // Seller GSTIN
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('GSTIN: ', left + 4, cardY + 18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(sellerGst, left + 16, cardY + 18);

    // Seller Location
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text('Dispatch / Pickup: ', left + 4, cardY + 23.5);
    doc.setTextColor(55, 65, 81);
    const sLocTrunc = doc.splitTextToSize(sellerFullLocation, cardW - 32)[0] || sellerFullLocation;
    doc.text(sLocTrunc, left + 28, cardY + 23.5);

    // Seller Bottom Line & Commission
    doc.setDrawColor(226, 232, 240);
    doc.line(left + 4, cardY + 28.5, left + cardW - 4, cardY + 28.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text('Seller Commission:', left + 4, cardY + 34.5);

    const sCommW = 18;
    const sCommX = left + cardW - sCommW - 4;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(sCommX, cardY + 30.5, sCommW, 5.5, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text(sellerComm, sCommX + sCommW / 2, cardY + 34.5, { align: 'center' });

    // Right Box: Buyer
    const buyerX = left + cardW + 6; // 108
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(buyerX, cardY, cardW, cardH, cardR, cardR, 'FD');

    // Buyer Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text('BUYER DETAILS', buyerX + 4, cardY + 5);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(buyerX + 4, cardY + 7, buyerX + cardW - 4, cardY + 7);

    // Buyer Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(17, 24, 39);
    const bNameTrunc = doc.splitTextToSize(buyerName.toUpperCase(), cardW - 8)[0] || buyerName.toUpperCase();
    doc.text(bNameTrunc, buyerX + 4, cardY + 12.5);

    // Buyer GSTIN
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('GSTIN: ', buyerX + 4, cardY + 18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(buyerGst, buyerX + 16, cardY + 18);

    // Buyer Location
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text('Delivery / Shipping: ', buyerX + 4, cardY + 23.5);
    doc.setTextColor(55, 65, 81);
    const bLocTrunc = doc.splitTextToSize(buyerFullLocation, cardW - 32)[0] || buyerFullLocation;
    doc.text(bLocTrunc, buyerX + 30, cardY + 23.5);

    // Buyer Bottom Line & Commission
    doc.setDrawColor(226, 232, 240);
    doc.line(buyerX + 4, cardY + 28.5, buyerX + cardW - 4, cardY + 28.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(107, 114, 128);
    doc.text('Buyer Commission:', buyerX + 4, cardY + 34.5);

    const bCommW = 18;
    const bCommX = buyerX + cardW - bCommW - 4;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(bCommX, cardY + 30.5, bCommW, 5.5, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text(buyerComm, bCommX + bCommW / 2, cardY + 34.5, { align: 'center' });

    // Material & Transaction Overview Table
    const tableY = 87.5;
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.3);

    // Header bar
    doc.setFillColor(theme.headerBg[0], theme.headerBg[1], theme.headerBg[2]);
    doc.rect(left, tableY, contentWidth, 6.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(theme.headerText[0], theme.headerText[1], theme.headerText[2]);
    doc.text('MATERIAL & TRANSACTION OVERVIEW', left + 4, tableY + 4.6);

    // Column Headers row
    const thY = tableY + 6.5;
    doc.setFillColor(243, 244, 246);
    doc.rect(left, thY, contentWidth, 6.5, 'FD');

    const cols = [
      { x: left, w: 10, align: 'center', title: 'Sr.' },
      { x: left + 10, w: 72, align: 'left', title: 'Commodity Item Description' },
      { x: left + 82, w: 26, align: 'left', title: 'Quality' },
      { x: left + 108, w: 24, align: 'right', title: 'Quantity' },
      { x: left + 132, w: 22, align: 'right', title: `Rate (${unit})` },
      { x: left + 154, w: 28, align: 'right', title: 'Total Amount' },
    ];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(55, 65, 81);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);

    cols.forEach((col, idx) => {
      if (idx > 0) {
        doc.line(col.x, thY, col.x, thY + 6.5);
      }
      const textX = col.align === 'center' ? col.x + col.w / 2 : col.align === 'right' ? col.x + col.w - 3 : col.x + 3;
      doc.text(col.title, textX, thY + 4.5, { align: col.align as any });
    });

    // Data Row
    const tdY = thY + 6.5;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.3);
    doc.rect(left, tdY, contentWidth, 9, 'FD');

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);
    cols.forEach((col, idx) => {
      if (idx > 0) {
        doc.line(col.x, tdY, col.x, tdY + 9);
      }
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('01', cols[0].x + cols[0].w / 2, tdY + 5.8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    const itemTrunc = doc.splitTextToSize(itemName, cols[1].w - 6)[0] || itemName;
    doc.text(itemTrunc, cols[1].x + 3, tdY + 5.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    const qualTrunc = doc.splitTextToSize(itemQuality, cols[2].w - 6)[0] || itemQuality;
    doc.text(qualTrunc, cols[2].x + 3, tdY + 5.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(`${quantity}`, cols[3].x + cols[3].w - 3, tdY + 5.8, { align: 'right' });
    doc.text(`${billRate} Rs.`, cols[4].x + cols[4].w - 3, tdY + 5.8, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text(formatPdfCurrency(totalAmount), cols[5].x + cols[5].w - 3, tdY + 5.8, { align: 'right' });

    // Table Footer Bar
    const tfY = tdY + 9;
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.3);
    doc.rect(left, tfY, contentWidth, 7, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(75, 85, 99);
    doc.text(`Payment Terms: ${payTerms} Days   •   Unit: ${unit}`, left + 4, tfY + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text('Net Bill Amount:', right - 38, tfY + 4.8, { align: 'right' });

    doc.setFontSize(8.5);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text(formatPdfCurrency(totalAmount), right - 3, tfY + 4.8, { align: 'right' });

    // Technical Parameters Table
    const techY = tfY + 11;
    doc.setFillColor(theme.headerBg[0], theme.headerBg[1], theme.headerBg[2]);
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.3);
    doc.rect(left, techY, contentWidth, 6.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(theme.headerText[0], theme.headerText[1], theme.headerText[2]);
    doc.text('TECHNICAL & QUALITY PARAMETERS', left + 4, techY + 4.6);

    const techGridY = techY + 6.5;
    const techGridH = 13.5;
    doc.setFillColor(255, 255, 255);
    doc.rect(left, techGridY, contentWidth, techGridH, 'FD');

    const techColW = contentWidth / 5; // 36.4
    const techCols = [
      { label: 'RD VALUE', val: rdValue },
      { label: 'STAPLE LENGTH', val: `${stapleLength} mm` },
      { label: 'MICRONAIRE', val: mic },
      { label: 'TRASH %', val: trash },
      { label: 'MOISTURE %', val: moisture },
    ];

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);

    techCols.forEach((tcol, idx) => {
      const colX = left + idx * techColW;
      if (idx > 0) {
        doc.line(colX, techGridY, colX, techGridY + techGridH);
      }
      const colCenter = colX + techColW / 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.text(tcol.label, colCenter, techGridY + 4.8, { align: 'center' });

      doc.setFontSize(8.5);
      doc.setTextColor(17, 24, 39);
      doc.text(tcol.val, colCenter, techGridY + 10, { align: 'center' });
    });

    // Standard Trade Conditions & Terms Card (Stacked Vertically)
    const termsY = techGridY + techGridH + 5;
    const termsH = 26;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(left, termsY, contentWidth, termsH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(31, 41, 55);
    doc.text('STANDARD TRADE CONDITIONS & TERMS', left + 4, termsY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(75, 85, 99);

    // One below the other (aek ke niche aek)
    doc.text(`• Payment must be settled within the agreed ${payTerms} days from delivery date.`, left + 4, termsY + 9.8);
    doc.text('• Weight and sample verification to be conducted at the time of delivery/unloading.', left + 4, termsY + 14.3);
    doc.text('• Quality, staple length and moisture are subject to standard commodity market arbitration rules.', left + 4, termsY + 18.8);
    doc.text(`• Brokerage is payable to ${compName} by both parties as stated.`, left + 4, termsY + 23.3);
  }

  // Common Bottom Section: Authorized Signatory (Right-aligned)
  if (showSignature) {
    const sigLineY = 258;
    const sigW = 50;
    const sigX = right - sigW;
    doc.setDrawColor(156, 163, 175);
    doc.setLineWidth(0.3);
    doc.line(sigX, sigLineY, right, sigLineY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);
    doc.text('Authorized Signatory', sigX + sigW / 2, sigLineY + 5, { align: 'center' });
  }

  // Unified Footer pinned at bottom of A4 page (y = 280)
  const footerDividerY = 280;
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.2);
  doc.line(left, footerDividerY, right, footerDividerY);

  const footerTextY = 285.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text('VyaparX', left, footerTextY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 99);
  doc.text('Page 1 of 1', center, footerTextY, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.text(liveTimeStr, right, footerTextY, { align: 'right' });

  return doc;
};

/**
 * Direct Download Sauda / Vyapar Note as a 100% Vector full-page A4 PDF file.
 * - Generates crisp vector shapes & fonts: never blurs or pixelates on zoom!
 * - Directly saves the PDF file into the browser download bar without opening any print popup or preview dialog.
 * - Always uses live updated timestamp at moment of download.
 * - Generates exact file name: DO_ITEM_SELLER_TO_BUYER_VyparX.pdf.
 */
export const downloadSaudaNotePdf = async (
  order: Partial<SaudaOrder>,
  company?: Partial<Company> | string | null,
  color = 'RED',
  template: 1 | 2 = 1,
  showSignature = true,
  seller?: Partial<Party> | null,
  buyer?: Partial<Party> | null
): Promise<boolean> => {
  try {
    const actualCompany = typeof company === 'object' ? company : null;
    const doc = generateSaudaVectorPdf(
      order,
      actualCompany,
      color,
      template,
      showSignature,
      seller,
      buyer
    );
    const fileName = formatOrderPdfFileName(order, seller, buyer);
    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('Vector PDF generation error:', err);
    return false;
  }
};

/**
 * Print Sauda / Vyapar Note in an isolated full-page A4 print container.
 * - Always updates footer timestamp to exact current moment right before printing.
 * - Suppresses browser default headers/footers via @page margin 0.
 * - Hides the entire React application (#root) during print to eliminate parent offsets & blank spaces.
 * - Pins the footer to the bottom of the 297mm A4 page.
 * - Sets the browser title to DO_ITEM_SELLER_TO_BUYER_VyparX so 'Save as PDF' uses this exact name.
 */
export const printSaudaNote = (
  order?: Partial<SaudaOrder> | null,
  elementId = 'printable-sauda-note',
  seller?: Partial<Party> | null,
  buyer?: Partial<Party> | null
) => {
  const sourceEl = document.getElementById(elementId);
  if (!sourceEl) {
    window.print();
    return;
  }

  // 1. Force update live timestamp in DOM right now
  const liveTimeStr = formatSaudaFooterDateTime(new Date());
  sourceEl.querySelectorAll<HTMLElement>('.note-footer-datetime').forEach(el => {
    el.textContent = liveTimeStr;
  });

  const baseTitle = formatOrderPdfBaseTitle(order, seller, buyer);
  const originalTitle = document.title;
  document.title = baseTitle;

  // Ensure isolated print root exists directly under body
  let printRoot = document.getElementById('print-root');
  if (!printRoot) {
    printRoot = document.createElement('div');
    printRoot.id = 'print-root';
    document.body.appendChild(printRoot);
  }

  // Clone note HTML and strip card border/shadow classes
  const clone = sourceEl.cloneNode(true) as HTMLElement;
  clone.id = 'printable-sauda-note-print-cloned';
  clone.style.border = 'none';
  clone.style.borderRadius = '0';
  clone.style.boxShadow = 'none';
  clone.style.width = '100%';
  clone.style.maxWidth = '100%';
  clone.style.height = '100%';
  clone.style.minHeight = '100%';
  clone.style.maxHeight = '100%';
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.display = 'flex';
  clone.style.flexDirection = 'column';
  clone.style.justifyContent = 'space-between';

  const bottomSection = clone.querySelector('.note-bottom-section') as HTMLElement | null;
  if (bottomSection) {
    bottomSection.style.marginTop = 'auto';
    bottomSection.style.paddingTop = '16px';
  }

  clone.querySelectorAll<HTMLElement>('.note-footer-datetime').forEach(el => {
    el.textContent = liveTimeStr;
  });

  printRoot.innerHTML = '';
  printRoot.appendChild(clone);
  document.body.classList.add('is-printing-note');

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    document.title = originalTitle;
    document.body.classList.remove('is-printing-note');
    if (printRoot) {
      printRoot.innerHTML = '';
    }
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  // Give browser a tick to render print-root
  setTimeout(() => {
    window.print();
    // Fallback cleanup in case afterprint does not fire in some desktop browsers
    setTimeout(cleanup, 25000);
  }, 100);
};

// Global listener for native Ctrl+P so it also uses the isolated container
if (typeof window !== 'undefined') {
  window.addEventListener('beforeprint', () => {
    const sourceEl = document.getElementById('printable-sauda-note');
    if (sourceEl && !document.body.classList.contains('is-printing-note')) {
      const liveTimeStr = formatSaudaFooterDateTime(new Date());
      sourceEl.querySelectorAll<HTMLElement>('.note-footer-datetime').forEach(el => {
        el.textContent = liveTimeStr;
      });

      let printRoot = document.getElementById('print-root');
      if (!printRoot) {
        printRoot = document.createElement('div');
        printRoot.id = 'print-root';
        document.body.appendChild(printRoot);
      }
      const clone = sourceEl.cloneNode(true) as HTMLElement;
      clone.style.border = 'none';
      clone.style.borderRadius = '0';
      clone.style.boxShadow = 'none';
      clone.style.width = '100%';
      clone.style.height = '100%';
      clone.style.display = 'flex';
      clone.style.flexDirection = 'column';
      clone.style.justifyContent = 'space-between';

      const bottomSection = clone.querySelector('.note-bottom-section') as HTMLElement | null;
      if (bottomSection) {
        bottomSection.style.marginTop = 'auto';
        bottomSection.style.paddingTop = '16px';
      }

      clone.querySelectorAll<HTMLElement>('.note-footer-datetime').forEach(el => {
        el.textContent = liveTimeStr;
      });

      printRoot.innerHTML = '';
      printRoot.appendChild(clone);
      document.body.classList.add('is-printing-note');
    }
  });

  window.addEventListener('afterprint', () => {
    document.body.classList.remove('is-printing-note');
    const printRoot = document.getElementById('print-root');
    if (printRoot) {
      printRoot.innerHTML = '';
    }
  });
}
