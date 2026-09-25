import React, { useState } from 'react';
import {
  UploadCloud,
  Link2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Github,
} from 'lucide-react';
import { deposerExerciceApi, ApiHttpError } from '../../lib/api';
import { SessionResponse, ExerciceResponse, EtudiantInfo } from '../../types';

interface DepotExerciceCardProps {
  sessions: SessionResponse[];
  selectedEtudiantId: number;
  etudiants: EtudiantInfo[];
  onSuccess: (res: ExerciceResponse) => void;
}

export const DepotExerciceCard: React.FC<DepotExerciceCardProps> = ({
  sessions,
  selectedEtudiantId,
  etudiants,
  onSuccess,
}) => {
  const [sessionId, setSessionId] = useState<number>(sessions[0]?.id || 11);
  const [lien, setLien] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    details?: string;
    data?: ExerciceResponse;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionId) {
      setFeedback({
        type: 'error',
        message: 'Veuillez sélectionner une session académique pour rattacher ce travail.',
      });
      return;
    }

    if (!lien.trim()) {
      setFeedback({
        type: 'error',
        message: 'Veuillez coller le lien de votre livrable (dépôt GitHub, GitLab, Google Drive...).',
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      // POST /api/exercices
      // Payload: { sessionId: number, etudiantId: number, lien: string }
      // Réponse: { id: number, statut: string }
      const res = await deposerExerciceApi({
        sessionId: Number(sessionId),
        etudiantId: Number(selectedEtudiantId),
        lien: lien.trim(),
      });

      setFeedback({
        type: 'success',
        message: `Exercice déposé avec succès ! Numéro de dépôt : #${res.id}`,
        details: `Statut actuel : "${res.statut || 'DEPOSE'}" · Prêt pour la relecture croisée par les pairs.`,
        data: res,
      });

      setLien('');
      onSuccess(res);
    } catch (err: unknown) {
      if (err instanceof ApiHttpError) {
        setFeedback({
          type: 'error',
          message: err.message,
          details: `Code HTTP ${err.status}`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: "Une erreur est survenue lors de l'enregistrement de l'exercice.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const currentStudent = etudiants.find((e) => e.id === selectedEtudiantId);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Dépôt d'Exercice & Livrables
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Soumission de travail pratique pour évaluation et relecture croisée
          </p>
        </div>
        <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
          POST /api/exercices
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sélection de la Session */}
        <div>
          <label htmlFor="select-session" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Sélectionner la Session (sessionId)</span>
          </label>
          <select
            id="select-session"
            value={sessionId}
            onChange={(e) => setSessionId(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titre || `Session #${s.id}`} (Code: {s.code})
              </option>
            ))}
          </select>
        </div>

        {/* Étudiant connecté */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/70 text-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block">Étudiant soumetteur (etudiantId) :</span>
            <span className="font-semibold text-slate-900">
              {currentStudent ? `${currentStudent.prenom} ${currentStudent.nom}` : `Étudiant #${selectedEtudiantId}`}
            </span>
          </div>
          <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            ID: {selectedEtudiantId}
          </span>
        </div>

        {/* Lien de l'exercice */}
        <div>
          <label htmlFor="lien-input" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Lien du livrable (GitHub, GitLab, Google Drive...)</span>
          </label>
          <input
            id="lien-input"
            type="url"
            value={lien}
            onChange={(e) => setLien(e.target.value)}
            placeholder="https://github.com/votre-nom/tp-springboot-microservices"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800"
          />
          <div className="flex gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => setLien('https://github.com/etudiant-demo/kfokam48-microservices')}
              className="text-[11px] text-slate-500 hover:text-slate-800 hover:underline flex items-center gap-1"
            >
              <Github className="w-3 h-3" />
              <span>Exemple GitHub</span>
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => setLien('https://drive.google.com/file/d/tp-kfokam48-architecture/view')}
              className="text-[11px] text-slate-500 hover:text-slate-800 hover:underline"
            >
              Exemple Drive
            </button>
          </div>
        </div>

        {/* Bouton de dépôt */}
        <button
          type="submit"
          disabled={loading || !lien.trim()}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm rounded-lg transition-all shadow-xs flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>Déposer le travail pour évaluation</span>
            </>
          )}
        </button>
      </form>

      {/* Feedback Dépôt */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`mt-4 p-4 rounded-xl border text-xs leading-relaxed ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-bold text-sm mb-0.5">{feedback.message}</div>
              {feedback.details && <p className="opacity-90">{feedback.details}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
