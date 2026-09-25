import React, { useState } from 'react';
import {
  ExternalLink,
  Star,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { soumettreRelectureApi, ApiHttpError } from '../../lib/api';
import { RelectureItem } from '../../types';

interface RelectureCroiseeCardProps {
  relectures: RelectureItem[];
  onRelectureDone: () => void;
}

export const RelectureCroiseeCard: React.FC<RelectureCroiseeCardProps> = ({
  relectures,
  onRelectureDone,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(
    relectures.find((r) => r.statut === 'EN_ATTENTE')?.id || relectures[0]?.id || null
  );
  const [note, setNote] = useState<number>(15);
  const [commentaire, setCommentaire] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const activeRelecture = relectures.find((r) => r.id === selectedId) || null;

  const getMention = (val: number): { label: string; color: string } => {
    if (val >= 16) return { label: 'Très Bien / Excellent', color: 'text-emerald-700 bg-emerald-50' };
    if (val >= 14) return { label: 'Bien', color: 'text-emerald-600 bg-emerald-50/50' };
    if (val >= 12) return { label: 'Assez Bien', color: 'text-blue-700 bg-blue-50' };
    if (val >= 10) return { label: 'Passable (Admis)', color: 'text-amber-700 bg-amber-50' };
    return { label: 'Insuffisant (À revoir)', color: 'text-rose-700 bg-rose-50' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    if (note < 0 || note > 20 || isNaN(note)) {
      setFeedback({
        type: 'error',
        message: 'La note doit être obligatoirement comprise entre 0 et 20.',
      });
      return;
    }

    if (!commentaire.trim() || commentaire.trim().length < 5) {
      setFeedback({
        type: 'error',
        message: "Veuillez fournir un commentaire d'évaluation d'au moins 5 caractères.",
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      // POST /api/relectures/{id}
      // Payload: { note: number (0 à 20), commentaire: string }
      // Réponse: 200 OK
      const res = await soumettreRelectureApi(selectedId, {
        note: Number(note),
        commentaire: commentaire.trim(),
      });

      setFeedback({
        type: 'success',
        message: res.message || 'Relecture croisée enregistrée avec succès (200 OK).',
      });
      setCommentaire('');
      onRelectureDone();
    } catch (err: unknown) {
      if (err instanceof ApiHttpError) {
        setFeedback({
          type: 'error',
          message: err.message,
        });
      } else {
        setFeedback({
          type: 'error',
          message: 'Erreur lors de la transmission de la relecture.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Relecture Croisée par les Pairs (Peer-Review)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Évaluez et commentez le livrable d'un camarade de promotion (Note sur 20)
          </p>
        </div>
        <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
          POST /api/relectures/&#123;id&#125;
        </span>
      </div>

      {/* Liste des devoirs attribués */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Sélectionner le devoir à évaluer :
        </label>
        <div className="space-y-2">
          {relectures.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedId(item.id);
                setFeedback(null);
                if (item.note !== undefined) setNote(item.note);
                if (item.commentaire) setCommentaire(item.commentaire);
              }}
              className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between gap-3 ${
                selectedId === item.id
                  ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-xs text-slate-900 truncate">
                    {item.exerciceTitre}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-xs text-slate-500">{item.sessionTitre}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Pair : <strong className="text-slate-700">{item.auteurNom}</strong></span>
                  <span>·</span>
                  <span>Dossier #{item.id}</span>
                </div>
              </div>

              <div>
                {item.statut === 'CORRIGE' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Noté ({item.note}/20)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Clock className="w-3 h-3" />
                    <span>En attente</span>
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire de Relecture si un devoir est sélectionné */}
      {activeRelecture && (
        <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-5 space-y-4">
          {/* Fiche du travail à examiner */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                  Livrable du pair à relire
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {activeRelecture.exerciceTitre}
                </h4>
                <p className="text-xs text-slate-500">
                  Auteur : {activeRelecture.auteurNom} (ID: {activeRelecture.auteurEtudiantId})
                </p>
              </div>

              <a
                href={activeRelecture.exerciceLien}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-indigo-700 transition-colors shrink-0"
              >
                <span>Consulter le code / livrable</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Grille de Notation (0 à 20) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="note-input" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>Note académique (/20)</span>
              </label>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${getMention(note).color}`}>
                {getMention(note).label}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <input
                id="note-slider"
                type="range"
                min="0"
                max="20"
                step="1"
                value={note}
                onChange={(e) => setNote(parseFloat(e.target.value))}
                className="flex-1 accent-indigo-600 cursor-pointer"
              />
              <div className="flex items-center gap-1">
                <input
                  id="note-input"
                  type="number"
                  min="0"
                  max="20"
                  step="1"
                  value={note}
                  onChange={(e) => setNote(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2.5 py-1.5 text-sm font-mono font-bold text-center border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
                <span className="text-sm font-bold text-slate-500">/ 20</span>
              </div>
            </div>
          </div>

          {/* Commentaire de relecture */}
          <div>
            <label htmlFor="commentaire-input" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Commentaire d'évaluation et feedback constructif</span>
            </label>
            <textarea
              id="commentaire-input"
              rows={3}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Structure du code, respect des conventions, qualité des tests unitaires, points forts et axes d'amélioration..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 resize-none"
            />
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg transition-all shadow-xs flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Soumettre la relecture (POST /api/relectures/{selectedId})</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Feedback Relecture */}
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
            <div className="font-bold text-sm">{feedback.message}</div>
          </div>
        </div>
      )}
    </div>
  );
};
