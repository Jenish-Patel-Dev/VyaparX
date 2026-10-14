import React, { useState, useEffect } from 'react';
import { Search, BarChart2, Info, X } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { reportService, type PartyWiseReportRow } from '../../services/reportService';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { printBrokerageReport } from '../../utils/printReportService';

export const ReportsPage: React.FC = () => {
  const { currentCompany, currentFinancialYear } = useApp();
  const [reportData, setReportData] = useState<PartyWiseReportRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    reportService
      .getPartyWiseBrokerageReport(currentCompany?.id, currentFinancialYear)
      .then(data => {
        setReportData(data);
        setIsLoading(false);
      });
  }, [currentCompany?.id, currentFinancialYear]);

  const filteredData = reportData.filter(row =>
    row.partyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBrokerageSum = filteredData.reduce((sum, r) => sum + r.totalBrokerage, 0);
  const totalVolumeSum = filteredData.reduce((sum, r) => sum + r.totalQuantity, 0);
  const totalBillSum = filteredData.reduce((sum, r) => sum + r.totalBillAmount, 0);

  const handlePrint = () => {
    printBrokerageReport({
      rows: filteredData,
      totalBrokerage: totalBrokerageSum,
      totalVolume: totalVolumeSum,
      totalTurnover: totalBillSum,
      companyName: currentCompany?.name,
      financialYear: currentFinancialYear,
      filterText: searchQuery.trim() ? `Search: "${searchQuery.trim()}"` : undefined,
    });
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      <PageHeader
        title="BROKERAGE TOTAL AMOUNT REPORT"
        companyInfo={{
          companyName: currentCompany?.name,
          financialYear: currentFinancialYear,
        }}
        onPrint={handlePrint}
      />

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
        {/* Top Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="neu-raised p-4 md:p-5 rounded-3xl text-center min-w-0 overflow-hidden border border-white/60 dark:border-white/5">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Brokerage</div>
            <div className="text-base sm:text-lg md:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate" title={formatCurrency(totalBrokerageSum)}>
              {formatCurrency(totalBrokerageSum)}
            </div>
          </div>
          <div className="neu-raised p-4 md:p-5 rounded-3xl text-center min-w-0 overflow-hidden border border-white/60 dark:border-white/5">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Volume</div>
            <div className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white mt-1 truncate" title={totalVolumeSum.toLocaleString()}>
              {totalVolumeSum.toLocaleString()}
            </div>
          </div>
          <div className="neu-raised p-4 md:p-5 rounded-3xl text-center min-w-0 overflow-hidden border border-white/60 dark:border-white/5">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Turnover Amount</div>
            <div className="text-base sm:text-lg md:text-xl font-black text-blue-600 dark:text-blue-400 mt-1 truncate" title={formatCurrency(totalBillSum, 0)}>
              {formatCurrency(totalBillSum, 0)}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search party in report..."
            className="input-sauda !pl-11 !pr-10 text-xs sm:text-sm font-semibold"
          />
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2] transition-colors" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              title="Clear Search"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          )}
        </div>

        {/* Report Table / Cards */}
        <div className="neu-raised rounded-3xl overflow-hidden border border-white/60 dark:border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider whitespace-nowrap">
                  <th className="p-4">Party Name</th>
                  <th className="p-4 text-center">Orders</th>
                  <th className="p-4 text-right">Volume</th>
                  <th className="p-4 text-right">Turnover</th>
                  <th className="p-4 text-right">Brokerage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 whitespace-nowrap">
                {filteredData.map(row => (
                  <tr key={row.partyId} className="hover:bg-blue-500/5 transition-colors">
                    <td className="p-4 font-extrabold text-slate-900 dark:text-white uppercase">
                      <div className="truncate max-w-[180px] sm:max-w-xs" title={row.partyName}>{row.partyName}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                        Seller: {row.asSellerCount} | Buyer: {row.asBuyerCount}
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {row.totalOrders}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                      {row.totalQuantity.toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-600 dark:text-slate-400">
                      {formatCurrency(row.totalBillAmount, 0)}
                    </td>
                    <td className="p-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(row.totalBrokerage)}
                    </td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 dark:text-slate-500">
                      <BarChart2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">No brokerage records found</div>
                      <p className="text-xs text-slate-400 mt-1">
                        {searchQuery ? 'No records match your search filter' : 'No records found for the selected company & financial year.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredData.length > 0 && (
          <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-xs font-medium flex items-center justify-center gap-1.5">
            <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
            <span>No more records</span>
          </div>
        )}
      </div>
    </div>
  );
};
