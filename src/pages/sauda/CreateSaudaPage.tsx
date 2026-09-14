import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle2, ChevronDown, ArrowLeft, ArrowRight, Package, Settings2, Percent, Sliders } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchSelectModal, type SelectOption } from '../../components/common/SearchSelectModal';
import { SaudaWizardStepper } from '../../components/sauda/SaudaWizardStepper';
import { QuickAddItemModal } from '../../components/common/QuickAddItemModal';
import { QuickAddPartyModal } from '../../components/common/QuickAddPartyModal';
import { GlassDatePicker } from '../../components/common/GlassDatePicker';
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
import { validatePositiveNumber, preventNonNumericInput, sanitizeNumeric } from '../../utils/validators';

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

  // Step 1: Item, Material & Quality, Technical Parameters
  const [date, setDate] = useState(formatISODate());
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemQuality, setItemQuality] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('100');
  const [billRate, setBillRate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('15');

  // Technical parameters
  const [rdValue, setRdValue] = useState('');
  const [stapleLength, setStapleLength] = useState('');
  const [mic, setMic] = useState('');
  const [trashPercent, setTrashPercent] = useState('');
  const [moisturePercent, setMoisturePercent] = useState('');

  // Step 2: Seller Data
  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null);
  const [sellerName, setSellerName] = useState('');
  const [sellerLocation, setSellerLocation] = useState('');
  const [sellerCity, setSellerCity] = useState('');
  const [sellerCommRate, setSellerCommRate] = useState('2.4');
  const [sellerContactPerson, setSellerContactPerson] = useState('');

  // Step 3: Buyer Data
  const [selectedBuyerId, setSelectedBuyerId] = useState<number | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerLocation, setBuyerLocation] = useState('');
  const [buyerCity, setBuyerCity] = useState('');
  const [buyerCommRate, setBuyerCommRate] = useState('2.3');
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

  // Load items, parties and quick values on mount
  useEffect(() => {
    Promise.all([
      itemService.getAll(),
      partyService.getAll(),
      quickValueService.getAll(),
    ]).then(([fetchedItems, fetchedParties, fetchedQVs]) => {
      setItems(fetchedItems);
      setParties(fetchedParties);

      const qvMap: Record<string, string[]> = {};
      fetchedQVs.forEach(qv => {
        if (!qvMap[qv.category]) qvMap[qv.category] = [];
        qvMap[qv.category].push(qv.value);
      });
      setQuickValues(qvMap);
    });
  }, []);

  // Dynamically calculate total bill amount (Rate x Quantity)
  const totalBillAmount = useMemo(() => {
    return calculateBillAmount(Number(quantity) || 0, Number(billRate) || 0, false, 0).totalBillAmount;
  }, [quantity, billRate]);

  // Dynamically calculate commissions
  const sellerCommissionAmount = useMemo(() => {
    return calculateCommission(Number(quantity) || 0, Number(sellerCommRate) || 0);
  }, [quantity, sellerCommRate]);

  const buyerCommissionAmount = useMemo(() => {
    return calculateCommission(Number(quantity) || 0, Number(buyerCommRate) || 0);
  }, [quantity, buyerCommRate]);

  // Convert items and parties to SearchSelectModal options
  const itemOptions: SelectOption[] = useMemo(() => {
    return items.map(item => ({
      id: item.id!,
      title: item.name,
      subtitle: `UNIT: ${item.unit} • SELLER: ${item.sellerCommissionRate}% • BUYER: ${item.buyerCommissionRate}%`,
      raw: item,
    }));
  }, [items]);

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


  // Validation flags to disable buttons until data is valid
  const isStep1Valid = Boolean(
    date &&
    date.trim() &&
    itemName.trim() &&
    itemQuality.trim() &&
    quantity &&
    Number(quantity) > 0 &&
    unit.trim() &&
    billRate &&
    Number(billRate) > 0 &&
    paymentTerms.trim() &&
    rdValue.trim() &&
    stapleLength.trim() &&
    mic.trim() &&
    trashPercent.trim() &&
    moisturePercent.trim()
  );

  const isStep2Valid = Boolean(
    selectedSellerId &&
    sellerName.trim() &&
    sellerCity.trim() &&
    sellerCommRate !== '' &&
    Number(sellerCommRate) >= 0
  );

  const isStep3Valid = Boolean(
    selectedBuyerId &&
    buyerName.trim() &&
    buyerCity.trim() &&
    buyerCommRate !== '' &&
    Number(buyerCommRate) >= 0 &&
    (!selectedSellerId || selectedSellerId !== selectedBuyerId) &&
    !isSubmitting
  );

  // Step 1 Validation & Next
  const handleNextFromItem = () => {
    const newErrors: Record<string, string> = {};
    if (!date || !date.trim()) newErrors.date = 'Date is required';
    if (!itemName.trim()) newErrors.itemName = 'Please select an Item Name';
    if (!itemQuality.trim()) newErrors.itemQuality = 'Quality is required';
    const qtyErr = validatePositiveNumber(quantity, 'Quantity');
    if (qtyErr) newErrors.quantity = qtyErr;
    const rateErr = validatePositiveNumber(billRate, 'Rate');
    if (rateErr) newErrors.billRate = rateErr;
    if (!unit.trim()) newErrors.unit = 'Unit is required';
    if (!paymentTerms.trim()) newErrors.paymentTerms = 'Payment terms are required';
    if (!rdValue.trim()) newErrors.rdValue = 'RD Value is required';
    if (!stapleLength.trim()) newErrors.stapleLength = 'Staple Length is required';
    if (!mic.trim()) newErrors.mic = 'Mic is required';
    if (!trashPercent.trim()) newErrors.trashPercent = 'Trash % is required';
    if (!moisturePercent.trim()) newErrors.moisturePercent = 'Moisture % is required';

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
    if (!sellerCity.trim()) newErrors.sellerCity = 'Seller City is required';
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
    if (!buyerCity.trim()) newErrors.buyerCity = 'Buyer City is required';
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
      const newId = await saudaService.create({
        companyId: currentCompany?.id || 1,
        financialYear: currentFinancialYear || '2026-2027',
        date,
        itemId: selectedItemId || 1,
        itemName,
        itemQuality: itemQuality || 'STANDARD',
        quantity: Number(quantity),
        unit,
        billRate: Number(billRate),
        totalBillAmount,
        paymentTerms,
        rdValue,
        stapleLength,
        mic,
        trashPercent,
        moisturePercent,
        sellerId: selectedSellerId || 1,
        sellerName,
        sellerLocation,
        sellerCity,
        sellerCommissionRate: Number(sellerCommRate),
        sellerCommissionAmount,
        sellerContactPerson,
        buyerId: selectedBuyerId || 1,
        buyerName,
        buyerLocation,
        buyerCity,
        buyerCommissionRate: Number(buyerCommRate),
        buyerCommissionAmount,
        buyerContactPerson,
      });

      toast.success(`Vyapar Order created successfully!`);
      navigate('/vyapar');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create Vyapar Order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      <PageHeader
        title="CREATE VYAPAR ORDER"
        companyInfo={{
          financialYear: currentFinancialYear,
          companyName: currentCompany?.name,
        }}
      />

      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
        {/* Step Indicator Bar matching Image 1 */}
        <SaudaWizardStepper
          currentStep={step}
          onStepClick={(targetStep) => {
            if (targetStep < step) setStep(targetStep as 1 | 2 | 3);
            else if (targetStep === 2 && isStep1Valid) setStep(2);
            else if (targetStep === 3 && isStep1Valid && isStep2Valid) setStep(3);
          }}
          maxAllowedStep={isStep1Valid ? (isStep2Valid ? 3 : 2) : 1}
        />

        {/* STEP 1: ITEM, MATERIAL & QUALITY, TECHNICAL PARAMETERS */}
        {step === 1 && (
          <div className="liquid-glass-card p-5 md:p-6 rounded-3xl space-y-5 shadow-glass-card">
            {/* DATE */}
            <div>
              <GlassDatePicker
                label="DATE"
                required
                value={date || formatISODate()}
                onChange={val => {
                  setDate(val);
                  clearError('date');
                }}
                error={errors.date}
                placeholder="DD-MM-YYYY"
              />
            </div>

            {/* ITEM NAME * */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                ITEM NAME <span className="text-red-500 font-bold">*</span>
              </label>
              <div
                onClick={() => {
                  setIsItemModalOpen(true);
                  clearError('itemName');
                }}
                className={`input-sauda flex items-center justify-between cursor-pointer font-bold uppercase text-slate-900 dark:text-slate-100 ${
                  errors.itemName ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                }`}
              >
                <span>{itemName || 'SELECT ITEM NAME'}</span>
                <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
              <FieldError error={errors.itemName} />
            </div>

            {/* SECTION: MATERIAL & QUALITY */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Material & Quality
                </h3>
              </div>

              {/* QUALITY */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  QUALITY <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="EX. A-1, 1 GADI, 50 BORI 40 Kg"
                  value={itemQuality}
                  onChange={e => {
                    setItemQuality(e.target.value);
                    clearError('itemQuality');
                  }}
                  className={`input-sauda font-semibold uppercase text-xs ${
                    errors.itemQuality ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                  }`}
                />
                <FieldError error={errors.itemQuality} />
                {quickValues.quality && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {quickValues.quality.slice(0, 5).map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setItemQuality(val);
                          clearError('itemQuality');
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/70 dark:border-blue-800/40 font-bold transition-colors cursor-pointer"
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
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                    QUANTITY <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="EX. 100"
                    value={quantity}
                    onKeyDown={e => preventNonNumericInput(e, true)}
                    onChange={e => {
                      setQuantity(sanitizeNumeric(e.target.value, true));
                      clearError('quantity');
                    }}
                    className={`input-sauda font-extrabold text-slate-900 dark:text-slate-100 ${
                      errors.quantity ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                    }`}
                  />
                  <FieldError error={errors.quantity} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                    UNIT <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="EX. CANDY / TON"
                    value={unit}
                    onChange={e => {
                      setUnit(e.target.value);
                      clearError('unit');
                    }}
                    className={`input-sauda font-bold uppercase text-slate-900 dark:text-slate-100 ${
                      errors.unit ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                    }`}
                  />
                  <FieldError error={errors.unit} />
                </div>
              </div>

              {/* RATE (PER CANDY / UNIT) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  RATE (PER {unit ? unit.toUpperCase() : 'CANDY'}) <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="EX. 3723"
                  value={billRate}
                  onKeyDown={e => preventNonNumericInput(e, true)}
                  onChange={e => {
                    setBillRate(sanitizeNumeric(e.target.value, true));
                    clearError('billRate');
                  }}
                  className={`input-sauda font-extrabold text-slate-900 dark:text-slate-100 ${
                    errors.billRate ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                  }`}
                />
                <FieldError error={errors.billRate} />
              </div>

              {/* PAYMENT TERMS (DAYS) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  PAYMENT TERMS (DAYS) <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="EX. 15, NEXT DAY, ADVANCE"
                  value={paymentTerms}
                  onChange={e => {
                    setPaymentTerms(e.target.value);
                    clearError('paymentTerms');
                  }}
                  className={`input-sauda font-semibold ${
                    errors.paymentTerms ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                  }`}
                />
                <FieldError error={errors.paymentTerms} />
                {quickValues.paymentTerms && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {quickValues.paymentTerms.map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setPaymentTerms(val);
                          clearError('paymentTerms');
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/70 dark:border-blue-800/40 font-bold transition-colors cursor-pointer"
                      >
                        + {val} Days
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Bill Amount Calculated Box */}
              {quantity && billRate && (
                <div className="p-3.5 sm:p-4 bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/25 dark:border-emerald-800/40 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300 shadow-glass-card backdrop-blur-md animate-in fade-in">
                  <span className="text-[11px] sm:text-xs uppercase tracking-wider font-extrabold text-emerald-700 dark:text-emerald-400">Total Bill Amount:</span>
                  <span className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 break-all">{formatCurrency(totalBillAmount)}</span>
                </div>
              )}
            </div>

            {/* SECTION: TECHNICAL PARAMETERS */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Technical Parameters
                </h3>
              </div>

              {/* RD VALUE */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  RD VALUE <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="EX. A-1, 75, 76"
                  value={rdValue}
                  onChange={e => {
                    setRdValue(e.target.value);
                    clearError('rdValue');
                  }}
                  className={`input-sauda font-semibold uppercase text-xs ${
                    errors.rdValue ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                  }`}
                />
                <FieldError error={errors.rdValue} />
                {quickValues.rdValue && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {quickValues.rdValue.map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setRdValue(val);
                          clearError('rdValue');
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/70 dark:border-blue-800/40 font-bold transition-colors cursor-pointer"
                      >
                        + {val}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* STAPLE LENGTH & MIC */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                    STAPLE LENGTH (MM) <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="EX. 30"
                    value={stapleLength}
                    onKeyDown={e => preventNonNumericInput(e, true)}
                    onChange={e => {
                      setStapleLength(sanitizeNumeric(e.target.value, true));
                      clearError('stapleLength');
                    }}
                    className={`input-sauda font-semibold ${
                      errors.stapleLength ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                    }`}
                  />
                  <FieldError error={errors.stapleLength} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                    MIC <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="EX. 4-5"
                    value={mic}
                    onChange={e => {
                      setMic(e.target.value);
                      clearError('mic');
                    }}
                    className={`input-sauda font-semibold ${
                      errors.mic ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                    }`}
                  />
                  <FieldError error={errors.mic} />
                </div>
              </div>

              {/* TRASH % & MOISTURE % */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                    <span>TRASH % <span className="text-red-500 font-bold">*</span></span>
                    <Percent className="w-3 h-3 text-slate-400" />
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="EX. 3.5"
                    value={trashPercent}
                    onKeyDown={e => preventNonNumericInput(e, true)}
                    onChange={e => {
                      setTrashPercent(sanitizeNumeric(e.target.value, true));
                      clearError('trashPercent');
                    }}
                    className={`input-sauda font-semibold ${
                      errors.trashPercent ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                    }`}
                  />
                  <FieldError error={errors.trashPercent} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                    <span>MOISTURE % <span className="text-red-500 font-bold">*</span></span>
                    <Percent className="w-3 h-3 text-slate-400" />
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="EX. 5.3"
                    value={moisturePercent}
                    onKeyDown={e => preventNonNumericInput(e, true)}
                    onChange={e => {
                      setMoisturePercent(sanitizeNumeric(e.target.value, true));
                      clearError('moisturePercent');
                    }}
                    className={`input-sauda font-semibold ${
                      errors.moisturePercent ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                    }`}
                  />
                  <FieldError error={errors.moisturePercent} />
                </div>
              </div>
            </div>

            {/* Step 1 Footer */}
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-200/60 dark:border-slate-800 gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                Step 1 of 3
              </span>
              <button
                type="button"
                onClick={handleNextFromItem}
                disabled={!isStep1Valid}
                className="btn-glass-primary px-5 sm:px-7 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none hover:disabled:shadow-none transition-all"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SELLER FORM */}
        {step === 2 && (
          <div className="liquid-glass-card p-5 md:p-6 rounded-3xl space-y-4 shadow-glass-card animate-in fade-in">
            {/* SELLER NAME * */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                SELLER NAME <span className="text-red-500 font-bold">*</span>
              </label>
              <div
                onClick={() => {
                  setIsSellerModalOpen(true);
                  clearError('sellerName');
                }}
                className={`input-sauda flex items-center justify-between cursor-pointer font-bold uppercase text-slate-900 dark:text-slate-100 ${
                  errors.sellerName ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                }`}
              >
                <span>{sellerName || 'SELECT SELLER PARTY'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <FieldError error={errors.sellerName} />
            </div>

            {/* PICKUP LOCATION & CITY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  PICKUP LOCATION <span className="text-slate-400 font-normal text-[11px]">(OPTIONAL)</span>
                </label>
                <input
                  type="text"
                  placeholder="Factory, GIDC, etc."
                  value={sellerLocation}
                  onChange={e => setSellerLocation(e.target.value)}
                  className="input-sauda font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  CITY <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={sellerCity}
                  onChange={e => {
                    setSellerCity(e.target.value);
                    clearError('sellerCity');
                  }}
                  className={`input-sauda font-semibold uppercase ${
                    errors.sellerCity ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                  }`}
                />
                <FieldError error={errors.sellerCity} />
              </div>
            </div>

            {/* SELLER COMMISSION % */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                <span>SELLER COMMISSION % <span className="text-red-500 font-bold">*</span></span>
                <span className="text-[11px] text-slate-400 font-medium">% per {unit || 'Candy'}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="2.4"
                  value={sellerCommRate}
                  onKeyDown={e => preventNonNumericInput(e, true)}
                  onChange={e => {
                    setSellerCommRate(sanitizeNumeric(e.target.value, true));
                    clearError('sellerCommRate');
                  }}
                  className={`input-sauda font-bold !pr-10 ${
                    errors.sellerCommRate ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                  }`}
                />
                <Percent className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <FieldError error={errors.sellerCommRate} />
            </div>

            {/* Commission Amount Banner */}
            <div className="p-3.5 sm:p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/50 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 shadow-glass-card backdrop-blur-md">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-extrabold text-blue-700 dark:text-blue-300">Seller Commission Amount:</span>
              <span className="text-base sm:text-xl font-black text-blue-600 dark:text-blue-400 break-all">{formatCurrency(sellerCommissionAmount)}</span>
            </div>

            {/* SELLER CONTACT PERSON */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                SELLER CONTACT PERSON / PHONE
              </label>
              <input
                type="text"
                placeholder="Eg. Sharma / 9876543210"
                value={sellerContactPerson}
                onChange={e => setSellerContactPerson(e.target.value)}
                className="input-sauda font-medium"
              />
            </div>

            {/* Step 2 Footer */}
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-200/60 dark:border-slate-800 gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                Step 2 of 3
              </span>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-glass-secondary px-3 sm:px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Previous Step"
                  aria-label="Previous Step"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextFromSeller}
                  disabled={!isStep2Valid}
                  className="btn-glass-primary px-5 sm:px-7 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none hover:disabled:shadow-none transition-all"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BUYER FORM */}
        {step === 3 && (
          <div className="liquid-glass-card p-5 md:p-6 rounded-3xl space-y-4 shadow-glass-card animate-in fade-in">
            {/* BUYER NAME * */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                BUYER NAME <span className="text-red-500 font-bold">*</span>
              </label>
              <div
                onClick={() => {
                  setIsBuyerModalOpen(true);
                  clearError('buyerName');
                }}
                className={`input-sauda flex items-center justify-between cursor-pointer font-bold uppercase text-slate-900 dark:text-slate-100 ${
                  errors.buyerName ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                }`}
              >
                <span>{buyerName || 'SELECT BUYER PARTY'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <FieldError error={errors.buyerName} />
            </div>

            {/* SHIPPING LOCATION & CITY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  SHIPPING LOCATION <span className="text-slate-400 font-normal text-[11px]">(OPTIONAL)</span>
                </label>
                <input
                  type="text"
                  placeholder="Mill, Unit, Address"
                  value={buyerLocation}
                  onChange={e => setBuyerLocation(e.target.value)}
                  className="input-sauda font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  CITY <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={buyerCity}
                  onChange={e => {
                    setBuyerCity(e.target.value);
                    clearError('buyerCity');
                  }}
                  className={`input-sauda font-semibold uppercase ${
                    errors.buyerCity ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                  }`}
                />
                <FieldError error={errors.buyerCity} />
              </div>
            </div>

            {/* BUYER COMMISSION % */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                <span>BUYER COMMISSION % <span className="text-red-500 font-bold">*</span></span>
                <span className="text-[11px] text-slate-400 font-medium">% per {unit || 'Candy'}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="2.3"
                  value={buyerCommRate}
                  onKeyDown={e => preventNonNumericInput(e, true)}
                  onChange={e => {
                    setBuyerCommRate(sanitizeNumeric(e.target.value, true));
                    clearError('buyerCommRate');
                  }}
                  className={`input-sauda font-bold !pr-10 ${
                    errors.buyerCommRate ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                  }`}
                />
                <Percent className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <FieldError error={errors.buyerCommRate} />
            </div>

            {/* Commission Amount Banner */}
            <div className="p-3.5 sm:p-4 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/50 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-blue-800 dark:text-blue-300 shadow-glass-card backdrop-blur-md">
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-extrabold text-blue-700 dark:text-blue-300">Buyer Commission Amount:</span>
              <span className="text-base sm:text-xl font-black text-blue-600 dark:text-blue-400 break-all">{formatCurrency(buyerCommissionAmount)}</span>
            </div>

            {/* BUYER CONTACT PERSON */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                BUYER CONTACT PERSON / PHONE
              </label>
              <input
                type="text"
                placeholder="Eg. Sharma / 9876543210"
                value={buyerContactPerson}
                onChange={e => setBuyerContactPerson(e.target.value)}
                className="input-sauda font-medium"
              />
            </div>

            {/* Step 3 Footer */}
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-200/60 dark:border-slate-800 gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                Step 3 of 3
              </span>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-glass-secondary px-3 sm:px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Previous Step"
                  aria-label="Previous Step"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={!isStep3Valid}
                  className="btn-glass-primary px-5 sm:px-7 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none hover:disabled:shadow-none transition-all"
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

      {/* Item Search Selector Modal */}
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
          setSellerCommRate(String(itm.sellerCommissionRate || 2.4));
          setBuyerCommRate(String(itm.buyerCommissionRate || 2.3));
        }}
      />

      {/* Seller Search Selector Modal */}
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
          setSellerLocation(p.address || '');
          setSellerCity(p.city || '');
          if (p.mobileNumber) setSellerContactPerson(p.mobileNumber);
          if (selectedBuyerId === p.id) {
            setSelectedBuyerId(null);
            setBuyerName('');
            setBuyerLocation('');
            setBuyerCity('');
          }
        }}
      />

      {/* Buyer Search Selector Modal */}
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
          setBuyerLocation(p.address || '');
          setBuyerCity(p.city || '');
          if (p.mobileNumber) setBuyerContactPerson(p.mobileNumber);
          if (selectedSellerId === p.id) {
            setSelectedSellerId(null);
            setSellerName('');
            setSellerLocation('');
            setSellerCity('');
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
          setSellerCommRate(String(newItem.sellerCommissionRate || 2.4));
          setBuyerCommRate(String(newItem.buyerCommissionRate || 2.3));
          setIsItemModalOpen(false);
        }}
      />

      {/* Quick Add Party Modal */}
      <QuickAddPartyModal
        isOpen={isQuickAddPartyOpen}
        onClose={() => setIsQuickAddPartyOpen(false)}
        defaultPartyType={quickAddPartyContext}
        onPartyCreated={newParty => {
          setParties(prev => [newParty, ...prev.filter(p => p.id !== newParty.id)]);
          if (quickAddPartyContext === 'seller') {
            setSelectedSellerId(newParty.id!);
            setSellerName(newParty.name);
            setSellerLocation(newParty.address || '');
            setSellerCity(newParty.city || '');
            if (newParty.mobileNumber) setSellerContactPerson(newParty.mobileNumber);
            setIsSellerModalOpen(false);
          } else {
            setSelectedBuyerId(newParty.id!);
            setBuyerName(newParty.name);
            setBuyerLocation(newParty.address || '');
            setBuyerCity(newParty.city || '');
            if (newParty.mobileNumber) setBuyerContactPerson(newParty.mobileNumber);
            setIsBuyerModalOpen(false);
          }
        }}
      />
    </div>
  );
};
