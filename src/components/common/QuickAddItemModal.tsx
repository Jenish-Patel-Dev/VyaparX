import React, { useState } from 'react';
import { X, Package, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { itemService } from '../../services/itemService';
import type { Item } from '../../types';
import { FieldError } from './FieldError';
import { validateRequired, validatePositiveNumber } from '../../utils/validators';

interface QuickAddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: (item: Item) => void;
}

const COMMON_UNITS = ['100', 'KG', 'M.TON', 'BAGS', 'BALES'];

export const QuickAddItemModal: React.FC<QuickAddItemModalProps> = ({
  isOpen,
  onClose,
  onItemCreated,
}) => {
  const { palette } = useTheme();
  const toast = useToast();

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('100');
  const [sellerRate, setSellerRate] = useState('2.8');
  const [buyerRate, setBuyerRate] = useState('2.6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const nameErr = validateRequired(name, 'Item Name');
    if (nameErr) newErrors.name = nameErr;

    const unitErr = validateRequired(unit, 'Unit');
    if (unitErr) newErrors.unit = unitErr;

    const sellerRateErr = validatePositiveNumber(sellerRate, 'Seller Comm. Rate', false);
    if (sellerRateErr) newErrors.sellerRate = sellerRateErr;

    const buyerRateErr = validatePositiveNumber(buyerRate, 'Buyer Comm. Rate', false);
    if (buyerRateErr) newErrors.buyerRate = buyerRateErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim().toUpperCase(),
        unit: unit.trim() || '100',
        sellerCommissionRate: Number(sellerRate) || 0,
        buyerCommissionRate: Number(buyerRate) || 0,
      };

      const newId = await itemService.create(itemData);
      const createdItem = await itemService.getById(newId);

      if (createdItem) {
        toast.success(`Item "${createdItem.name}" added successfully`);
        onItemCreated(createdItem);
      }
      setErrors({});
      onClose();

      // Reset form
      setName('');
      setUnit('100');
      setSellerRate('2.8');
      setBuyerRate('2.6');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-xl animate-in fade-in"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div 
        className="w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl rounded-3xl shadow-glass-hover overflow-hidden flex flex-col max-h-[90vh] border border-white/70 dark:border-white/15 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 text-white flex items-center justify-between shadow-glass"
          style={{ backgroundColor: palette.primary }}
        >
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 stroke-[2.5]" />
            <h2 className="font-extrabold text-base tracking-wide uppercase">Add New Item</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-black/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 overflow-y-auto">
          {/* ITEM NAME */}
          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
              ITEM NAME <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. KAPAS, COTTON, KHOL"
              value={name}
              onChange={e => {
                setName(e.target.value);
                clearError('name');
              }}
              className={`input-vyapar uppercase font-bold text-sm ${
                errors.name ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
              }`}
            />
            <FieldError error={errors.name} />
          </div>

          {/* UNIT */}
          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
              UNIT <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder="100"
              value={unit}
              onChange={e => {
                setUnit(e.target.value);
                clearError('unit');
              }}
              className={`input-vyapar font-semibold text-xs ${
                errors.unit ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
              }`}
            />
            <FieldError error={errors.unit} />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_UNITS.map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    setUnit(u);
                    clearError('unit');
                  }}
                  style={unit === u ? { backgroundColor: `${palette.primary}20`, borderColor: palette.primary, color: palette.primary } : {}}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all border ${
                    unit === u
                      ? 'shadow-glass'
                      : 'bg-white/40 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* COMMISSION RATES */}
          <div className="grid grid-cols-2 gap-3 min-w-0">
            <div className="min-w-0">
              <label className="block text-[11px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5 truncate" title="SELLER COMM. RATE">
                SELLER COMM. RATE
              </label>
              <input
                type="number"
                step="any"
                placeholder="2.8"
                value={sellerRate}
                onChange={e => {
                  setSellerRate(e.target.value);
                  clearError('sellerRate');
                }}
                className={`input-vyapar font-semibold text-xs ${
                  errors.sellerRate ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                }`}
              />
              <FieldError error={errors.sellerRate} />
            </div>
            <div className="min-w-0">
              <label className="block text-[11px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5 truncate" title="BUYER COMM. RATE">
                BUYER COMM. RATE
              </label>
              <input
                type="number"
                step="any"
                placeholder="2.6"
                value={buyerRate}
                onChange={e => {
                  setBuyerRate(e.target.value);
                  clearError('buyerRate');
                }}
                className={`input-vyapar font-semibold text-xs ${
                  errors.buyerRate ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                }`}
              />
              <FieldError error={errors.buyerRate} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-glass-secondary flex-1 py-3 px-4 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-glass-primary flex-2 py-3 px-4 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? 'Saving...' : 'Save Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
