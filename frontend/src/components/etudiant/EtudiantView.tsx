import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  FileCheck2,
  Users,
  Clock,
} from 'lucide-react';
import {
  EtudiantInfo,
  SessionResponse,
  PresenceResponse,
  ExerciceResponse,
  RelectureItem,
} from '../../types';
import { getRelecturesApi } from '../../lib/api';
import { EmargementCard } from './EmargementCard';
import { DepotExerciceCard } from './DepotExerciceCard';
import { RelectureCroiseeCard } from './RelectureCroiseeCard';

interface EtudiantViewProps {
  etudiants: EtudiantInfo[];
  sessions: SessionResponse[];
  onRefreshData: () => void;
}

export const EtudiantView: React.FC<EtudiantViewProps> = ({
  etudiants,
  sessions,
  onRefreshData,
}) => {
  const [selectedEtudiantId, setSelectedEtudiantId] = useState<number>(etudiants[0]?.id || 101);
  const [activeTab, setActiveTab] = useState<'emargement' | 'depot' | 'relecture'>('emargement');
  const [recentPresences, setRecentPresences] = useState<PresenceResponse[]>([]);
  const [relectures, setRelectures] = useState<RelectureItem[]>([]);
  const [loadingRelectures, setLoadingRelectures] = useState(false);
  const [relectureError, setRelectureError] = useState<string | null>(null);

  const currentStudent = etudiants.find((e) => e.id === selectedEtudiantId) || etudiants[0];

  // Session encore émargable (non expirée).
  const activeSession = useMemo(() => {
    const now = Date.now();
    return sessions.find((s) => new Date(s.expirationAt).getTime() > now) || null;
  }, [sessions]);

  // Relectures assignées à l'étudiant sélectionné (GET /api/relectures?relecteurId=X).
  const loadRelectures = useCallback(async (etudiantId: number) => {
    setLoadingRelectures(true);
    setRelectureError(null);
    try {
      const list = await getRelecturesApi(etudiantId);
      setRelectures(list);
    } catch (err) {
      setRelectureError(err instanceof Error ? err.message : 'Impossible de charger les relectures.');
    } finally {
      setLoadingRelectures(false);
    }
  }, []);

  useEffect(() => {
    void loadRelectures(selectedEtudiantId);
  }, [selectedEtudiantId, loadRelectures]);

  const handlePresenceSuccess = (res: PresenceResponse) => {
    setRecentPresences((prev) => [res, ...prev.slice(0, 4)]);
    onRefreshData();
  };

  const handleExerciceSuccess = (_res: ExerciceResponse) => {
    onRefreshData();
  };

  const handleRelectureDone = () => {
    void loadRelectures(selectedEtudiantId);
    onRefreshData();
  };

  const nbRelecturesEnAttente = relectures.filter((r) => r.statut === 'EN_ATTENTE').length;

  return (
    <div className="space-y-6">
      {/* Profil de l'étudiant & sélecteur rapide */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
            {currentStudent ? `${currentStudent.prenom[0]}${currentStudent.nom[0]}` : 'ET'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {currentStudent ? `${currentStudent.prenom} ${currentStudent.nom}` : 'Étudiant Connecté'}
              </h2>
              <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {currentStudent?.matricule || 'KF-2026'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentStudent?.email || 'etudiant@univ-kfokam.ac'} · Promotion #{currentStudent?.promotionId || 1}
            </p>
          </div>
        </div>

        {/* Changer d'étudiant pour tester les interactions */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="text-xs text-slate-500 font-medium">Changer d'étudiant :</span>
          <select
            value={selectedEtudiantId}
            onChange={(e) => setSelectedEtudiantId(Number(e.target.value))}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {etudiants.map((et) => (
              <option key={et.id} value={et.id}>
                {et.prenom} {et.nom} ({et.matricule})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Onglets Étudiant */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-1.5 flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('emargement')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'emargement' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Émargement</span>
          {activeSession && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('depot')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'depot' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Déposer mon exercice</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('relecture')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'relecture' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Relecture croisée</span>
          {nbRelecturesEnAttente > 0 && (
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold">
              {nbRelecturesEnAttente}
            </span>
          )}
        </button>
      </div>

      {/* Contenu de l'onglet actif */}
      <div>
        {activeTab === 'emargement' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <EmargementCard
                etudiants={etudiants}
                selectedEtudiantId={selectedEtudiantId}
                onSelectEtudiant={setSelectedEtudiantId}
                activeSessionCode={activeSession?.code || null}
                onSuccess={handlePresenceSuccess}
              />
            </div>

            {/* Historique récent / Conseils */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Derniers émargements validés</span>
                </h4>
                {recentPresences.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Aucun émargement enregistré lors de cette session de navigation.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {recentPresences.map((p) => (
                      <li
                        key={p.id}
                        className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 block">Session #{p.sessionId}</span>
                          <span className="text-[11px] text-slate-400">{p.source}</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-emerald-600">Présent ✓</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs text-slate-600 space-y-2">
                <span className="font-bold text-slate-800 block">Règles académiques d'émargement :</span>
                <p>• Le code à 6 caractères est généré par le formateur en début de séance.</p>
                <p>• La session expire strictement au bout de 15 minutes (code HTTP 410).</p>
                <p>• L'émargement est unique par séance : un second essai renvoie une erreur 409.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'depot' && (
          <div className="max-w-2xl">
            <DepotExerciceCard
              sessions={sessions}
              selectedEtudiantId={selectedEtudiantId}
              etudiants={etudiants}
              onSuccess={handleExerciceSuccess}
            />
          </div>
        )}

        {activeTab === 'relecture' && (
          <div className="max-w-3xl">
            {loadingRelectures ? (
              <div className="text-sm text-slate-500 py-8 text-center">Chargement des relectures...</div>
            ) : relectureError ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs">
                {relectureError}
              </div>
            ) : (
              <RelectureCroiseeCard
                relectures={relectures}
                onRelectureDone={handleRelectureDone}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
