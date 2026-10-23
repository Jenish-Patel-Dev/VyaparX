import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  KeyRound,
  Trash2,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Building2,
  ReceiptText,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';
import { adminService, type AdminUserStats } from '../../services/adminService';
import { userService } from '../../services/userService';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUserStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newInitialPin, setNewInitialPin] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

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
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.name && u.name.toLowerCase().includes(q))
      )
    );
  }, [searchQuery, users]);

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    try {
      setIsAddingUser(true);
      const user = await userService.getOrCreateUser(newEmail, newName);
      if (newInitialPin.length === 6) {
        await userService.updateUserPin(user.email, newInitialPin);
      }
      setShowAddUserModal(false);
      setNewEmail('');
      setNewName('');
      setNewInitialPin('');
      loadUsers();
    } catch (err) {
      console.error('Failed to add user:', err);
    } finally {
      setIsAddingUser(false);
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
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 rounded-2xl border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-700 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-[#60A5FA] shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowAddUserModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-neu-raised-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user email or name..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-neu-inset-sm"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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
                  <th className="py-3 px-4">Joined / Last Active</th>
                  <th className="py-3 px-4 text-center">Firms</th>
                  <th className="py-3 px-4 text-center">Trades</th>
                  <th className="py-3 px-4 text-right">Turnover</th>
                  <th className="py-3 px-4 text-right">Commission</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 font-medium">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id || u.email} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {u.name || u.email.split('@')[0]}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {u.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div>{u.createdAt ? formatDate(u.createdAt) : '—'}</div>
                        <div className="text-[10px] text-slate-400">
                          Last: {u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8EDF3] dark:bg-[#20242D] font-bold text-slate-700 dark:text-slate-300 text-[11px] border border-black/5 dark:border-white/5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {u.companyCount}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 font-bold text-blue-700 dark:text-blue-300 text-[11px] border border-blue-200/50 dark:border-blue-800/40">
                          <ReceiptText className="w-3 h-3 text-blue-500" />
                          {u.ordersCount}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        {formatCurrency(u.turnover)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        +{formatCurrency(u.brokerage)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(u);
                              setShowViewModal(true);
                            }}
                            className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer"
                            title="View User Details"
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      No users match your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: View User 360 */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
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
                    {selectedUser.createdAt ? formatDate(selectedUser.createdAt) : 'N/A'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Last Active</span>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Never'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-center shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Firms</span>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {selectedUser.companyCount}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-center shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Parties</span>
                  <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {selectedUser.partiesCount}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-center shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Sauda Orders</span>
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
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-blue-600 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reset PIN */}
      {pinModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-neu-raised-lg relative">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-500" />
              <span>Reset User Passcode PIN</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              For: <span className="font-bold text-slate-800 dark:text-slate-200">{pinModalUser.email}</span>
            </p>

            {pinSuccess ? (
              <div className="my-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>6-Digit PIN Updated Successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleResetPin} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    New 6-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit numeric PIN"
                    autoFocus
                    className="w-full text-center tracking-[0.5em] text-lg font-mono py-2.5 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-inset-sm focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    User will immediately be able to unlock their app with this PIN.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPinModalUser(null)}
                    className="px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={newPin.length !== 6}
                    className="px-4 py-2 rounded-2xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed disabled:opacity-40 cursor-pointer"
                  >
                    Set PIN
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Delete User Confirmation */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
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

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-md p-6 shadow-neu-raised-lg relative">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/10">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>Create New User Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="w-8 h-8 rounded-xl neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  User Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="broker@example.com"
                  className="w-full px-3 py-2 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-inset-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-inset-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Initial 6-Digit Passcode PIN (Optional)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={newInitialPin}
                  onChange={(e) => setNewInitialPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full px-3 py-2 font-mono tracking-widest rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-inset-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.06] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingUser}
                  className="px-4 py-2 rounded-2xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed disabled:opacity-50 cursor-pointer"
                >
                  {isAddingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
