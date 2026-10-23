import React, { useEffect, useState } from 'react';
import { Info, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { adminService, type SystemNotice } from '../../services/adminService';

export const SystemNoticeBanner: React.FC = () => {
  const [notice, setNotice] = useState<SystemNotice | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    adminService.getSystemNotice().then((res) => {
      if (isMounted && res && res.enabled && res.message?.trim()) {
        const lastDismissedMsg = sessionStorage.getItem('vx_dismissed_notice');
        if (lastDismissedMsg !== res.message) {
          setNotice(res);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!notice || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('vx_dismissed_notice', notice.message);
    setDismissed(true);
  };

  const getStyle = () => {
    switch (notice.type) {
      case 'warning':
        return 'bg-amber-500 text-white';
      case 'alert':
        return 'bg-red-600 text-white';
      default:
        return 'bg-indigo-600 text-white';
    }
  };

  const getIcon = () => {
    switch (notice.type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 shrink-0" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 shrink-0" />;
      default:
        return <Info className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div className={`w-full py-2 px-4 flex items-center justify-between text-xs font-medium shadow-md transition-all z-40 ${getStyle()}`}>
      <div className="flex items-center gap-2 max-w-4xl mx-auto truncate">
        {getIcon()}
        <span className="truncate">{notice.message}</span>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="p-1 rounded-lg hover:bg-black/10 transition-colors shrink-0 ml-2"
        title="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
