import React, { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  Eye,
  Trash2,
  Edit,
  RefreshCw,
  CreditCard,
  X,
  AlertCircle,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { Company } from '../../types';

export const AdminCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [deleteCompany, setDeleteCompany] = useState<Company | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadCompanies = async () => {
    try {
      const data = await adminService.getAllCompanies();
      setCompanies(data);
      setFilteredCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCompanies(companies);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    setFilteredCompanies(
      companies.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.userEmail && c.userEmail.toLowerCase().includes(q)) ||
          (c.city && c.city.toLowerCase().includes(q)) ||
          (c.gstNumber && c.gstNumber.toLowerCase().includes(q))
      )
    );
  }, [searchQuery, companies]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadCompanies();
  };

  const handleDelete = async () => {
    if (!deleteCompany || !deleteCompany.id) return;
    try {
      setIsSaving(true);
      await adminService.deleteCompany(deleteCompany.id);
      setDeleteCompany(null);
      loadCompanies();
    } catch (err) {
      console.error('Failed to delete company:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCompany || !editCompany.id) return;
    try {
      setIsSaving(true);
      await adminService.updateCompany(editCompany.id, editCompany);
      setEditCompany(null);
      loadCompanies();
    } catch (err) {
      console.error('Failed to update company:', err);
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
            <Building2 className="w-5 h-5 text-indigo-500" />
            <span>Companies & Brokerage Firms Master</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit and manage all registered trade entities, banking details, GSTIN, and letterhead configurations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-10 h-10 rounded-2xl border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-700 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-[#60A5FA] shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
          title="Refresh Companies"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-neu-raised-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by firm name, user email, GST, city..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-neu-inset-sm"
          />
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="font-extrabold text-slate-900 dark:text-white">{filteredCompanies.length}</span> of {companies.length} companies
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-neu-raised-sm">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-slate-400 font-semibold">Loading companies...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E8EDF3] dark:bg-[#20242D] border-b border-black/[0.06] dark:border-white/10 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Company / Firm</th>
                  <th className="py-3 px-4">Owner Email</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">GSTIN / PAN</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 font-medium">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((c) => (
                    <tr key={c.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{c.name}</span>
                          {c.isDefault && (
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">ID: #{c.id}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {c.userEmail || c.email || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {c.city}, {c.state}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        <div>{c.gstNumber || 'No GST'}</div>
                        <div className="text-[10px] text-slate-400">{c.panNumber || ''}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        {c.contactNumber}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                          Active
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedCompany(c)}
                            className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer"
                            title="View Full Company Record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditCompany(c)}
                            className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer"
                            title="Edit Company Details"
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
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      No companies found matching search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: View Full Company */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-neu-raised-lg relative">
            <div className="flex items-start justify-between pb-4 border-b border-black/[0.06] dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {selectedCompany.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-500">Owner: {selectedCompany.userEmail || 'System'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="w-8 h-8 rounded-xl neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 space-y-1 shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Address</span>
                <p className="text-slate-900 dark:text-slate-100 font-semibold">
                  {selectedCompany.address}, {selectedCompany.city}, {selectedCompany.state} - {selectedCompany.pinCode}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">GSTIN</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedCompany.gstNumber || 'Not Provided'}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">PAN Number</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedCompany.panNumber || 'Not Provided'}
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
                    <span className="font-bold text-slate-900 dark:text-slate-100">{selectedCompany.bankName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">A/C No:</span>{' '}
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{selectedCompany.accountNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">IFSC:</span>{' '}
                    <span className="font-mono text-slate-800 dark:text-slate-200">{selectedCompany.ifscCode || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">UPI ID:</span>{' '}
                    <span className="font-mono text-slate-800 dark:text-slate-200">{selectedCompany.upiId || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-black/[0.06] dark:border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-2 rounded-2xl text-xs font-bold bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-blue-600 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Company */}
      {editCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
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

            <form onSubmit={handleUpdate} className="mt-4 space-y-3.5 text-xs">
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

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEditCompany(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
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
              <button
                type="button"
                onClick={() => setDeleteCompany(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Deleting...' : 'Delete Company'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
