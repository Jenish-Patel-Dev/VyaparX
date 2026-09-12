import React, { useState, useEffect } from 'react';
import { X, CreditCard, Check } from 'lucide-react';
import type { SaudaOrder, PaymentRecord } from '../../types';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatISODate } from '../../utils/formatters';
import { GlassSelect } from '../common/GlassSelect';
import { FieldError } from '../common/FieldError';
import { validateRequired, validatePositiveNumber } from '../../utils/validators';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: SaudaOrder;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}) => {
  const toast = useToast();
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [paymentDate, setPaymentDate] = useState(formatISODate());
  const [amount, setAmount] = useState('');
  const [partyType, setPartyType] = useState<'buyer' | 'seller'>('buyer');
  const [paymentMode, setPaymentMode] = useState<PaymentRecord['paymentMode']>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');
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

  useEffect(() => {
    if (isOpen && order.id) {
      paymentService.getBySaudaId(order.id).then(setHistory);
      const remaining = Math.max(0, order.totalBillAmount - (order.paidAmount || 0));
      setAmount(remaining > 0 ? String(remaining) : '');
      setErrors({});
    }
  }, [isOpen, order]);

  if (!isOpen) return null;

  const remainingAmt = Math.max(0, order.totalBillAmount - (order.paidAmount || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const dateErr = validateRequired(paymentDate, 'Payment Date');
    if (dateErr) newErrors.paymentDate = dateErr;

    const amtErr = validatePositiveNumber(amount, 'Payment Amount', true);
    if (amtErr) newErrors.amount = amtErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const amtNum = Number(amount);

    try {
      setIsSubmitting(true);
      await paymentService.addPayment({
        saudaId: order.id!,
        partyType,
        paymentDate,
        amount: amtNum,
        paymentMode,
        referenceNumber: referenceNumber.trim(),
        remarks: remarks.trim(),
      });

      toast.success('Payment recorded successfully');
      setErrors({});
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-xl animate-in fade-in"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div 
        className="w-full max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl rounded-3xl shadow-glass-hover overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 border border-white/70 dark:border-white/15"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Record Payment</h2>
              <p className="text-xs text-gray-500">Vyapar #{order.id} • {order.itemName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Amount Status Card */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-center text-xs border border-gray-200 dark:border-white/10">
            <div>
              <div className="text-gray-400 font-medium">Bill Amount</div>
              <div className="font-bold text-gray-900 dark:text-gray-100 text-xs mt-0.5">{formatCurrency(order.totalBillAmount)}</div>
            </div>
            <div>
              <div className="text-gray-400 font-medium">Paid</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">{formatCurrency(order.paidAmount || 0)}</div>
            </div>
            <div>
              <div className="text-gray-400 font-medium">Remaining</div>
              <div className="font-bold text-red-600 dark:text-red-400 text-xs mt-0.5">{formatCurrency(remainingAmt)}</div>
            </div>
          </div>

          <form id="payment-form" onSubmit={handleSubmit} noValidate className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                  PAYMENT DATE <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={e => {
                    setPaymentDate(e.target.value);
                    clearError('paymentDate');
                  }}
                  className={`input-sauda text-xs ${
                    errors.paymentDate ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                  }`}
                />
                <FieldError error={errors.paymentDate} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                  AMOUNT (₹) <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Amount"
                  value={amount}
                  onChange={e => {
                    setAmount(e.target.value);
                    clearError('amount');
                  }}
                  className={`input-sauda text-xs font-bold text-emerald-700 dark:text-emerald-400 ${
                    errors.amount ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                  }`}
                />
                <FieldError error={errors.amount} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <GlassSelect
                  label="PARTY"
                  value={partyType}
                  onChange={v => setPartyType(v as 'buyer' | 'seller')}
                  options={[
                    { value: 'buyer', label: `Buyer (${order.buyerName})` },
                    { value: 'seller', label: `Seller (${order.sellerName})` },
                  ]}
                />
              </div>
              <div>
                <GlassSelect
                  label="PAYMENT MODE"
                  value={paymentMode}
                  onChange={v => setPaymentMode(v as PaymentRecord['paymentMode'])}
                  options={[
                    { value: 'Bank Transfer', label: 'Bank Transfer / NEFT' },
                    { value: 'UPI', label: 'UPI' },
                    { value: 'Cash', label: 'Cash' },
                    { value: 'Cheque', label: 'Cheque' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                REFERENCE / UTR / CHEQUE NO.
              </label>
              <input
                type="text"
                placeholder="Ex. UTR12345678"
                value={referenceNumber}
                onChange={e => setReferenceNumber(e.target.value)}
                className="input-sauda text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                REMARKS
              </label>
              <input
                type="text"
                placeholder="Optional notes"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="input-sauda text-xs"
              />
            </div>
          </form>

          {/* Past Payments History */}
          {history.length > 0 && (
            <div className="pt-3 border-t border-gray-100 dark:border-white/10">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Previous Payments</h4>
              <div className="space-y-2">
                {history.map(item => (
                  <div key={item.id} className="p-2.5 bg-gray-50 dark:bg-white/5 rounded-lg text-xs flex justify-between items-center border border-gray-200 dark:border-white/10">
                    <div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(item.amount)}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">via {item.paymentMode}</span>
                      <div className="text-[10px] text-gray-400 dark:text-gray-500">
                        {item.paymentDate} • {item.partyType === 'buyer' ? 'Received from Buyer' : 'Paid to Seller'}
                        {item.referenceNumber ? ` • Ref: ${item.referenceNumber}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 dark:border-white/10 flex gap-3 bg-gray-50 dark:bg-gray-800/80">
          <button
            type="button"
            onClick={onClose}
            className="btn-glass-secondary flex-1 py-2.5 px-4 font-semibold rounded-2xl text-sm flex items-center justify-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            form="payment-form"
            disabled={isSubmitting}
            className="btn-glass-primary flex-1 py-2.5 px-4 font-bold rounded-2xl text-sm flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Payment'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
