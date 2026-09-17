import type { Item, Party, Company, SaudaOrder } from '../types';
import { formatCurrency, formatDate, formatDoNo, formatReportDoNo } from './formatters';

export interface BrokerageReportRow {
  partyId: number;
  partyName: string;
  totalOrders: number;
  asSellerCount: number;
  asBuyerCount: number;
  totalQuantity: number;
  totalBillAmount: number;
  totalBrokerage: number;
}

/**
 * Triggers the browser's native print dialog using an invisible iframe,
 * opening direct PDF/print preview without popup blockers or page navigation.
 * Sets the document.title to reportTitle so browser 'Save as PDF' uses this default name.
 */
function triggerDirectPrint(htmlContent: string, reportTitle: string = 'Report - VyaparX') {
  const originalDocTitle = document.title;
  // Set the parent page title to desired download name so browser 'Save as PDF' uses this name
  document.title = reportTitle;

  const restoreTitle = () => {
    setTimeout(() => {
      document.title = originalDocTitle;
    }, 2000);
  };

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(htmlContent);
      win.document.title = reportTitle;
      win.document.close();
      win.focus();
      win.print();
      restoreTitle();
    }
    return;
  }

  doc.open();
  doc.write(htmlContent);
  if (iframe.contentWindow) {
    iframe.contentWindow.document.title = reportTitle;
  }
  doc.close();

  // Allow styles and fonts to render before printing
  setTimeout(() => {
    if (iframe.contentWindow) {
      iframe.contentWindow.document.title = reportTitle;
      iframe.contentWindow.focus();

      let cleanedUp = false;
      const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        restoreTitle();
        try {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        } catch {
          // ignore
        }
      };

      iframe.contentWindow.onafterprint = cleanup;
      window.onafterprint = cleanup;

      iframe.contentWindow.print();

      // Fallback cleanup after print modal is closed
      setTimeout(cleanup, 25000);
    }
  }, 250);
}

/**
 * Returns standard clean corporate CSS for PDF print layouts.
 * Setting @page margin: 0 suppresses browser default header (date/time & title) and footer (url & page number).
 */
function getReportStyles(orientation: 'portrait' | 'landscape' = 'portrait') {
  return `
    @page {
      size: A4 ${orientation};
      margin: 0;
    }
    @media print {
      @page {
        margin: 0;
      }
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 10mm 10mm 15mm 10mm;
      font-size: 11px;
      line-height: 1.4;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 8px;
    }
    .header-table td {
      vertical-align: middle;
    }
    .company-title {
      font-size: 18px;
      font-weight: 900;
      color: #1e3a8a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .report-subtitle {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      margin-top: 2px;
    }
    .report-name-badge {
      display: inline-block;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .filter-banner {
      background: #f1f5f9;
      border-left: 3px solid #2563eb;
      padding: 5px 10px;
      font-size: 10px;
      color: #334155;
      font-weight: 600;
      margin-bottom: 10px;
      border-radius: 0 4px 4px 0;
    }
    .summary-cards {
      display: flex;
      gap: 10px;
      margin-bottom: 12px;
    }
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 12px;
      flex: 1;
    }
    .summary-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
    }
    .summary-value {
      font-size: 14px;
      font-weight: 900;
      color: #0f172a;
      margin-top: 2px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-top: 4px;
    }
    .data-table th {
      background: #1e293b;
      color: #ffffff;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 9.5px;
      letter-spacing: 0.5px;
      padding: 7px 8px;
      text-align: left;
      border: 1px solid #1e293b;
    }
    .data-table th.text-right, .data-table td.text-right {
      text-align: right;
    }
    .data-table th.text-center, .data-table td.text-center {
      text-align: center;
    }
    .data-table td {
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      vertical-align: middle;
    }
    .data-table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .data-table tr {
      page-break-inside: avoid;
    }
    .pill-badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-blue { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
    .badge-green { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .badge-gray { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    .table-summary-bar {
      margin-top: 10px;
      padding-top: 6px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #64748b;
      font-weight: 500;
    }
    .page-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 22px;
      padding: 3px 10mm 5mm 10mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #64748b;
      border-top: 1px solid #cbd5e1;
      background: #ffffff;
      z-index: 9999;
    }
    .page-footer-left {
      flex: 1;
      text-align: left;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .page-footer-center {
      flex: 1;
      text-align: center;
      font-weight: 700;
      color: #475569;
    }
    .page-footer-right {
      flex: 1;
      text-align: right;
      color: #64748b;
      font-weight: 500;
    }
  `;
}

function formatReportFooterDateTime(date: Date = new Date()): string {
  const day = date.getDate();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

/**
 * 1. ITEMS LIST REPORT
 */
export function printItemsReport(params: {
  items: Item[];
  companyName?: string;
  financialYear?: string;
  filterText?: string;
}) {
  const { items, companyName, financialYear, filterText } = params;
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const reportTitle = 'Items Report - VyaparX';

  const rows = items.map((item, idx) => `
    <tr>
      <td class="text-center" style="width: 35px;">${idx + 1}</td>
      <td style="font-weight: 700; color: #1e293b;">${escapeHtml(item.name.toUpperCase())}</td>
      <td class="text-center" style="width: 80px;">
        <span class="pill-badge badge-blue">${escapeHtml(item.unit || 'UNIT')}</span>
      </td>
      <td class="text-right" style="font-weight: 600; width: 110px;">${item.sellerCommissionRate}%</td>
      <td class="text-right" style="font-weight: 600; width: 110px;">${item.buyerCommissionRate}%</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${reportTitle}</title>
        <style>${getReportStyles('portrait')}</style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td>
              <h1 class="company-title">${escapeHtml(companyName || 'VYAPARX')}</h1>
              <div class="report-subtitle">${financialYear ? `Financial Year: ${financialYear}` : 'Commodity Master'}</div>
            </td>
            <td style="text-align: right;">
              <span class="report-name-badge">Commodity Items Report</span>
            </td>
          </tr>
        </table>

        ${filterText ? `<div class="filter-banner">Filtered by: ${escapeHtml(filterText)}</div>` : ''}

        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-label">Total Commodity Items</div>
            <div class="summary-value">${items.length}</div>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th class="text-center" style="width: 35px;">#</th>
              <th>Commodity Item</th>
              <th class="text-center" style="width: 80px;">Unit</th>
              <th class="text-right" style="width: 110px;">Seller Comm.</th>
              <th class="text-right" style="width: 110px;">Buyer Comm.</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="5" class="text-center" style="padding: 20px; color: #94a3b8;">No items found</td></tr>'}
          </tbody>
        </table>

        <div class="table-summary-bar">
          <div>Generated on ${now} via VyaparX • Commodity Management</div>
          <div>Total Records: ${items.length}</div>
        </div>

        <div class="page-footer">
          <div class="page-footer-left">VyaparX</div>
          <div class="page-footer-center">Page 1</div>
          <div class="page-footer-right">${formatReportFooterDateTime()}</div>
        </div>
      </body>
    </html>
  `;

  triggerDirectPrint(html, reportTitle);
}

/**
 * 2. PARTIES LIST REPORT (Without ID Column)
 */
export function printPartiesReport(params: {
  parties: Party[];
  companyName?: string;
  financialYear?: string;
  filterText?: string;
}) {
  const { parties, companyName, financialYear, filterText } = params;
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const reportTitle = 'Parties Report - VyaparX';

  const rows = parties.map((p, idx) => `
    <tr>
      <td class="text-center" style="width: 30px;">${idx + 1}</td>
      <td style="font-weight: 700; color: #1e293b;">${escapeHtml(p.name.toUpperCase())}</td>
      <td style="font-weight: 600; width: 100px;">${escapeHtml(p.mobileNumber || '-')}</td>
      <td style="width: 125px;">${escapeHtml((p.city || '').toUpperCase())} ${p.state ? '• ' + escapeHtml(p.state.toUpperCase()) : ''}</td>
      <td style="color: #475569; font-size: 9.5px;">${escapeHtml(p.address || '-')}</td>
      <td style="width: 110px; font-family: monospace; font-size: 9px;">${escapeHtml(p.gstNumber || '-')}</td>
      <td style="width: 90px; font-family: monospace; font-size: 9px;">${escapeHtml(p.panNumber || '-')}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${reportTitle}</title>
        <style>${getReportStyles('landscape')}</style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td>
              <h1 class="company-title">${escapeHtml(companyName || 'VYAPARX')}</h1>
              <div class="report-subtitle">${financialYear ? `Financial Year: ${financialYear}` : 'Parties Directory'}</div>
            </td>
            <td style="text-align: right;">
              <span class="report-name-badge">Parties Directory Report</span>
            </td>
          </tr>
        </table>

        ${filterText ? `<div class="filter-banner">Filtered by: ${escapeHtml(filterText)}</div>` : ''}

        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-label">Total Parties Count</div>
            <div class="summary-value">${parties.length}</div>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th class="text-center" style="width: 30px;">#</th>
              <th>Party / Firm Name</th>
              <th style="width: 100px;">Mobile No.</th>
              <th style="width: 125px;">City / State</th>
              <th>Address</th>
              <th style="width: 110px;">GSTIN</th>
              <th style="width: 90px;">PAN No.</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="7" class="text-center" style="padding: 20px; color: #94a3b8;">No parties found</td></tr>'}
          </tbody>
        </table>

        <div class="table-summary-bar">
          <div>Generated on ${now} via VyaparX • Parties Master Directory</div>
          <div>Total Parties: ${parties.length}</div>
        </div>

        <div class="page-footer">
          <div class="page-footer-left">VyaparX</div>
          <div class="page-footer-center">Page 1</div>
          <div class="page-footer-right">${formatReportFooterDateTime()}</div>
        </div>
      </body>
    </html>
  `;

  triggerDirectPrint(html, reportTitle);
}

/**
 * 3. COMPANIES LIST REPORT
 */
export function printCompaniesReport(params: {
  companies: Company[];
  filterText?: string;
}) {
  const { companies, filterText } = params;
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const reportTitle = 'Companies Report - VyaparX';

  const rows = companies.map((c, idx) => `
    <tr>
      <td class="text-center" style="width: 35px;">${idx + 1}</td>
      <td style="font-weight: 700; color: #1e293b;">
        ${escapeHtml(c.name.toUpperCase())}
        ${c.isDefault ? '<span class="pill-badge badge-green" style="margin-left: 6px;">DEFAULT</span>' : ''}
      </td>
      <td style="width: 100px; font-weight: 600;">${escapeHtml(c.contactNumber || '-')}</td>
      <td style="width: 120px; font-size: 9.5px;">${escapeHtml(c.email || '-')}</td>
      <td style="width: 120px;">${escapeHtml((c.city || '').toUpperCase())} ${c.state ? '• ' + escapeHtml(c.state.toUpperCase()) : ''}</td>
      <td style="width: 105px; font-family: monospace; font-size: 9px;">${escapeHtml(c.gstNumber || '-')}</td>
      <td style="width: 85px; font-family: monospace; font-size: 9px;">${escapeHtml(c.panNumber || '-')}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${reportTitle}</title>
        <style>${getReportStyles('landscape')}</style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td>
              <h1 class="company-title">VYAPARX</h1>
              <div class="report-subtitle">Company Profiles & Master Register</div>
            </td>
            <td style="text-align: right;">
              <span class="report-name-badge">Companies Register Report</span>
            </td>
          </tr>
        </table>

        ${filterText ? `<div class="filter-banner">Filtered by: ${escapeHtml(filterText)}</div>` : ''}

        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-label">Total Companies</div>
            <div class="summary-value">${companies.length}</div>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th class="text-center" style="width: 35px;">#</th>
              <th>Company Name</th>
              <th style="width: 100px;">Contact No.</th>
              <th style="width: 120px;">Email</th>
              <th style="width: 120px;">City / State</th>
              <th style="width: 105px;">GSTIN</th>
              <th style="width: 85px;">PAN</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="7" class="text-center" style="padding: 20px; color: #94a3b8;">No companies found</td></tr>'}
          </tbody>
        </table>

        <div class="table-summary-bar">
          <div>Generated on ${now} via VyaparX • Business Management Platform</div>
          <div>Total Records: ${companies.length}</div>
        </div>

        <div class="page-footer">
          <div class="page-footer-left">VyaparX</div>
          <div class="page-footer-center">Page 1</div>
          <div class="page-footer-right">${formatReportFooterDateTime()}</div>
        </div>
      </body>
    </html>
  `;

  triggerDirectPrint(html, reportTitle);
}

/**
 * 4. VYAPAR (SAUDA) ORDERS REPORT
 */
export function printVyaparReport(params: {
  orders: SaudaOrder[];
  companyName?: string;
  financialYear?: string;
  filterText?: string;
}) {
  const { orders, companyName, financialYear, filterText } = params;
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const reportTitle = 'Vyapar Report - VyaparX';

  const totalQuantitySum = orders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);
  const totalBillAmountSum = orders.reduce((sum, o) => sum + (Number(o.totalBillAmount) || 0), 0);

  const rows = orders.map((o, idx) => `
    <tr>
      <td class="text-center" style="width: 30px;">${idx + 1}</td>
      <td class="text-center" style="width: 95px; font-weight: 700; color: #1d4ed8; white-space: nowrap;">
        ${formatReportDoNo(o.doNo, o.id)}
      </td>
      <td class="text-center" style="width: 75px; white-space: nowrap;">${formatDate(o.date)}</td>
      <td style="font-weight: 700;">
        ${escapeHtml(o.itemName.toUpperCase())}
        ${o.itemQuality ? `<div style="font-size: 9px; font-weight: normal; color: #64748b;">${escapeHtml(o.itemQuality)}</div>` : ''}
      </td>
      <td class="text-right" style="font-weight: 700; width: 85px; white-space: nowrap;">
        ${Number(o.quantity).toFixed(2)} <span style="font-size: 9px; color: #64748b;">${escapeHtml(o.unit || '')}</span>
      </td>
      <td class="text-right" style="font-weight: 600; width: 75px; white-space: nowrap;">${formatCurrency(o.billRate, 0)}</td>
      <td class="text-right" style="font-weight: 900; color: #0f172a; width: 90px; white-space: nowrap;">
        ${formatCurrency(o.totalBillAmount, 0)}
      </td>
      <td style="width: 120px;">
        <div style="font-weight: 700; color: #047857;">${escapeHtml(o.sellerName.toUpperCase())}</div>
        <div style="font-size: 9px; color: #64748b;">Comm: ${o.sellerCommissionRate}% ${o.sellerCity ? '• ' + escapeHtml(o.sellerCity) : ''}</div>
      </td>
      <td style="width: 120px;">
        <div style="font-weight: 700; color: #1d4ed8;">${escapeHtml(o.buyerName.toUpperCase())}</div>
        <div style="font-size: 9px; color: #64748b;">Comm: ${o.buyerCommissionRate}% ${o.buyerCity ? '• ' + escapeHtml(o.buyerCity) : ''}</div>
      </td>
      <td class="text-center" style="width: 60px; font-size: 9.5px;">${escapeHtml(o.paymentTerms || '15')} Days</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${reportTitle}</title>
        <style>${getReportStyles('landscape')}</style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td>
              <h1 class="company-title">${escapeHtml(companyName || 'VYAPARX')}</h1>
              <div class="report-subtitle">${financialYear ? `Financial Year: ${financialYear}` : 'Trading Register'}</div>
            </td>
            <td style="text-align: right;">
              <span class="report-name-badge">Vyapar (Sauda) Orders Report</span>
            </td>
          </tr>
        </table>

        ${filterText ? `<div class="filter-banner">Filtered by: ${escapeHtml(filterText)}</div>` : ''}

        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-label">Total Vyapar Orders</div>
            <div class="summary-value">${orders.length}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Volume (Quantity)</div>
            <div class="summary-value">${totalQuantitySum.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Bill Amount</div>
            <div class="summary-value">${formatCurrency(totalBillAmountSum, 0)}</div>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th class="text-center" style="width: 30px;">#</th>
              <th class="text-center" style="width: 95px;">DO No.</th>
              <th class="text-center" style="width: 75px;">Trade Date</th>
              <th>Commodity Item</th>
              <th class="text-right" style="width: 85px;">Quantity</th>
              <th class="text-right" style="width: 75px;">Bill Rate</th>
              <th class="text-right" style="width: 90px;">Total Bill</th>
              <th style="width: 120px;">Seller</th>
              <th style="width: 120px;">Buyer</th>
              <th class="text-center" style="width: 60px;">Payment</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="10" class="text-center" style="padding: 20px; color: #94a3b8;">No Vyapar orders found</td></tr>'}
          </tbody>
        </table>

        <div class="table-summary-bar">
          <div>Generated on ${now} via VyaparX • Sauda & Trade Register</div>
          <div>Total Orders: ${orders.length} • Total Amount: ${formatCurrency(totalBillAmountSum, 0)}</div>
        </div>

        <div class="page-footer">
          <div class="page-footer-left">VyaparX</div>
          <div class="page-footer-center">Page 1</div>
          <div class="page-footer-right">${formatReportFooterDateTime()}</div>
        </div>
      </body>
    </html>
  `;

  triggerDirectPrint(html, reportTitle);
}

/**
 * 5. BROKERAGE TOTAL AMOUNT REPORT
 */
export function printBrokerageReport(params: {
  rows: BrokerageReportRow[];
  totalBrokerage: number;
  totalVolume: number;
  totalTurnover: number;
  companyName?: string;
  financialYear?: string;
  filterText?: string;
}) {
  const { rows, totalBrokerage, totalVolume, totalTurnover, companyName, financialYear, filterText } = params;
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const reportTitle = 'Brokerage Report - VyaparX';

  const totalOrdersSum = rows.reduce((sum, r) => sum + r.totalOrders, 0);

  const tableRows = rows.map((r, idx) => `
    <tr>
      <td class="text-center" style="width: 35px;">${idx + 1}</td>
      <td style="font-weight: 700; color: #1e293b;">
        <div>${escapeHtml(r.partyName.toUpperCase())}</div>
        <div style="font-size: 9px; font-weight: normal; color: #64748b;">
          Seller: ${r.asSellerCount} | Buyer: ${r.asBuyerCount}
        </div>
      </td>
      <td class="text-center" style="width: 70px; font-weight: 600;">${r.totalOrders}</td>
      <td class="text-right" style="width: 100px; font-weight: 700;">${r.totalQuantity.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
      <td class="text-right" style="width: 110px; font-weight: 600; color: #334155;">${formatCurrency(r.totalBillAmount, 0)}</td>
      <td class="text-right" style="width: 110px; font-weight: 900; color: #047857;">${formatCurrency(r.totalBrokerage)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${reportTitle}</title>
        <style>${getReportStyles('portrait')}</style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td>
              <h1 class="company-title">${escapeHtml(companyName || 'VYAPARX')}</h1>
              <div class="report-subtitle">${financialYear ? `Financial Year: ${financialYear}` : 'Brokerage Ledger'}</div>
            </td>
            <td style="text-align: right;">
              <span class="report-name-badge">Brokerage Summary Report</span>
            </td>
          </tr>
        </table>

        ${filterText ? `<div class="filter-banner">Filtered by: ${escapeHtml(filterText)}</div>` : ''}

        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-label">Total Brokerage</div>
            <div class="summary-value" style="color: #059669;">${formatCurrency(totalBrokerage)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Volume</div>
            <div class="summary-value">${totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Turnover Amount</div>
            <div class="summary-value" style="color: #2563eb;">${formatCurrency(totalTurnover, 0)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Parties</div>
            <div class="summary-value">${rows.length}</div>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th class="text-center" style="width: 35px;">#</th>
              <th>Party Name</th>
              <th class="text-center" style="width: 70px;">Orders</th>
              <th class="text-right" style="width: 100px;">Volume</th>
              <th class="text-right" style="width: 110px;">Turnover</th>
              <th class="text-right" style="width: 110px;">Brokerage</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="6" class="text-center" style="padding: 20px; color: #94a3b8;">No brokerage records found</td></tr>'}
          </tbody>
          ${rows.length > 0 ? `
          <tfoot>
            <tr style="background: #f1f5f9; font-weight: 800; border-top: 2px solid #cbd5e1;">
              <td colspan="2" style="padding: 8px; font-size: 11px; text-transform: uppercase;">Total</td>
              <td class="text-center" style="padding: 8px;">${totalOrdersSum}</td>
              <td class="text-right" style="padding: 8px;">${totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
              <td class="text-right" style="padding: 8px;">${formatCurrency(totalTurnover, 0)}</td>
              <td class="text-right" style="padding: 8px; color: #047857; font-size: 12px;">${formatCurrency(totalBrokerage)}</td>
            </tr>
          </tfoot>
          ` : ''}
        </table>

        <div class="table-summary-bar">
          <div>Generated on ${now} via VyaparX • Brokerage Summary</div>
          <div>Total Parties: ${rows.length}</div>
        </div>

        <div class="page-footer">
          <div class="page-footer-left">VyaparX</div>
          <div class="page-footer-center">Page 1</div>
          <div class="page-footer-right">${formatReportFooterDateTime()}</div>
        </div>
      </body>
    </html>
  `;

  triggerDirectPrint(html, reportTitle);
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

