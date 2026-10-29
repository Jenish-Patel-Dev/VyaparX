import { createPortal } from 'react-dom';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ReceiptText,
  Search,
  Eye,
  Trash2,
  RefreshCw,
  X,
  AlertCircle,
  IndianRupee,
  BadgePercent,
  RotateCcw,
  Building2,
  Users,
  Package,
  Calendar,
  User as UserIcon,
  Download,
} from 'lucide-react';
import { adminService, type AdminUserStats } from '../../services/adminService';
import { TradeSlipModal } from '../../components/admin/TradeSlipModal';
import { AdminCustomSelect } from '../../components/admin/AdminCustomSelect';
import { GlassDatePicker } from '../../components/common/GlassDatePicker';
import { formatCurrency, formatDate, formatReportDoNo } from '../../utils/formatters';
import type { Company, Item, Party, SaudaOrder } from '../../types';
import { exportToExcel } from '../../utils/excelExport';

export const AdminSaudaOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<SaudaOrder[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<AdminUserStats[]>([]);

  // Filters State (matching AdminUserDetailPage sauda tab + user filter)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState('ALL');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('ALL');
  const [selectedPartyFilter, setSelectedPartyFilter] = useState('ALL');
  const [selectedItemFilter, setSelectedItemFilter] = useState('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [viewOrder, setViewOrder] = useState<SaudaOrder | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<SaudaOrder | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      const [ordersData, companiesData, usersData, partiesData, itemsData] = await Promise.all([
        adminService.getAllSaudaOrders(),
        adminService.getAllCompanies().catch(() => []),
        adminService.getAllUsersWithStats().catch(() => []),
        adminService.getAllParties().catch(() => []),
        adminService.getAllItems().catch(() => []),
      ]);
      setOrders(ordersData);
      setCompanies(companiesData);
      setUsers(usersData);
      setParties(partiesData);
      setItems(itemsData);
    } catch (err) {
      console.error('Failed to load sauda orders data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

    const handleExportExcel = () => {
    const companyLookup: Record<string | number, string> = {};
    companies.forEach((c) => {
      if (c.id) companyLookup[c.id] = c.name;
    });

    const exportData = filteredOrders.map((o) => {
      const compName = (o as any).companyName || (o.companyId ? companyLookup[o.companyId] : '-') || '-';
      return {
        'Order ID': o.id ?? '-',
        'DO No': o.doNo ? formatReportDoNo(o.doNo) : '-',
        'Sauda Date': o.date ? formatDate(o.date) : '-',
        'Financial Year': o.financialYear || '-',
        'Company Name': compName,
        'Broker / User': o.userEmail || '-',
        'Commodity': o.itemName || '-',
        'Quality': o.itemQuality || '-',
        'Quantity': Number(o.quantity) || 0,
        'Unit': o.unit || '-',
        'Bill Rate (₹)': Number(o.billRate) || 0,
        'With GST': o.withGST ? 'Yes' : 'No',
        'GST %': Number(o.gstPercent) || 0,
        'GST Amount (₹)': Number(o.gstAmount) || 0,
        'Total Bill Amount (₹)': Number(o.totalBillAmount) || 0,
        'Seller Name': o.sellerName || '-',
        'Seller City': o.sellerCity || '-',
        'Seller Comm. Rate': Number(o.sellerCommissionRate) || 0,
        'Seller Commission (₹)': Number(o.sellerCommissionAmount) || 0,
        'Buyer Name': o.buyerName || '-',
        'Buyer City': o.buyerCity || '-',
        'Buyer Comm. Rate': Number(o.buyerCommissionRate) || 0,
        'Buyer Commission (₹)': Number(o.buyerCommissionAmount) || 0,
        'Total Commission (₹)': (Number(o.sellerCommissionAmount) || 0) + (Number(o.buyerCommissionAmount) || 0),
        'Payment Terms': o.paymentTerms || '-',
        'Delivery Terms': o.deliveryTerms || '-',
        'Remarks': o.remark || '-',
      };
    });
    exportToExcel(exportData, `VyaparX_Sauda_Orders_${new Date().toISOString().slice(0, 10)}`, 'Sauda Orders');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // Map user email to user profile for quick lookup
  const userMap = useMemo(() => {
    const map: Record<string, { name?: string; email: string }> = {};
    users.forEach((u) => {
      if (u.email) {
        map[u.email.toLowerCase().trim()] = { name: u.name, email: u.email };
      }
    });
    return map;
  }, [users]);

  // User Filter Options (All Brokers / Users)
  const userOptions = useMemo(() => {
    const list: Array<{ value: string; label: string; sublabel?: string }> = [
      { value: 'ALL', label: 'All Brokers / Users (Default)' },
    ];
    const seen = new Set<string>();

    users.forEach((u) => {
      const email = (u.email || '').toLowerCase().trim();
      if (email && !seen.has(email)) {
        seen.add(email);
        list.push({
          value: email,
          label: u.name || email,
          sublabel: u.name ? email : undefined,
        });
      }
    });

    orders.forEach((o) => {
      const email = (o.userEmail || '').toLowerCase().trim();
      if (email && !seen.has(email)) {
        seen.add(email);
        list.push({
          value: email,
          label: email,
        });
      }
    });

    return list;
  }, [users, orders]);

  // Company Filter Options
  const companyOptions = useMemo(() => {
    const list = [{ value: 'ALL', label: 'All Companies' }];
    const seen = new Set<string>();

    const relevantCompanies =
      selectedUserFilter !== 'ALL'
        ? companies.filter((c) => (c.userEmail || '').toLowerCase().trim() === selectedUserFilter)
        : companies;

    relevantCompanies.forEach((c) => {
      const key = String(c.id);
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ value: key, label: c.name });
      }
    });

    const relevantOrders =
      selectedUserFilter !== 'ALL'
        ? orders.filter((o) => (o.userEmail || '').toLowerCase().trim() === selectedUserFilter)
        : orders;

    relevantOrders.forEach((o) => {
      const cName = (o as any).companyName;
      if (cName && !seen.has(cName)) {
        seen.add(cName);
        list.push({ value: cName, label: cName });
      }
    });

    return list;
  }, [companies, orders, selectedUserFilter]);

  // Party Filter Options
  const partyOptions = useMemo(() => {
    const list = [{ value: 'ALL', label: 'All Parties' }];
    const seen = new Set<string>();

    const relevantParties =
      selectedUserFilter !== 'ALL'
        ? parties.filter((p) => (p.userEmail || '').toLowerCase().trim() === selectedUserFilter)
        : parties;

    relevantParties.forEach((p) => {
      const name = p.name?.trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({ value: name, label: name });
      }
    });

    const relevantOrders =
      selectedUserFilter !== 'ALL'
        ? orders.filter((o) => (o.userEmail || '').toLowerCase().trim() === selectedUserFilter)
        : orders;

    relevantOrders.forEach((o) => {
      if (o.sellerName && !seen.has(o.sellerName.toLowerCase().trim())) {
        seen.add(o.sellerName.toLowerCase().trim());
        list.push({ value: o.sellerName.trim(), label: o.sellerName.trim() });
      }
      if (o.buyerName && !seen.has(o.buyerName.toLowerCase().trim())) {
        seen.add(o.buyerName.toLowerCase().trim());
        list.push({ value: o.buyerName.trim(), label: o.buyerName.trim() });
      }
    });

    return list;
  }, [parties, orders, selectedUserFilter]);

  // Commodity / Item Filter Options
  const itemOptions = useMemo(() => {
    const list = [{ value: 'ALL', label: 'All Commodities' }];
    const seen = new Set<string>();

    const relevantItems =
      selectedUserFilter !== 'ALL'
        ? items.filter((i) => (i.userEmail || '').toLowerCase().trim() === selectedUserFilter)
        : items;

    relevantItems.forEach((i) => {
      const name = i.name?.trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({ value: name, label: name });
      }
    });

    const relevantOrders =
      selectedUserFilter !== 'ALL'
        ? orders.filter((o) => (o.userEmail || '').toLowerCase().trim() === selectedUserFilter)
        : orders;

    relevantOrders.forEach((o) => {
      if (o.itemName && !seen.has(o.itemName.toLowerCase().trim())) {
        seen.add(o.itemName.toLowerCase().trim());
        list.push({ value: o.itemName.trim(), label: o.itemName.trim() });
      }
    });

    return list;
  }, [items, orders, selectedUserFilter]);

  // Filtered Orders Calculation
  const filteredOrders = useMemo(() => {
    let result = orders;

    if (selectedUserFilter !== 'ALL') {
      const uf = selectedUserFilter.toLowerCase().trim();
      result = result.filter(
        (o) => (o.userEmail || '').toLowerCase().trim() === uf
      );
    }

    if (selectedCompanyFilter !== 'ALL') {
      result = result.filter(
        (o) =>
          String(o.companyId) === selectedCompanyFilter ||
          (o as any).companyName === selectedCompanyFilter
      );
    }

    if (selectedPartyFilter !== 'ALL') {
      const pf = selectedPartyFilter.toLowerCase().trim();
      result = result.filter(
        (o) =>
          (o.buyerName && o.buyerName.toLowerCase().trim() === pf) ||
          (o.sellerName && o.sellerName.toLowerCase().trim() === pf)
      );
    }

    if (selectedItemFilter !== 'ALL') {
      const itf = selectedItemFilter.toLowerCase().trim();
      result = result.filter(
        (o) => o.itemName && o.itemName.toLowerCase().trim() === itf
      );
    }

    if (selectedDateFilter) {
      const cleanFilter = selectedDateFilter.split('T')[0];
      result = result.filter((o) => {
        if (!o.date) return false;
        const oClean = o.date.split('T')[0];
        return oClean === cleanFilter || formatDate(o.date) === formatDate(selectedDateFilter);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          String(o.id).includes(q) ||
          (o.doNo && o.doNo.toLowerCase().includes(q)) ||
          (o.itemName && o.itemName.toLowerCase().includes(q)) ||
          (o.sellerName && o.sellerName.toLowerCase().includes(q)) ||
          (o.buyerName && o.buyerName.toLowerCase().includes(q)) ||
          (o.userEmail && o.userEmail.toLowerCase().includes(q)) ||
          (o.remark && o.remark.toLowerCase().includes(q))
      );
    }

    return result;
  }, [
    orders,
    selectedUserFilter,
    selectedCompanyFilter,
    selectedPartyFilter,
    selectedItemFilter,
    selectedDateFilter,
    searchQuery,
  ]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      selectedUserFilter !== 'ALL' ||
      selectedCompanyFilter !== 'ALL' ||
      selectedPartyFilter !== 'ALL' ||
      selectedItemFilter !== 'ALL' ||
      selectedDateFilter !== ''
    );
  }, [
    searchQuery,
    selectedUserFilter,
    selectedCompanyFilter,
    selectedPartyFilter,
    selectedItemFilter,
    selectedDateFilter,
  ]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedUserFilter('ALL');
    setSelectedCompanyFilter('ALL');
    setSelectedPartyFilter('ALL');
    setSelectedItemFilter('ALL');
    setSelectedDateFilter('');
  };

  const handleDelete = async () => {
    if (!deleteOrder || !deleteOrder.id) return;
    try {
      setIsSaving(true);
      await adminService.deleteSaudaOrder(deleteOrder.id);
      setDeleteOrder(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete order:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Metrics for filtered dataset
  const filteredTurnover = filteredOrders.reduce(
    (sum, o) => sum + (Number(o.totalBillAmount) || 0),
    0
  );
  const filteredBrokerage = filteredOrders.reduce(
    (sum, o) =>
      sum +
      ((Number(o.sellerCommissionAmount) || 0) + (Number(o.buyerCommissionAmount) || 0)),
    0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-indigo-500" />
            <span>Global Sauda Orders Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete platform-wide audit trail of commodity trades, contracts, and commission splits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportExcel}
            className="w-10 h-10 rounded-2xl border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed flex items-center justify-center transition-all cursor-pointer"
            title="Download Excel Report"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-2xl border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-700 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-[#60A5FA] shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Filtered Trades</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {filteredOrders.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ReceiptText className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Turnover</p>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {formatCurrency(filteredTurnover)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <IndianRupee className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Brokerage</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              +{formatCurrency(filteredBrokerage)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <BadgePercent className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Multi-Filter Bar (Identical to AdminUserDetailPage Sauda Tab + Broker User Filter) */}
      <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 1. Full-width Text Search Input */}
          <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by DO #, commodity, buyer, seller, user..."
              className="w-full h-[38px] pl-9 pr-8 text-xs rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-neu-inset-sm font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Broker / User Select Filter (New filter requested by user) */}
          <AdminCustomSelect
            value={selectedUserFilter}
            onChange={(val) => {
              setSelectedUserFilter(val);
              setSelectedCompanyFilter('ALL');
            }}
            icon={<UserIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
            options={userOptions}
            placeholder="All Brokers / Users"
            searchable={true}
            className="w-full sm:w-[190px] lg:w-[210px] shrink-0"
          />

          {/* 3. Company Select Filter */}
          <AdminCustomSelect
            value={selectedCompanyFilter}
            onChange={setSelectedCompanyFilter}
            icon={<Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
            options={companyOptions}
            placeholder="All Companies"
            searchable={true}
            className="w-full sm:w-[170px] lg:w-[185px] shrink-0"
          />

          {/* 4. Party Select Filter */}
          <AdminCustomSelect
            value={selectedPartyFilter}
            onChange={setSelectedPartyFilter}
            icon={<Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
            options={partyOptions}
            placeholder="All Parties"
            searchable={true}
            className="w-full sm:w-[170px] lg:w-[185px] shrink-0"
          />

          {/* 5. Commodity / Item Select Filter */}
          <AdminCustomSelect
            value={selectedItemFilter}
            onChange={setSelectedItemFilter}
            icon={<Package className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            options={itemOptions}
            placeholder="All Commodities"
            searchable={true}
            className="w-full sm:w-[170px] lg:w-[185px] shrink-0"
          />

          {/* 6. Sauda Date Picker */}
          <div className="w-full sm:w-[160px] lg:w-[175px] shrink-0">
            <GlassDatePicker
              value={selectedDateFilter}
              onChange={setSelectedDateFilter}
              placeholder="Sauda Date"
              icon={<Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
              triggerClassName="!h-[38px] !min-h-0 !py-0 !px-3.5 !rounded-2xl !bg-[#F0F3F8] dark:!bg-[#2B3140] !border !border-white/80 dark:!border-white/10 !shadow-neu-raised-sm hover:!shadow-neu-raised !text-xs !font-bold text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Sub-bar: Showing records & Active filter status with Reset Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/5 text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="font-medium">
            Showing <span className="font-extrabold text-slate-900 dark:text-white">{filteredOrders.length}</span> of {orders.length} orders
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-900/40">
                <span>Filtered view active</span>
              </div>

              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders Report Table (Identical structure to AdminUserDetailPage Sauda Tab) */}
      <div className="bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-neu-raised-sm">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-slate-400 font-semibold">Loading global sauda trades...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E8EDF3] dark:bg-[#20242D] border-b border-black/[0.06] dark:border-white/10 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 whitespace-nowrap">DO No</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Sauda Date</th>
                  <th className="py-3.5 px-4">Broker / User</th>
                  <th className="py-3.5 px-4">Commodity & Quality</th>
                  <th className="py-3.5 px-4">Seller Party</th>
                  <th className="py-3.5 px-4">Buyer Party</th>
                  <th className="py-3.5 px-4">Quantity & Rate</th>
                  <th className="py-3.5 px-4">Total Bill Amount</th>
                  <th className="py-3.5 px-4">Brokerage</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 font-medium">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => {
                    const totalComm =
                      (Number(o.sellerCommissionAmount) || 0) +
                      (Number(o.buyerCommissionAmount) || 0);
                    const userInf = userMap[(o.userEmail || '').toLowerCase().trim()];
                    return (
                      <tr
                        key={o.id}
                        className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors"
                      >
                        {/* 1. DO No */}
                        <td className="py-3.5 px-4 font-mono font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {formatReportDoNo(o.doNo, o.id)}
                        </td>

                        {/* 2. Sauda Date */}
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium">
                          {o.date ? formatDate(o.date) : '-'}
                        </td>

                        {/* 3. Broker / User */}
                        <td className="py-3.5 px-4 max-w-[170px] truncate" title={o.userEmail}>
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {userInf?.name || o.userEmail?.split('@')[0] || '-'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {o.userEmail || '-'}
                          </div>
                        </td>

                        {/* 4. Commodity & Quality */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {o.itemName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {o.itemQuality || 'Standard'}
                          </div>
                        </td>

                        {/* 5. Seller Party */}
                        <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                          {o.sellerName}
                        </td>

                        {/* 6. Buyer Party */}
                        <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                          {o.buyerName}
                        </td>

                        {/* 7. Quantity & Rate */}
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {o.quantity} {o.unit}
                          </span>
                          <span className="text-slate-400 text-[11px] block">
                            @ ₹{Number(o.billRate).toFixed(2)}
                          </span>
                        </td>

                        {/* 8. Total Bill Amount */}
                        <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white">
                          {formatCurrency(o.totalBillAmount)}
                        </td>

                        {/* 9. Brokerage */}
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(totalComm)}
                        </td>

                        {/* 10. Actions (View & Delete only, matching AdminUserDetailPage) */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewOrder(o)}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer"
                              title="View & Print Trade Slip"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteOrder(o)}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                              title="Delete Sauda Trade"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-medium">
                      No sauda trades found matching your selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade Slip Preview Modal */}
      {viewOrder && (
        <TradeSlipModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
        />
      )}

      {/* Delete Confirmation Modal (Soft Blur Backdrop & Neumorphic Design) */}
      {deleteOrder &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
            <div className="bg-[#F0F3F8] dark:bg-[#20242D] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-neu-raised-lg relative text-center">
              <div className="w-12 h-12 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#1E232B] text-red-500 mx-auto flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 stroke-[2.2]" />
              </div>

              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Delete Sauda Trade
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Are you sure you want to permanently delete Sauda Order{' '}
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                  {formatReportDoNo(deleteOrder.doNo, deleteOrder.id)}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeleteOrder(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Deleting...' : 'Delete Trade'}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
