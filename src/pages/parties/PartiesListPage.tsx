import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building, Phone, Plus, CheckCircle2, Info, Users } from 'lucide-react';
import { partyService } from '../../services/partyService';
import type { Party } from '../../types';
import { PageHeader } from '../../components/layout/PageHeader';
import { useTheme } from '../../context/ThemeContext';

export const PartiesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { palette } = useTheme();
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

  useEffect(() => {
    fetchParties();
  }, [searchQuery]);

  return (
    <div className="min-h-[calc(100vh-60px)] pb-24 md:pb-12">
      {/* Header Replicating Screenshot 8 */}
      <PageHeader
        title={`PARTIES (${parties.length})`}
        subtitle="Manage your seller/buyer Party"
        onRefresh={fetchParties}
      />

      <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
        {/* Search Bar matching screenshot */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search parties..."
            className="w-full pl-12 pr-4 py-3.5 bg-white/80 backdrop-blur-xl border border-blue-200/90 rounded-2xl text-sm font-medium text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-300/50 transition-all placeholder-gray-400 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_2px_8px_rgba(37,99,235,0.06)]"
          />
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
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/80 shadow-xs"
                style={{ backgroundColor: palette.light, color: palette.primary }}
              >
                <Building className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Details matching screenshot 8 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100 uppercase tracking-wide truncate" title={party.name}>
                  {party.name}
                </h3>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-0.5 truncate">
                  {party.city || 'BOTAD'} - {party.state || 'GUJARAT'}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-gray-600 dark:text-gray-300 mt-2">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    <span>{party.mobileNumber}</span>
                  </div>
                  <span className="text-gray-400 shrink-0">#ID: {party.id}</span>
                </div>

                <div className="text-xs text-gray-400 italic mt-2 group-hover:text-[var(--primary)] transition-colors">
                  Tap to view or edit
                </div>
              </div>
            </div>
          ))}

          {!isLoading && parties.length > 0 && (
            <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs font-medium flex items-center justify-center gap-1.5">
              <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <span>No more parties</span>
            </div>
          )}

          {!isLoading && parties.length === 0 && (
            <div className="text-center py-12 px-4 rounded-3xl bg-white/40 dark:bg-gray-850/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-glass">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">No parties found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
