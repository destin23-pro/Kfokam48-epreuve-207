import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  GraduationCap,
} from 'lucide-react';
import { SessionResponse } from '../../types';
import { CountdownTimer } from './CountdownTimer';

interface ProjectorViewModalProps {
  session: SessionResponse;
  promotionName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectorViewModal: React.FC<ProjectorViewModalProps> = ({
  session,
  promotionName,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(session.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl flex flex-col items-center">
        {/* Actions Supérieures */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Plein écran"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Fermer la vue amphithéâtre"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Marque Académique */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-6">
          <GraduationCap className="w-4 h-4" />
          <span>KFOKAM48 · Émargement en amphithéâtre</span>
        </div>

        {/* Titre & Promo */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2 max-w-2xl text-balance">
          {session.titre || 'Session de Cours & TD'}
        </h2>
        {promotionName && (
          <p className="text-sm sm:text-base text-slate-400 mb-8">{promotionName}</p>
        )}

        {/* Zone Centrale : Code Géant & Timer */}
        <div className="w-full max-w-2xl bg-slate-950/70 border border-slate-800/80 rounded-2xl p-8 sm:p-10 mb-8">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-3">
            Code d'émargement unique
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="font-mono tabular-nums font-black text-6xl sm:text-8xl tracking-widest text-emerald-400 drop-shadow-sm select-all">
              {session.code}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Copier le code"
            >
              {copied ? <Check className="w-6 h-6 text-emerald-400" /> : <Copy className="w-6 h-6" />}
            </button>
          </div>

          <div className="pt-6 border-t border-slate-800/60 flex flex-col items-center">
            <CountdownTimer expirationAt={session.expirationAt} size="giant" />
          </div>
        </div>

        {/* Instructions pour les étudiants */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              1
            </span>
            <span>Rendez-vous sur l'Espace Étudiant</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              2
            </span>
            <span>Entrez le code à 6 caractères</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs">
              3
            </span>
            <span>Validation immédiate de la présence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
