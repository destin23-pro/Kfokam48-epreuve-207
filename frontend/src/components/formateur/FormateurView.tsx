import React, { useState } from 'react';
import {
  Plus,
  Play,
  Layers,
  Clock,
  History,
} from 'lucide-react';
import { Promotion, SessionResponse, TableauLigne } from '../../types';
import { SessionActiveBanner } from './SessionActiveBanner';
import { CreateSessionModal } from './CreateSessionModal';
import { TableauSuivi } from './TableauSuivi';
import { ProjectorViewModal } from '../common/ProjectorViewModal';

interface FormateurViewProps {
  promotions: Promotion[];
  selectedPromotionId: number;
  onSelectPromotion: (promoId: number) => void;
  activeSession: SessionResponse | null;
  sessionsHistory: SessionResponse[];
  tableauLignes: TableauLigne[];
  loadingTableau: boolean;
  onRefreshTableau: () => void;
  onSessionCreated: (session: SessionResponse) => void;
  onSessionUpdated: () => void;
}

export const FormateurView: React.FC<FormateurViewProps> = ({
  promotions,
  selectedPromotionId,
  onSelectPromotion,
  activeSession,
  sessionsHistory,
  tableauLignes,
  loadingTableau,
  onRefreshTableau,
  onSessionCreated,
  onSessionUpdated,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProjectorOpen, setIsProjectorOpen] = useState(false);

  const currentPromo =
    promotions.find((p) => p.id === selectedPromotionId) || promotions[0];

  return (
    <div className="space-y-6">
      {/* Barre d'Actions Supérieure & Sélecteur de Promotion */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Promotion active :
            </span>
          </div>
          <select
            value={selectedPromotionId}
            onChange={(e) => onSelectPromotion(Number(e.target.value))}
            className="text-xs sm:text-sm font-bold px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          >
            {promotions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton d'action rapide : Ouvrir une session */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-lg transition-all shadow-xs flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Ouvrir une session d'émargement</span>
          </button>
        </div>
      </div>

      {/* Bannière de Session Active (si existante) */}
      {activeSession ? (
        <SessionActiveBanner
          session={activeSession}
          promotionName={currentPromo?.nom}
          onOpenProjector={() => setIsProjectorOpen(true)}
          onSessionUpdated={onSessionUpdated}
        />
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">Aucune session en direct ouverte</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Pour lancer l'émargement de vos étudiants, cliquez sur le bouton ci-dessous. Un code unique à 6 caractères sera généré pour 15 minutes.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Démarrer une séance maintenant</span>
          </button>
        </div>
      )}

      {/* Tableau de Bord de Suivi Global (/api/tableau?promotionId=X) */}
      <TableauSuivi
        lignes={tableauLignes}
        loading={loadingTableau}
        promotion={currentPromo}
        onRefresh={onRefreshTableau}
      />

      {/* Historique Récent des Sessions Ouvertes */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-bold text-slate-900">Historique des sessions de cours</h4>
          </div>
          <span className="text-xs text-slate-500">
            {sessionsHistory.length} sessions enregistrées
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sessionsHistory.map((s) => {
            const isCurrentlyActive = new Date(s.expirationAt).getTime() > Date.now();
            return (
              <div
                key={s.id}
                className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {s.code}
                  </span>
                  {isCurrentlyActive ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      En cours
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Clôturée
                    </span>
                  )}
                </div>
                <div className="font-semibold text-slate-800 line-clamp-1 mb-1">
                  {s.titre || `Session #${s.id}`}
                </div>
                <div className="text-[11px] text-slate-500">
                  Ouverture : {new Date(s.ouvertureAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de création de session (POST /api/sessions) */}
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        promotions={promotions}
        onSessionCreated={onSessionCreated}
      />

      {/* Modal Plein Écran Vidéoprojecteur */}
      {activeSession && (
        <ProjectorViewModal
          session={activeSession}
          promotionName={currentPromo?.nom}
          isOpen={isProjectorOpen}
          onClose={() => setIsProjectorOpen(false)}
        />
      )}
    </div>
  );
};
