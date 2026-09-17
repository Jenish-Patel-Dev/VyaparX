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

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  // handles YYYY-MM-DD or ISO string to DD/MM/YYYY
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
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
  const clean = raw.replace(/^DO\s*#?/i, '').replace(/^#/, '');
  return `#${clean}`;
}

