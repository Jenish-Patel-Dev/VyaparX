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
  preventNonNumericInput,
  sanitizeNumeric,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const nameErr = validateRequired(name, 'Party Name');
    if (nameErr) newErrors.name = nameErr;

    const phoneErr = validatePhone(mobileNumber, 'Mobile Number', true);
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
        title={isEdit ? 'EDIT PARTY' : 'ADD PARTY'}
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
          className="p-4 rounded-2xl flex items-start gap-3 text-xs font-medium leading-relaxed glass-card-subtle border border-blue-200/60 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/30 text-slate-700 dark:text-slate-300"
        >
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <span>
            Fields marked with a red <span className="text-red-500 font-bold">*</span> are mandatory. Other details are optional and can be added later.
          </span>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Basic Information */}
          <div className="glass-card p-5 md:p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              Basic Information
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
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
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                MOBILE NUMBER <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-DIGIT MOBILE NUMBER"
                  value={mobileNumber}
                  onKeyDown={e => preventNonNumericInput(e, false)}
                  onChange={e => {
                    setMobileNumber(sanitizeNumeric(e.target.value, false).slice(0, 10));
                    clearError('mobileNumber');
                  }}
                  className={`input-sauda pr-12 font-medium ${errors.mobileNumber ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
                />
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60 shadow-xs pointer-events-none"
                >
                  <Contact className="w-5 h-5" />
                </div>
              </div>
              <FieldError error={errors.mobileNumber} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
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
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
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
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
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
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              Business Details
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
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
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                GST NUMBER
              </label>
              <input
                type="text"
                maxLength={15}
                placeholder="15-CHARACTER GSTIN (OPTIONAL)"
                value={gstNumber}
                onChange={e => {
                  setGstNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15));
                  clearError('gstNumber');
                }}
                className={`input-sauda uppercase font-semibold ${errors.gstNumber ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
              />
              <FieldError error={errors.gstNumber} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                PAN NUMBER
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="10-CHARACTER PAN (OPTIONAL)"
                value={panNumber}
                onChange={e => {
                  setPanNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10));
                  clearError('panNumber');
                }}
                className={`input-sauda uppercase font-semibold ${errors.panNumber ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
              />
              <FieldError error={errors.panNumber} />
            </div>
          </div>

          {/* 3. Banking Details */}
          <div className="glass-card p-5 md:p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              Banking Details
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
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
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                ACCOUNT NUMBER
              </label>
              <input
                type="text"
                maxLength={20}
                placeholder="ACCOUNT NUMBER"
                value={accountNumber}
                onKeyDown={e => preventNonNumericInput(e, false)}
                onChange={e => setAccountNumber(sanitizeNumeric(e.target.value, false).slice(0, 20))}
                className="input-sauda font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                IFSC CODE
              </label>
              <input
                type="text"
                maxLength={11}
                placeholder="11-CHARACTER IFSC CODE"
                value={ifscCode}
                onChange={e => {
                  setIfscCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11));
                  clearError('ifscCode');
                }}
                className={`input-sauda uppercase font-semibold ${errors.ifscCode ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''}`}
              />
              <FieldError error={errors.ifscCode} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
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
            disabled={!name.trim() || mobileNumber.trim().length !== 10 || !city.trim() || !state.trim() || isSubmitting}
            className="btn-glass-primary w-full py-4 px-4 font-extrabold text-sm uppercase tracking-wider rounded-2xl mt-6 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none hover:disabled:shadow-none transition-all"
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
