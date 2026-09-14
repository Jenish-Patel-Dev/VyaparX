import React from 'react';
import { Users2, Copy, Share2, Award, Check } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

export const ReferralsPage: React.FC = () => {
  const { userProfile } = useApp();
  const toast = useToast();
  const [copied, setCopied] = React.useState(false);

  const code = userProfile?.referralCode || 'LHPXC3';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const dummyReferredUsers = [
    { name: 'PATELE TRADING CO.', date: '01/09/2026', bonus: '+30 Days Free' },
    { name: 'SHREE BALAJI COTTON', date: '28/08/2026', bonus: '+30 Days Free' },
    { name: 'KESHAV AGRO BROKERS', date: '15/08/2026', bonus: '+30 Days Free' },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      <PageHeader title="Referrals & Rewards" />

      <div className="p-4 md:p-6 max-w-lg mx-auto space-y-5">
        <div className="glass-card rounded-3xl p-6 text-center space-y-4 shadow-glass-card">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-glass backdrop-blur-xs">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Refer & Earn Free Access</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
              Share your referral code with fellow commodity brokers and earn 30 extra days of premium access!
            </p>
          </div>

          <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/15 border-2 border-dashed border-emerald-500/40 rounded-2xl flex items-center justify-between backdrop-blur-md">
            <div className="text-left">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Your Referral Code</span>
              <div className="text-2xl font-black text-emerald-950 dark:text-emerald-200 tracking-widest">{code}</div>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-glass flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Referred Users List */}
        <div className="glass-card rounded-3xl p-6 space-y-3 shadow-glass-card">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
            <Users2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>My Referral Users ({dummyReferredUsers.length})</span>
          </div>

          <div className="divide-y divide-[#DCE6F2]/70 dark:divide-white/10">
            {dummyReferredUsers.map((user, i) => (
              <div key={i} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <div className="font-extrabold text-gray-800 dark:text-gray-200 uppercase">{user.name}</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500">Joined on {user.date}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[10px] border border-emerald-500/30 backdrop-blur-xs">
                  {user.bonus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
