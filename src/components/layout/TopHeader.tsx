import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Plus,
  ShieldCheck,
  Check,
  Globe,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePwa } from '../../context/PwaContext';
import { Language } from '../../i18n/translations';

export const TopHeader: React.FC = () => {
  const {
    currentCompany,
    setCurrentCompany,
    companies,
    currentFinancialYear,
    setCurrentFinancialYear,
    financialYears,
    userProfile,
    isSidebarCollapsed,
    toggleSidebar,
  } = useApp();
  const { palette, isDarkMode, setDarkMode } = useTheme();
  const { language, setLanguage, languages, currentLanguageConfig, t } = useLanguage();
  const { isInstalled, promptInstall } = usePwa();
  const navigate = useNavigate();

  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showCompanyPicker, setShowCompanyPicker] = useState(false);
  const [showFyPicker, setShowFyPicker] = useState(false);

  const langPickerRef = useRef<HTMLDivElement>(null);
  const mobileLangPickerRef = useRef<HTMLDivElement>(null);
  const companyPickerRef = useRef<HTMLDivElement>(null);
  const fyPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (!target) return;

      const isLangClick =
        (langPickerRef.current && langPickerRef.current.contains(target)) ||
        (mobileLangPickerRef.current && mobileLangPickerRef.current.contains(target));
      if (!isLangClick) {
        setShowLangPicker(false);
      }

      if (companyPickerRef.current && !companyPickerRef.current.contains(target)) {
        setShowCompanyPicker(false);
      }
      if (fyPickerRef.current && !fyPickerRef.current.contains(target)) {
        setShowFyPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const isAnyDropdownOpen = showLangPicker || showCompanyPicker || showFyPicker;

  return (
    <>
      {/* Mobile Top Navigation Bar (Neumorphic Surface) */}
      <header className="flex md:hidden items-center justify-between px-3.5 py-2.5 bg-[#E8EDF3] dark:bg-[#20242D] border-b border-black/5 dark:border-white/5 shrink-0 relative z-40 transition-all shadow-neu-raised-sm">
        <Link to="/home" className="flex items-center shrink-0 group py-0.5">
          <img
            src="/logo-name.png"
            alt="VyaparX - Business Made Simple"
            className="h-8 sm:h-9 w-auto max-w-[145px] object-contain transition-transform active:scale-95 drop-shadow-xs dark:hidden"
          />
          <img
            src="/logo-name-dark.png"
            alt="VyaparX - Business Made Simple"
            className="h-8 sm:h-9 w-auto max-w-[145px] object-contain transition-transform active:scale-95 drop-shadow-xs hidden dark:block"
          />
        </Link>

        <div className="flex items-center gap-2">
          {/* Mobile Language Picker */}
          <div className="relative" ref={mobileLangPickerRef}>
            <button
              type="button"
              onClick={() => {
                setShowLangPicker(prev => !prev);
              }}
              className="px-2.5 py-1.5 rounded-full border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-800 dark:text-gray-100 text-xs font-bold flex items-center gap-1.5 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8]" />
              <span>{currentLanguageConfig.shortLabel}</span>
            </button>

            {showLangPicker && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-[#E8EDF3] dark:bg-[#262B36] rounded-2xl shadow-neu-raised-lg border border-white/80 dark:border-white/10 p-2 z-50 animate-in fade-in duration-150 space-y-1"
                onMouseDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
              >
                <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1">
                  {t('common.selectLanguage', 'Select Language')}
                </div>
                {languages.map(item => {
                  const isSelected = language === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setLanguage(item.code as Language);
                        setShowLangPicker(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#DEE4ED] dark:bg-[#181C24] text-[#2563EB] dark:text-[#60A5FA] shadow-neu-inset-sm border border-blue-200/50 dark:border-blue-900/40'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-extrabold">{item.nativeLabel}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={() => setDarkMode(!isDarkMode)}
            className="p-2 rounded-full border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-amber-500 dark:text-amber-400 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed flex items-center justify-center transition-all cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 stroke-[2.5]" /> : <Moon className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>

          {/* Mobile Download Web App Button */}
          <button
            type="button"
            onClick={promptInstall}
            className="p-2 rounded-full border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-[#2563EB] dark:text-[#38BDF8] shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed flex items-center justify-center transition-all cursor-pointer"
            title={isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')}
            aria-label="Download App"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </header>
      {/* Desktop Top Navigation Bar (Neumorphic Surface) */}
      <header className="hidden md:flex items-center justify-between px-4 lg:px-6 h-16 bg-[#E8EDF3] dark:bg-[#20242D] border-b border-black/5 dark:border-white/5 shrink-0 relative z-40 transition-all shadow-neu-raised-sm gap-2 min-w-0">
        <div className="flex items-center gap-2 lg:gap-3 min-w-0">
          {/* Sidebar Toggle Button (Collapse / Expand Left Navigation) */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-2xl border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-700 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-all shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed shrink-0 flex items-center justify-center cursor-pointer"
            title={isSidebarCollapsed ? t('nav.expandMenu', 'Expand Sidebar Menu') : t('nav.collapseMenu', 'Collapse Sidebar Menu')}
            aria-label="Toggle Sidebar Menu"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 stroke-[2.2]" />
            ) : (
              <PanelLeftClose className="w-4 h-4 stroke-[2.2]" />
            )}
          </button>

          {/* Neumorphic Company Switcher Pill */}
          <div className="relative" ref={companyPickerRef}>
            <button
              type="button"
              onClick={() => {
                setShowCompanyPicker(prev => !prev);
                setShowFyPicker(false);
                setShowLangPicker(false);
              }}
              className="flex items-center gap-2 bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 rounded-full px-4 py-2 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all min-w-0 cursor-pointer text-gray-800 dark:text-gray-100"
              title={t('common.selectCompany', 'Select Company')}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0 text-[#2563EB] dark:text-[#38BDF8]" />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-100 max-w-[120px] lg:max-w-[180px] truncate">
                {currentCompany?.name || 'Select Company'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${showCompanyPicker ? 'rotate-180' : ''}`} />
            </button>

            {showCompanyPicker && (
              <div 
                className="absolute left-0 mt-3 w-64 bg-[#E8EDF3] dark:bg-[#262B36] rounded-2xl p-2.5 z-50 animate-in fade-in duration-150 space-y-1 shadow-neu-raised-lg border border-[#D5DDE7] dark:border-[#303746]"
              >
                <div className="text-[10px] font-bold text-[#8994A5] dark:text-[#8994A7] uppercase tracking-wider px-2.5 py-1 flex items-center justify-between border-b border-[#D5DDE7]/60 dark:border-[#303746]/60 mb-1">
                  <span>{t('common.selectCompany', 'Select Company')}</span>
                  <span className="text-[9px] font-semibold text-[#8994A5]">({companies.length})</span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {companies.map(comp => {
                    const isSelected = currentCompany?.id === comp.id;
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => {
                          setCurrentCompany(comp);
                          setShowCompanyPicker(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-[#DEE4ED] dark:bg-[#1B1F27] text-[#2563EB] dark:text-[#60A5FA] border border-blue-200/50 dark:border-blue-900/40 shadow-neu-inset-sm'
                            : 'hover:bg-[#F0F3F8] dark:hover:bg-[#2B3140] text-[#263244] dark:text-[#F0F3F8]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Building2 className="w-3.5 h-3.5 shrink-0 text-[#2563EB] dark:text-[#38BDF8]" />
                          <span className="truncate">{comp.name}</span>
                          {comp.isDefault && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shrink-0 font-extrabold border border-amber-200 dark:border-amber-800/60">
                              Default
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3] shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Neumorphic Financial Year Switcher Pill */}
          <div className="relative" ref={fyPickerRef}>
            <button
              type="button"
              onClick={() => {
                setShowFyPicker(prev => !prev);
                setShowCompanyPicker(false);
                setShowLangPicker(false);
              }}
              className="flex items-center gap-2 bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 rounded-full px-4 py-2 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all shrink-0 cursor-pointer text-gray-800 dark:text-gray-100"
              title="Select Financial Year"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0 text-[#2563EB] dark:text-[#38BDF8]" />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                {t('common.financialYear', 'FY')}: {currentFinancialYear}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${showFyPicker ? 'rotate-180' : ''}`} />
            </button>

            {showFyPicker && (
              <div 
                className="absolute left-0 mt-3 w-52 bg-[#E8EDF3] dark:bg-[#262B36] rounded-2xl p-2.5 z-50 animate-in fade-in duration-150 space-y-1 shadow-neu-raised-lg border border-white/80 dark:border-white/10"
              >
                <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2.5 py-1 border-b border-black/5 dark:border-white/5 mb-1">
                  {t('common.financialYear', 'Financial Year')}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {financialYears.map(fy => {
                    const isSelected = currentFinancialYear === fy.id;
                    return (
                      <button
                        key={fy.id}
                        type="button"
                        onClick={() => {
                          setCurrentFinancialYear(fy.id);
                          setShowFyPicker(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-[#DEE4ED] dark:bg-[#181C24] text-[#2563EB] dark:text-[#60A5FA] border border-blue-200/50 dark:border-blue-900/40 shadow-neu-inset-sm'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-800 dark:text-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-[#2563EB] dark:text-[#38BDF8]" />
                          <span>{fy.name}</span>
                          {fy.isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-200 dark:border-emerald-800/60">
                              Current
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3] ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
          {/* Language Selector Pill */}
          <div className="relative" ref={langPickerRef}>
            <button
              type="button"
              onClick={() => {
                setShowLangPicker(prev => !prev);
                setShowCompanyPicker(false);
                setShowFyPicker(false);
              }}
              className="px-3.5 py-2 rounded-full border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-800 dark:text-gray-100 transition-all shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#2563EB] dark:text-[#38BDF8]" />
              <span className="hidden lg:inline">{currentLanguageConfig.nativeLabel}</span>
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-md bg-[#DEE4ED] dark:bg-[#181C24] text-gray-800 dark:text-gray-100 font-extrabold shadow-neu-inset-sm">
                {currentLanguageConfig.shortLabel}
              </span>
            </button>

            {showLangPicker && (
              <div 
                className="absolute right-0 mt-3 w-52 bg-[#E8EDF3] dark:bg-[#262B36] rounded-2xl p-2.5 z-50 animate-in fade-in duration-150 space-y-1 shadow-neu-raised-lg border border-white/80 dark:border-white/10"
              >
                <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2.5 py-1 border-b border-black/5 dark:border-white/5 mb-1">
                  {t('common.selectLanguage', 'Select Language')}
                </div>
                {languages.map(item => {
                  const isSelected = language === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setLanguage(item.code as Language);
                        setShowLangPicker(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#DEE4ED] dark:bg-[#181C24] text-[#2563EB] dark:text-[#60A5FA] border border-blue-200/50 dark:border-blue-900/40 shadow-neu-inset-sm'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-extrabold">{item.nativeLabel}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Dark / Light Mode Toggle Pill */}
          <button
            type="button"
            onClick={() => setDarkMode(!isDarkMode)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-800 dark:text-gray-100 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all text-xs font-bold cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
                <span className="hidden xl:inline text-gray-100">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-gray-700 stroke-[2.5]" />
                <span className="hidden xl:inline text-gray-800">Dark</span>
              </>
            )}
          </button>

          {/* Download Web App Pill */}
          <button
            type="button"
            onClick={promptInstall}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-[#2563EB] dark:text-[#38BDF8] shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all text-xs font-bold cursor-pointer"
            title={isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')}
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden xl:inline">{isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')}</span>
          </button>

          {/* New Vyapar Button */}
          <button
            type="button"
            onClick={() => navigate('/vyapar/create')}
            className="neu-button-primary flex items-center gap-1.5 px-4 py-2 text-white text-xs font-extrabold rounded-full transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{t('nav.newSauda', 'New Vyapar')}</span>
          </button>

          {/* Profile Pill */}
          <Link
            to="/profile"
            className="flex items-center gap-2 pl-2 pr-3.5 py-1.5 bg-[#F0F3F8] dark:bg-[#2B3140] rounded-full border border-white/80 dark:border-white/10 text-gray-800 dark:text-gray-100 text-xs font-bold shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all min-w-0"
          >
            <div
              className="w-6 h-6 rounded-full text-white flex items-center justify-center text-[11px] font-black shadow-xs shrink-0 bg-gradient-to-br from-[#1D4ED8] to-[#2563EB]"
            >
              {userProfile?.name?.charAt(0) || 'J'}
            </div>
            <span className="truncate max-w-[70px] lg:max-w-[110px]">{userProfile?.name || 'JENISH'}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 hidden sm:inline" />
          </Link>
        </div>
      </header>
    </>
  );
};
