import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Building2,
  ReceiptText,
  IndianRupee,
  BadgePercent,
  Contact,
  Package,
  Download,
  Eye,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  Calendar,
  User as UserIcon,
  Filter,
  X,
} from 'lucide-react';
import { adminService, type AdminDashboardMetrics } from '../../services/adminService';
import { AdminStatCard } from '../../components/admin/AdminStatCard';
import { AdminCustomSelect } from '../../components/admin/AdminCustomSelect';
import { TradeSlipModal } from '../../components/admin/TradeSlipModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { SaudaOrder } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SaudaOrder | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Filters State
  const [selectedFY, setSelectedFY] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<string>('ALL');

  const loadData = async (fy = selectedFY, usr = selectedUser) => {
    try {
      const data = await adminService.getDashboardMetrics({
        financialYear: fy,
        userEmail: usr,
      });
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load admin dashboard metrics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(selectedFY, selectedUser);
  }, [selectedFY, selectedUser]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(selectedFY, selectedUser);
  };

  const handleResetFilters = () => {
    setSelectedFY('ALL');
    setSelectedUser('ALL');
  };

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      const data = await adminService.exportFullDatabase();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vyaparx_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Loading Dashboard...
        </span>
      </div>
    );
  }

  const formatLakhsCr = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
    return formatCurrency(amount);
  };

  const isFiltered = selectedFY !== 'ALL' || selectedUser !== 'ALL';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Welcome & Actions Header with Neumorphic Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Real-time multi-tenant overview across all accounts, brokerages, and Mandi trades.
          </p>
        </div>

        {/* Top Controls: User Filter, FY Filter, Refresh, Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* User Select Filter */}
          <AdminCustomSelect
            value={selectedUser}
            onChange={setSelectedUser}
            icon={<UserIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
            options={[
              { value: 'ALL', label: 'All Users (System-wide)' },
              ...(metrics?.allUsersList?.map((u) => ({
                value: u.email,
                label: u.name || u.email,
                sublabel: u.name ? u.email : undefined,
              })) || []),
            ]}
            className="min-w-[190px] sm:min-w-[220px]"
            searchable={true}
          />

          {/* Financial Year Select Filter */}
          <AdminCustomSelect
            value={selectedFY}
            onChange={setSelectedFY}
            icon={<Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            options={[
              { value: 'ALL', label: 'All Financial Years' },
              ...(metrics?.allFinancialYears?.map((fy) => ({
                value: fy,
                label: `FY ${fy}`,
              })) || []),
            ]}
            className="min-w-[160px] sm:min-w-[180px]"
          />

          {/* Reset Filters Button (Visible only when filter is active) */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all cursor-pointer"
              title="Reset all filters to default"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 sm:w-auto sm:px-3.5 py-2 rounded-2xl border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-700 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-[#60A5FA] shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed flex items-center justify-center gap-1.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Full Backup Button */}
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all disabled:opacity-50 cursor-pointer"
            title="Export complete database backup as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export Backup'}</span>
          </button>
        </div>
      </div>

      {/* Active Filter Pill Bar (Shown when filtered) */}
      {isFiltered && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm text-xs animate-fade-in">
          <div className="flex flex-wrap items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
            <Filter className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-bold">Active Filter:</span>
            {selectedUser !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#E8EDF3] dark:bg-[#20242D] text-blue-600 dark:text-blue-400 font-bold border border-white/60 dark:border-white/10 shadow-2xs">
                <UserIcon className="w-3 h-3" />
                {selectedUser}
              </span>
            )}
            {selectedFY !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#E8EDF3] dark:bg-[#20242D] text-emerald-600 dark:text-emerald-400 font-bold border border-white/60 dark:border-white/10 shadow-2xs">
                <Calendar className="w-3 h-3" />
                FY {selectedFY}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Clear Filters & View All
          </button>
        </div>
      )}

      {/* KPI Cards Grid (6 Metric Cards: Users, Turnover, Brokerage, Companies, Parties, Items) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {/* 1. Total Users */}
        <AdminStatCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          subtitle={selectedUser !== 'ALL' ? 'Selected User' : `${metrics?.activeToday || 0} active today`}
          icon={Users}
          badge={selectedUser !== 'ALL' ? 'Selected' : `${metrics?.totalUsers || 0} Registered`}
          badgeColor="indigo"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />

        {/* 2. Gross Trade Turnover */}
        <AdminStatCard
          title="Trade Turnover"
          value={formatLakhsCr(metrics?.grossTurnover || 0)}
          subtitle={`${metrics?.totalOrders || 0} sauda orders`}
          icon={IndianRupee}
          badge="Volume"
          badgeColor="emerald"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />

        {/* 3. Total Brokerage Revenue */}
        <AdminStatCard
          title="Brokerage Revenue"
          value={formatCurrency(metrics?.totalBrokerage || 0)}
          subtitle="Buyer + Seller comm."
          icon={BadgePercent}
          badge="Commission"
          badgeColor="amber"
          iconColor="text-amber-600 dark:text-amber-400"
        />

        {/* 4. Companies & Firms */}
        <AdminStatCard
          title="Companies & Firms"
          value={metrics?.totalCompanies || 0}
          subtitle="Registered firms"
          icon={Building2}
          badge="Firms"
          badgeColor="purple"
          iconColor="text-purple-600 dark:text-purple-400"
        />

        {/* 5. Parties Directory */}
        <AdminStatCard
          title="Parties Directory"
          value={metrics?.totalParties || 0}
          subtitle="Buyers & Sellers"
          icon={Contact}
          badge="Parties"
          badgeColor="blue"
          iconColor="text-blue-600 dark:text-blue-400"
        />

        {/* 6. Commodities / Items */}
        <AdminStatCard
          title="Commodities Master"
          value={metrics?.totalItems || 0}
          subtitle="Product items"
          icon={Package}
          badge="Commodities"
          badgeColor="emerald"
          iconColor="text-teal-600 dark:text-teal-400"
        />
      </div>

      {/* Main Two-Column Section: Recent Trades & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Trades Platform-Wide */}
        <div className="lg:col-span-2 bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl p-5 shadow-neu-raised-sm">
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/10">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>
                  Recent Trades {selectedUser !== 'ALL' ? `(${selectedUser})` : '(All Accounts)'}
                  {selectedFY !== 'ALL' ? ` • FY ${selectedFY}` : ''}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Latest transactions registered in the selected scope.
              </p>
            </div>
            <NavLink
              to="/admin/sauda"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/10 text-[11px] font-bold uppercase text-slate-400">
                  <th className="pb-3 font-bold">DO #</th>
                  <th className="pb-3 font-bold">User Email</th>
                  <th className="pb-3 font-bold">Commodity</th>
                  <th className="pb-3 font-bold">Parties (Seller ➔ Buyer)</th>
                  <th className="pb-3 font-bold text-right">Amount</th>
                  <th className="pb-3 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 font-medium">
                {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
                  metrics.recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        #{o.id}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300 max-w-[140px] truncate" title={o.userEmail}>
                        {o.userEmail || '—'}
                      </td>
                      <td className="py-3">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {o.itemName}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {o.quantity} {o.unit}
                        </div>
                      </td>
                      <td className="py-3 max-w-[180px] truncate">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{o.sellerName}</span>
                        <span className="text-slate-400 mx-1">➔</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">{o.buyerName}</span>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {formatCurrency(o.totalBillAmount)}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(o)}
                          className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer mx-auto"
                          title="View Digital Contract Slip"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No trades found for selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: User Overview / Recent Users */}
        <div className="bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl p-5 shadow-neu-raised-sm">
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/10">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{selectedUser !== 'ALL' ? 'Selected User Profile' : 'Recent Users'}</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {selectedUser !== 'ALL' ? 'Account details of filtered user.' : 'New accounts created in platform.'}
              </p>
            </div>
            <NavLink
              to="/admin/users"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="mt-4 space-y-2.5">
            {metrics?.recentUsers && metrics.recentUsers.length > 0 ? (
              metrics.recentUsers.map((u) => (
                <div
                  key={u.id || u.email}
                  className="p-3 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 flex items-center justify-between shadow-2xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {u.name || u.email.split('@')[0]}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {u.email}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold">
                      {u.createdAt ? formatDate(u.createdAt) : 'Registered'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-400 font-medium">
                No users found.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Commodities & Top Brokers Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Commodities */}
        <div className="bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl p-5 shadow-neu-raised-sm">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/10">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Top Traded Commodities</span>
            </h3>
            <NavLink to="/admin/items" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
              View Items
            </NavLink>
          </div>

          <div className="mt-4 space-y-3">
            {metrics?.topCommodities && metrics.topCommodities.length > 0 ? (
              metrics.topCommodities.map((item, idx) => {
                const maxTurnover = metrics.topCommodities[0].turnover || 1;
                const pct = Math.min(100, Math.round((item.turnover / maxTurnover) * 100));
                return (
                  <div key={item.name} className="space-y-1.5 p-2.5 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-900 dark:text-slate-100 font-bold">
                        {idx + 1}. {item.name}
                      </span>
                      <span className="font-mono text-slate-900 dark:text-white font-extrabold">
                        {formatCurrency(item.turnover)} ({item.count} trades)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-4 text-xs text-slate-400 text-center font-medium">No commodity trades recorded.</p>
            )}
          </div>
        </div>

        {/* Top Brokers Activity */}
        <div className="bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl p-5 shadow-neu-raised-sm">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/10">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Broker Performance Leaderboard</span>
            </h3>
            <NavLink to="/admin/analytics" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
              Full Analytics
            </NavLink>
          </div>

          <div className="mt-4 space-y-2.5">
            {metrics?.topBrokers && metrics.topBrokers.length > 0 ? (
              metrics.topBrokers.map((b, idx) => (
                <div
                  key={b.email}
                  className="p-3 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 flex items-center justify-between text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs shrink-0 border border-blue-500/20">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 dark:text-white truncate">
                        {b.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate font-mono">
                        {b.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-slate-900 dark:text-white font-mono">
                      {formatCurrency(b.turnover)}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      +{formatCurrency(b.brokerage)} comm. ({b.ordersCount} trades)
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-xs text-slate-400 text-center font-medium">No broker activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Trade Slip Preview Modal */}
      {selectedOrder && (
        <TradeSlipModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
