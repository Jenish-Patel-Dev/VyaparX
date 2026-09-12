import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle2, ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchSelectModal, type SelectOption } from '../../components/common/SearchSelectModal';
import { QuickAddItemModal } from '../../components/common/QuickAddItemModal';
import { QuickAddPartyModal } from '../../components/common/QuickAddPartyModal';
import { GlassSelect } from '../../components/common/GlassSelect';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { itemService } from '../../services/itemService';
import { partyService } from '../../services/partyService';
import { saudaService } from '../../services/saudaService';
import { quickValueService } from '../../services/quickValueService';
import type { Item, Party } from '../../types';
import { calculateBillAmount, calculateCommission } from '../../utils/calculations';
import { formatCurrency, formatISODate } from '../../utils/formatters';
import { FieldError } from '../../components/common/FieldError';
import { validatePositiveNumber } from '../../utils/validators';

export const CreateSaudaPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentCompany, currentFinancialYear } = useApp();
  const { palette } = useTheme();

  const [step, setStep] = useState<1 | 2 | 3>(1);
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

  // Entities
  const [items, setItems] = useState<Item[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [quickValues, setQuickValues] = useState<Record<string, string[]>>({});

  // Step 1: Item Data
  const [date, setDate] = useState(formatISODate());
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemQuality, setItemQuality] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('100');
  const [billRate, setBillRate] = useState('');
  const [withGST, setWithGST] = useState(false);
  const [gstPercent, setGstPercent] = useState('5');
  const [billNo, setBillNo] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [remark, setRemark] = useState('');
  const [termsConditions, setTermsConditions] = useState(
    'Our responsibility and duty are restricted to communication and coordination only.'
  );

  // Step 2: Seller Data
  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null);
  const [sellerName, setSellerName] = useState('');
  const [sellerCommRate, setSellerCommRate] = useState('2.8');
  const [sellerContactPerson, setSellerContactPerson] = useState('');

  // Step 3: Buyer Data
  const [selectedBuyerId, setSelectedBuyerId] = useState<number | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerCommRate, setBuyerCommRate] = useState('2.6');
  const [buyerContactPerson, setBuyerContactPerson] = useState('');

  // Modal selector states
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);

  // Quick creation modal states
  const [isQuickAddItemOpen, setIsQuickAddItemOpen] = useState(false);
  const [isQuickAddPartyOpen, setIsQuickAddPartyOpen] = useState(false);
  const [quickAddPartyContext, setQuickAddPartyContext] = useState<'seller' | 'buyer'>('seller');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch initial lookups
  useEffect(() => {
    Promise.all([
      itemService.getAll(),
      partyService.getAll(),
      quickValueService.getAll(),
    ]).then(([fetchedItems, fetchedParties, fetchedQV]) => {
      setItems(fetchedItems);
      setParties(fetchedParties);

      // Group quick values
      const qvMap: Record<string, string[]> = {};
      fetchedQV.forEach(q => {
        if (!qvMap[q.category]) qvMap[q.category] = [];
        qvMap[q.category].push(q.value);
      });
      setQuickValues(qvMap);

      // Auto-select first item if available
      if (fetchedItems.length > 0) {
        const first = fetchedItems[0];
        setSelectedItemId(first.id!);
        setItemName(first.name);
        setUnit(first.unit || '100');
        setSellerCommRate(String(first.sellerCommissionRate || 2.8));
        setBuyerCommRate(String(first.buyerCommissionRate || 2.6));
      }
    });
  }, []);

  // Dynamically calculate bill amounts
  const { subtotal, gstAmount, totalBillAmount } = useMemo(() => {
    return calculateBillAmount(
      Number(quantity) || 0,
      Number(billRate) || 0,
      withGST,
      Number(gstPercent) || 5
    );
  }, [quantity, billRate, withGST, gstPercent]);

  // Dynamically calculate commissions
  const sellerCommissionAmount = useMemo(() => {
    return calculateCommission(Number(quantity) || 0, Number(sellerCommRate) || 0);
  }, [quantity, sellerCommRate]);

  const buyerCommissionAmount = useMemo(() => {
    return calculateCommission(Number(quantity) || 0, Number(buyerCommRate) || 0);
  }, [quantity, buyerCommRate]);

  // Convert items and parties to SearchSelectModal options matching screenshots 21 & 22
  const itemOptions: SelectOption[] = useMemo(() => {
    return items.map(item => ({
      id: item.id!,
      title: item.name,
      subtitle: `UNIT: ${item.unit} • SELLER: ${item.sellerCommissionRate} • BUYER: ${item.buyerCommissionRate}`,
      raw: item,
    }));
  }, [items]);

  // Seller party options excluding currently selected buyer party
  const sellerPartyOptions: SelectOption[] = useMemo(() => {
    return parties
      .filter(p => !selectedBuyerId || p.id !== selectedBuyerId)
      .map(p => ({
        id: p.id!,
        title: p.name,
        subtitle: `ID: ${p.id} • ${p.city || 'BOTAD'} • ${p.state || 'GUJARAT'}`,
        raw: p,
      }));
  }, [parties, selectedBuyerId]);

  // Buyer party options excluding currently selected seller party
  const buyerPartyOptions: SelectOption[] = useMemo(() => {
    return parties
      .filter(p => !selectedSellerId || p.id !== selectedSellerId)
      .map(p => ({
        id: p.id!,
        title: p.name,
        subtitle: `ID: ${p.id} • ${p.city || 'BOTAD'} • ${p.state || 'GUJARAT'}`,
        raw: p,
      }));
  }, [parties, selectedSellerId]);

  // Step 1 Validation & Next
  const handleNextFromItem = () => {
    const newErrors: Record<string, string> = {};
    if (!itemName.trim()) newErrors.itemName = 'Please select an Item Name';
    const qtyErr = validatePositiveNumber(quantity, 'Quantity');
    if (qtyErr) newErrors.quantity = qtyErr;
    const rateErr = validatePositiveNumber(billRate, 'Bill Rate');
    if (rateErr) newErrors.billRate = rateErr;
    if (!unit.trim()) newErrors.unit = 'Unit is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please resolve the errors highlighted below');
      return;
    }
    setStep(2);
  };

  // Step 2 Validation & Next
  const handleNextFromSeller = () => {
    const newErrors: Record<string, string> = {};
    if (!sellerName.trim()) newErrors.sellerName = 'Please select a Seller';
    if (sellerCommRate !== '') {
      const commErr = validatePositiveNumber(sellerCommRate, 'Seller commission rate', true);
      if (commErr) newErrors.sellerCommRate = commErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please resolve the errors highlighted below');
      return;
    }
    setStep(3);
  };

  // Step 3 Save Order to IndexedDB
  const handleSaveOrder = async () => {
    const newErrors: Record<string, string> = {};
    if (!buyerName.trim()) newErrors.buyerName = 'Please select a Buyer';
    if (selectedSellerId && selectedBuyerId && selectedSellerId === selectedBuyerId) {
      newErrors.buyerName = 'Seller and Buyer cannot be the same party';
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
      await saudaService.create({
        companyId: currentCompany?.id || 1,
        financialYear: currentFinancialYear || '2026-2027',
        date,
        itemId: selectedItemId || 1,
        itemName,
        itemQuality: itemQuality || 'STANDARD',
        quantity: Number(quantity),
        unit,
        billRate: Number(billRate),
        withGST,
        gstPercent: Number(gstPercent) || 5,
        gstAmount,
        totalBillAmount,
        billNo: billNo || `ORD-${Date.now().toString().slice(-4)}`,
        paymentTerms,
        deliveryTerms,
        remark,
        termsConditions,
        sellerId: selectedSellerId || 1,
        sellerName,
        sellerCommissionRate: Number(sellerCommRate),
        sellerCommissionAmount,
        sellerContactPerson,
        buyerId: selectedBuyerId || 2,
        buyerName,
        buyerCommissionRate: Number(buyerCommRate),
        buyerCommissionAmount,
        buyerContactPerson,
        dispatchStatus: 'Pending',
        paymentStatus: 'Pending',
      });

      toast.success('Vyapar order saved successfully');
      navigate('/vyapar');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save Vyapar order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      {/* Header Replicating Screenshot 18/19 */}
      <PageHeader title="Create Vyapar Order" />

      <div className="p-4 md:p-6 max-w-xl mx-auto space-y-5">
        {/* 3-Step Wizard Indicator matching Image 4 */}
        <div className="liquid-glass-card p-4 sm:p-5 rounded-3xl shadow-glass-card">
          <div className="relative flex items-center justify-between max-w-sm sm:max-w-md mx-auto px-2">
            {/* Step 1: Item */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="relative z-10 flex flex-col items-center group focus:outline-none transition-transform active:scale-95"
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                  step >= 1
                    ? 'btn-glass-primary text-white shadow-glass'
                    : 'bg-white/60 dark:bg-card-dark text-gray-400 border-2 border-gray-300 dark:border-gray-600'
                }`}
              >
                {step > 1 ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                ) : (
                  <span>1</span>
                )}
              </div>
              <span
                style={step === 1 ? { color: palette.primary } : {}}
                className={`mt-1.5 text-xs sm:text-sm font-bold tracking-tight transition-colors ${
                  step === 1
                    ? 'font-extrabold'
                    : step > 1
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                Item
              </span>
            </button>

            {/* Connecting Track 1 -> 2 */}
            <div className="flex-1 h-[2.5px] mx-2 -mt-5 bg-gray-200 dark:bg-white/10 relative rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  backgroundColor: palette.primary,
                  width: step >= 2 ? '100%' : '0%',
                }}
              />
            </div>

            {/* Step 2: Seller */}
            <button
              type="button"
              onClick={() => {
                if (quantity && billRate) setStep(2);
              }}
              disabled={!quantity || !billRate}
              className="relative z-10 flex flex-col items-center group focus:outline-none transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                  step >= 2
                    ? 'btn-glass-primary text-white shadow-glass'
                    : 'bg-white/60 dark:bg-card-dark text-gray-400 border-2 border-gray-300 dark:border-gray-600'
                }`}
              >
                {step > 2 ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                ) : (
                  <span>2</span>
                )}
              </div>
              <span
                style={step === 2 ? { color: palette.primary } : {}}
                className={`mt-1.5 text-xs sm:text-sm font-bold tracking-tight transition-colors ${
                  step === 2
                    ? 'font-extrabold'
                    : step > 2
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                Seller
              </span>
            </button>

            {/* Connecting Track 2 -> 3 */}
            <div className="flex-1 h-[2.5px] mx-2 -mt-5 bg-gray-200 dark:bg-white/10 relative rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  backgroundColor: palette.primary,
                  width: step >= 3 ? '100%' : '0%',
                }}
              />
            </div>

            {/* Step 3: Buyer */}
            <button
              type="button"
              onClick={() => {
                if (quantity && billRate && sellerName) setStep(3);
              }}
              disabled={!quantity || !billRate || !sellerName}
              className="relative z-10 flex flex-col items-center group focus:outline-none transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                  step === 3
                    ? 'btn-glass-primary text-white shadow-glass'
                    : 'bg-white/60 dark:bg-card-dark text-gray-400 border-2 border-gray-300 dark:border-gray-600'
                }`}
              >
                <span>3</span>
              </div>
              <span
                style={step === 3 ? { color: palette.primary } : {}}
                className={`mt-1.5 text-xs sm:text-sm font-bold tracking-tight transition-colors ${
                  step === 3
                    ? 'font-extrabold'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                Buyer
              </span>
            </button>
          </div>
        </div>

        {/* STEP 1: ITEM FORM (Replicating Screenshots 19 & 20) */}
        {step === 1 && (
          <div className="liquid-glass-card p-5 md:p-6 rounded-3xl space-y-4 shadow-glass-card">
            {/* DATE */}
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                DATE
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input-sauda font-semibold"
              />
            </div>

            {/* ITEM NAME * */}
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                ITEM NAME <span className="text-red-500 font-bold">*</span>
              </label>
              <div
                onClick={() => {
                  setIsItemModalOpen(true);
                  clearError('itemName');
                }}
                className={`input-sauda flex items-center justify-between cursor-pointer font-bold uppercase text-gray-900 dark:text-gray-100 ${
                  errors.itemName ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                }`}
              >
                <span>{itemName || 'SELECT ITEM NAME'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <FieldError error={errors.itemName} />
            </div>

            {/* ITEM QUALITY / VARIETY */}
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                ITEM QUALITY / VARIETY
              </label>
              <input
                type="text"
                placeholder="EX. 1 GADI, 50 BORI 40 Kg ,30-40 M.TON, etc."
                value={itemQuality}
                onChange={e => setItemQuality(e.target.value)}
                className="input-sauda font-medium uppercase text-xs"
              />
              {/* Quick Values Chips */}
              {quickValues.quality && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickValues.quality.slice(0, 4).map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setItemQuality(val)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-sky-900/40 hover:text-sky-800 dark:hover:text-sky-300 font-semibold transition-colors"
                    >
                      + {val}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* QUANTITY & UNIT */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                  QUANTITY <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="EX. 200"
                  value={quantity}
                  onChange={e => {
                    setQuantity(e.target.value);
                    clearError('quantity');
                  }}
                  className={`input-sauda font-extrabold text-gray-900 dark:text-gray-100 ${
                    errors.quantity ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                  }`}
                />
                <FieldError error={errors.quantity} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                  UNIT <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="EX. KG"
                  value={unit}
                  onChange={e => {
                    setUnit(e.target.value);
                    clearError('unit');
                  }}
                  className={`input-sauda font-bold text-gray-900 dark:text-gray-100 ${
                    errors.unit ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                  }`}
                />
                <FieldError error={errors.unit} />
              </div>
            </div>

            {/* BILL RATE * */}
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                BILL RATE <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="number"
                step="any"
                placeholder="EX. 10,000"
                value={billRate}
                onChange={e => {
                  setBillRate(e.target.value);
                  clearError('billRate');
                }}
                className={`input-sauda font-extrabold text-gray-900 dark:text-gray-100 border-2 ${
                  errors.billRate
                    ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20'
                    : 'border-[var(--primary)]'
                }`}
              />
              <FieldError error={errors.billRate} />
            </div>

            {/* Total Bill Amount Calculated Box (Matching Screenshot 20: ₹18,62,496.00) */}
            {quantity && billRate && (
              <div className="p-3.5 sm:p-4 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300 shadow-glass-card backdrop-blur-md animate-in fade-in">
                <span className="text-[11px] sm:text-xs uppercase tracking-wider font-extrabold text-emerald-700 dark:text-emerald-300">Total Bill Amount:</span>
                <span className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 break-all">{formatCurrency(totalBillAmount)}</span>
              </div>
            )}

            {/* WITH GST Checkbox */}
            <div className="flex items-center gap-2.5 py-1">
              <input
                type="checkbox"
                id="withGST"
                checked={withGST}
                onChange={e => setWithGST(e.target.checked)}
                className="w-5 h-5 text-[var(--primary)] rounded border-gray-300 dark:border-gray-600 focus:ring-[var(--primary)]"
              />
              <label htmlFor="withGST" className="text-xs font-extrabold text-gray-800 dark:text-gray-200 uppercase tracking-wider cursor-pointer">
                WITH GST
              </label>
            </div>

            {withGST && (
              <div className="p-4 glass-card-subtle rounded-2xl space-y-3 text-xs">
                <GlassSelect
                  label="GST Percentage"
                  value={gstPercent}
                  onChange={setGstPercent}
                  options={[
                    { value: '5', label: '5% (Commodity/Cotton)' },
                    { value: '12', label: '12%' },
                    { value: '18', label: '18%' },
                    { value: '28', label: '28%' },
                  ]}
                />
                <div className="flex justify-between font-bold text-gray-800 dark:text-gray-100 pt-2 border-t border-gray-200/60 dark:border-white/10">
                  <span>GST Amount:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(gstAmount)}</span>
                </div>
              </div>
            )}

            {/* BILL NO. & PAYMENT TERMS (Progressive fields from Screenshot 20) */}
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                BILL NO.
              </label>
              <input
                type="text"
                placeholder="EX. 0123"
                value={billNo}
                onChange={e => setBillNo(e.target.value)}
                className="input-sauda font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                PAYMENT TERMS
              </label>
              <input
                type="text"
                placeholder="EX. VAR TO VAR"
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                className="input-sauda font-medium uppercase"
              />
              {quickValues.paymentTerms && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickValues.paymentTerms.map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setPaymentTerms(val)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-sky-900/40 hover:text-sky-800 dark:hover:text-sky-300 font-semibold transition-colors"
                    >
                      + {val}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                DELIVERY TERMS
              </label>
              <input
                type="text"
                placeholder="EX. NEXT DAY"
                value={deliveryTerms}
                onChange={e => setDeliveryTerms(e.target.value)}
                className="input-sauda font-medium uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                REMARK
              </label>
              <input
                type="text"
                placeholder="EX. 10% moisture"
                value={remark}
                onChange={e => setRemark(e.target.value)}
                className="input-sauda font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                TERMS & CONDITIONS
              </label>
              <textarea
                rows={2}
                value={termsConditions}
                onChange={e => setTermsConditions(e.target.value)}
                className="input-sauda font-medium text-xs leading-relaxed"
              />
            </div>

            {/* Step 1 Footer matching Image 4 */}
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200/50 dark:border-white/10">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Step 1 of 3
              </span>
              <button
                type="button"
                onClick={handleNextFromItem}
                disabled={!quantity || !billRate}
                className="btn-glass-primary px-7 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SELLER FORM (Replicating Screenshot 18) */}
        {step === 2 && (
          <div className="liquid-glass-card p-5 md:p-6 rounded-3xl space-y-4 shadow-glass-card animate-in fade-in">
            {/* SELLER NAME * */}
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                SELLER NAME <span className="text-red-500 font-bold">*</span>
              </label>
              <div
                onClick={() => {
                  setIsSellerModalOpen(true);
                  clearError('sellerName');
                }}
                className={`input-sauda flex items-center justify-between cursor-pointer font-bold uppercase text-gray-900 dark:text-gray-100 ${
                  errors.sellerName ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                }`}
              >
                <span>{sellerName || 'SELECT SELLER PARTY'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <FieldError error={errors.sellerName} />
            </div>

            {/* COMM. RATE */}
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                COMM. RATE (₹ per {unit || '100'})
              </label>
              <input
                type="number"
                step="any"
                placeholder="2.8"
                value={sellerCommRate}
                onChange={e => {
                  setSellerCommRate(e.target.value);
                  clearError('sellerCommRate');
                }}
                className={`input-sauda font-bold ${
                  errors.sellerCommRate ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                }`}
              />
              <FieldError error={errors.sellerCommRate} />
            </div>

            {/* Commission Amount Banner */}
            <div className="p-3.5 sm:p-4 bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-sky-800 dark:text-sky-300 shadow-glass-card backdrop-blur-md">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-extrabold text-sky-700 dark:text-sky-300">Commission Amount:</span>
              <span className="text-base sm:text-xl font-black text-sky-600 dark:text-sky-400 break-all">{formatCurrency(sellerCommissionAmount)}</span>
            </div>

            {/* SELLER CONTACT PERSON */}
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                SELLER CONTACT PERSON
              </label>
              <input
                type="text"
                placeholder="Eg. Sharma"
                value={sellerContactPerson}
                onChange={e => setSellerContactPerson(e.target.value)}
                className="input-sauda font-medium"
              />
            </div>

            {/* Step 2 Footer */}
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200/50 dark:border-white/10">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Step 2 of 3
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-glass-secondary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextFromSeller}
                  className="btn-glass-primary px-7 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BUYER FORM (Replicating Screenshot 22) */}
        {step === 3 && (
          <div className="liquid-glass-card p-5 md:p-6 rounded-3xl space-y-4 shadow-glass-card animate-in fade-in">
            {/* BUYER NAME * */}
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                BUYER NAME <span className="text-red-500 font-bold">*</span>
              </label>
              <div
                onClick={() => {
                  setIsBuyerModalOpen(true);
                  clearError('buyerName');
                }}
                className={`input-sauda flex items-center justify-between cursor-pointer font-bold uppercase text-gray-900 dark:text-gray-100 ${
                  errors.buyerName ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                }`}
              >
                <span>{buyerName || 'SELECT BUYER PARTY'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              <FieldError error={errors.buyerName} />
            </div>

            {/* COMM. RATE */}
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                COMM. RATE (₹ per {unit || '100'})
              </label>
              <input
                type="number"
                step="any"
                placeholder="2.6"
                value={buyerCommRate}
                onChange={e => {
                  setBuyerCommRate(e.target.value);
                  clearError('buyerCommRate');
                }}
                className={`input-sauda font-bold ${
                  errors.buyerCommRate ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                }`}
              />
              <FieldError error={errors.buyerCommRate} />
            </div>

            {/* Commission Amount Banner */}
            <div className="p-3.5 sm:p-4 bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-sky-800 dark:text-sky-300 shadow-glass-card backdrop-blur-md">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-extrabold text-sky-700 dark:text-sky-300">Commission Amount:</span>
              <span className="text-base sm:text-xl font-black text-sky-600 dark:text-sky-400 break-all">{formatCurrency(buyerCommissionAmount)}</span>
            </div>

            {/* BUYER CONTACT PERSON */}
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                BUYER CONTACT PERSON
              </label>
              <input
                type="text"
                placeholder="Eg. Sharma"
                value={buyerContactPerson}
                onChange={e => setBuyerContactPerson(e.target.value)}
                className="input-sauda font-medium"
              />
            </div>

            {/* Step 3 Footer */}
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200/50 dark:border-white/10">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Step 3 of 3
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-glass-secondary px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={!buyerName || isSubmitting}
                  className="btn-glass-primary px-7 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 animate-spin" />
                      <span>SAVING...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>SAVE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Item Search Selector Modal (Replicating Screenshots 21 & 22) */}
      <SearchSelectModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title="Select Commodity Item"
        placeholder="Search items..."
        options={itemOptions}
        onAddNew={() => setIsQuickAddItemOpen(true)}
        addNewButtonText="ADD ITEM"
        onSelect={opt => {
          const itm = opt.raw as Item;
          setSelectedItemId(itm.id!);
          setItemName(itm.name);
          setUnit(itm.unit || '100');
          setSellerCommRate(String(itm.sellerCommissionRate || 2.8));
          setBuyerCommRate(String(itm.buyerCommissionRate || 2.6));
        }}
      />

      {/* Seller Search Selector Modal (Replicating Screenshot 21) */}
      <SearchSelectModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        title="Select Seller Party"
        placeholder="Search..."
        options={sellerPartyOptions}
        onAddNew={() => {
          setQuickAddPartyContext('seller');
          setIsQuickAddPartyOpen(true);
        }}
        addNewButtonText="ADD PARTY"
        onSelect={opt => {
          const p = opt.raw as Party;
          setSelectedSellerId(p.id!);
          setSellerName(p.name);
          if (selectedBuyerId === p.id) {
            setSelectedBuyerId(null);
            setBuyerName('');
          }
        }}
      />

      {/* Buyer Search Selector Modal (Replicating Screenshot 22) */}
      <SearchSelectModal
        isOpen={isBuyerModalOpen}
        onClose={() => setIsBuyerModalOpen(false)}
        title="Select Buyer Party"
        placeholder="Search..."
        options={buyerPartyOptions}
        onAddNew={() => {
          setQuickAddPartyContext('buyer');
          setIsQuickAddPartyOpen(true);
        }}
        addNewButtonText="ADD PARTY"
        onSelect={opt => {
          const p = opt.raw as Party;
          setSelectedBuyerId(p.id!);
          setBuyerName(p.name);
          if (selectedSellerId === p.id) {
            setSelectedSellerId(null);
            setSellerName('');
          }
        }}
      />

      {/* Quick Add Item Modal */}
      <QuickAddItemModal
        isOpen={isQuickAddItemOpen}
        onClose={() => setIsQuickAddItemOpen(false)}
        onItemCreated={newItem => {
          setItems(prev => [newItem, ...prev.filter(i => i.id !== newItem.id)]);
          setSelectedItemId(newItem.id!);
          setItemName(newItem.name);
          setUnit(newItem.unit || '100');
          setSellerCommRate(String(newItem.sellerCommissionRate || 2.8));
          setBuyerCommRate(String(newItem.buyerCommissionRate || 2.6));
          setIsItemModalOpen(false);
        }}
      />

      {/* Quick Add Party Modal */}
      <QuickAddPartyModal
        isOpen={isQuickAddPartyOpen}
        onClose={() => setIsQuickAddPartyOpen(false)}
        defaultPartyType={quickAddPartyContext === 'seller' ? 'seller' : 'buyer'}
        onPartyCreated={newParty => {
          setParties(prev => [newParty, ...prev.filter(p => p.id !== newParty.id)]);
          if (quickAddPartyContext === 'seller') {
            setSelectedSellerId(newParty.id!);
            setSellerName(newParty.name);
            if (selectedBuyerId === newParty.id) {
              setSelectedBuyerId(null);
              setBuyerName('');
            }
            setIsSellerModalOpen(false);
          } else {
            setSelectedBuyerId(newParty.id!);
            setBuyerName(newParty.name);
            if (selectedSellerId === newParty.id) {
              setSelectedSellerId(null);
              setSellerName('');
            }
            setIsBuyerModalOpen(false);
          }
        }}
      />
    </div>
  );
};
