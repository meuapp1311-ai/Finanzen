import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  Landmark,
  Sparkles,
  PiggyBank,
} from 'lucide-react';

export type NavigationTab = 'dashboard' | 'expenses' | 'income' | 'savings' | 'financings' | 'ai';

interface BottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  overdueCount?: number;
  dueSoonCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  overdueCount = 0,
  dueSoonCount = 0,
}) => {
  const tabs = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Painel',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'expenses' as NavigationTab,
      label: 'Despesas',
      icon: Receipt,
      badge: overdueCount > 0 ? overdueCount : dueSoonCount > 0 ? dueSoonCount : null,
      badgeColor: overdueCount > 0 ? 'bg-rose-500' : 'bg-amber-500',
    },
    {
      id: 'income' as NavigationTab,
      label: 'Renda',
      icon: Wallet,
      badge: null,
    },
    {
      id: 'savings' as NavigationTab,
      label: 'Cofrinho',
      icon: PiggyBank,
      badge: null,
    },
    {
      id: 'financings' as NavigationTab,
      label: 'Financiamentos',
      icon: Landmark,
      badge: null,
    },
    {
      id: 'ai' as NavigationTab,
      label: 'IA',
      icon: Sparkles,
      badge: 'PRO',
      badgeColor: 'bg-emerald-500 text-slate-950 font-bold',
    },
  ];

  return (
    <nav
      aria-label="Navegação Principal do Aplicativo"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-lg border-t border-slate-800/80 px-1.5 py-1.5 safe-area-pb"
    >
      <div className="max-w-xl mx-auto flex items-center justify-around gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 min-w-0 max-w-[76px] py-1 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Active subtle background glow */}
              {isActive && (
                <span className="absolute inset-0 bg-emerald-500/10 rounded-xl -z-10" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-emerald-400' : 'text-slate-400'
                  }`}
                  strokeWidth={isActive ? 2.3 : 1.8}
                />

                {/* Notification Badge */}
                {tab.badge !== null && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 min-w-[15px] h-3.5 px-1 rounded-full text-[8px] flex items-center justify-center leading-none text-white ${
                      tab.badgeColor || 'bg-rose-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] sm:text-[11px] mt-1 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
