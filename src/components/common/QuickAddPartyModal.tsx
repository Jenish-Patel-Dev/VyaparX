import React, { useState } from 'react';
import { X, Users, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { partyService } from '../../services/partyService';
import type { Party } from '../../types';
import { FieldError } from './FieldError';
import { validateRequired, validatePhone, validateGst } from '../../utils/validators';

interface QuickAddPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPartyCreated: (party: Party) => void;
  defaultPartyType?: 'seller' | 'buyer' | 'both';
}

const COMMON_STATES = ['GUJARAT', 'MAHARASHTRA', 'RAJASTHAN', 'MADHYA PRADESH', 'PUNJAB', 'HARYANA'];

export const QuickAddPartyModal: React.FC<QuickAddPartyModalProps> = ({
  isOpen,
  onClose,
  onPartyCreated,
}) => {
  const { palette } = useTheme();
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
  const [city, setCity] = useState('BOTAD');
  const [state, setState] = useState('GUJARAT');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const nameErr = validateRequired(name, 'Party Name');
    if (nameErr) newErrors.name = nameErr;

    const phoneErr = validatePhone(mobileNumber, 'Mobile Number', true);
    if (phoneErr) newErrors.mobileNumber = phoneErr;

    const gstErr = validateGst(gstNumber, false);
    if (gstErr) newErrors.gstNumber = gstErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please resolve the errors highlighted below');
      return;
    }

    try {
      setIsSubmitting(true);
      const partyData: Omit<Party, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim().toUpperCase(),
        mobileNumber: mobileNumber.trim(),
        city: city.trim().toUpperCase() || 'BOTAD',
        state: state.trim().toUpperCase() || 'GUJARAT',
        partyType: 'both',
        address: address.trim(),
        gstNumber: gstNumber.trim().toUpperCase(),
      };

      const newId = await partyService.create(partyData);
      const createdParty = await partyService.getById(newId);

      if (createdParty) {
        toast.success(`Party "${createdParty.name}" added successfully`);
        onPartyCreated(createdParty);
      }
      onClose();

      // Reset form
      setName('');
      setMobileNumber('');
      setAddress('');
      setGstNumber('');
      setErrors({});
    } catch (err) {
      console.error(err);
      toast.error('Failed to create party');
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
            <Users className="w-5 h-5 stroke-[2.5]" />
            <h2 className="font-extrabold text-base tracking-wide uppercase">ADD NEW PARTY</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form noValidate onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* PARTY NAME */}
          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
              PARTY / FIRM NAME <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. SHREE RAM TRADERS, SKY GINNING"
              value={name}
              onChange={e => {
                setName(e.target.value);
                clearError('name');
              }}
              className={`w-full px-3.5 py-2.5 bg-white/60 dark:bg-white/5 border rounded-xl font-bold uppercase text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-[var(--primary)] transition-all shadow-2xs placeholder-gray-400 ${
                errors.name ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : 'border-white/80 dark:border-white/10'
              }`}
            />
            <FieldError error={errors.name} />
          </div>

          {/* MOBILE NUMBER */}
          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
              MOBILE NUMBER <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="tel"
              maxLength={10}
              placeholder="e.g. 9876543210 (10 digits)"
              value={mobileNumber}
              onChange={e => {
                setMobileNumber(e.target.value.replace(/\D/g, ''));
                clearError('mobileNumber');
              }}
              className={`w-full px-3.5 py-2.5 bg-white/60 dark:bg-white/5 border rounded-xl font-semibold text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-[var(--primary)] transition-all shadow-2xs placeholder-gray-400 ${
                errors.mobileNumber ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : 'border-white/80 dark:border-white/10'
              }`}
            />
            <FieldError error={errors.mobileNumber} />
          </div>

          {/* CITY & STATE */}
          <div className="grid grid-cols-2 gap-3 min-w-0">
            <div className="min-w-0">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                CITY
              </label>
              <input
                type="text"
                placeholder="BOTAD"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 rounded-xl font-semibold uppercase text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-[var(--primary)] transition-all shadow-2xs placeholder-gray-400"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
                STATE
              </label>
              <input
                type="text"
                placeholder="GUJARAT"
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 rounded-xl font-semibold uppercase text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-[var(--primary)] transition-all shadow-2xs placeholder-gray-400"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {COMMON_STATES.slice(0, 3).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setState(s)}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-white/60 dark:bg-white/10 border border-white/80 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-2xs"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GST NUMBER (OPTIONAL) */}
          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide mb-1.5">
              GST NUMBER (OPTIONAL)
            </label>
            <input
              type="text"
              maxLength={15}
              placeholder="e.g. 24AAAAA0000A1Z5"
              value={gstNumber}
              onChange={e => setGstNumber(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 rounded-xl font-mono uppercase text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-[var(--primary)] transition-all shadow-2xs placeholder-gray-400"
            />
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
              <span>{isSubmitting ? 'Saving...' : 'Save Party'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
