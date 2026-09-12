import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Phone, Plus, CheckCircle2, Info } from 'lucide-react';
import { companyService } from '../../services/companyService';
import type { Company } from '../../types';
import { PageHeader } from '../../components/layout/PageHeader';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const CompaniesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { palette } = useTheme();
  const { currentCompany, refreshAppContext } = useApp();
  const { currentUser } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const data = await companyService.search(searchQuery, currentUser?.email);
      setCompanies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [searchQuery]);

  return (
    <div className="min-h-[calc(100vh-60px)] pb-24 md:pb-12">
      {/* Header Replicating Screenshot 12 */}
      <PageHeader
        title={`COMPANIES (${companies.length})`}
        subtitle="Manage your business profiles"
        onRefresh={() => {
          fetchCompanies();
          refreshAppContext();
        }}
      />

      <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
        {/* Search Bar matching screenshot */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search companies..."
            className="w-full pl-12 pr-4 py-3.5 bg-white/65 dark:bg-gray-800/50 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl text-sm font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white/90 dark:focus:bg-gray-800/80 focus:border-[var(--primary)] transition-all placeholder-gray-400 dark:placeholder-gray-500 shadow-2xs"
          />
        </div>

        {/* Company Cards List */}
        <div className="space-y-3">
          {companies.map(comp => (
            <div
              key={comp.id}
              onClick={() => navigate(`/companies/edit/${comp.id}`)}
              className="glass-card-interactive p-4 flex items-start gap-3.5 cursor-pointer group"
            >
              {/* Building Icon in Soft Circle */}
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 border border-white/60 dark:border-white/10 shadow-2xs"
                style={{ backgroundColor: palette.light, color: palette.primary }}
              >
                <Building2 className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Details matching screenshot 12 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100 uppercase tracking-wide truncate" title={comp.name}>
                  {comp.name}
                </h3>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-0.5 truncate">
                  {comp.address} {comp.city ? `• ${comp.city}` : ''}
                </div>

                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1 truncate">
                  Phone: {comp.contactNumber}
                </div>

                {comp.isDefault && (
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                    <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
                    <span>Default</span>
                  </div>
                )}

                <div className="text-xs text-gray-400 italic mt-2 group-hover:text-[var(--primary)] transition-colors">
                  Tap to view or edit
                </div>
              </div>
            </div>
          ))}

          {!isLoading && companies.length > 0 && (
            <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs font-medium flex items-center justify-center gap-1.5">
              <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <span>No more companies</span>
            </div>
          )}

          {!isLoading && companies.length === 0 && (
            <div className="text-center py-12 px-4 rounded-3xl bg-white/40 dark:bg-gray-850/40 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-glass">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center mb-3">
                <Building2 className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">No companies found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {searchQuery ? 'No companies match your search criteria' : 'Click the + button below to register your first company.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (+) */}
      <button
        type="button"
        onClick={() => navigate('/companies/new')}
        className="btn-glass-primary fixed bottom-20 md:bottom-8 right-6 z-40 w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90"
        aria-label="Add Company"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
