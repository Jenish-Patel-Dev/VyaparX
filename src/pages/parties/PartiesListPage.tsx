import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building, Phone, Plus, CheckCircle2, Info, Users, X, RotateCcw } from 'lucide-react';
import { partyService } from '../../services/partyService';
import type { Party } from '../../types';
import { PageHeader } from '../../components/layout/PageHeader';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const PartiesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { palette } = useTheme();
  const { t } = useLanguage();
  const [parties, setParties] = useState<Party[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchParties = async () => {
    setIsLoading(true);
    try {
      const data = await partyService.search(searchQuery);
      setParties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    partyService.getAll().then(setParties);
  };

  useEffect(() => {
    fetchParties();
  }, [searchQuery]);

  return (
    <div className="min-h-[calc(100vh-60px)] pb-24 md:pb-12">
      {/* Header Replicating Screenshot 8 */}
      <PageHeader
        title={`PARTIES (${parties.length})`}
        onRefresh={fetchParties}
      />

      <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
        {/* Search Bar with Reset Button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="relative group flex-1 min-w-0">
            <input
              type="text"
              placeholder={t('parties.searchPlaceholder', 'Search by Name, Mobile, City, State, GST...')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-sauda !pl-11 !pr-10 text-sm"
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
            title="Reset Search & Filters"
            aria-label="Reset Search"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.3]" />
            <span className="hidden sm:inline uppercase tracking-wider font-extrabold text-xs">
              {t('common.reset', 'Reset')}
            </span>
          </button>
        </div>

        {/* Party Cards List */}
        <div className="space-y-3">
          {parties.map(party => (
            <div
              key={party.id}
              onClick={() => navigate(`/parties/edit/${party.id}`)}
              className="glass-card-interactive p-4 flex items-start gap-3.5 cursor-pointer group"
            >
              {/* Building Icon in Soft Circle */}
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60 shadow-xs"
              >
                <Building className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Details matching screenshot 8 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 uppercase tracking-wide truncate" title={party.name}>
                  {party.name}
                </h3>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mt-0.5 truncate">
                  {party.city || 'BOTAD'} - {party.state || 'GUJARAT'}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300 mt-2">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>{party.mobileNumber}</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 shrink-0">#ID: {party.id}</span>
                </div>

                <div className="text-xs text-slate-400 dark:text-slate-500 italic mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Tap to view or edit
                </div>
              </div>
            </div>
          ))}

          {!isLoading && parties.length > 0 && (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-medium flex items-center justify-center gap-1.5">
              <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>No more parties</span>
            </div>
          )}

          {!isLoading && parties.length === 0 && (
            <div className="text-center py-12 px-4 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-slate-800/60 shadow-glass">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No parties found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {searchQuery ? 'No parties match your search criteria' : 'Click the + button below to add your first party.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (+) */}
      <button
        type="button"
        onClick={() => navigate('/parties/new')}
        className="btn-glass-primary fixed bottom-20 md:bottom-8 right-6 z-40 w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90"
        aria-label="Add Party"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
