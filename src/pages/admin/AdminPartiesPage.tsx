import {
  createPortal } from 'react-dom';
import React,
  { useEffect, useMemo,
  useState } from 'react';
import {
  Contact,
  Search,
  Filter,
  Eye,
  Trash2,
  Edit,
  RefreshCw,
  CreditCard,
  X,
  AlertCircle,
  Check,
  User as UserIcon,
  RotateCcw,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminCustomSelect } from '../../components/admin/AdminCustomSelect';
import type { Party } from '../../types';

export const AdminPartiesPage: React.FC = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [filteredParties, setFilteredParties] = useState<Party[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'seller' | 'buyer' | 'both'>('ALL');
  const [selectedUserFilter, setSelectedUserFilter] = useState('ALL');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [editParty, setEditParty] = useState<Party | null>(null);
  const [deleteParty, setDeleteParty] = useState<Party | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadParties = async () => {
    try {
      setIsLoading(true);
      const [data, usersData] = await Promise.all([
        adminService.getAllParties(),
        adminService.getAllUsersWithStats().catch(() => []),
      ]);
      setParties(data);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load parties:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadParties();
  }, []);

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

    parties.forEach((p) => {
      const email = (p.userEmail || '').toLowerCase().trim();
      if (email && !seen.has(email)) {
        seen.add(email);
        list.push({
          value: email,
          label: email,
        });
      }
    });

    return list;
  }, [users, parties]);

  useEffect(() => {
    let result = parties;

    if (selectedUserFilter !== 'ALL') {
      const uf = selectedUserFilter.toLowerCase().trim();
      result = result.filter(
        (p) => (p.userEmail || '').toLowerCase().trim() === uf
      );
    }

    if (typeFilter !== 'ALL') {
      result = result.filter((p) => p.partyType === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.mobileNumber && p.mobileNumber.includes(q)) ||
          (p.city && p.city.toLowerCase().includes(q)) ||
          (p.userEmail && p.userEmail.toLowerCase().includes(q)) ||
          (p.gstNumber && p.gstNumber.toLowerCase().includes(q))
      );
    }

    setFilteredParties(result);
  }, [searchQuery, typeFilter, selectedUserFilter, parties]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadParties();
  };

  const handleDelete = async () => {
    if (!deleteParty || !deleteParty.id) return;
    try {
      setIsSaving(true);
      await adminService.deleteParty(deleteParty.id);
      setDeleteParty(null);
      loadParties();
    } catch (err) {
      console.error('Failed to delete party:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editParty || !editParty.id) return;
    try {
      setIsSaving(true);
      await adminService.updateParty(editParty.id, editParty);
      setEditParty(null);
      loadParties();
    } catch (err) {
      console.error('Failed to update party:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Contact className="w-5 h-5 text-indigo-500" />
            <span>Parties Directory (Buyers & Sellers)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global master of Mandi counterparties, contact profiles, APMC licenses, and bank information.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-10 h-10 rounded-2xl border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-700 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-[#60A5FA] shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
          title="Refresh Parties"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-neu-raised-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 w-full">
          {/* Expanded Full-width Search Bar */}
          <div className="relative flex-1 w-full min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by party name, phone, city, user..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-neu-inset-sm font-medium"
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

          {/* Broker / User Filter */}
          <AdminCustomSelect
            value={selectedUserFilter}
            onChange={setSelectedUserFilter}
            icon={<UserIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
            options={userOptions}
            placeholder="All Brokers / Users"
            className="w-full sm:w-[220px] shrink-0"
            searchable={true}
          />

          {/* Party Type Filter */}
          <AdminCustomSelect
            value={typeFilter}
            onChange={(val) => setTypeFilter(val as 'ALL' | 'seller' | 'buyer' | 'both')}
            icon={<Filter className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />}
            options={[
              { value: 'ALL', label: 'All Party Types' },
              { value: 'seller', label: 'Sellers Only' },
              { value: 'buyer', label: 'Buyers Only' },
              { value: 'both', label: 'Both (Buyer & Seller)' },
            ]}
            className="w-full sm:w-[200px] shrink-0"
          />

          {/* Reset button if filter or search is active */}
          {(selectedUserFilter !== 'ALL' || typeFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedUserFilter('ALL');
                setTypeFilter('ALL');
                setSearchQuery('');
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all shrink-0 cursor-pointer"
              title="Reset search and filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0 text-right sm:text-left lg:text-right">
          Showing <span className="font-extrabold text-slate-900 dark:text-white">{filteredParties.length}</span> of {parties.length} parties
        </div>
      </div>

      {/* Parties Table */}
      <div className="bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-neu-raised-sm">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-slate-400 font-semibold">Loading parties...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E8EDF3] dark:bg-[#20242D] border-b border-black/[0.06] dark:border-white/10 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Party Name</th>
                  <th className="py-3 px-4">Owner Email</th>
                  <th className="py-3 px-4">Mobile / Contact</th>
                  <th className="py-3 px-4">City / State</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4">GSTIN / APMC</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 font-medium">
                {filteredParties.length > 0 ? (
                  filteredParties.map((p) => (
                    <tr key={p.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                        {p.name}
                        <div className="text-[10px] text-slate-400 font-normal">ID: #{p.id}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {p.userEmail || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        {p.mobileNumber || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {p.city || '—'}, {p.state || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
                          {p.partyType || 'Both'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        <div>{p.gstNumber || '-'}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{p.licenseNumber || ''}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedParty(p)}
                            className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditParty(p)}
                            className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer"
                            title="Edit Party Details"
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
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      No parties found matching search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: View Full Party Details */}
      {selectedParty && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
          <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-start justify-between pb-4 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  <Contact className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedParty.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-500">Owner User: {selectedParty.userEmail || '—'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedParty(null)}
                className="p-1.5 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Address</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {selectedParty.address}, {selectedParty.city}, {selectedParty.state} {selectedParty.pinCode ? ` - ${selectedParty.pinCode}` : ''}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Mobile</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{selectedParty.mobileNumber}</p>
                </div>
                <div className="p-3 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Email</span>
                  <p className="font-mono text-slate-900 dark:text-white mt-0.5">{selectedParty.email || 'Not Provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">GSTIN</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{selectedParty.gstNumber || 'Not Provided'}</p>
                </div>
                <div className="p-3 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">APMC License</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{selectedParty.licenseNumber || 'Not Provided'}</p>
                </div>
              </div>

              {/* Bank Details */}
              <div className="p-3.5 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                  <CreditCard className="w-4 h-4" />
                  <span>Bank & Settlement Account</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400">Bank:</span>{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedParty.bankName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">A/C:</span>{' '}
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedParty.accountNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">IFSC:</span>{' '}
                    <span className="font-mono text-slate-800 dark:text-slate-200">{selectedParty.ifscCode || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">UPI:</span>{' '}
                    <span className="font-mono text-slate-800 dark:text-slate-200">{selectedParty.upiId || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-black/5 dark:border-white/10 flex justify-end">
              <button type="button" onClick={() => setSelectedParty(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-all cursor-pointer"><X className="w-3.5 h-3.5" /><span>Close</span></button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Edit Party */}
      {editParty && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
          <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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

            <form onSubmit={handleUpdate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Party / Firm Name</label>
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
                  <AdminCustomSelect
                    label="Party Type"
                    variant="form"
                    value={editParty.partyType || 'both'}
                    onChange={(val) => setEditParty({ ...editParty, partyType: val as 'both' | 'seller' | 'buyer' })}
                    options={[
                      { value: 'both', label: 'Both (Buyer & Seller)' },
                      { value: 'seller', label: 'Seller' },
                      { value: 'buyer', label: 'Buyer' },
                    ]}
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

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">APMC Mandi License</label>
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
                <button type="submit" disabled={isSaving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"><Check className="w-3.5 h-3.5" /><span>{isSaving ? 'Saving...' : 'Save Changes'}</span></button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Delete Confirmation */}
      {deleteParty && createPortal(
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
              <button type="button" onClick={handleDelete} disabled={isSaving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /><span>{isSaving ? 'Deleting...' : 'Delete Party'}</span></button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
