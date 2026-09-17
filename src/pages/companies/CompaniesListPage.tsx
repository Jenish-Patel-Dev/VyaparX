import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Phone, Plus, CheckCircle2, Info, X, RotateCcw } from 'lucide-react';
import { TapIcon } from '../../components/common/TapIcon';
import { companyService } from '../../services/companyService';
import type { Company } from '../../types';
import { PageHeader } from '../../components/layout/PageHeader';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { printCompaniesReport } from '../../utils/printReportService';

export const CompaniesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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

  const handleReset = () => {
    setSearchQuery('');
  };

  const handlePrint = () => {
    printCompaniesReport({
      companies,
      filterText: searchQuery ? `Search "${searchQuery}"` : undefined,
    });
  };

  return (
    <div className="min-h-[calc(100vh-60px)] pb-24 md:pb-12">
      {/* Header Replicating Screenshot 12 */}
      <PageHeader
        title={`COMPANIES (${companies.length})`}
        onRefresh={() => {
          fetchCompanies();
          refreshAppContext();
        }}
        onPrint={handlePrint}
      />

      <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
        {/* Search Bar & Responsive Reset Button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="relative flex-1 group">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('companies.searchPlaceholder', 'Search by Company, User, Email, City, Address...')}
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
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200/80 dark:border-teal-800/60 shadow-xs"
              >
                <Building2 className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Details matching screenshot 12 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 uppercase tracking-wide truncate" title={comp.name}>
                  {comp.name}
                </h3>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mt-0.5 truncate">
                  {comp.address} {comp.city ? `• ${comp.city}` : ''}
                </div>

                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 truncate">
                  Phone: {comp.contactNumber}
                </div>

                {comp.isDefault && (
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                    <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
                    <span>Default</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 italic mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <TapIcon className="w-3.5 h-3.5 stroke-[2.2] shrink-0 not-italic" />
                  <span>Tap to view or edit</span>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && companies.length > 0 && (
            <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-medium flex items-center justify-center gap-1.5">
              <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <span>No more companies</span>
            </div>
          )}

          {!isLoading && companies.length === 0 && (
            <div className="text-center py-12 px-4 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-slate-800/60 shadow-glass">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center mb-3">
                <Building2 className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No companies found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
