import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Plus, Info } from 'lucide-react';
import { itemService } from '../../services/itemService';
import type { Item } from '../../types';
import { PageHeader } from '../../components/layout/PageHeader';
import { useTheme } from '../../context/ThemeContext';

export const ItemsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { palette } = useTheme();
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await itemService.search(searchQuery);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchQuery]);

  return (
    <div className="min-h-[calc(100vh-60px)] pb-24 md:pb-12">
      {/* Header Replicating Screenshot 4 */}
      <PageHeader
        title={`ITEM DETAIL (${items.length})`}
        subtitle="Manage your commodity items"
        onRefresh={fetchItems}
      />

      <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
        {/* Search Bar matching screenshot */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-12 pr-4 py-3.5 bg-white/65 dark:bg-gray-800/50 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white/90 dark:focus:bg-gray-800/80 focus:border-[var(--primary)] transition-all placeholder-gray-400 dark:placeholder-gray-500 shadow-2xs"
          />
        </div>

        {/* Item Cards List */}
        <div className="space-y-3">
          {items.map(item => (
            <div
              key={item.id}
              onClick={() => navigate(`/items/edit/${item.id}`)}
              className="glass-card-interactive p-4 flex items-start gap-3.5 cursor-pointer group"
            >
              {/* Box Icon in Theme Circle */}
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 border border-white/60 dark:border-white/10 shadow-2xs"
                style={{ backgroundColor: palette.light, color: palette.primary }}
              >
                <Package className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Details matching screenshot 4 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100 uppercase tracking-wide truncate" title={item.name}>
                  {item.name}
                </h3>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-1 truncate">
                  UNIT: {item.unit}
                </div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5 flex flex-wrap items-center gap-x-1.5">
                  <span>RATE:</span>
                  <span>{item.sellerCommissionRate} (Seller)</span>
                  <span className="text-gray-400">|</span>
                  <span>{item.buyerCommissionRate} (Buyer)</span>
                </div>
                <div className="text-xs text-gray-400 italic mt-1 group-hover:text-[var(--primary)] transition-colors">
                  Tap to view or edit
                </div>
              </div>
            </div>
          ))}

          {!isLoading && items.length > 0 && (
            <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs font-medium flex items-center justify-center gap-1.5">
              <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <span>No more items</span>
            </div>
          )}

          {!isLoading && items.length === 0 && (
            <div className="text-center py-12 px-4 rounded-3xl bg-white/40 dark:bg-gray-850/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-glass">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center mb-3">
                <Package className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">No commodity items found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {searchQuery ? 'No items match your search criteria' : 'Click the + button below to add your first item.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (+) */}
      <button
        type="button"
        onClick={() => navigate('/items/new')}
        className="btn-glass-primary fixed bottom-20 md:bottom-8 right-6 z-40 w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90"
        aria-label="Add Item"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
