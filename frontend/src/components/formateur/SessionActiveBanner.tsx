import React, { useState } from 'react';
import {
  Copy,
  Check,
  Maximize2,
  StopCircle,
} from 'lucide-react';
import { SessionResponse } from '../../types';
import { CountdownTimer } from '../common/CountdownTimer';
import { expireSessionNow } from '../../lib/api';

interface SessionActiveBannerProps {
  session: SessionResponse;
  promotionName?: string;
  onOpenProjector: () => void;
  onSessionUpdated: () => void;
}

export const SessionActiveBanner: React.FC<SessionActiveBannerProps> = ({
  session,
  promotionName,
  onOpenProjector,
  onSessionUpdated,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(session.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloturerSession = () => {
    if (confirm('Voulez-vous clôturer immédiatement cette session ? Le code expirera pour tous les étudiants (code HTTP 410).')) {
      expireSessionNow(session.id);
      onSessionUpdated();
    }
  };

  const isExpired = new Date(session.expirationAt).getTime() <= Date.now();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-7 shadow-lg border border-slate-700/60 relative overflow-hidden">
      {/* Halo lumineux décoratif en arrière-plan */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Colonne Gauche : Infos Séance */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Session d'émargement active</span>
            </span>
            {promotionName && (
              <span className="text-xs text-slate-300">· {promotionName}</span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white text-balance">
            {session.titre || 'Séance en cours'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300">
            Communiquez ce code aux étudiants présents dans la salle pour valider leur émargement.
          </p>
        </div>

        {/* Colonne Droite : Code Géant & Timer */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/60 border border-slate-700/80 rounded-xl p-4 sm:p-5">
          {/* Code */}
          <div className="text-center sm:text-left">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 block font-semibold">
              Code de session (6 carac.)
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono tabular-nums font-black text-3xl sm:text-4xl tracking-widest text-emerald-400 select-all">
                {session.code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Copier le code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700 hidden sm:block" />

          {/* Compte à rebours */}
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 block font-semibold mb-1">
              Temps restant
            </span>
            <CountdownTimer
              expirationAt={session.expirationAt}
              onExpire={onSessionUpdated}
              size="md"
            />
          </div>

          {/* Actions : Vidéoprojecteur & Clôture */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={onOpenProjector}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Afficher en grand sur le vidéoprojecteur de la salle"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Vidéoprojecteur</span>
            </button>

            {!isExpired && (
              <button
                type="button"
                onClick={handleCloturerSession}
                className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                title="Clôturer immédiatement la session"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Clôturer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
