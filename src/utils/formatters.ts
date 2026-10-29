/**
 * Indian currency & Date formatting utilities matching Sauda Book UI
 */

export function formatCurrency(amount: number, decimals: number = 2): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0.00';
  }
  
  const numStr = amount.toFixed(decimals);
  const [integerPart, decimalPart] = numStr.split('.');
  
  // Indian numbering system format (last 3 digits, then pairs of 2 digits)
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  
  return decimals > 0 
    ? `₹${formattedInteger}.${decimalPart}`
    : `₹${formattedInteger}`;
}

export function formatLakhsCr(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0.00';
  }
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  }
  return formatCurrency(amount);
}

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const str = String(dateString).trim();
  // Already in DD-MON-YYYY format (e.g. 26-OCT-2026)
  if (/^\d{2}-[A-Za-z]{3}-\d{4}$/.test(str)) {
    return str.toUpperCase();
  }
  // Try clean ISO date part YYYY-MM-DD
  const clean = str.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2].padStart(2, '0');
      const month = MONTH_NAMES[monthIdx] || parts[1].toUpperCase();
      return `${day}-${month}-${year}`;
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      const day = parts[0].padStart(2, '0');
      const year = parts[2];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const month = !isNaN(monthIdx) && monthIdx >= 0 && monthIdx < 12
        ? MONTH_NAMES[monthIdx]
        : parts[1].toUpperCase();
      return `${day}-${month}-${year}`;
    }
  }
  const slashParts = str.split('/');
  if (slashParts.length === 3) {
    if (slashParts[2].length === 4) {
      // DD/MM/YYYY
      const day = slashParts[0].padStart(2, '0');
      const monthIdx = parseInt(slashParts[1], 10) - 1;
      const year = slashParts[2];
      const month = MONTH_NAMES[monthIdx] || slashParts[1].toUpperCase();
      return `${day}-${month}-${year}`;
    } else if (slashParts[0].length === 4) {
      // YYYY/MM/DD
      const year = slashParts[0];
      const monthIdx = parseInt(slashParts[1], 10) - 1;
      const day = slashParts[2].padStart(2, '0');
      const month = MONTH_NAMES[monthIdx] || slashParts[1].toUpperCase();
      return `${day}-${month}-${year}`;
    }
  }
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = MONTH_NAMES[d.getMonth()] || String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch {
    // fallback
  }
  return dateString;
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[d.getMonth()] || String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedHours = String(hours).padStart(2, '0');
    return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
  } catch {
    return dateString;
  }
}

export function formatDateTimeParts(dateString?: string): { date: string; time: string } | null {
  if (!dateString) return null;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { date: dateString, time: '' };
    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[d.getMonth()] || String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedHours = String(hours).padStart(2, '0');
    return {
      date: `${day}-${month}-${year}`,
      time: `${formattedHours}:${minutes} ${ampm}`,
    };
  } catch {
    return { date: dateString, time: '' };
  }
}

export function formatISODate(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formats a DO number uniformly across the application.
 * E.g., '20260917004' -> 'DO #20260917004'
 * E.g., 'DO #20260917004' -> 'DO #20260917004'
 */
export function formatDoNo(doNo?: string, id?: number): string {
  const raw = String(doNo || id || '').trim();
  if (!raw) return '';
  if (/^do\s*#/i.test(raw)) return raw;
  if (/^do/i.test(raw)) return raw.replace(/^do\s*/i, 'DO #');
  if (raw.startsWith('#')) return `DO ${raw}`;
  return `DO #${raw}`;
}

/**
 * Formats a DO number without the 'DO ' prefix, starting directly with '#'
 * E.g., '20260917004' -> '#20260917004'
 * E.g., 'DO #20260917004' -> '#20260917004'
 */
export function formatReportDoNo(doNo?: string, id?: number): string {
  const raw = String(doNo || id || '').trim();
  if (!raw) return '-';
  const clean = raw.replace(/^DO\s*#?/i, '').replace(/^#+/, '').trim();
  return `#${clean}`;
}
