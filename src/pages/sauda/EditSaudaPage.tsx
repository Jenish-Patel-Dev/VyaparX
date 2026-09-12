import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { saudaService } from '../../services/saudaService';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import type { SaudaOrder } from '../../types';
import { calculateBillAmount, calculateCommission } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { FieldError } from '../../components/common/FieldError';
import { validateRequired, validatePositiveNumber } from '../../utils/validators';

export const EditSaudaPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const { palette } = useTheme();

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

  const [order, setOrder] = useState<SaudaOrder | null>(null);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [billRate, setBillRate] = useState('');
  const [itemQuality, setItemQuality] = useState('');
  const [sellerCommRate, setSellerCommRate] = useState('');
  const [buyerCommRate, setBuyerCommRate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [remark, setRemark] = useState('');
  const [billNo, setBillNo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      saudaService.getById(Number(id)).then(ord => {
        if (ord) {
          setOrder(ord);
          setQuantity(String(ord.quantity));
          setUnit(ord.unit);
          setBillRate(String(ord.billRate));
          setItemQuality(ord.itemQuality);
          setSellerCommRate(String(ord.sellerCommissionRate));
          setBuyerCommRate(String(ord.buyerCommissionRate));
          setPaymentTerms(ord.paymentTerms || '');
          setDeliveryTerms(ord.deliveryTerms || '');
          setRemark(ord.remark || '');
          setBillNo(ord.billNo || '');
        } else {
          toast.error('Order not found');
          navigate('/vyapar');
        }
      });
    }
  }, [id]);

  if (!order) return null;

  const { totalBillAmount } = calculateBillAmount(
    Number(quantity) || 0,
    Number(billRate) || 0,
    order.withGST,
    order.gstPercent
  );

  const sellerCommAmt = calculateCommission(Number(quantity) || 0, Number(sellerCommRate) || 0);
  const buyerCommAmt = calculateCommission(Number(quantity) || 0, Number(buyerCommRate) || 0);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const qtyErr = validatePositiveNumber(quantity, 'Quantity');
    if (qtyErr) newErrors.quantity = qtyErr;

    const rateErr = validatePositiveNumber(billRate, 'Bill Rate');
    if (rateErr) newErrors.billRate = rateErr;

    const unitErr = validateRequired(unit, 'Unit');
    if (unitErr) newErrors.unit = unitErr;

    if (sellerCommRate !== '') {
      const commErr = validatePositiveNumber(sellerCommRate, 'Seller commission rate', true);
      if (commErr) newErrors.sellerCommRate = commErr;
    }

    if (buyerCommRate !== '') {
      const commErr = validatePositiveNumber(buyerCommRate, 'Buyer commission rate', true);
      if (commErr) newErrors.buyerCommRate = commErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please resolve the errors highlighted below');
      return;
    }

    try {
      setIsSubmitting(true);
      await saudaService.update(order.id!, {
        quantity: Number(quantity),
        unit,
        billRate: Number(billRate),
        itemQuality,
        totalBillAmount,
        sellerCommissionRate: Number(sellerCommRate),
        sellerCommissionAmount: sellerCommAmt,
        buyerCommissionRate: Number(buyerCommRate),
        buyerCommissionAmount: buyerCommAmt,
        paymentTerms,
        deliveryTerms,
        remark,
        billNo,
      });

      toast.success('Vyapar order updated successfully');
      navigate('/vyapar');
    } catch (err) {
      toast.error('Failed to update Vyapar order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      <PageHeader title={`Edit Vyapar #${order.id}`} />

      <div className="p-4 md:p-6 max-w-xl mx-auto">
        <form noValidate onSubmit={handleUpdate} className="space-y-4">
          <div className="liquid-glass-card p-5 md:p-6 rounded-3xl space-y-4 shadow-glass-card">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200/60 dark:border-white/10">
              <span className="font-extrabold text-base text-gray-900 dark:text-gray-100">{order.itemName}</span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Date: {order.date}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                  QUANTITY <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={e => {
                    setQuantity(e.target.value);
                    clearError('quantity');
                  }}
                  className={`input-sauda font-bold ${errors.quantity ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
                />
                <FieldError error={errors.quantity} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                  UNIT <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => {
                    setUnit(e.target.value);
                    clearError('unit');
                  }}
                  className={`input-sauda font-bold ${errors.unit ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
                />
                <FieldError error={errors.unit} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                BILL RATE <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={billRate}
                onChange={e => {
                  setBillRate(e.target.value);
                  clearError('billRate');
                }}
                className={`input-sauda font-bold border-2 ${
                  errors.billRate
                    ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20'
                    : 'border-[var(--primary)]'
                }`}
              />
              <FieldError error={errors.billRate} />
            </div>

            <div className="p-3.5 sm:p-4 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-2xl flex flex-wrap justify-between items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-glass-card">
              <span className="uppercase tracking-wider font-extrabold text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-300">Total Bill Amount:</span>
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 break-all">{formatCurrency(totalBillAmount)}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                QUALITY / VARIETY
              </label>
              <input
                type="text"
                value={itemQuality}
                onChange={e => setItemQuality(e.target.value)}
                className="input-sauda text-xs uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                BILL NO.
              </label>
              <input
                type="text"
                value={billNo}
                onChange={e => setBillNo(e.target.value)}
                className="input-sauda text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-3 border-t border-gray-200/60 dark:border-white/10 min-w-0">
              <div className="min-w-0">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5 truncate" title={`Seller (${order.sellerName}) Comm.`}>
                  SELLER COMM.
                  <span className="block text-[10px] text-gray-400 dark:text-gray-500 truncate font-normal">({order.sellerName})</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={sellerCommRate}
                  onChange={e => {
                    setSellerCommRate(e.target.value);
                    clearError('sellerCommRate');
                  }}
                  className={`input-sauda text-xs font-bold ${errors.sellerCommRate ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
                />
                <FieldError error={errors.sellerCommRate} />
              </div>
              <div className="min-w-0">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5 truncate" title={`Buyer (${order.buyerName}) Comm.`}>
                  BUYER COMM.
                  <span className="block text-[10px] text-gray-400 dark:text-gray-500 truncate font-normal">({order.buyerName})</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={buyerCommRate}
                  onChange={e => {
                    setBuyerCommRate(e.target.value);
                    clearError('buyerCommRate');
                  }}
                  className={`input-sauda text-xs font-bold ${errors.buyerCommRate ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
                />
                <FieldError error={errors.buyerCommRate} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                PAYMENT TERMS
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                className="input-sauda text-xs uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                DELIVERY TERMS
              </label>
              <input
                type="text"
                value={deliveryTerms}
                onChange={e => setDeliveryTerms(e.target.value)}
                className="input-sauda text-xs uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                REMARK
              </label>
              <input
                type="text"
                value={remark}
                onChange={e => setRemark(e.target.value)}
                className="input-sauda text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-glass-primary w-full py-4 px-4 font-extrabold text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2"
          >
            <Save className={`w-4 h-4 stroke-[2.5] ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>{isSubmitting ? 'UPDATING...' : 'UPDATE VYAPAR ORDER'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
