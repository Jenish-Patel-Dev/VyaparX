import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Info, Package, Scale, Percent, Trash2, Plus, Save } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { itemService } from '../../services/itemService';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useTheme } from '../../context/ThemeContext';
import { FieldError } from '../../components/common/FieldError';
import { validateRequired, validatePositiveNumber, preventNonNumericInput, sanitizeNumeric } from '../../utils/validators';

export const AddEditItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { palette } = useTheme();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const toast = useToast();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState('');
  const [sellerRate, setSellerRate] = useState('2.8');
  const [buyerRate, setBuyerRate] = useState('2.6');
  const [unit, setUnit] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      loadItem(Number(id));
    }
  }, [id]);

  const loadItem = async (itemId: number) => {
    try {
      const itm = await itemService.getById(itemId);
      if (itm) {
        setName(itm.name);
        setSellerRate(itm.sellerCommissionRate !== undefined ? String(itm.sellerCommissionRate) : '2.8');
        setBuyerRate(itm.buyerCommissionRate !== undefined ? String(itm.buyerCommissionRate) : '2.6');
        setUnit(itm.unit || '100');
      } else {
        toast.error('Item not found');
        navigate('/items');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load item');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameErr = validateRequired(name, 'Item Name');
    if (nameErr) newErrors.name = nameErr;

    const unitErr = validateRequired(unit, 'Unit');
    if (unitErr) newErrors.unit = unitErr;

    if (sellerRate.trim()) {
      const sRateErr = validatePositiveNumber(sellerRate, 'Seller Rate');
      if (sRateErr) newErrors.sellerRate = sRateErr;
    }

    if (buyerRate.trim()) {
      const bRateErr = validatePositiveNumber(buyerRate, 'Buyer Rate');
      if (bRateErr) newErrors.buyerRate = bRateErr;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim().toUpperCase(),
        sellerCommissionRate: Number(sellerRate) || 0,
        buyerCommissionRate: Number(buyerRate) || 0,
        unit: unit.trim().toUpperCase(),
      };

      if (isEdit && id) {
        await itemService.update(Number(id), payload);
        toast.success('Item updated successfully');
      } else {
        await itemService.create(payload);
        toast.success('Item created successfully');
      }
      navigate('/items');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await itemService.delete(Number(id));
      toast.success('Item deleted successfully');
      navigate('/items');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete item');
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      <PageHeader
        title={isEdit ? 'EDIT ITEM' : 'ADD ITEM'}
        rightAction={
          isEdit ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
              title="Delete Item"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : null
        }
      />

      <div className="p-4 md:p-6 max-w-xl mx-auto space-y-5">
        {/* Info Banner matching screenshot 5 */}
        <div 
          className="p-4 rounded-2xl flex items-start gap-3 text-xs font-medium leading-relaxed glass-card-subtle border border-blue-200/60 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/30 text-slate-700 dark:text-slate-300"
        >
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <span>
            Fields marked with a red <span className="text-red-500 font-bold">*</span> are mandatory. Other details are optional and can be added later.
          </span>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div className="glass-card p-5 md:p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              Item Details
            </h2>

            {/* Item Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase">
                Item Name <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center absolute left-2.5 top-1/2 -translate-y-1/2 bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60 shadow-xs pointer-events-none z-10">
                  <Package className="w-4 h-4 stroke-[2.3]" />
                </div>
                <input
                  type="text"
                  placeholder="Ex. KAPAS"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    clearError('name');
                  }}
                  className={`input-vyapar !pl-[50px] pr-4 font-bold text-sm uppercase ${errors.name ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
                />
              </div>
              <FieldError error={errors.name} />
            </div>

            {/* Commission Rate (Seller) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase">
                Commission Rate (Seller)
              </label>
              <div className="relative flex items-center">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center absolute left-2.5 top-1/2 -translate-y-1/2 bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60 shadow-xs pointer-events-none z-10">
                  <Percent className="w-4 h-4 stroke-[2.3]" />
                </div>
                <input
                  type="number"
                  step="any"
                  placeholder="2.8"
                  value={sellerRate}
                  onKeyDown={e => preventNonNumericInput(e, true)}
                  onChange={e => {
                    setSellerRate(sanitizeNumeric(e.target.value, true));
                    clearError('sellerRate');
                  }}
                  className={`input-vyapar !pl-[50px] pr-4 font-bold text-sm ${errors.sellerRate ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
                />
              </div>
              <FieldError error={errors.sellerRate} />
            </div>

            {/* Commission Rate (Buyer) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase">
                Commission Rate (Buyer)
              </label>
              <div className="relative flex items-center">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center absolute left-2.5 top-1/2 -translate-y-1/2 bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60 shadow-xs pointer-events-none z-10">
                  <Percent className="w-4 h-4 stroke-[2.3]" />
                </div>
                <input
                  type="number"
                  step="any"
                  placeholder="2.6"
                  value={buyerRate}
                  onKeyDown={e => preventNonNumericInput(e, true)}
                  onChange={e => {
                    setBuyerRate(sanitizeNumeric(e.target.value, true));
                    clearError('buyerRate');
                  }}
                  className={`input-vyapar !pl-[50px] pr-4 font-bold text-sm ${errors.buyerRate ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
                />
              </div>
              <FieldError error={errors.buyerRate} />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase">
                Unit <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center absolute left-2.5 top-1/2 -translate-y-1/2 bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60 shadow-xs pointer-events-none z-10">
                  <Scale className="w-4 h-4 stroke-[2.3]" />
                </div>
                <input
                  type="text"
                  placeholder="100"
                  value={unit}
                  onChange={e => {
                    setUnit(e.target.value);
                    clearError('unit');
                  }}
                  className={`input-vyapar !pl-[50px] pr-4 font-bold text-sm uppercase ${errors.unit ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
                />
              </div>
              <FieldError error={errors.unit} />
            </div>

            {/* Dynamic Summary Box matching screenshot 5 */}
            <div className="p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/50 rounded-2xl flex items-start gap-3 text-xs text-blue-800 dark:text-blue-300 font-semibold leading-relaxed backdrop-blur-md shadow-glass-card">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div>Seller Comm: <strong>{sellerRate || '0'}</strong> per <strong>{unit || '100'}</strong></div>
                <div>Buyer Comm: <strong>{buyerRate || '0'}</strong> per <strong>{unit || '100'}</strong></div>
              </div>
            </div>
          </div>

          {/* Create Item Button */}
          <button
            type="submit"
            disabled={!name.trim() || !unit.trim() || isSubmitting}
            className="btn-glass-primary w-full py-4 px-4 font-extrabold text-sm uppercase tracking-wider rounded-2xl mt-4 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none hover:disabled:shadow-none transition-all"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>SAVING...</span>
              </div>
            ) : isEdit ? (
              <div className="flex items-center justify-center gap-2">
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>UPDATE ITEM</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>CREATE ITEM</span>
              </div>
            )}
          </button>
        </form>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Item?"
        message="Are you sure you want to delete this commodity item? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
