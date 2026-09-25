import React, { useState } from 'react';
import {
  X,
  Server,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Zap,
} from 'lucide-react';
import {
  getStoredBaseUrl,
  setStoredBaseUrl,
  isLiveApiEnabled,
  setLiveApiEnabled,
  DEFAULT_BASE_URL,
} from '../../lib/api';

interface BackendSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const BackendSettingsModal: React.FC<BackendSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const [baseUrl, setBaseUrl] = useState<string>(getStoredBaseUrl());
  const [useLive, setUseLive] = useState<boolean>(isLiveApiEnabled());
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredBaseUrl(baseUrl);
    setLiveApiEnabled(useLive);
    onConfigChanged();
    onClose();
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      // Test GET /api/tableau?promotionId=1
      const target = baseUrl.trim().replace(/\/+$/, '');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${target}/tableau?promotionId=1`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setTestResult({
          success: true,
          message: `Connexion réussie ! Le serveur Spring Boot répond correctement (${res.status} OK).`,
        });
      } else {
        setTestResult({
          success: false,
          message: `Serveur contacté mais code HTTP inattendu : ${res.status} ${res.statusText}`,
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setTestResult({
        success: false,
        message: `Injoignable (${errorMsg}). Si votre Spring Boot tourne localement sur ${baseUrl}, assurez-vous que les annotations @CrossOrigin ou la configuration CORS autorisent l'origine de cette application. En attendant, basculez sur la "Simulation Active".`,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleResetData = () => {
    if (confirm('Voulez-vous réinitialiser les données de démonstration locales (présences, sessions, devoirs) ?')) {
      localStorage.removeItem('kfokam48_sessions_store');
      localStorage.removeItem('kfokam48_tableau_store_1');
      localStorage.removeItem('kfokam48_tableau_store_2');
      localStorage.removeItem('kfokam48_tableau_store_3');
      localStorage.removeItem('kfokam48_presences_store');
      localStorage.removeItem('kfokam48_relectures_store');
      onConfigChanged();
      setTestResult({
        success: true,
        message: 'Données locales réinitialisées aux valeurs académiques par défaut.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-base">Configuration API Spring Boot</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-5">
          {/* Sélection Mode Live / Simulation */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Mode de fonctionnement
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUseLive(false)}
                className={`p-3.5 rounded-lg border text-left transition-all ${
                  !useLive
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-bold text-slate-900">Simulation Active</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Idéal pour tester l'interface immédiatement sans lancer de backend local. Données persistantes dans le navigateur.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setUseLive(true)}
                className={`p-3.5 rounded-lg border text-left transition-all ${
                  useLive
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-900">Backend Live (REST)</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Appelle directement les 5 endpoints REST sur votre serveur Spring Boot local.
                </p>
              </button>
            </div>
          </div>

          {/* URL de base */}
          <div>
            <label htmlFor="api-url-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              URL racine de l'API REST Spring Boot
            </label>
            <div className="flex gap-2">
              <input
                id="api-url-input"
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:8080/api"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
              >
                {testingConnection ? (
                  <span>Test...</span>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Tester</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Valeur par défaut standard : <span className="font-mono text-slate-600">{DEFAULT_BASE_URL}</span>
            </p>
          </div>

          {/* Résultat du test */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>{testResult.message}</div>
            </div>
          )}

          {/* Rappel des 5 Endpoints Spécifiés */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700 block mb-2">
              Endpoints REST intégrés :
            </span>
            <ul className="space-y-1 font-mono text-[11px] text-slate-600">
              <li>
                <span className="font-bold text-emerald-600">POST</span> /api/sessions (Création
                session formateur)
              </li>
              <li>
                <span className="font-bold text-emerald-600">POST</span> /api/presences (Émargement
                code 6 carac)
              </li>
              <li>
                <span className="font-bold text-emerald-600">POST</span> /api/exercices (Dépôt
                lien exercice)
              </li>
              <li>
                <span className="font-bold text-emerald-600">POST</span> /api/relectures/&#123;id&#125;
                (Relecture croisée)
              </li>
              <li>
                <span className="font-bold text-indigo-600">GET </span> /api/tableau?promotionId=X
                (Tableau de bord)
              </li>
            </ul>
          </div>
        </div>

        {/* Pied de modal */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            title="Remettre à zéro le stockage local"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser la démo</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
