import React, { useState } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Target,
  Check,
  PiggyBank,
  Sun,
  Moon,
} from 'lucide-react';
import { UserProfile } from '../types/finance';
import { formatBRL } from '../utils/financeCalculations';
import { PWAInstallButton } from './PWAInstallButton';
import { ConfirmModal } from './ConfirmModal';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  totalSavedInPiggyBanks?: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onUpdateProfile,
  onResetData,
  onExportData,
  onImportData,
  activeTab,
  onSelectTab,
  totalSavedInPiggyBanks,
}) => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [savingsTarget, setSavingsTarget] = useState(profile.monthlySavingsTarget);
  const [dueDays, setDueDays] = useState(profile.dueAlertDays);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      monthlySavingsTarget: Number(savingsTarget) || 0,
      dueAlertDays: Number(dueDays) || 3,
    });
    setShowSettingsModal(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImportData(content);
        if (success) {
          setImportStatus('Dados importados com sucesso!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Falha ao importar: arquivo JSON inválido');
          setTimeout(() => setImportStatus(null), 4000);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onSelectTab('dashboard')}
          >
            <img
              src="/logo.png"
              alt="Gasto Inteligente"
              className="w-10 h-10 rounded-xl object-contain shadow-md shadow-emerald-500/10 border border-emerald-500/20 bg-slate-950 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-lg text-white font-['Plus_Jakarta_Sans'] leading-tight">
                  Gasto<span className="text-emerald-400">Inteligente</span>
                </span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">
                Gestão e Inteligência de Gastos
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <PWAInstallButton />

            {/* Light / Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:bg-slate-700/60 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
              aria-label={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline">Tema Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="hidden sm:inline">Tema Escuro</span>
                </>
              )}
            </button>

            <button
              onClick={() => onSelectTab('ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'ai'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/40'
              }`}
              title="Abrir Assistente de Corte de Gastos com IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Assistente</span> IA
            </button>

            {totalSavedInPiggyBanks !== undefined && (
              <button
                onClick={() => onSelectTab('savings')}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'savings'
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'bg-slate-800/80 text-emerald-400 border border-slate-700/60 hover:bg-slate-700/60'
                }`}
                title="Cofrinho e Poupança Guardada"
              >
                <PiggyBank className="w-3.5 h-3.5" />
                <span>Cofrinho: {formatBRL(totalSavedInPiggyBanks)}</span>
              </button>
            )}

            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:bg-slate-700/60 transition-colors"
              title="Configurações de Meta, Aparência e Alertas"
            >
              <Target className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Meta: {formatBRL(profile.monthlySavingsTarget)}</span>
            </button>

            <div className="hidden lg:flex items-center gap-1 border-l border-slate-800 pl-2">
              <button
                onClick={onExportData}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition-colors"
                title="Exportar dados (Backup JSON)"
              >
                <Download className="w-4 h-4" />
              </button>

              <label
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition-colors cursor-pointer"
                title="Importar dados de arquivo JSON"
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-md transition-colors cursor-pointer"
                title="Restaurar dados de exemplo"
                aria-label="Restaurar dados de exemplo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Import Notification Banner */}
      {importStatus && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-center text-xs font-medium text-emerald-400 flex items-center justify-center gap-2">
          <Check className="w-4 h-4" />
          {importStatus}
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Configurações do App</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Tema de Exibição */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Aparência / Tema de Tela
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Tema Claro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Tema Escuro</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Meta Mensal de Economia (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={savingsTarget}
                  onChange={(e) => setSavingsTarget(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  A IA usará esta meta para sugerir cortes proporcionais e calcular amortizações.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Aviso de Vencimento de Contas (Dias de antecedência)
                </label>
                <div className="flex items-center gap-3">
                  {[1, 3, 5, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDueDays(days)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                        dueDays === days
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {days} {days === 1 ? 'dia' : 'dias'}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Contas vencendo nesse intervalo receberão destaque âmbar para evitar juros.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onResetData();
                    setShowSettingsModal(false);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 py-2"
                >
                  Restaurar dados demo
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Salvar Ajustes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Resetting Data */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Restaurar Dados de Exemplo"
        message="Deseja realmente restaurar todos os dados para o padrão de demonstração? Suas alterações locais não salvas serão substituídas."
        confirmText="Sim, restaurar"
        cancelText="Cancelar"
        variant="warning"
        onConfirm={() => {
          onResetData();
          setShowResetConfirm(false);
        }}
        onClose={() => setShowResetConfirm(false)}
      />
    </>
  );
};
