import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'emerald' | 'indigo' | 'amber' | 'blue' | 'purple';
  iconColor?: string;
  iconBg?: string;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'emerald',
  iconColor = 'text-[#2563EB] dark:text-[#60A5FA]',
}) => {
  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
      case 'amber':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/50';
      case 'blue':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/50';
      case 'purple':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/50';
      default:
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50';
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm hover:shadow-neu-raised transition-all relative overflow-hidden group flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {value}
          </div>
          {subtitle && (
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`w-10 h-10 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 ${iconColor} shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform`}>
          <Icon className="w-5 h-5 stroke-[2.2]" />
        </div>
      </div>

      {badge && (
        <div className="mt-3 pt-2.5 border-t border-black/[0.04] dark:border-white/5 flex items-center justify-between">
          <span className={`inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-2xs ${getBadgeStyle()}`}>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};
