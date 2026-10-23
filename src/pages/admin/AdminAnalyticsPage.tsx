import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  IndianRupee,
  BadgePercent,
  Award,
  Package,
  RefreshCw,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';
import type { SaudaOrder, AppUser } from '../../types';

export const AdminAnalyticsPage: React.FC = () => {
  const [orders, setOrders] = useState<SaudaOrder[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [allOrders, allUsers] = await Promise.all([
        adminService.getAllSaudaOrders(),
        adminService.getAllUsersWithStats(),
      ]);
      setOrders(allOrders);
      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // Aggregations
  const totalTurnover = orders.reduce((acc, o) => acc + (Number(o.totalBillAmount) || 0), 0);
  const totalSellerComm = orders.reduce((acc, o) => acc + (Number(o.sellerCommissionAmount) || 0), 0);
  const totalBuyerComm = orders.reduce((acc, o) => acc + (Number(o.buyerCommissionAmount) || 0), 0);
  const totalBrokerage = totalSellerComm + totalBuyerComm;

  const avgOrderValue = orders.length > 0 ? totalTurnover / orders.length : 0;
  const brokerageYield = totalTurnover > 0 ? (totalBrokerage / totalTurnover) * 100 : 0;

  // Commodity rankings
  const commodityMap: Record<string, { count: number; turnover: number; quantity: number; unit: string }> = {};
  orders.forEach((o) => {
    const item = (o.itemName || 'Unspecified').trim();
    if (!commodityMap[item]) {
      commodityMap[item] = { count: 0, turnover: 0, quantity: 0, unit: o.unit || 'Unit' };
    }
    commodityMap[item].count += 1;
    commodityMap[item].turnover += Number(o.totalBillAmount) || 0;
    commodityMap[item].quantity += Number(o.quantity) || 0;
  });

  const sortedCommodities = Object.entries(commodityMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.turnover - a.turnover);

  // Broker rankings
  const brokerMap: Record<string, { email: string; name: string; count: number; turnover: number; brokerage: number }> = {};
  orders.forEach((o) => {
    const email = (o.userEmail || 'unknown').toLowerCase().trim();
    if (!brokerMap[email]) {
      const u = users.find((usr) => (usr.email || '').toLowerCase().trim() === email);
      brokerMap[email] = {
        email,
        name: u?.name || email.split('@')[0],
        count: 0,
        turnover: 0,
        brokerage: 0,
      };
    }
    brokerMap[email].count += 1;
    brokerMap[email].turnover += Number(o.totalBillAmount) || 0;
    brokerMap[email].brokerage +=
      (Number(o.sellerCommissionAmount) || 0) + (Number(o.buyerCommissionAmount) || 0);
  });

  const sortedBrokers = Object.values(brokerMap).sort((a, b) => b.turnover - a.turnover);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
          Calculating Platform Analytics...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Turnover & Financial Intelligence</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deep financial metrics, broker volume leaderboards, and commodity market yield analysis.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2.5 self-start sm:self-auto rounded-2xl neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"
          title="Refresh Analytics"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Trade Volume</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {formatCurrency(totalTurnover)}
          </p>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Avg Order Value:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(avgOrderValue)}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Commission Yield</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            +{formatCurrency(totalBrokerage)}
          </p>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Platform Commission Rate:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{brokerageYield.toFixed(2)}%</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Seller Commission</p>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 font-mono">
            {formatCurrency(totalSellerComm)}
          </p>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Share of Total:</span>
            <span className="font-bold font-mono">
              {totalBrokerage > 0 ? ((totalSellerComm / totalBrokerage) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Buyer Commission</p>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
            {formatCurrency(totalBuyerComm)}
          </p>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Share of Total:</span>
            <span className="font-bold font-mono">
              {totalBrokerage > 0 ? ((totalBuyerComm / totalBrokerage) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brokers Leaderboard */}
        <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-2xl p-5 shadow-neu-raised-sm">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Brokers Volume Leaderboard</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-semibold">{sortedBrokers.length} Active Traders</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-black/5 dark:border-white/10">
                <tr>
                  <th className="pb-2">Rank / Broker</th>
                  <th className="pb-2 text-center">Trades</th>
                  <th className="pb-2 text-right">Turnover</th>
                  <th className="pb-2 text-right">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                {sortedBrokers.length > 0 ? (
                  sortedBrokers.map((b, idx) => (
                    <tr key={b.email} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                            idx === 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            idx === 1 ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200' :
                            idx === 2 ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-400' :
                            'neu-inset bg-[#E8EDF3] dark:bg-[#20242D] text-slate-500'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">{b.name}</div>
                            <div className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">{b.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-center font-bold">{b.count}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(b.turnover)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        +{formatCurrency(b.brokerage)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No broker data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commodities Breakdown */}
        <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-2xl p-5 shadow-neu-raised-sm">
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-500" />
              <span>Commodity Market Share</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-semibold">{sortedCommodities.length} Commodities</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-black/5 dark:border-white/10">
                <tr>
                  <th className="pb-2">Commodity</th>
                  <th className="pb-2 text-center">Volume</th>
                  <th className="pb-2 text-right">Turnover</th>
                  <th className="pb-2 text-right">Share %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                {sortedCommodities.length > 0 ? (
                  sortedCommodities.map((item, idx) => {
                    const share = totalTurnover > 0 ? (item.turnover / totalTurnover) * 100 : 0;
                    return (
                      <tr key={item.name} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                          <span className="text-slate-400 mr-1.5">{idx + 1}.</span>
                          {item.name}
                        </td>
                        <td className="py-2.5 text-center font-mono">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.turnover)}
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                          {share.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No commodity trade records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
