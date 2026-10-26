import {
  createPortal } from 'react-dom';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  X,
  AlertCircle,
  Check,
  User as UserIcon,
  RotateCcw,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminCustomSelect } from '../../components/admin/AdminCustomSelect';
import { formatDate } from '../../utils/formatters';
import type { Item } from '../../types';

export const AdminItemsPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [selectedUserFilter, setSelectedUserFilter] = useState('ALL');
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [deleteItem, setDeleteItem] = useState<Item | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for new item
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('CANDY');
  const [newSellerRate, setNewSellerRate] = useState<number>(0);
  const [newBuyerRate, setNewBuyerRate] = useState<number>(0);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const [data, usersData] = await Promise.all([
        adminService.getAllItems(),
        adminService.getAllUsersWithStats().catch(() => []),
      ]);
      setItems(data);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadItems();
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

    items.forEach((i) => {
      const email = (i.userEmail || '').toLowerCase().trim();
      if (email && !seen.has(email)) {
        seen.add(email);
        list.push({
          value: email,
          label: email,
        });
      }
    });

    return list;
  }, [users, items]);

  useEffect(() => {
    let result = items;

    if (selectedUserFilter !== 'ALL') {
      const uf = selectedUserFilter.toLowerCase().trim();
      result = result.filter(
        (i) => (i.userEmail || '').toLowerCase().trim() === uf
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.unit.toLowerCase().includes(q) ||
          (i.userEmail && i.userEmail.toLowerCase().includes(q))
      );
    }

    setFilteredItems(result);
  }, [searchQuery, selectedUserFilter, items]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadItems();
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    try {
      setIsSaving(true);
      await adminService.createItem({
        name: newItemName.trim(),
        unit: newItemUnit.trim().toUpperCase(),
        sellerCommissionRate: Number(newSellerRate) || 0,
        buyerCommissionRate: Number(newBuyerRate) || 0,
        userEmail: 'system',
      });
      setShowAddModal(false);
      setNewItemName('');
      setNewItemUnit('CANDY');
      setNewSellerRate(0);
      setNewBuyerRate(0);
      loadItems();
    } catch (err) {
      console.error('Failed to create item:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem || !editItem.id) return;
    try {
      setIsSaving(true);
      await adminService.updateItem(editItem.id, editItem);
      setEditItem(null);
      loadItems();
    } catch (err) {
      console.error('Failed to update item:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItem || !deleteItem.id) return;
    try {
      setIsSaving(true);
      await adminService.deleteItem(deleteItem.id);
      setDeleteItem(null);
      loadItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
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
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Commodity Items Catalog</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global agro-commodities (Cotton, Kapas, Khol, Grains) and default commission standards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"
            title="Refresh Items"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-neu-raised-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Commodity</span>
          </button>
        </div>
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
              placeholder="Search by commodity name, unit, owner..."
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
            className="w-full sm:w-[240px] shrink-0"
            searchable={true}
          />

          {/* Reset button if filter or search is active */}
          {(selectedUserFilter !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedUserFilter('ALL');
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
          Showing <span className="font-extrabold text-slate-900 dark:text-white">{filteredItems.length}</span> of {items.length} commodities
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-2xl neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 overflow-hidden shadow-neu-raised-sm">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-slate-400">Loading commodities...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-200/50 dark:bg-[#1E232D] border-b border-black/5 dark:border-white/10 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Commodity Name</th>
                  <th className="py-3 px-4">Standard Unit</th>
                  <th className="py-3 px-4">Seller Default Rate</th>
                  <th className="py-3 px-4">Buyer Default Rate</th>
                  <th className="py-3 px-4">Scope / Owner</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span>{item.name}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">ID: #{item.id}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-md neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs">
                          {item.unit}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono">
                        ₹{item.sellerCommissionRate} / {item.unit}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-mono">
                        ₹{item.buyerCommissionRate} / {item.unit}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-[11px] font-mono">
                        {item.userEmail && item.userEmail !== 'system' ? (
                          <span className="text-slate-600 dark:text-slate-300">{item.userEmail}</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                            Global Master
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {item.createdAt ? formatDate(item.createdAt) : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditItem(item)}
                            className="p-1.5 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"
                            title="Edit Commodity"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteItem(item)}
                            className="p-1.5 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-all active:scale-95"
                            title="Delete Commodity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No commodities found matching search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add Commodity */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
          <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Add Global Commodity Item</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Commodity Name *
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Cotton Bales 29mm, Kapas, Khol, Castor"
                  className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Trade Unit (Candy, Quintal, Bales, Bags, MT)
                </label>
                <input
                  type="text"
                  required
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value.toUpperCase())}
                  placeholder="CANDY, BALES, QUINTAL, BAGS, MT, KGS"
                  className="w-full px-3 py-2.5 font-mono uppercase rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
                    value={newSellerRate}
                    onChange={(e) => setNewSellerRate(Number(e.target.value))}
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
                    value={newBuyerRate}
                    onChange={(e) => setNewBuyerRate(Number(e.target.value))}
                    className="w-full px-3 py-2.5 font-mono rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/5 dark:border-white/10">
                <button type="button" onClick={() => setShowAddModal(false)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"><X className="w-3.5 h-3.5" /><span>Cancel</span></button>
                <button type="submit" disabled={isSaving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50"><Plus className="w-3.5 h-3.5" /><span>{isSaving ? 'Creating...' : 'Add Item'}</span></button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Edit Commodity */}
      {editItem && createPortal(
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
                className="p-1.5 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Commodity Name
                </label>
                <input
                  type="text"
                  required
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  required
                  value={editItem.unit}
                  onChange={(e) => setEditItem({ ...editItem, unit: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2.5 font-mono uppercase rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Seller Commission (₹)
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
                    Buyer Commission (₹)
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
                <button type="button" onClick={() => setEditItem(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"><X className="w-3.5 h-3.5" /><span>Cancel</span></button>
                <button type="submit" disabled={isSaving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50"><Check className="w-3.5 h-3.5" /><span>{isSaving ? 'Updating...' : 'Save Changes'}</span></button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Delete Item */}
      {deleteItem && createPortal(
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
              <button type="button" onClick={() => setDeleteItem(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"><X className="w-3.5 h-3.5" /><span>Cancel</span></button>
              <button type="button" onClick={handleDeleteItem} disabled={isSaving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /><span>{isSaving ? 'Deleting...' : 'Delete Commodity'}</span></button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
