import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Building2,
  Contact,
  Package,
  ReceiptText,
  KeyRound,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Search,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Lock,
  EyeOff,
  Clock,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { adminService, type UserFullAuditData } from '../../services/adminService';
import { formatCurrency, formatDateTime, formatDateTimeParts, formatDoNo, formatReportDoNo, formatDate } from '../../utils/formatters';
import { AdminCustomSelect } from '../../components/admin/AdminCustomSelect';
import { GlassDatePicker } from '../../components/common/GlassDatePicker';
import { TradeSlipModal } from '../../components/admin/TradeSlipModal';
import { useToast } from '../../context/ToastContext';
import type { Company, Party, Item, SaudaOrder } from '../../types';

export const AdminUserDetailPage: React.FC = () => {
  const { email } = useParams<{ email: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const userEmail = useMemo(() => decodeURIComponent(email || '').toLowerCase().trim(), [email]);

  const [data, setData] = useState<UserFullAuditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active Tab: 'profile' | 'companies' | 'parties' | 'items' | 'orders'
  const [activeTab, setActiveTab] = useState<'profile' | 'companies' | 'parties' | 'items' | 'orders'>('profile');

  // Tab 1: Profile Edit State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Tab 2: Companies State
  const [companySearch, setCompanySearch] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('ALL');
  const [viewCompany, setViewCompany] = useState<Company | null>(null);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [deleteCompany, setDeleteCompany] = useState<Company | null>(null);
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  // Tab 3: Parties State
  const [partySearch, setPartySearch] = useState('');
  const [selectedPartyFilter, setSelectedPartyFilter] = useState('ALL');
  const [viewParty, setViewParty] = useState<Party | null>(null);
  const [editParty, setEditParty] = useState<Party | null>(null);
  const [deleteParty, setDeleteParty] = useState<Party | null>(null);
  const [isSavingParty, setIsSavingParty] = useState(false);

  // Tab 4: Commodities / Items State
  const [itemSearch, setItemSearch] = useState('');
  const [selectedItemFilter, setSelectedItemFilter] = useState('ALL');
  const [viewItem, setViewItem] = useState<Item | null>(null);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [deleteItem, setDeleteItem] = useState<Item | null>(null);
  const [isSavingItem, setIsSavingItem] = useState(false);

  // Tab 5: Sauda Trades State & Multi-Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderCompanyFilter, setOrderCompanyFilter] = useState('ALL');
  const [orderPartyFilter, setOrderPartyFilter] = useState('ALL');
  const [orderItemFilter, setOrderItemFilter] = useState('ALL');
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [viewSlipOrder, setViewSlipOrder] = useState<SaudaOrder | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<SaudaOrder | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Load User Data
  const loadUserData = async (silent = false) => {
    if (!userEmail) return;
    try {
      if (!silent) setIsLoading(true);
      const audit = await adminService.getUserFullAudit(userEmail);
      setData(audit);
      setName(audit.user.name || '');
      setPhone(audit.user.phone || (audit.user as any).mobile || '');
      setPin(audit.user.pin || '');
    } catch (err) {
      console.error('Failed to load user audit:', err);
      toast.error('Failed to load user details');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userEmail]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadUserData(true);
  };

  // ----------------------------------------------------
  // PROFILE UPDATE HANDLER
  // ----------------------------------------------------
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    if (pin && pin.length !== 6) {
      toast.error('Passcode PIN must be exactly 6 digits');
      return;
    }

    try {
      setIsSavingProfile(true);
      const userId = data.user.id || userEmail.replace(/[.#$[\]]/g, '_');
      await adminService.updateUser(userId, {
        name: name.trim(),
        phone: phone.trim(),
        pin: pin.trim() || undefined,
        isPinEnabled: !!pin.trim(),
      });
      toast.success('User account details updated successfully');
      loadUserData(true);
    } catch (err) {
      console.error('Error updating user profile:', err);
      toast.error('Failed to update user profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ----------------------------------------------------
  // COMPANIES HANDLERS & FILTERING
  // ----------------------------------------------------
  const filteredCompanies = useMemo(() => {
    if (!data) return [];
    let list = data.companies;

    if (selectedCompanyFilter !== 'ALL') {
      list = list.filter((c) => String(c.id) === selectedCompanyFilter);
    }

    if (companySearch.trim()) {
      const q = companySearch.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.city && c.city.toLowerCase().includes(q)) ||
          (c.gstNumber && c.gstNumber.toLowerCase().includes(q)) ||
          (c.contactNumber && c.contactNumber.includes(q))
      );
    }

    return list;
  }, [data, companySearch, selectedCompanyFilter]);

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCompany?.id) return;
    try {
      setIsSavingCompany(true);
      await adminService.updateCompany(editCompany.id, editCompany);
      toast.success('Company updated successfully');
      setEditCompany(null);
      loadUserData(true);
    } catch (err) {
      console.error('Failed to update company:', err);
      toast.error('Failed to update company');
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!deleteCompany?.id) return;
    try {
      setIsSavingCompany(true);
      await adminService.deleteCompany(deleteCompany.id);
      toast.success('Company deleted successfully');
      setDeleteCompany(null);
      loadUserData(true);
    } catch (err) {
      console.error('Failed to delete company:', err);
      toast.error('Failed to delete company');
    } finally {
      setIsSavingCompany(false);
    }
  };

  // ----------------------------------------------------
  // PARTIES HANDLERS & FILTERING
  // ----------------------------------------------------
  const filteredParties = useMemo(() => {
    if (!data) return [];
    let list = data.parties;

    if (selectedPartyFilter !== 'ALL') {
      list = list.filter((p) => String(p.id) === selectedPartyFilter);
    }

    if (partySearch.trim()) {
      const q = partySearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.city && p.city.toLowerCase().includes(q)) ||
          (p.mobileNumber && p.mobileNumber.includes(q)) ||
          (p.gstNumber && p.gstNumber.toLowerCase().includes(q))
      );
    }

    return list;
  }, [data, partySearch, selectedPartyFilter]);

  const handleUpdateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editParty?.id) return;
    try {
      setIsSavingParty(true);
      await adminService.updateParty(editParty.id, editParty);
      toast.success('Party details updated successfully');
      setEditParty(null);
      loadUserData(true);
    } catch (err) {
      console.error('Failed to update party:', err);
      toast.error('Failed to update party');
    } finally {
      setIsSavingParty(false);
    }
  };

  const handleDeleteParty = async () => {
    if (!deleteParty?.id) return;
    try {
      setIsSavingParty(true);
      await adminService.deleteParty(deleteParty.id);
      toast.success('Party deleted successfully');
      setDeleteParty(null);
      loadUserData(true);
    } catch (err) {
      console.error('Failed to delete party:', err);
      toast.error('Failed to delete party');
    } finally {
      setIsSavingParty(false);
    }
  };

  // ----------------------------------------------------
  // ITEMS HANDLERS & FILTERING
  // ----------------------------------------------------
  const filteredItems = useMemo(() => {
    if (!data) return [];
    let list = data.items;

    if (selectedItemFilter !== 'ALL') {
      list = list.filter((i) => String(i.id) === selectedItemFilter);
    }

    if (itemSearch.trim()) {
      const q = itemSearch.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.unit && i.unit.toLowerCase().includes(q))
      );
    }

    return list;
  }, [data, itemSearch, selectedItemFilter]);

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem?.id) return;
    try {
      setIsSavingItem(true);
      await adminService.updateItem(editItem.id, editItem);
      toast.success('Commodity item updated successfully');
      setEditItem(null);
      loadUserData(true);
    } catch (err) {
      console.error('Failed to update item:', err);
      toast.error('Failed to update item');
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItem?.id) return;
    try {
      setIsSavingItem(true);
      await adminService.deleteItem(deleteItem.id);
      toast.success('Commodity item deleted successfully');
      setDeleteItem(null);
      loadUserData(true);
    } catch (err) {
      console.error('Failed to delete item:', err);
      toast.error('Failed to delete item');
    } finally {
      setIsSavingItem(false);
    }
  };

  // ----------------------------------------------------
  // SAUDA TRADES OPTIONS, FILTERING & HANDLERS
  // ----------------------------------------------------
  const saudaCompanyOptions = useMemo(() => {
    if (!data) return [{ value: 'ALL', label: 'All Companies' }];
    return [
      { value: 'ALL', label: 'All Companies' },
      ...data.companies.map((c) => ({ value: String(c.id), label: c.name })),
    ];
  }, [data]);

  const saudaPartyOptions = useMemo(() => {
    if (!data) return [{ value: 'ALL', label: 'All Parties' }];
    return [
      { value: 'ALL', label: 'All Parties' },
      ...data.parties.map((p) => ({ value: p.name, label: p.name })),
    ];
  }, [data]);

  const saudaItemOptions = useMemo(() => {
    if (!data) return [{ value: 'ALL', label: 'All Commodities' }];
    return [
      { value: 'ALL', label: 'All Commodities' },
      ...data.items.map((i) => ({ value: i.name, label: i.name })),
    ];
  }, [data]);

  const filteredOrders = useMemo(() => {
    if (!data) return [];
    let list = data.orders;

    if (orderCompanyFilter !== 'ALL') {
      list = list.filter((o) => String(o.companyId) === orderCompanyFilter || (o as any).companyName === orderCompanyFilter);
    }

    if (orderPartyFilter !== 'ALL') {
      const q = orderPartyFilter.toLowerCase();
      list = list.filter(
        (o) =>
          (o.buyerName && o.buyerName.toLowerCase() === q) ||
          (o.sellerName && o.sellerName.toLowerCase() === q)
      );
    }

    if (orderItemFilter !== 'ALL') {
      const q = orderItemFilter.toLowerCase();
      list = list.filter((o) => o.itemName && o.itemName.toLowerCase() === q);
    }

    if (orderDateFilter) {
      const cleanFilter = orderDateFilter.split('T')[0];
      list = list.filter((o) => {
        if (!o.date) return false;
        const oClean = o.date.split('T')[0];
        return oClean === cleanFilter || formatDate(o.date) === formatDate(orderDateFilter);
      });
    }

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      list = list.filter(
        (o) =>
          (o.itemName && o.itemName.toLowerCase().includes(q)) ||
          (o.buyerName && o.buyerName.toLowerCase().includes(q)) ||
          (o.sellerName && o.sellerName.toLowerCase().includes(q)) ||
          String(o.id).includes(q) ||
          (o.doNo && o.doNo.toLowerCase().includes(q)) ||
          (o.remark && o.remark.toLowerCase().includes(q))
      );
    }

    return list;
  }, [data, orderSearch, orderCompanyFilter, orderPartyFilter, orderItemFilter, orderDateFilter]);

  const hasActiveOrderFilters = useMemo(() => {
    return (
      orderSearch.trim() !== '' ||
      orderCompanyFilter !== 'ALL' ||
      orderPartyFilter !== 'ALL' ||
      orderItemFilter !== 'ALL' ||
      orderDateFilter !== ''
    );
  }, [orderSearch, orderCompanyFilter, orderPartyFilter, orderItemFilter, orderDateFilter]);

  const handleClearOrderFilters = () => {
    setOrderSearch('');
    setOrderCompanyFilter('ALL');
    setOrderPartyFilter('ALL');
    setOrderItemFilter('ALL');
    setOrderDateFilter('');
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrder?.id) return;
    try {
      setIsSavingOrder(true);
      await adminService.deleteSaudaOrder(deleteOrder.id);
      toast.success('Sauda trade order deleted successfully');
      setDeleteOrder(null);
      loadUserData(true);
    } catch (err) {
      console.error('Failed to delete trade order:', err);
      toast.error('Failed to delete trade order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <span className="text-sm text-slate-500 font-semibold tracking-wide">
          Loading user comprehensive audit profile...
        </span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-[#F0F3F8] dark:bg-[#262B36] rounded-3xl border border-white/80 dark:border-white/10 space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">User Account Not Found</h2>
        <p className="text-xs text-slate-500">We could not retrieve account data for: {userEmail}</p>
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-neu-raised-sm hover:shadow-neu-raised"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users & Accounts</span>
        </button>
      </div>
    );
  }

  const { user, stats } = data;
  const joinedParts = formatDateTimeParts(user.createdAt);
  const lastActiveParts = formatDateTimeParts(user.lastLoginAt);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Navigation & Back Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="w-10 h-10 rounded-2xl border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-700 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-[#60A5FA] shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed flex items-center justify-center transition-all cursor-pointer"
            title="Back to Users & Accounts"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {user.name || user.email.split('@')[0]}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                User Audit
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-2xl border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-700 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-[#60A5FA] shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh User Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl neu-raised bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center text-xl font-black shadow-neu-raised-sm shrink-0">
              {(user.name || user.email)[0].toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center flex-wrap gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {user.name || 'Verified Trader'}
                </h2>
                {user.pin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>PIN Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                    <KeyRound className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>PIN Not Set</span>
                  </span>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>{user.email}</span>
                </span>
                {phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{phone}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-black/[0.06] dark:border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 shadow-neu-inset-sm">
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <div className="flex items-baseline gap-1.5 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Joined:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{joinedParts?.date || '-'}</span>
                {joinedParts?.time && (
                  <span className="text-[11px] font-mono text-slate-400">({joinedParts.time})</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 shadow-neu-inset-sm">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="flex items-baseline gap-1.5 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last Active:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{lastActiveParts?.date || 'Never'}</span>
                {lastActiveParts?.time && (
                  <span className="text-[11px] font-mono text-slate-400">({lastActiveParts.time})</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KPI Mini-Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-black/[0.06] dark:border-white/10">
          <div className="p-3 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 shadow-neu-inset-sm text-center">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold">Companies</span>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              {stats.companyCount}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 shadow-neu-inset-sm text-center">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold">Parties</span>
            <p className="text-base font-black text-purple-600 dark:text-purple-400 mt-0.5">
              {stats.partiesCount}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 shadow-neu-inset-sm text-center">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold">Commodities</span>
            <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {stats.itemsCount}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 shadow-neu-inset-sm text-center">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold">Trades</span>
            <p className="text-base font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {stats.ordersCount}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 shadow-neu-inset-sm text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold">Turnover</span>
            <p className="text-xs font-black text-slate-900 dark:text-white mt-1 font-mono truncate">
              {formatCurrency(stats.turnover)}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 shadow-neu-inset-sm text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-extrabold">Brokerage</span>
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono truncate">
              +{formatCurrency(stats.brokerage)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="p-1.5 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-inset-sm flex items-center gap-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'profile'
              ? 'bg-[#2563EB] text-white shadow-neu-raised-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'companies'
              ? 'bg-[#2563EB] text-white shadow-neu-raised-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Companies</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
            activeTab === 'companies' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {data.companies.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('parties')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'parties'
              ? 'bg-[#2563EB] text-white shadow-neu-raised-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03]'
          }`}
        >
          <Contact className="w-4 h-4" />
          <span>Parties</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
            activeTab === 'parties' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {data.parties.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'items'
              ? 'bg-[#2563EB] text-white shadow-neu-raised-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Commodities</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
            activeTab === 'items' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {data.items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'orders'
              ? 'bg-[#2563EB] text-white shadow-neu-raised-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03]'
          }`}
        >
          <ReceiptText className="w-4 h-4" />
          <span>Sauda Trades</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
            activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {data.orders.length}
          </span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: USER PROFILE & UPDATE */}
      {/* ==================================================== */}
      {activeTab === 'profile' && (
        <div className="bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl p-6 shadow-neu-raised-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/10">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Account Profile & Security Information</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update account holder details, contact numbers, and 6-digit security passcode.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                  Account Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-neu-inset-sm"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                  Contact Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-neu-inset-sm"
                  />
                </div>
              </div>

              {/* Registered Email (Locked) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide flex items-center justify-between">
                  <span>Registered Account Email</span>
                  <span className="text-[10px] font-normal text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Primary Identifier</span>
                  </span>
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-black/30 border border-black/5 dark:border-white/5 text-xs font-mono text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-neu-inset-sm opacity-80"
                />
              </div>

              {/* 6-Digit PIN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide flex items-center justify-between">
                  <span>6-Digit Security Passcode PIN</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    Must be 6 numbers
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 123456"
                    className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-neu-inset-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.06] dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setName(data.user.name || '');
                  setPhone(data.user.phone || '');
                  setPin(data.user.pin || '');
                }}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Form</span>
              </button>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isSavingProfile ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Save Account Details</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: COMPANIES REPORT */}
      {/* ==================================================== */}
      {activeTab === 'companies' && (
        <div className="space-y-4">
          {/* Companies Filter Bar */}
          <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-neu-raised-sm">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
              {/* Search Box */}
              <div className="relative flex-1 w-full min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  placeholder="Search firm, city, GSTIN..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-neu-inset-sm"
                />
              </div>

              {/* Company Select Dropdown Filter */}
              <AdminCustomSelect
                value={selectedCompanyFilter}
                onChange={setSelectedCompanyFilter}
                icon={<Building2 className="w-4 h-4 text-blue-500" />}
                options={[
                  { value: 'ALL', label: 'All Registered Companies (Default)' },
                  ...data.companies.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                    sublabel: `${c.city || ''} ${c.gstNumber ? '• GST: ' + c.gstNumber : ''}`.trim() || undefined,
                  })),
                ]}
                className="w-full sm:w-[260px] shrink-0"
                searchable={true}
              />

              {/* Reset filter */}
              {(selectedCompanyFilter !== 'ALL' || companySearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCompanyFilter('ALL');
                    setCompanySearch('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 shadow-neu-raised-sm hover:shadow-neu-raised cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
              Showing <span className="font-extrabold text-slate-900 dark:text-white">{filteredCompanies.length}</span> of {data.companies.length} companies
            </div>
          </div>

          {/* Companies Table */}
          <div className="bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-neu-raised-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#E8EDF3] dark:bg-[#20242D] border-b border-black/[0.06] dark:border-white/10 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4">Company / Firm</th>
                    <th className="py-3.5 px-4">Contact Phone</th>
                    <th className="py-3.5 px-4">City / State</th>
                    <th className="py-3.5 px-4">GSTIN & PAN</th>
                    <th className="py-3.5 px-4">Bank & A/C</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 font-medium">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((c) => (
                      <tr key={c.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-white">{c.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{c.email || '-'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                          {c.contactNumber || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {c.city || '-'}{c.state ? `, ${c.state}` : ''}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-slate-800 dark:text-slate-200 font-bold">{c.gstNumber || '-'}</div>
                          <div className="text-[10px] text-slate-400">{c.panNumber || ''}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{c.bankName || '-'}</div>
                          <div className="font-mono text-[11px] text-slate-500">{c.accountNumber ? `A/C: ${c.accountNumber}` : ''}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewCompany(c)}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer"
                              title="View Full Company"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditCompany({ ...c })}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-all cursor-pointer"
                              title="Edit Company"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteCompany(c)}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                              title="Delete Company"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        No companies registered by this user match the query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: PARTIES DIRECTORY */}
      {/* ==================================================== */}
      {activeTab === 'parties' && (
        <div className="space-y-4">
          {/* Parties Filter Bar */}
          <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-neu-raised-sm">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
              {/* Search Box */}
              <div className="relative flex-1 w-full min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={partySearch}
                  onChange={(e) => setPartySearch(e.target.value)}
                  placeholder="Search party, mobile, city..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-neu-inset-sm"
                />
              </div>

              {/* Party Select Dropdown Filter */}
              <AdminCustomSelect
                value={selectedPartyFilter}
                onChange={setSelectedPartyFilter}
                icon={<Contact className="w-4 h-4 text-purple-500" />}
                options={[
                  { value: 'ALL', label: 'All Counterparties (Default)' },
                  ...data.parties.map((p) => ({
                    value: String(p.id),
                    label: p.name,
                    sublabel: `${p.city || ''} ${p.mobileNumber ? '• ' + p.mobileNumber : ''}`.trim() || undefined,
                  })),
                ]}
                className="w-full sm:w-[260px] shrink-0"
                searchable={true}
              />

              {/* Reset filter */}
              {(selectedPartyFilter !== 'ALL' || partySearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPartyFilter('ALL');
                    setPartySearch('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 shadow-neu-raised-sm hover:shadow-neu-raised cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
              Showing <span className="font-extrabold text-slate-900 dark:text-white">{filteredParties.length}</span> of {data.parties.length} parties
            </div>
          </div>

          {/* Parties Table */}
          <div className="bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-neu-raised-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#E8EDF3] dark:bg-[#20242D] border-b border-black/[0.06] dark:border-white/10 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4">Party Name</th>
                    <th className="py-3.5 px-4">Mobile</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">GSTIN & License</th>
                    <th className="py-3.5 px-4">Bank & UPI</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 font-medium">
                  {filteredParties.length > 0 ? (
                    filteredParties.map((p) => (
                      <tr key={p.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-white">{p.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{p.email || '-'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                          {p.mobileNumber || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {p.city || '-'}{p.state ? `, ${p.state}` : ''}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-slate-800 dark:text-slate-200 font-bold">{p.gstNumber || '-'}</div>
                          <div className="text-[10px] text-slate-400">{p.licenseNumber ? `APMC: ${p.licenseNumber}` : ''}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{p.bankName || '-'}</div>
                          <div className="font-mono text-[11px] text-slate-500">{p.upiId ? `UPI: ${p.upiId}` : ''}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewParty(p)}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer"
                              title="View Full Party"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditParty({ ...p })}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-all cursor-pointer"
                              title="Edit Party"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteParty(p)}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                              title="Delete Party"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        No counterparties registered by this user match the query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: COMMODITIES MASTER */}
      {/* ==================================================== */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Items Filter Bar */}
          <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-neu-raised-sm">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
              {/* Search Box */}
              <div className="relative flex-1 w-full min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Search commodity name, unit..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-neu-inset-sm"
                />
              </div>

              {/* Commodity Select Dropdown Filter */}
              <AdminCustomSelect
                value={selectedItemFilter}
                onChange={setSelectedItemFilter}
                icon={<Package className="w-4 h-4 text-amber-500" />}
                options={[
                  { value: 'ALL', label: 'All Commodities (Default)' },
                  ...data.items.map((i) => ({
                    value: String(i.id),
                    label: i.name,
                    sublabel: `Unit: ${i.unit || '-'}`,
                  })),
                ]}
                className="w-full sm:w-[260px] shrink-0"
                searchable={true}
              />

              {/* Reset filter */}
              {(selectedItemFilter !== 'ALL' || itemSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItemFilter('ALL');
                    setItemSearch('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 shadow-neu-raised-sm hover:shadow-neu-raised cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
              Showing <span className="font-extrabold text-slate-900 dark:text-white">{filteredItems.length}</span> of {data.items.length} commodities
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-neu-raised-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#E8EDF3] dark:bg-[#20242D] border-b border-black/[0.06] dark:border-white/10 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4">Commodity Item</th>
                    <th className="py-3.5 px-4">Trade Unit</th>
                    <th className="py-3.5 px-4">Seller Commission (₹)</th>
                    <th className="py-3.5 px-4">Buyer Commission (₹)</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 font-medium">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((i) => (
                      <tr key={i.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-white">{i.name}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                            {i.unit}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          ₹{Number(i.sellerCommissionRate || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          ₹{Number(i.buyerCommissionRate || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewItem(i)}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer"
                              title="View Commodity Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditItem({ ...i })}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-all cursor-pointer"
                              title="Edit Commodity"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteItem(i)}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                              title="Delete Commodity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        No commodity items registered by this user match the query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: SAUDA TRADES */}
      {/* ==================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Sauda Multi-Filter Bar */}
          <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* 1. Text Search Input */}
              <div className="relative flex-1 min-w-[200px] sm:min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by DO #, commodity, buyer, seller..."
                  className="w-full h-[38px] pl-9 pr-8 text-xs rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-neu-inset-sm font-medium"
                />
                {orderSearch && (
                  <button
                    type="button"
                    onClick={() => setOrderSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 2. Company Select Filter */}
              <AdminCustomSelect
                value={orderCompanyFilter}
                onChange={setOrderCompanyFilter}
                icon={<Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                options={saudaCompanyOptions}
                placeholder="All Companies"
                searchable={true}
                className="w-full sm:w-[170px] lg:w-[185px] shrink-0"
              />

              {/* 3. Party Select Filter */}
              <AdminCustomSelect
                value={orderPartyFilter}
                onChange={setOrderPartyFilter}
                icon={<Users className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                options={saudaPartyOptions}
                placeholder="All Parties"
                searchable={true}
                className="w-full sm:w-[170px] lg:w-[185px] shrink-0"
              />

              {/* 4. Commodity / Item Select Filter */}
              <AdminCustomSelect
                value={orderItemFilter}
                onChange={setOrderItemFilter}
                icon={<Package className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                options={saudaItemOptions}
                placeholder="All Commodities"
                searchable={true}
                className="w-full sm:w-[170px] lg:w-[185px] shrink-0"
              />

              {/* 5. Sauda Date Picker */}
              <div className="w-full sm:w-[160px] lg:w-[175px] shrink-0">
                <GlassDatePicker
                  value={orderDateFilter}
                  onChange={setOrderDateFilter}
                  placeholder="Sauda Date"
                  icon={<Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  triggerClassName="!h-[38px] !min-h-0 !py-0 !px-3.5 !rounded-2xl !bg-[#F0F3F8] dark:!bg-[#2B3140] !border !border-white/80 dark:!border-white/10 !shadow-neu-raised-sm hover:!shadow-neu-raised !text-xs !font-bold text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Sub-bar: Showing records & Active filter status with Reset Button */}
            <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/5 text-xs text-slate-500 dark:text-slate-400">
              <div className="font-medium">
                Showing <span className="font-extrabold text-slate-900 dark:text-white">{filteredOrders.length}</span> of {data.orders.length} orders
              </div>

              {hasActiveOrderFilters && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-900/40">
                    <span>Filtered view active</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearOrderFilters}
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

          {/* Sauda Orders Table */}
          <div className="bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-neu-raised-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#E8EDF3] dark:bg-[#20242D] border-b border-black/[0.06] dark:border-white/10 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4 whitespace-nowrap">DO No</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Sauda Date</th>
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
                      const comm = (Number(o.sellerCommissionAmount) || 0) + (Number(o.buyerCommissionAmount) || 0);
                      return (
                        <tr key={o.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                          <td className="py-3.5 px-4 font-mono font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            {formatReportDoNo(o.doNo, o.id)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium">
                            {o.date ? formatDate(o.date) : '-'}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900 dark:text-white">{o.itemName}</div>
                            <div className="text-[10px] text-slate-400">{o.itemQuality || 'Standard'}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                            {o.sellerName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                            {o.buyerName}
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-bold text-slate-900 dark:text-white">{o.quantity} {o.unit}</span>
                            <span className="text-slate-400 text-[11px] block">@ ₹{Number(o.billRate).toFixed(2)}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white">
                            {formatCurrency(o.totalBillAmount)}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(comm)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewSlipOrder(o)}
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
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        No sauda trades recorded for this user match the query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODALS SECTION (Full Page Backdrop Soft-Blur) */}
      {/* ==================================================== */}

      {/* 1. TRADE SLIP MODAL */}
      {viewSlipOrder && (
        <TradeSlipModal
          order={viewSlipOrder}
          onClose={() => setViewSlipOrder(null)}
        />
      )}

      {/* 2. VIEW COMPANY MODAL */}
      {viewCompany &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
            <div className="bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-neu-raised-lg relative">
              <div className="flex items-start justify-between pb-4 border-b border-black/[0.06] dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {viewCompany.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-500">Owner: {viewCompany.userEmail || userEmail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewCompany(null)}
                  className="w-8 h-8 rounded-xl neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-3.5 text-xs">
                <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 space-y-1 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Address</span>
                  <p className="text-slate-900 dark:text-slate-100 font-semibold">
                    {[viewCompany.address, viewCompany.city, viewCompany.state].filter(Boolean).join(', ') + (viewCompany.pinCode ? ` - ${viewCompany.pinCode}` : '') || '-'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">GSTIN</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                      {viewCompany.gstNumber || '-'}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">PAN Number</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                      {viewCompany.panNumber || '-'}
                    </p>
                  </div>
                </div>

                {/* Banking Details */}
                <div className="p-3.5 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 space-y-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-extrabold border-b border-black/[0.04] dark:border-white/5 pb-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Settlement Bank Credentials</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-400">Bank:</span>{' '}
                      <span className="font-bold text-slate-900 dark:text-slate-100">{viewCompany.bankName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">A/C No:</span>{' '}
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{viewCompany.accountNumber || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">IFSC:</span>{' '}
                      <span className="font-mono text-slate-800 dark:text-slate-200">{viewCompany.ifscCode || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">UPI ID:</span>{' '}
                      <span className="font-mono text-slate-800 dark:text-slate-200">{viewCompany.upiId || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.06] dark:border-white/10 flex justify-end">
                <button type="button" onClick={() => setViewCompany(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-blue-600 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed cursor-pointer"><X className="w-3.5 h-3.5" /><span>Close</span></button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 3. EDIT COMPANY MODAL */}
      {editCompany &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
            <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Edit Company Details</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditCompany(null)}
                  className="p-1.5 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateCompany} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    required
                    value={editCompany.name}
                    onChange={(e) => setEditCompany({ ...editCompany, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      required
                      value={editCompany.contactNumber}
                      onChange={(e) => setEditCompany({ ...editCompany, contactNumber: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={editCompany.email || ''}
                      onChange={(e) => setEditCompany({ ...editCompany, email: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                  <input
                    type="text"
                    value={editCompany.address}
                    onChange={(e) => setEditCompany({ ...editCompany, address: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      value={editCompany.city}
                      onChange={(e) => setEditCompany({ ...editCompany, city: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
                    <input
                      type="text"
                      value={editCompany.state}
                      onChange={(e) => setEditCompany({ ...editCompany, state: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={editCompany.pinCode}
                      onChange={(e) => setEditCompany({ ...editCompany, pinCode: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN</label>
                    <input
                      type="text"
                      value={editCompany.gstNumber || ''}
                      onChange={(e) => setEditCompany({ ...editCompany, gstNumber: e.target.value })}
                      className="w-full px-3 py-2.5 font-mono rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">PAN</label>
                    <input
                      type="text"
                      value={editCompany.panNumber || ''}
                      onChange={(e) => setEditCompany({ ...editCompany, panNumber: e.target.value })}
                      className="w-full px-3 py-2.5 font-mono rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={editCompany.bankName || ''}
                      onChange={(e) => setEditCompany({ ...editCompany, bankName: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={editCompany.accountNumber || ''}
                      onChange={(e) => setEditCompany({ ...editCompany, accountNumber: e.target.value })}
                      className="w-full px-3 py-2.5 font-mono rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/5 dark:border-white/10">
                  <button type="button" onClick={() => setEditCompany(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"><X className="w-3.5 h-3.5" /><span>Cancel</span></button>
                  <button type="submit" disabled={isSavingCompany} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"><Check className="w-3.5 h-3.5" /><span>{isSavingCompany ? 'Saving...' : 'Save Changes'}</span></button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* 4. DELETE COMPANY MODAL */}
      {deleteCompany &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
            <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-center text-slate-900 dark:text-white">
                Delete Company?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
                Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">{deleteCompany.name}</span>?
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button type="button" onClick={() => setDeleteCompany(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"><X className="w-3.5 h-3.5" /><span>Cancel</span></button>
                <button type="button" onClick={handleDeleteCompany} disabled={isSavingCompany} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /><span>{isSavingCompany ? 'Deleting...' : 'Delete Company'}</span></button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 5. VIEW PARTY MODAL */}
      {viewParty &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
            <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
              <div className="flex items-start justify-between pb-4 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                    <Contact className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {viewParty.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-500">Owner User: {viewParty.userEmail || userEmail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewParty(null)}
                  className="p-1.5 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Address</span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {[viewParty.address, viewParty.city, viewParty.state].filter(Boolean).join(', ') + (viewParty.pinCode ? ` - ${viewParty.pinCode}` : '') || '-'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Mobile</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{viewParty.mobileNumber || '-'}</p>
                  </div>
                  <div className="p-3 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Email</span>
                    <p className="font-mono text-slate-900 dark:text-white mt-0.5">{viewParty.email || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">GSTIN</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{viewParty.gstNumber || '-'}</p>
                  </div>
                  <div className="p-3 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">APMC License</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{viewParty.licenseNumber || '-'}</p>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="p-3.5 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
                    <CreditCard className="w-4 h-4" />
                    <span>Bank & Settlement Account</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-400">Bank:</span>{' '}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{viewParty.bankName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">A/C:</span>{' '}
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{viewParty.accountNumber || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">IFSC:</span>{' '}
                      <span className="font-mono text-slate-800 dark:text-slate-200">{viewParty.ifscCode || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">UPI:</span>{' '}
                      <span className="font-mono text-slate-800 dark:text-slate-200">{viewParty.upiId || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/10 flex justify-end">
                <button type="button" onClick={() => setViewParty(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-all cursor-pointer"><X className="w-3.5 h-3.5" /><span>Close</span></button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 6. EDIT PARTY MODAL */}
      {editParty &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
            <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Edit Counterparty Details</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditParty(null)}
                  className="p-1.5 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateParty} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Party Name</label>
                  <input
                    type="text"
                    required
                    value={editParty.name}
                    onChange={(e) => setEditParty({ ...editParty, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      required
                      value={editParty.mobileNumber}
                      onChange={(e) => setEditParty({ ...editParty, mobileNumber: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={editParty.email || ''}
                      onChange={(e) => setEditParty({ ...editParty, email: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                  <input
                    type="text"
                    value={editParty.address}
                    onChange={(e) => setEditParty({ ...editParty, address: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                    <input
                      type="text"
                      value={editParty.city}
                      onChange={(e) => setEditParty({ ...editParty, city: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
                    <input
                      type="text"
                      value={editParty.state}
                      onChange={(e) => setEditParty({ ...editParty, state: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={editParty.pinCode || ''}
                      onChange={(e) => setEditParty({ ...editParty, pinCode: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN</label>
                    <input
                      type="text"
                      value={editParty.gstNumber || ''}
                      onChange={(e) => setEditParty({ ...editParty, gstNumber: e.target.value })}
                      className="w-full px-3 py-2.5 font-mono rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">APMC License</label>
                    <input
                      type="text"
                      value={editParty.licenseNumber || ''}
                      onChange={(e) => setEditParty({ ...editParty, licenseNumber: e.target.value })}
                      className="w-full px-3 py-2.5 font-mono rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/5 dark:border-white/10">
                  <button type="button" onClick={() => setEditParty(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"><X className="w-3.5 h-3.5" /><span>Cancel</span></button>
                  <button type="submit" disabled={isSavingParty} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"><Check className="w-3.5 h-3.5" /><span>{isSavingParty ? 'Saving...' : 'Save Changes'}</span></button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* 7. DELETE PARTY MODAL */}
      {deleteParty &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
            <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-center text-slate-900 dark:text-white">
                Delete Party?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
                Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">{deleteParty.name}</span>?
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button type="button" onClick={() => setDeleteParty(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"><X className="w-3.5 h-3.5" /><span>Cancel</span></button>
                <button type="button" onClick={handleDeleteParty} disabled={isSavingParty} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /><span>{isSavingParty ? 'Deleting...' : 'Delete Party'}</span></button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 8. VIEW COMMODITY MODAL */}
      {viewItem &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
            <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewItem.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Unit: {viewItem.unit}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewItem(null)}
                  className="p-1.5 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Seller Comm Rate</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-white mt-1 text-sm">
                      ₹{Number(viewItem.sellerCommissionRate || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Buyer Comm Rate</span>
                    <p className="font-mono font-bold text-slate-900 dark:text-white mt-1 text-sm">
                      ₹{Number(viewItem.buyerCommissionRate || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/10 flex justify-end">
                <button type="button" onClick={() => setViewItem(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-all cursor-pointer"><X className="w-3.5 h-3.5" /><span>Close</span></button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 9. EDIT COMMODITY MODAL */}
      {editItem &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
            <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Edit Commodity</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="p-1.5 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateItem} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Commodity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editItem.name}
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Trade Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={editItem.unit}
                    onChange={(e) => setEditItem({ ...editItem, unit: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2.5 font-mono uppercase rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Seller Commission Rate (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editItem.sellerCommissionRate}
                      onChange={(e) => setEditItem({ ...editItem, sellerCommissionRate: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 font-mono rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Buyer Commission Rate (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editItem.buyerCommissionRate}
                      onChange={(e) => setEditItem({ ...editItem, buyerCommissionRate: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 font-mono rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/5 dark:border-white/10">
                  <button type="button" onClick={() => setEditItem(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"><X className="w-3.5 h-3.5" /><span>Cancel</span></button>
                  <button type="submit" disabled={isSavingItem} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"><Check className="w-3.5 h-3.5" /><span>{isSavingItem ? 'Updating...' : 'Save Changes'}</span></button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* 10. DELETE COMMODITY MODAL */}
      {deleteItem &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
            <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-center text-slate-900 dark:text-white">
                Delete Commodity?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
                Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-200">{deleteItem.name}</span>?
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button type="button" onClick={() => setDeleteItem(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"><X className="w-3.5 h-3.5" /><span>Cancel</span></button>
                <button type="button" onClick={handleDeleteItem} disabled={isSavingItem} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /><span>{isSavingItem ? 'Deleting...' : 'Delete Commodity'}</span></button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 11. DELETE SAUDA ORDER MODAL */}
      {deleteOrder &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
            <div className="bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-neu-raised-lg relative">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-center text-slate-900 dark:text-white">
                Delete Sauda Order #{deleteOrder.id}?
              </h3>
              <p className="text-xs text-slate-500 text-center mt-1">
                Are you sure you want to delete this trade of <span className="font-semibold text-slate-800 dark:text-slate-200">{deleteOrder.itemName} ({formatCurrency(deleteOrder.totalBillAmount)})</span>?
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button type="button" onClick={() => setDeleteOrder(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"><X className="w-3.5 h-3.5" /><span>Cancel</span></button>
                <button type="button" onClick={handleDeleteOrder} disabled={isSavingOrder} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:opacity-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /><span>{isSavingOrder ? 'Deleting...' : 'Delete Trade'}</span></button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
