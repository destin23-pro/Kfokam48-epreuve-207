import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Send,
  User,
  Hash,
  Sparkles,
} from 'lucide-react';
import { validerPresenceApi, ApiHttpError } from '../../lib/api';
import { PresenceResponse, EtudiantInfo } from '../../types';

interface EmargementCardProps {
  etudiants: EtudiantInfo[];
  selectedEtudiantId: number;
  onSelectEtudiant: (id: number) => void;
  activeSessionCode?: string | null;
  onSuccess: (res: PresenceResponse) => void;
}

export const EmargementCard: React.FC<EmargementCardProps> = ({
  etudiants,
  selectedEtudiantId,
  onSelectEtudiant,
  activeSessionCode,
  onSuccess,
}) => {
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    status?: number;
    title: string;
    message: string;
    details?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      setFeedback({
        type: 'error',
        status: 400,
        title: 'Code Manquant',
        message: 'Veuillez saisir le code de session à 6 caractères affiché par votre formateur.',
      });
      return;
    }

    if (!selectedEtudiantId) {
      setFeedback({
        type: 'error',
        status: 400,
        title: 'Étudiant non identifié',
        message: 'Veuillez sélectionner votre nom ou identifiant étudiant.',
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      // POST /api/presences
      // Payload: { code: string, etudiantId: number }
      // Réponse: { id: number, sessionId: number, etudiantId: number, source: string }
      const res = await validerPresenceApi({
        code: cleanCode,
        etudiantId: selectedEtudiantId,
      });

      setFeedback({
        type: 'success',
        status: 200,
        title: 'Présence Validée !',
        message: `Votre présence a été enregistrée avec succès (Émargement #${res.id}).`,
        details: `Source : ${res.source || 'WEB_ETUDIANT'} · Session #${res.sessionId}`,
      });
      setCode('');
      onSuccess(res);
    } catch (err: unknown) {
      if (err instanceof ApiHttpError) {
        if (err.status === 409) {
          setFeedback({
            type: 'warning',
            status: 409,
            title: 'Présence déjà enregistrée (409 Conflict)',
            message: err.message,
            details: 'Vous avez déjà validé votre émargement pour cette séance de cours.',
          });
        } else if (err.status === 410) {
          setFeedback({
            type: 'error',
            status: 410,
            title: 'Session expirée (410 Gone)',
            message: err.message,
            details: "Le compte à rebours de 15 minutes est terminé. L'accès est clos.",
          });
        } else if (err.status === 404) {
          setFeedback({
            type: 'error',
            status: 404,
            title: 'Session introuvable (404 Not Found)',
            message: err.message,
            details: 'Vérifiez les 6 caractères du code auprès de votre formateur.',
          });
        } else {
          setFeedback({
            type: 'error',
            status: err.status || 400,
            title: `Erreur (${err.status || 400})`,
            message: err.message,
          });
        }
      } else {
        setFeedback({
          type: 'error',
          title: 'Erreur réseau',
          message: 'Impossible de joindre le service des présences.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillCode = (c: string) => {
    setCode(c);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Émargement Rapide
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Validation instantanée de présence par code unique à 6 caractères
          </p>
        </div>
        <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
          POST /api/presences
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sélecteur Étudiant */}
        <div>
          <label htmlFor="select-etudiant" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Identifiant Étudiant (etudiantId)</span>
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              Requis pour le payload
            </span>
          </label>
          <select
            id="select-etudiant"
            value={selectedEtudiantId}
            onChange={(e) => onSelectEtudiant(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
          >
            {etudiants.map((etudiant) => (
              <option key={etudiant.id} value={etudiant.id}>
                {etudiant.prenom} {etudiant.nom} — {etudiant.matricule} (ID: {etudiant.id})
              </option>
            ))}
          </select>
        </div>

        {/* Saisie du Code à 6 caractères */}
        <div>
          <label htmlFor="code-input" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-500" />
              <span>Code de session (6 caractères)</span>
            </span>
            {activeSessionCode && (
              <button
                type="button"
                onClick={() => handleFillCode(activeSessionCode)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Coller le code actif ({activeSessionCode})</span>
              </button>
            )}
          </label>
          <div className="relative">
            <input
              id="code-input"
              type="text"
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ex: KF8942"
              className="w-full px-4 py-3 text-lg font-mono tracking-widest uppercase font-bold text-center border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Le code expire automatiquement 15 minutes après son ouverture par le formateur.
          </p>
        </div>

        {/* Bouton de validation */}
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm rounded-lg transition-all shadow-xs flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Valider mon émargement</span>
            </>
          )}
        </button>
      </form>

      {/* Raccourcis de simulation de cas limites pour les tests */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
        <span>Tests rapides :</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleFillCode('EXPIRE')}
            className="hover:text-slate-900 underline text-slate-600"
            title="Tester code expiré ou 404"
          >
            Tester code inconnu
          </button>
          <span>·</span>
          {activeSessionCode && (
            <button
              type="button"
              onClick={() => handleFillCode(activeSessionCode)}
              className="text-indigo-600 hover:underline font-medium"
            >
              Session active ({activeSessionCode})
            </button>
          )}
        </div>
      </div>

      {/* Feedback Dynamique */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-4 p-4 rounded-xl border transition-all text-xs leading-relaxed ${
            feedback.type === 'success'
              ? 'bg-emerald-50/90 text-emerald-900 border-emerald-200'
              : feedback.type === 'warning'
              ? 'bg-amber-50/90 text-amber-900 border-amber-200'
              : 'bg-rose-50/90 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {feedback.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            {feedback.type === 'warning' && (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            {feedback.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <div className="font-bold text-sm mb-0.5">{feedback.title}</div>
              <p className="text-xs opacity-90">{feedback.message}</p>
              {feedback.details && (
                <p className="text-[11px] mt-1 font-mono opacity-75">{feedback.details}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
