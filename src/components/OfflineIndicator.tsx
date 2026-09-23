import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:right-auto md:left-6 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/95 text-slate-950 font-semibold px-3.5 py-2 text-xs shadow-xl shadow-amber-500/20 backdrop-blur border border-amber-400 animate-bounce">
      <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
      <span>Modo Offline — O app continua funcionando localmente com seus dados salvos.</span>
    </div>
  );
};
