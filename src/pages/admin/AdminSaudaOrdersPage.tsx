import { createPortal } from 'react-dom';
import React, { useEffect, useState } from 'react';
import {
  ReceiptText,
  Search,
  Filter,
  Eye,
  Trash2,
  Edit,
  RefreshCw,
  X,
  AlertCircle,
  IndianRupee,
  BadgePercent,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { TradeSlipModal } from '../../components/admin/TradeSlipModal';
import { AdminCustomSelect } from '../../components/admin/AdminCustomSelect';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { SaudaOrder } from '../../types';

export const AdminSaudaOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<SaudaOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<SaudaOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [viewOrder, setViewOrder] = useState<SaudaOrder | null>(null);
  const [editOrder, setEditOrder] = useState<SaudaOrder | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<SaudaOrder | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadOrders = async () => {
    try {
      const data = await adminService.getAllSaudaOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Unique users for dropdown
  const uniqueUsers = Array.from(
    new Set(orders.map((o) => (o.userEmail || '').toLowerCase().trim()).filter(Boolean))
  );

  useEffect(() => {
    let result = orders;

    if (selectedUserFilter !== 'ALL') {
      result = result.filter(
        (o) => (o.userEmail || '').toLowerCase().trim() === selectedUserFilter
      );
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
          (o.userEmail && o.userEmail.toLowerCase().includes(q))
      );
    }

    setFilteredOrders(result);
  }, [searchQuery, selectedUserFilter, orders]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadOrders();
  };

  const handleDelete = async () => {
    if (!deleteOrder || !deleteOrder.id) return;
    try {
      setIsSaving(true);
      await adminService.deleteSaudaOrder(deleteOrder.id);
      setDeleteOrder(null);
      loadOrders();
    } catch (err) {
      console.error('Failed to delete order:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrder || !editOrder.id) return;
    try {
      setIsSaving(true);
      const totalAmount = Number(editOrder.quantity) * Number(editOrder.billRate);
      const sellerComm = Number(editOrder.sellerCommissionAmount) || 0;
      const buyerComm = Number(editOrder.buyerCommissionAmount) || 0;

      await adminService.updateSaudaOrder(editOrder.id, {
        ...editOrder,
        totalBillAmount: totalAmount,
        sellerCommissionAmount: sellerComm,
        buyerCommissionAmount: buyerComm,
      });

      setEditOrder(null);
      loadOrders();
    } catch (err) {
      console.error('Failed to update order:', err);
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

      {/* Filters & Search */}
      <div className="p-4 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-neu-raised-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, party, item, user..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-neu-inset-sm"
            />
          </div>

          <div className="w-full sm:w-auto min-w-[200px]">
            <AdminCustomSelect
              value={selectedUserFilter}
              onChange={setSelectedUserFilter}
              icon={<Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
              options={[
                { value: 'ALL', label: 'All Broker Users' },
                ...uniqueUsers.map((email) => ({
                  value: email,
                  label: email,
                })),
              ]}
              searchable={true}
            />
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="font-extrabold text-slate-900 dark:text-white">{filteredOrders.length}</span> of {orders.length}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-neu-raised-sm">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
            <span className="text-xs text-slate-400 font-semibold">Loading orders...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E8EDF3] dark:bg-[#20242D] border-b border-black/[0.06] dark:border-white/10 text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">DO # / Date</th>
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3 px-4">Commodity Item</th>
                  <th className="py-3 px-4">Trade Counterparties</th>
                  <th className="py-3 px-4 text-right">Bill Rate</th>
                  <th className="py-3 px-4 text-right">Turnover</th>
                  <th className="py-3 px-4 text-right">Brokerage</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/5 font-medium">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => {
                    const totalComm = (Number(o.sellerCommissionAmount) || 0) + (Number(o.buyerCommissionAmount) || 0);
                    return (
                      <tr key={o.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-extrabold text-slate-900 dark:text-white">#{o.id}</span>
                          <div className="text-[10px] text-slate-400">{o.date ? formatDate(o.date) : '—'}</div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-[130px] truncate" title={o.userEmail}>
                          <span className="font-mono text-[11px]">{o.userEmail || '—'}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-white">{o.itemName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {o.quantity} {o.unit}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-[200px] truncate">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">S: </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{o.sellerName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">B: </span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">{o.buyerName}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300 font-semibold">
                          ₹{o.billRate}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                          {formatCurrency(o.totalBillAmount)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          +{formatCurrency(totalComm)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewOrder(o)}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer"
                              title="View & Print Digital Contract Note"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditOrder(o)}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer"
                              title="Edit Trade Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteOrder(o)}
                              className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
                              title="Delete Trade"
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
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                      No trades found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slip Preview Modal */}
      {viewOrder && (
        <TradeSlipModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
        />
      )}

      {/* Edit Order Modal */}
      {editOrder && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-500" />
                <span>Edit Sauda Order #{editOrder.id}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Commodity Name</label>
                  <input
                    type="text"
                    required
                    value={editOrder.itemName}
                    onChange={(e) => setEditOrder({ ...editOrder, itemName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Quality / Grade</label>
                  <input
                    type="text"
                    value={editOrder.itemQuality || ''}
                    onChange={(e) => setEditOrder({ ...editOrder, itemQuality: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={editOrder.quantity}
                    onChange={(e) => setEditOrder({ ...editOrder, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={editOrder.unit}
                    onChange={(e) => setEditOrder({ ...editOrder, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={editOrder.billRate}
                    onChange={(e) => setEditOrder({ ...editOrder, billRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Seller Name</label>
                  <input
                    type="text"
                    required
                    value={editOrder.sellerName}
                    onChange={(e) => setEditOrder({ ...editOrder, sellerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Buyer Name</label>
                  <input
                    type="text"
                    required
                    value={editOrder.buyerName}
                    onChange={(e) => setEditOrder({ ...editOrder, buyerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Seller Comm (₹)</label>
                  <input
                    type="number"
                    value={editOrder.sellerCommissionAmount}
                    onChange={(e) => setEditOrder({ ...editOrder, sellerCommissionAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Buyer Comm (₹)</label>
                  <input
                    type="number"
                    value={editOrder.buyerCommissionAmount}
                    onChange={(e) => setEditOrder({ ...editOrder, buyerCommissionAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Delivery / Condition Remarks</label>
                <textarea
                  rows={2}
                  value={editOrder.remark || ''}
                  onChange={(e) => setEditOrder({ ...editOrder, remark: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditOrder(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                >
                  {isSaving ? 'Updating...' : 'Update Order'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteOrder && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
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
              <button
                type="button"
                onClick={() => setDeleteOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:opacity-50"
              >
                {isSaving ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
