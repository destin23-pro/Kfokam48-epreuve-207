import React, { useState } from 'react';
import {
  X,
  Play,
  Clock,
  Sparkles,
  AlertCircle,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { createSessionApi, ApiHttpError } from '../../lib/api';
import { SessionResponse, Promotion } from '../../types';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotions: Promotion[];
  onSessionCreated: (session: SessionResponse) => void;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  promotions,
  onSessionCreated,
}) => {
  const [titre, setTitre] = useState('');
  const [promotionId, setPromotionId] = useState<number>(promotions[0]?.id || 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) {
      setError('Veuillez spécifier le titre du cours, TD ou TP.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // POST /api/sessions
      // Payload: { titre: string, promotionId: number }
      // Réponse: { id: number, code: string, ouvertureAt: string, expirationAt: string }
      const newSession = await createSessionApi({
        titre: titre.trim(),
        promotionId: Number(promotionId),
      });

      onSessionCreated(newSession);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiHttpError) {
        setError(err.message);
      } else {
        setError("Erreur inattendue lors de l'ouverture de la session.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (presetTitle: string) => {
    setTitre(presetTitle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Play className="w-4 h-4 fill-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Ouvrir une Session d'Émargement</h3>
              <p className="text-xs text-slate-500">Génération du code 6 caractères avec timer de 15 minutes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Sélection de la Promotion */}
          <div>
            <label htmlFor="modal-select-promo" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Promotion académique (promotionId)</span>
            </label>
            <select
              id="modal-select-promo"
              value={promotionId}
              onChange={(e) => setPromotionId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            >
              {promotions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Titre de la session */}
          <div>
            <label htmlFor="modal-session-title" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              <span>Titre de la séance (titre)</span>
            </label>
            <input
              id="modal-session-title"
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="ex: Séance 06 - Architecture Événementielle & Kafka"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />

            {/* Presets rapides pour gain de temps formateur */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('TP 05 : Microservices & Circuit Breaker')}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                TP Microservices
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('Cours Magistral : Clean Architecture')}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                Cours Clean Arch
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('Atelier Pratique : Docker & CI/CD')}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                Atelier Docker
              </button>
            </div>
          </div>

          {/* Rappel du Timer 15 minutes */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 text-xs text-slate-600 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Un code aléatoire à 6 caractères sera généré avec une durée de validité stricte de <strong>15 minutes</strong>.
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !titre.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              {loading ? (
                <span>Création...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Générer et Ouvrir la Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
