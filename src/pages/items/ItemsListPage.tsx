import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Plus, Info, X, RotateCcw } from 'lucide-react';
import { itemService } from '../../services/itemService';
import type { Item } from '../../types';
import { PageHeader } from '../../components/layout/PageHeader';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export const ItemsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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

  const handleReset = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-[calc(100vh-60px)] pb-24 md:pb-12">
      {/* Header matching screenshot */}
      <PageHeader
        title={`ITEM DETAIL (${items.length})`}
        onRefresh={fetchItems}
      />

      <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
        {/* Search Bar & Reset Button Row */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="relative flex-1 group">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('items.searchPlaceholder', 'Search by Item Name...')}
              className="input-sauda !pl-11 !pr-10 text-xs sm:text-sm font-semibold"
            />
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2] transition-colors" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                title="Clear Search"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}
          </div>

          {/* Reset Button: Icon on mobile, Label + Icon on desktop */}
          <button
            type="button"
            onClick={handleReset}
            className={`h-11 sm:h-12 px-3 sm:px-4 rounded-xl sm:rounded-2xl border transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 font-bold text-xs sm:text-sm ${
              searchQuery
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'bg-white/90 dark:bg-[#111827]/90 border-[#DCE6F2] dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_1px_3px_rgba(37,99,235,0.04)] dark:shadow-none'
            }`}
            title="Reset Search"
            aria-label="Reset Search"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.3]" />
            <span className="hidden sm:inline uppercase tracking-wider font-extrabold text-xs">
              {t('common.reset', 'Reset')}
            </span>
          </button>
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
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/60 shadow-xs"
              >
                <Package className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Details matching screenshot 4 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 uppercase tracking-wide truncate" title={item.name}>
                  {item.name}
                </h3>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 truncate">
                  UNIT: {item.unit}
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 flex flex-wrap items-center gap-x-1.5">
                  <span>RATE:</span>
                  <span>{item.sellerCommissionRate} (Seller)</span>
                  <span className="text-slate-400">|</span>
                  <span>{item.buyerCommissionRate} (Buyer)</span>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 italic mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Tap to view or edit
                </div>
              </div>
            </div>
          ))}

          {!isLoading && items.length > 0 && (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-medium flex items-center justify-center gap-1.5">
              <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>No more items</span>
            </div>
          )}

          {!isLoading && items.length === 0 && (
            <div className="text-center py-12 px-4 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-slate-800/60 shadow-glass">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center mb-3">
                <Package className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No commodity items found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
