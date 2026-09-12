import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { Info, Trash2, Search, CheckCircle, LogOut, Plus, Save, X, Check } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { companyService } from '../../services/companyService';
import { authService } from '../../services/authService';
import { profileService } from '../../services/profileService';
import type { Company } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SaudaNoteTemplate } from '../../components/pdf/SaudaNoteTemplate';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { GlassSelect } from '../../components/common/GlassSelect';
import { FieldError } from '../../components/common/FieldError';
import {
  validateRequired,
  validatePhone,
  validateEmail,
  validatePincode,
  validatePan,
  validateGst,
  validateIfsc,
} from '../../utils/validators';

const INDIAN_STATES = [
  'GUJARAT',
  'MAHARASHTRA',
  'RAJASTHAN',
  'MADHYA PRADESH',
  'PUNJAB',
  'HARYANA',
  'ANDHRA PRADESH',
  'TELANGANA',
  'KARNATAKA',
  'TAMIL NADU',
  'WEST BENGAL',
  'UTTAR PRADESH',
  'BIHAR',
  'DELHI',
];

const COLOR_OPTIONS = [
  { label: 'RED', hex: '#DC2626' },
  { label: 'ORANGE', hex: '#FF9800' },
  { label: 'BLUE', hex: '#2563EB' },
  { label: 'GREEN', hex: '#059669' },
  { label: 'BLACK', hex: '#111827' },
];

export const AddEditCompanyPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { palette } = useTheme();
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isFirstCompany = searchParams.get('firstCompany') === 'true' || location.pathname === '/create-first-company';
  const isEdit = Boolean(id);
  const toast = useToast();
  const { refreshAppContext, setCurrentCompany } = useApp();
  const { currentUser, logout } = useAuth();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('GUJARAT');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [saudaNoteColor, setSaudaNoteColor] = useState<Company['saudaNoteColor']>('RED');
  const [pdfTemplate, setPdfTemplate] = useState<Company['pdfTemplate']>(1);
  const [showSignature, setShowSignature] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGstModal, setShowGstModal] = useState(false);
  const [gstInput, setGstInput] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      companyService.getById(Number(id)).then(comp => {
        if (comp) {
          setName(comp.name);
          setUsername(comp.username || '');
          setContactNumber(comp.contactNumber);
          setEmail(comp.email || '');
          setAddress(comp.address);
          setState(comp.state);
          setCity(comp.city);
          setPinCode(comp.pinCode);
          setGstNumber(comp.gstNumber || '');
          setPanNumber(comp.panNumber || '');
          setBankName(comp.bankName || '');
          setAccountNumber(comp.accountNumber || '');
          setAccountHolderName(comp.accountHolderName || '');
          setIfscCode(comp.ifscCode || '');
          setUpiId(comp.upiId || '');
          setSaudaNoteColor(comp.saudaNoteColor || 'RED');
          setPdfTemplate(comp.pdfTemplate || 1);
          setShowSignature(comp.showSignature !== false);
          setIsDefault(Boolean(comp.isDefault));
        } else {
          toast.error('Company not found');
          navigate('/companies');
        }
      });
    } else {
      if (currentUser?.email && !email) {
        setEmail(currentUser.email);
      }
    }
  }, [id, isEdit, currentUser]);

  const handleApplyGst = () => {
    const gst = gstInput.trim().toUpperCase();
    if (gst.length >= 10) {
      setGstNumber(gst);
      clearError('gstNumber');
      if (gst.length >= 12) {
        setPanNumber(gst.substring(2, 12));
        clearError('panNumber');
      }
      toast.success('GST & PAN extracted successfully');
      setShowGstModal(false);
      setGstInput('');
    } else {
      toast.error('Please enter a valid GST number');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const nameErr = validateRequired(name, 'Company Name');
    if (nameErr) newErrors.name = nameErr;

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      newErrors.username = 'Username is required';
    } else if (trimmedUsername.length < 2 || trimmedUsername.length > 30) {
      newErrors.username = 'Username must be between 2 and 30 characters';
    }

    const contactErr = validatePhone(contactNumber, 'Contact Number', true);
    if (contactErr) newErrors.contactNumber = contactErr;

    const emailErr = validateEmail(email, false);
    if (emailErr) newErrors.email = emailErr;

    const addressErr = validateRequired(address, 'Address');
    if (addressErr) newErrors.address = addressErr;

    const stateErr = validateRequired(state, 'State');
    if (stateErr) newErrors.state = stateErr;

    const cityErr = validateRequired(city, 'City');
    if (cityErr) newErrors.city = cityErr;

    const pinErr = validatePincode(pinCode, true);
    if (pinErr) newErrors.pinCode = pinErr;

    const panErr = validatePan(panNumber, false);
    if (panErr) newErrors.panNumber = panErr;

    const gstErr = validateGst(gstNumber, false);
    if (gstErr) newErrors.gstNumber = gstErr;

    const ifscErr = validateIfsc(ifscCode, false);
    if (ifscErr) newErrors.ifscCode = ifscErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please resolve the errors highlighted below');
      return;
    }

    try {
      setIsSubmitting(true);
      const userEmail = currentUser?.email || email.trim() || 'krishnafibers@gmail.com';
      const companyData = {
        name: name.trim().toUpperCase(),
        username: trimmedUsername,
        userEmail: userEmail.toLowerCase(),
        contactNumber: contactNumber.trim(),
        email: email.trim() || userEmail,
        address: address.trim().toUpperCase(),
        state: state.trim().toUpperCase(),
        city: city.trim().toUpperCase() || 'BOTAD',
        pinCode: pinCode.trim(),
        gstNumber: gstNumber.trim().toUpperCase(),
        panNumber: panNumber.trim().toUpperCase(),
        bankName: bankName.trim().toUpperCase(),
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim().toUpperCase(),
        ifscCode: ifscCode.trim().toUpperCase(),
        upiId: upiId.trim(),
        saudaNoteColor,
        pdfTemplate,
        showSignature,
        isDefault: isFirstCompany ? true : isDefault,
      };

      let activeCompanyId: number;
      if (isEdit && id) {
        activeCompanyId = Number(id);
        await companyService.update(activeCompanyId, companyData);
        toast.success('Company updated successfully');
      } else {
        activeCompanyId = await companyService.create(companyData);
        toast.success('Company created successfully');
      }

      // Register association on backend
      await authService.registerCompanyOnBackend({
        id: activeCompanyId,
        name: companyData.name,
        username: trimmedUsername,
      });

      // Update userProfile name to match active username
      await profileService.updateProfile({ name: trimmedUsername });

      await refreshAppContext();

      if (isFirstCompany) {
        const savedComp = await companyService.getById(activeCompanyId);
        if (savedComp) {
          setCurrentCompany(savedComp);
        }
        navigate('/home', { replace: true });
      } else {
        navigate('/companies');
      }
    } catch (err) {
      toast.error('Failed to save company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (id) {
      await companyService.delete(Number(id));
      toast.success('Company deleted successfully');
      await refreshAppContext();
      navigate('/companies');
    }
  };

  const currentColorHex =
    COLOR_OPTIONS.find(c => c.label === saudaNoteColor)?.hex || '#DC2626';

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      <PageHeader
        title={isFirstCompany ? 'Create Your First Company' : (isEdit ? 'Edit Company' : 'Add Company')}
        subtitle={isFirstCompany ? 'Add company details to unlock VyaparX application' : undefined}
        showBack={!isFirstCompany}
        rightAction={
          isFirstCompany ? (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="btn-glass-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          ) : isEdit ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
              title="Delete Company"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : null
        }
      />

      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        {/* First Company Welcome Banner */}
        {isFirstCompany && (
          <div 
            className="p-4 border-2 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-glass-card backdrop-blur-md animate-in fade-in"
            style={{ backgroundColor: palette.light, borderColor: palette.primary, color: palette.text }}
          >
            <span>👋 Let's create your first company to get started.</span>
          </div>
        )}

        {/* Info Banner */}
        <div 
          className="p-4 rounded-2xl flex items-start gap-3 text-xs font-medium leading-relaxed glass-card-subtle"
          style={{ borderColor: palette.primary + '33', color: palette.text }}
        >
          <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: palette.primary }} />
          <span>
            Fields marked with a red <span className="text-red-500 font-bold">*</span> are mandatory. Other details are optional and can be added later.
          </span>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="glass-card p-5 md:p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.primary }}></span>
              Basic Information
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                COMPANY NAME <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="COMPANY NAME"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  clearError('name');
                }}
                className={`input-sauda uppercase font-bold ${errors.name ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
              />
              <FieldError error={errors.name} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                USERNAME <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="USERNAME"
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  clearError('username');
                }}
                className={`input-sauda uppercase font-bold ${errors.username ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
              />
              <FieldError error={errors.username} />
              <p className="text-[11px] text-gray-500 mt-1 font-medium">
                Your profile username for this company.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                CONTACT NUMBER <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="tel"
                placeholder="10-DIGIT CONTACT NUMBER"
                maxLength={10}
                value={contactNumber}
                onChange={e => {
                  setContactNumber(e.target.value);
                  clearError('contactNumber');
                }}
                className={`input-sauda font-semibold ${errors.contactNumber ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
              />
              <FieldError error={errors.contactNumber} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                EMAIL (OPTIONAL)
              </label>
              <input
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  clearError('email');
                }}
                className={`input-sauda font-medium lowercase ${errors.email ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
              />
              <FieldError error={errors.email} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                ADDRESS <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="ADDRESS"
                value={address}
                onChange={e => {
                  setAddress(e.target.value);
                  clearError('address');
                }}
                className={`input-sauda font-medium uppercase ${errors.address ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
              />
              <FieldError error={errors.address} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="col-span-1">
                <GlassSelect
                  label="STATE"
                  required
                  value={state}
                  error={errors.state}
                  onChange={v => {
                    setState(v);
                    clearError('state');
                  }}
                  options={INDIAN_STATES.map(s => ({ value: s, label: s }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                  CITY <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="CITY"
                  value={city}
                  onChange={e => {
                    setCity(e.target.value);
                    clearError('city');
                  }}
                  className={`input-sauda uppercase font-medium text-xs ${errors.city ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
                />
                <FieldError error={errors.city} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                  PIN CODE <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-DIGIT PIN CODE"
                  value={pinCode}
                  onChange={e => {
                    setPinCode(e.target.value);
                    clearError('pinCode');
                  }}
                  className={`input-sauda uppercase font-medium text-xs ${errors.pinCode ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
                />
                <FieldError error={errors.pinCode} />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="glass-card p-5 md:p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.primary }}></span>
              Business Details
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                GST NUMBER
              </label>
              <input
                type="text"
                maxLength={15}
                placeholder="15-CHARACTER GSTIN (OPTIONAL)"
                value={gstNumber}
                onChange={e => {
                  setGstNumber(e.target.value.toUpperCase());
                  clearError('gstNumber');
                }}
                className={`input-sauda uppercase font-semibold ${errors.gstNumber ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
              />
              <FieldError error={errors.gstNumber} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                PAN NUMBER
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="10-CHARACTER PAN (OPTIONAL)"
                value={panNumber}
                onChange={e => {
                  setPanNumber(e.target.value.toUpperCase());
                  clearError('panNumber');
                }}
                className={`input-sauda uppercase font-semibold ${errors.panNumber ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
              />
              <FieldError error={errors.panNumber} />
            </div>
          </div>

          {/* Bank Details */}
          <div className="glass-card p-5 md:p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.primary }}></span>
              Bank Details
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                BANK NAME
              </label>
              <input
                type="text"
                placeholder="BANK NAME"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="input-sauda uppercase font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                ACCOUNT NUMBER
              </label>
              <input
                type="text"
                placeholder="ACCOUNT NUMBER"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                className="input-sauda font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                ACCOUNT HOLDER NAME
              </label>
              <input
                type="text"
                placeholder="ACCOUNT HOLDER NAME"
                value={accountHolderName}
                onChange={e => setAccountHolderName(e.target.value)}
                className="input-sauda uppercase font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                IFSC CODE
              </label>
              <input
                type="text"
                maxLength={11}
                placeholder="11-CHARACTER IFSC CODE"
                value={ifscCode}
                onChange={e => {
                  setIfscCode(e.target.value.toUpperCase());
                  clearError('ifscCode');
                }}
                className={`input-sauda uppercase font-semibold ${errors.ifscCode ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
              />
              <FieldError error={errors.ifscCode} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                UPI ID
              </label>
              <input
                type="text"
                placeholder="UPI ID"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                className="input-sauda font-medium"
              />
            </div>
          </div>

          {/* Vyapar Note Customization (Screenshots 13 & 14) */}
          <div className="glass-card p-5 md:p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.primary }}></span>
              Vyapar Note Customization
            </h2>

            {/* Vyapar Note Color with Swatch */}
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                VYAPAR NOTE COLOR
              </label>
              <div className="flex items-center gap-3">
                <GlassSelect
                  value={saudaNoteColor}
                  onChange={v => setSaudaNoteColor(v as Company['saudaNoteColor'])}
                  options={COLOR_OPTIONS.map(c => ({
                    value: c.label,
                    label: c.label,
                    colorSwatch: c.hex,
                  }))}
                  className="flex-1"
                />
                <div
                  className="w-12 h-12 rounded-2xl shadow-glass border border-white/40 dark:border-white/10 shrink-0"
                  style={{ backgroundColor: currentColorHex }}
                  title={`Color Preview: ${saudaNoteColor}`}
                />
              </div>
            </div>

            {/* Vyapar Note PDF Template Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-2">
                VYAPAR NOTE PDF TEMPLATE
              </label>
              <div className="flex items-center gap-6 py-1">
                {[1, 2, 3, 4].map(num => (
                  <label key={num} className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-800 dark:text-gray-200">
                    <input
                      type="radio"
                      name="pdfTemplate"
                      checked={pdfTemplate === num}
                      onChange={() => setPdfTemplate(num as 1 | 2 | 3 | 4)}
                      style={{ accentColor: palette.primary }}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span>{num}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Signature Toggle */}
            <div className="flex items-center gap-3 py-1">
              <input
                type="checkbox"
                id="showSignature"
                checked={showSignature}
                onChange={e => setShowSignature(e.target.checked)}
                style={{ accentColor: palette.primary }}
                className="w-5 h-5 rounded cursor-pointer"
              />
              <label htmlFor="showSignature" className="text-sm font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                Show signature in Vyapar Note PDF
              </label>
            </div>

            {/* Set Default Company */}
            <div className="flex items-center gap-3 py-1">
              <input
                type="checkbox"
                id="isDefaultCompany"
                checked={isDefault}
                onChange={e => setIsDefault(e.target.checked)}
                style={{ accentColor: palette.primary }}
                className="w-5 h-5 rounded cursor-pointer"
              />
              <label htmlFor="isDefaultCompany" className="text-sm font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                Set as Default Business Profile
              </label>
            </div>

            {/* Live PDF Template Preview */}
            <div className="pt-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Live PDF Template Preview:
              </div>
              <div className="overflow-x-auto">
                <SaudaNoteTemplate
                  order={{
                    id: 13,
                    date: '2026-04-18',
                    itemName: 'KHOL',
                    itemQuality: '1 GADI',
                    quantity: 120,
                    unit: '50 KG',
                    billRate: 2099,
                    totalBillAmount: 251880,
                    sellerName: 'RAJ OIL MILL',
                    buyerName: 'JINESH GINNING AND PRESSING FECTORY',
                    paymentTerms: 'NEXT DAY',
                    deliveryTerms: 'next day',
                    remark: '10% moisture',
                  }}
                  company={{
                    name: name || 'KRISHNA FIBERS',
                    address: address || 'PALIYAD ROAD BOTAD',
                    city: city || 'BOTAD',
                    state: state || 'GUJARAT',
                    pinCode: pinCode || '364710',
                    panNumber: panNumber || 'ABCDE1234F',
                    gstNumber: gstNumber || '24ABCDE1234F1Z5',
                    contactNumber: contactNumber || '9574823170',
                    email: email || 'krishnafibers@gmail.com',
                  }}
                  color={saudaNoteColor}
                  template={pdfTemplate}
                  showSignature={showSignature}
                />
              </div>
            </div>
          </div>

          {/* Create / Update Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-glass-primary w-full py-4 px-4 font-extrabold text-sm uppercase tracking-wider rounded-2xl mt-6 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Save className="w-4 h-4 animate-spin" />
                <span>SAVING...</span>
              </>
            ) : isEdit ? (
              <>
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>UPDATE COMPANY</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>CREATE COMPANY</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* GST Search Modal */}
      {showGstModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-white/85 dark:bg-gray-900/85 backdrop-blur-2xl rounded-3xl shadow-glass-hover p-6 space-y-4 border border-white/60 dark:border-white/10">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Search className="w-5 h-5" style={{ color: palette.primary }} />
              <span>Search by GST</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enter 15-digit GSTIN to auto-fill GST & PAN:
            </p>
            <input
              type="text"
              placeholder="Ex. 24AAECK9823P1Z3"
              value={gstInput}
              onChange={e => setGstInput(e.target.value)}
              className="input-sauda uppercase font-bold text-xs"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGstModal(false)}
                className="btn-glass-secondary flex-1 py-2.5 px-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleApplyGst}
                className="btn-glass-primary flex-1 py-2.5 px-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Company?"
        message="Are you sure you want to delete this company profile? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title={t('profile.logoutConfirmTitle', 'Confirm Logout')}
        message={t('profile.logoutConfirmMsg', 'Are you sure you want to log out of your account?')}
        confirmText={t('profile.logout', 'Logout')}
        cancelText={t('common.cancel', 'Cancel')}
        isDestructive={true}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
          navigate('/login');
          toast.info('Logged out');
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};
