import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Zap } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { quickValueService } from '../../services/quickValueService';
import type { QuickValue } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { FieldError } from '../../components/common/FieldError';

export const QuickValuesPage: React.FC = () => {
  const toast = useToast();
  const { palette } = useTheme();
  const [activeTab, setActiveTab] = useState<QuickValue['category']>('paymentTerms');
  const [items, setItems] = useState<QuickValue[]>([]);
  const [newValue, setNewValue] = useState('');
  const [error, setError] = useState('');

  const loadValues = async () => {
    const all = await quickValueService.getAll();
    setItems(all.filter(i => i.category === activeTab));
  };

  useEffect(() => {
    loadValues();
  }, [activeTab]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) {
      setError(`Please enter a ${activeTab} value`);
      return;
    }

    try {
      await quickValueService.add(activeTab, newValue.trim().toUpperCase());
      toast.success('Quick value added');
      setNewValue('');
      setError('');
      loadValues();
    } catch (err) {
      toast.error('Failed to add quick value');
    }
  };

  const handleDelete = async (id: number) => {
    await quickValueService.delete(id);
    toast.success('Quick value removed');
    loadValues();
  };

  const tabs: { key: QuickValue['category']; label: string }[] = [
    { key: 'paymentTerms', label: 'Payment Days' },
    { key: 'quality', label: 'Quality' },
    { key: 'rdValue', label: 'RD Value' },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      <PageHeader
        title="MANAGE QUICK VALUES"
      />

      <div className="p-4 md:p-6 max-w-xl mx-auto space-y-5">
        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none p-1.5 neu-inset-sm rounded-2xl border border-black/[0.04] dark:border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setError('');
              }}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'neu-button-primary text-white'
                  : 'neu-button-secondary text-slate-700 dark:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Add Input */}
        <div>
          <form onSubmit={handleAdd} noValidate className="flex gap-2">
            <input
              type="text"
              placeholder={`Add new ${activeTab}...`}
              value={newValue}
              onChange={e => {
                setNewValue(e.target.value);
                if (error) setError('');
              }}
              className={`input-vyapar uppercase text-xs flex-1 ${
                error ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
              }`}
            />
            <button
              type="submit"
              disabled={!newValue.trim()}
              className="neu-button-primary px-5 py-3 font-bold rounded-2xl text-xs flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none hover:disabled:shadow-none transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>
          <FieldError error={error} className="mt-1.5" />
        </div>

        {/* List of shortcuts */}
        <div className="neu-raised rounded-3xl divide-y divide-black/[0.04] dark:divide-white/5 overflow-hidden border border-white/60 dark:border-white/5">
          {items.map(item => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-blue-500/5 transition-colors gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div 
                  className="w-7 h-7 rounded-lg neu-raised-sm flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                >
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase truncate">{item.value}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id!)}
                className="text-slate-400 hover:text-red-500 p-1.5 rounded-xl hover:bg-red-500/10 active:shadow-neu-pressed transition-all shrink-0 cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
              No quick values in this category yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
