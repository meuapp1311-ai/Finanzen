import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle2, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'icon-only';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // If already installed or banner dismissed, don't display
  if (isInstalled) {
    return null;
  }

  // If not on iOS and browser hasn't fired beforeinstallprompt yet, keep quiet in standard button mode
  // But on mobile banner, we can still show tips
  if (!isInstallable && !isIOS && variant !== 'banner') {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else if (isInstallable) {
      await install();
    } else {
      // In case user clicks banner on unsupported browser
      alert('Para instalar, abra as opções do seu navegador e selecione "Adicionar à tela inicial" ou "Instalar aplicativo".');
    }
  };

  // Render iOS Step-by-Step Guide Modal
  const renderIOSModal = () => {
    if (!showIOSModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative text-left">
          <button
            onClick={() => setShowIOSModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Instalar no iPhone / iPad</h3>
              <p className="text-xs text-slate-400">Tenha o Gasto Inteligente como app nativo</p>
            </div>
          </div>

          <div className="space-y-3.5 my-5 text-xs text-slate-300">
            <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="p-1.5 rounded-lg bg-slate-800 text-blue-400 shrink-0">
                <Share className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-white block mb-0.5">1. Toque em Compartilhar</span>
                No Safari do iOS, toque no ícone de compartilhamento na barra inferior do navegador.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 shrink-0">
                <PlusSquare className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-white block mb-0.5">2. Adicionar à Tela de Início</span>
                Role a lista para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="p-1.5 rounded-lg bg-slate-800 text-teal-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-white block mb-0.5">3. Concluir e Usar</span>
                Toque em "Adicionar" no canto superior direito. Pronto! O Gasto Inteligente funcionará em tela cheia e offline.
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowIOSModal(false)}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  };

  // 1. Banner Variant (Shown on mobile for high conversion)
  if (variant === 'banner') {
    if (bannerDismissed) return null;
    return (
      <>
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 rounded-2xl p-4 shadow-lg mb-6 relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 pr-8 sm:pr-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shrink-0 shadow-md shadow-emerald-500/30 font-bold">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                Instalar Gasto Inteligente
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">PWA</span>
              </h4>
              <p className="text-xs text-slate-400">
                Acesse mais rápido, receba avisos de vencimento e use sem gastar internet.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setBannerDismissed(true)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Agora não
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-400/20 flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              Instalar App
            </button>
          </div>

          <button
            onClick={() => setBannerDismissed(true)}
            className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 sm:hidden"
            aria-label="Dispensar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {renderIOSModal()}
      </>
    );
  }

  // 2. Icon-only button
  if (variant === 'icon-only') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors ${className}`}
          title="Instalar App no seu dispositivo (PWA)"
          aria-label="Instalar Gasto Inteligente PWA"
        >
          <Download className="w-4 h-4" />
        </button>
        {renderIOSModal()}
      </>
    );
  }

  // 3. Standard Button (for Header)
  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-md shadow-emerald-500/20 transition-all active:scale-95 ${className}`}
        title="Instalar Gasto Inteligente no celular ou computador"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Instalar App</span>
      </button>
      {renderIOSModal()}
    </>
  );
};
