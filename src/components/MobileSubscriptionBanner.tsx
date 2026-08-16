import React from 'react';
import { Crown, ChevronLeft } from 'lucide-react';

interface MobileSubscriptionBannerProps {
  onClick: () => void;
}

export default function MobileSubscriptionBanner({ onClick }: MobileSubscriptionBannerProps) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-[60] lg:hidden">
      <button
        onClick={onClick}
        className="w-full h-[75px] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all active:scale-[0.98] px-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Crown className="h-6 w-6 text-[#d4af37]" />
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-base">باقات معلمي</p>
            <p className="text-white/80 text-xs mt-0.5">اشترك في الباقة الشهرية</p>
          </div>
        </div>
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}
