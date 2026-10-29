import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Users,
  Search,
  KeyRound,
  Trash2,
  Eye,
  RefreshCw,
  Building2,
  ReceiptText,
  CheckCircle2,
  X,
  AlertCircle,
  Contact,
  Package,
  Clock,
  User as UserIcon,
  Download,
} from 'lucide-react';
import { adminService, type AdminUserStats } from '../../services/adminService';
import { formatCurrency, formatDateTime, formatDateTimeParts } from '../../utils/formatters';
import { AdminCustomSelect } from '../../components/admin/AdminCustomSelect';
import { exportToExcel } from '../../utils/excelExport';

export const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUserStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminUserStats | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [pinModalUser, setPinModalUser] = useState<AdminUserStats | null>(null);
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const [deleteModalUser, setDeleteModalUser] = useState<AdminUserStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await adminService.getAllUsersWithStats();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let result = users;

    if (selectedUserEmail !== 'ALL') {
      const email = selectedUserEmail.toLowerCase().trim();
      result = result.filter((u) => (u.email || '').toLowerCase().trim() === email);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.name && u.name.toLowerCase().includes(q)) ||
          ((u as any).phone && String((u as any).phone).includes(q))
      );
    }

    setFilteredUsers(result);
  }, [searchQuery, selectedUserEmail, users]);

    const handleExportExcel = () => {
    const exportData = filteredUsers.map((u) => ({
      'User Name': u.name || '-',
      'Email': u.email || '-',
      'Phone': (u as any).phone || '-',
      'Joined Date': u.createdAt ? formatDateTime(u.createdAt) : '-',
      'Last Active': u.lastLoginAt ? formatDateTime(u.lastLoginAt) : '-',
      'Companies': u.companyCount ?? 0,
      'Parties': u.partiesCount ?? 0,
      'Commodities': u.itemsCount ?? 0,
      'Total Commission (₹)': Number(u.brokerage) || 0,
      'Total Turnover (₹)': Number(u.turnover) || 0,
    }));
    exportToExcel(exportData, `VyaparX_Users_${new Date().toISOString().slice(0, 10)}`, 'Users');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadUsers();
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinModalUser || newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      return;
    }
    try {
      await adminService.resetUserPin(pinModalUser.id || pinModalUser.email, newPin);
      setPinSuccess(true);
      setTimeout(() => {
        setPinSuccess(false);
        setPinModalUser(null);
        setNewPin('');
      }, 1500);
    } catch (err) {
      console.error('Failed to reset PIN:', err);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;
    try {
      setIsDeleting(true);
      await adminService.deleteUser(deleteModalUser.id || deleteModalUser.email, deleteModalUser.email);
      setDeleteModalUser(null);
      loadUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <span>Users & Account Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete control over user profiles, security PINs, owned companies, and trade volumes.
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
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-neu-raised-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
          {/* Expanded Search Bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user email, name, phone..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-neu-inset-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* User Select Filter with Search */}
          <AdminCustomSelect
            value={selectedUserEmail}
            onChange={setSelectedUserEmail}
            icon={<UserIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
            options={[
              { value: 'ALL', label: 'All Users (Default)' },
              ...users.map((u) => ({
                value: u.email,
                label: u.name || u.email,
                sublabel: u.name ? u.email : undefined,
              })),
            ]}
            className="w-full sm:w-[260px] shrink-0"
            searchable={true}
          />

          {/* Reset button if filter or search is active */}
          {(selectedUserEmail !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedUserEmail('ALL');
                setSearchQuery('');
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all shrink-0 cursor-pointer"
              title="Reset search and filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0 text-right sm:text-left lg:text-right">
          Showing <span className="font-extrabold text-slate-900 dark:text-white">{filteredUsers.length}</span> of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-neu-raised-sm">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-slate-400 font-semibold">Loading user profiles...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E8EDF3] dark:bg-[#20242D] border-b border-black/[0.06] dark:border-white/10 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-center">Companies</th>
                  <th className="py-3 px-4 text-center">Parties</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-right">Commission</th>
                  <th className="py-3 px-4 text-right">Turnover</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 font-medium">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const joined = formatDateTimeParts(u.createdAt);
                    const lastActive = formatDateTimeParts(u.lastLoginAt);

                    return (
                      <tr key={u.id || u.email} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                        {/* 1. User Details */}
                        <td className="py-3.5 px-4">
                          <div
                            onClick={() => navigate(`/admin/users/${encodeURIComponent(u.email)}`)}
                            className="cursor-pointer group select-none"
                            title="Click to view comprehensive user reports"
                          >
                            <div className="font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                              {u.name || u.email.split('@')[0]}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 group-hover:underline">
                              {u.email}
                            </div>
                          </div>
                        </td>

                        {/* 2. Joined (Date & Time) */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {joined ? (
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-800 dark:text-slate-200">
                                {joined.date}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span>{joined.time}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* 3. Last Active (Date & Time) */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {lastActive ? (
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-800 dark:text-slate-200">
                                {lastActive.date}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span>{lastActive.time}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>

                        {/* 4. Companies */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8EDF3] dark:bg-[#20242D] font-bold text-slate-700 dark:text-slate-300 text-[11px] border border-black/5 dark:border-white/5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {u.companyCount}
                          </span>
                        </td>

                        {/* 5. Parties */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 font-bold text-purple-700 dark:text-purple-300 text-[11px] border border-purple-200/50 dark:border-purple-800/40">
                            <Contact className="w-3 h-3 text-purple-500" />
                            {u.partiesCount || 0}
                          </span>
                        </td>

                        {/* 6. Items */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 font-bold text-amber-700 dark:text-amber-300 text-[11px] border border-amber-200/50 dark:border-amber-800/40">
                            <Package className="w-3 h-3 text-amber-500" />
                            {u.itemsCount || 0}
                          </span>
                        </td>

                        {/* 7. Commission */}
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          +{formatCurrency(u.brokerage)}
                        </td>

                        {/* 8. Turnover */}
                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-slate-100">
                          {formatCurrency(u.turnover)}
                        </td>

                        {/* 9. Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/users/${encodeURIComponent(u.email)}`)}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer"
                              title="View Comprehensive User Report"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setPinModalUser(u);
                                setNewPin('');
                              }}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 flex items-center justify-center transition-all cursor-pointer"
                              title="Reset 6-digit PIN"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteModalUser(u)}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                              title="Delete User"
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
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                      No users match your filter or search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: View User 360 */}
      {showViewModal &&
        selectedUser &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
            <div className="bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-neu-raised-lg relative">
              <div className="flex items-start justify-between pb-4 border-b border-black/[0.06] dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedUser.name || 'User Profile'}
                    </h3>
                    <p className="text-xs font-mono text-slate-500">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="w-8 h-8 rounded-xl neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Registered On</span>
                    <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {selectedUser.createdAt ? formatDateTime(selectedUser.createdAt) : '-'}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Last Active</span>
                    <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {selectedUser.lastLoginAt ? formatDateTime(selectedUser.lastLoginAt) : 'Never'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-center shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Companies</span>
                    <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {selectedUser.companyCount}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-center shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Parties</span>
                    <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {selectedUser.partiesCount || 0}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-center shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Items</span>
                    <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      {selectedUser.itemsCount || 0}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-center shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Trades</span>
                    <p className="text-base font-black text-blue-600 dark:text-blue-400 mt-0.5">
                      {selectedUser.ordersCount}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase">Gross Turnover</span>
                    <p className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                      {formatCurrency(selectedUser.turnover)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">Total Brokerage</span>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                      +{formatCurrency(selectedUser.brokerage)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-black/[0.06] dark:border-white/10 flex justify-end">
                <button type="button" onClick={() => setShowViewModal(false)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-blue-600 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed cursor-pointer"><X className="w-3.5 h-3.5" /><span>Close</span></button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Reset PIN */}
      {pinModalUser &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
            <div className="bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-neu-raised-lg relative">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 flex items-center justify-center text-amber-500 shadow-neu-raised-sm shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                      Reset User Passcode PIN
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[210px]">
                      {pinModalUser.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPinModalUser(null)}
                  className="w-8 h-8 rounded-xl neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer shrink-0"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {pinSuccess ? (
                <div className="my-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>6-Digit PIN Updated Successfully!</span>
                </div>
              ) : (
                <form onSubmit={handleResetPin} className="mt-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        New 6-Digit Numeric PIN
                      </label>
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                        {newPin.length}/6 Digits
                      </span>
                    </div>

                    <input
                      type="password"
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-Digit PIN"
                      autoFocus
                      className={`w-full text-center py-2.5 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-inset-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-900 dark:text-white text-base sm:text-lg transition-all ${
                        newPin
                          ? 'tracking-[0.5em] font-mono font-black'
                          : 'tracking-normal font-sans font-medium placeholder:text-xs sm:placeholder:text-sm placeholder:text-slate-400'
                      }`}
                    />
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium leading-relaxed">
                      User will immediately be able to unlock their app with this PIN.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-black/[0.06] dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setPinModalUser(null)}
                      className="w-full py-2.5 rounded-2xl text-xs font-bold neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      disabled={newPin.length !== 6}
                      className="w-full py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Set PIN</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Modal: Delete User Confirmation */}
      {deleteModalUser &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
            <div className="bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-neu-raised-lg relative">
              <div className="w-12 h-12 rounded-2xl neu-raised-sm bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800/40 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-center text-slate-900 dark:text-white">
                Delete User Account?
              </h3>
              <p className="text-xs text-slate-500 text-center mt-1">
                Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-200">{deleteModalUser.email}</span>? This will also remove their registered companies and trades.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6 pt-3 border-t border-black/[0.06] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setDeleteModalUser(null)}
                  className="w-full py-2.5 rounded-2xl text-xs font-bold neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="w-full py-2.5 rounded-2xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
