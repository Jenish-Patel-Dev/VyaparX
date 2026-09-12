import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Info, Contact, Trash2, Search, Plus, Save, X, Check } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { partyService } from '../../services/partyService';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useTheme } from '../../context/ThemeContext';
import { GlassSelect } from '../../components/common/GlassSelect';
import { FieldError } from '../../components/common/FieldError';
import {
  validateRequired,
  validatePhone,
  validateEmail,
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
  'DELHI',
  'UTTAR PRADESH',
  'WEST BENGAL',
];

export const AddEditPartyPage: React.FC = () => {
  const navigate = useNavigate();
  const { palette } = useTheme();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const toast = useToast();

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

  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('GUJARAT');
  const [city, setCity] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGstModal, setShowGstModal] = useState(false);
  const [gstInput, setGstInput] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      partyService.getById(Number(id)).then(party => {
        if (party) {
          setName(party.name);
          setMobileNumber(party.mobileNumber);
          setEmail(party.email || '');
          setAddress(party.address || '');
          setState(party.state || 'GUJARAT');
          setCity(party.city || '');
          setLicenseNumber(party.licenseNumber || '');
          setGstNumber(party.gstNumber || '');
          setPanNumber(party.panNumber || '');
          setBankName(party.bankName || '');
          setAccountNumber(party.accountNumber || '');
          setIfscCode(party.ifscCode || '');
          setUpiId(party.upiId || '');
        } else {
          toast.error('Party not found');
          navigate('/parties');
        }
      });
    }
  }, [id, isEdit]);

  const handleSearchByGst = () => {
    setShowGstModal(true);
  };

  const handleApplyGst = () => {
    const gst = gstInput.trim().toUpperCase();
    if (gst.length >= 10) {
      setGstNumber(gst);
      // Auto-extract PAN (characters 3 to 12)
      if (gst.length >= 12) {
        const pan = gst.substring(2, 12);
        setPanNumber(pan);
      }
      toast.success('GST details extracted successfully');
      setShowGstModal(false);
      setGstInput('');
    } else {
      toast.error('Please enter a valid GST number');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const nameErr = validateRequired(name, 'Party Name');
    if (nameErr) newErrors.name = nameErr;

    const phoneErr = validatePhone(mobileNumber, 'Mobile Number', false);
    if (phoneErr) newErrors.mobileNumber = phoneErr;

    const emailErr = validateEmail(email, false);
    if (emailErr) newErrors.email = emailErr;

    const stateErr = validateRequired(state, 'State');
    if (stateErr) newErrors.state = stateErr;

    const cityErr = validateRequired(city, 'City');
    if (cityErr) newErrors.city = cityErr;

    const gstErr = validateGst(gstNumber, false);
    if (gstErr) newErrors.gstNumber = gstErr;

    const panErr = validatePan(panNumber, false);
    if (panErr) newErrors.panNumber = panErr;

    const ifscErr = validateIfsc(ifscCode, false);
    if (ifscErr) newErrors.ifscCode = ifscErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please resolve the errors highlighted below');
      return;
    }

    try {
      setIsSubmitting(true);
      const partyData = {
        name: name.trim().toUpperCase(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim(),
        address: address.trim(),
        state: state.trim().toUpperCase(),
        city: city.trim().toUpperCase() || 'BOTAD',
        licenseNumber: licenseNumber.trim(),
        gstNumber: gstNumber.trim().toUpperCase(),
        panNumber: panNumber.trim().toUpperCase(),
        bankName: bankName.trim().toUpperCase(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        upiId: upiId.trim(),
        partyType: 'both' as const,
      };

      if (isEdit && id) {
        await partyService.update(Number(id), partyData);
        toast.success('Party updated successfully');
      } else {
        await partyService.create(partyData);
        toast.success('Party created successfully');
      }
      navigate('/parties');
    } catch (err) {
      toast.error('Failed to save party');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (id) {
      await partyService.delete(Number(id));
      toast.success('Party deleted successfully');
      navigate('/parties');
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      {/* Header Replicating Screenshots 6, 7 */}
      <PageHeader
        title={isEdit ? 'Edit Party' : 'Add Party'}
        onSearchByGst={handleSearchByGst}
        rightAction={
          isEdit ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
              title="Delete Party"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : null
        }
      />

      <div className="p-4 md:p-6 max-w-xl mx-auto space-y-6">
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
          {/* 1. Basic Information */}
          <div className="glass-card p-5 md:p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.primary }}></span>
              Basic Information
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                PARTY NAME <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                placeholder="PARTY NAME"
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
                MOBILE NUMBER
              </label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-DIGIT MOBILE NUMBER"
                  value={mobileNumber}
                  onChange={e => {
                    setMobileNumber(e.target.value);
                    clearError('mobileNumber');
                  }}
                  className={`input-sauda pr-12 font-medium ${errors.mobileNumber ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
                />
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2"
                  style={{ backgroundColor: palette.light, color: palette.primary }}
                >
                  <Contact className="w-5 h-5" />
                </div>
              </div>
              <FieldError error={errors.mobileNumber} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                EMAIL
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
                ADDRESS
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

            <div className="grid grid-cols-2 gap-3">
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
                  className={`input-sauda uppercase font-medium ${errors.city ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
                />
                <FieldError error={errors.city} />
              </div>
            </div>
          </div>

          {/* 2. Business Details */}
          <div className="glass-card p-5 md:p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.primary }}></span>
              Business Details
            </h2>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                LICENSE NUMBER
              </label>
              <input
                type="text"
                placeholder="LICENSE NUMBER"
                value={licenseNumber}
                onChange={e => setLicenseNumber(e.target.value)}
                className="input-sauda uppercase font-medium"
              />
            </div>

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

          {/* 3. Banking Details */}
          <div className="glass-card p-5 md:p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.primary }}></span>
              Banking Details
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

          {/* Action Button */}
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
                <span>UPDATE PARTY</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>CREATE PARTY</span>
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
              placeholder="Ex. 24ABCDE1234F1Z5"
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
        title="Delete Party?"
        message="Are you sure you want to delete this party? All related orders will retain reference but party record will be removed."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
