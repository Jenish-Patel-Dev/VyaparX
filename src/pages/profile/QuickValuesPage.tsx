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
    { key: 'paymentTerms', label: 'Payment Terms' },
    { key: 'deliveryTerms', label: 'Delivery Terms' },
    { key: 'remark', label: 'Remarks' },
    { key: 'quality', label: 'Quality / Variety' },
    { key: 'unit', label: 'Units' },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      <PageHeader
        title="Manage Quick Values"
        subtitle="Shortcuts for repetitive order fields"
      />

      <div className="p-4 md:p-6 max-w-xl mx-auto space-y-5">
        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none p-1 glass-panel rounded-2xl">
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
                  ? 'btn-glass-primary text-white shadow-glass'
                  : 'bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-white/10'
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
              className="btn-glass-primary px-5 py-3 font-bold rounded-2xl text-xs flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>
          <FieldError error={error} className="mt-1.5" />
        </div>

        {/* List of shortcuts */}
        <div className="glass-card rounded-3xl divide-y divide-gray-200/50 dark:divide-white/10 overflow-hidden shadow-glass-card">
          {items.map(item => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-white/40 dark:hover:bg-white/5 transition-colors gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-xs shrink-0"
                  style={{ backgroundColor: palette.light, color: palette.primary }}
                >
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase truncate">{item.value}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id!)}
                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-xl hover:bg-red-500/10 transition-colors shrink-0"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="p-8 text-center text-xs text-gray-400 dark:text-gray-500">
              No quick values in this category yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
