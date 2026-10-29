import * as XLSX from 'xlsx';

/**
 * Utility to export JSON data to an Excel (.xlsx) file with auto-calculated column widths.
 *
 * @param data Array of records to export
 * @param fileName Desired filename (with or without .xlsx)
 * @param sheetName Sheet name inside the workbook (max 31 chars)
 */
export const exportToExcel = (
  data: Record<string, any>[],
  fileName: string,
  sheetName = 'Data'
): void => {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const ws = XLSX.utils.json_to_sheet(data);

  // Auto-fit column widths based on cell content
  const colWidths = Object.keys(data[0]).map((key) => {
    const maxValLength = Math.max(
      key.length,
      ...data.map((row) => String(row[key] ?? '').length)
    );
    return { wch: Math.min(Math.max(maxValLength + 3, 10), 50) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  const safeSheetName = sheetName.slice(0, 31).replace(/[\\/?*[\]]/g, '');
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);

  const cleanFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(wb, cleanFileName);
};
