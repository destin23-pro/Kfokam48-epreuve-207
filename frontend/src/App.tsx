import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from './components/common/Header';
import { BackendSettingsModal } from './components/common/BackendSettingsModal';
import { EtudiantView } from './components/etudiant/EtudiantView';
import { FormateurView } from './components/formateur/FormateurView';
import {
  getPromotionsApi,
  getEtudiantsApi,
  getSessionsApi,
  getTableauApi,
  DEFAULT_BASE_URL,
} from './lib/api';
import { Promotion, EtudiantInfo, SessionResponse, TableauLigne } from './types';

function App() {
  const [currentRole, setCurrentRole] = useState<'etudiant' | 'formateur'>('etudiant');
  const [apiUrl] = useState<string>(DEFAULT_BASE_URL);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [etudiants, setEtudiants] = useState<EtudiantInfo[]>([]);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [tableauLignes, setTableauLignes] = useState<TableauLigne[]>([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSessions = useCallback(async () => {
    const list = await getSessionsApi();
    setSessions(list);
  }, []);

  const refreshTableau = useCallback(async (promoId: number) => {
    const lignes = await getTableauApi(promoId);
    setTableauLignes(lignes);
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshSessions();
      setSelectedPromotionId((current) => {
        void refreshTableau(current);
        return current;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de rafraîchir les données.');
    }
  }, [refreshSessions, refreshTableau]);

  // Chargement initial : les données viennent de l'API (et non de mock statiques).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [promos, etus, sess] = await Promise.all([
          getPromotionsApi(),
          getEtudiantsApi(),
          getSessionsApi(),
        ]);
        if (cancelled) return;
        setPromotions(promos);
        setEtudiants(etus);
        setSessions(sess);
        const firstPromo = promos[0]?.id || 1;
        setSelectedPromotionId(firstPromo);
        const lignes = await getTableauApi(firstPromo);
        if (!cancelled) setTableauLignes(lignes);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : `Impossible de joindre le backend à ${apiUrl}. Démarrez-le puis recharger la page.`
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  const activeSession = useMemo(() => {
    const now = Date.now();
    return sessions.find((s) => new Date(s.expirationAt).getTime() > now) || null;
  }, [sessions]);

  const handleSessionCreated = useCallback((session: SessionResponse) => {
    setSessions((prev) => [session, ...prev]);
  }, []);

  const handleSelectPromotion = useCallback(
    (promoId: number) => {
      setSelectedPromotionId(promoId);
      void refreshTableau(promoId).catch(() => {});
    },
    [refreshTableau]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isLiveApi
        apiUrl={apiUrl}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeSessionCode={activeSession?.code || null}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-sm text-slate-500">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin mr-3" />
            Chargement des données depuis {apiUrl}...
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-6 text-sm">
            <p className="font-bold mb-1">Backend injoignable</p>
            <p>{error}</p>
            <p className="mt-2 text-xs">
              Lancez PostgreSQL puis le backend Spring Boot (voir README) et rechargez la page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
            >
              Recharger
            </button>
          </div>
        ) : currentRole === 'etudiant' ? (
          <EtudiantView
            etudiants={etudiants}
            sessions={sessions}
            onRefreshData={handleRefresh}
          />
        ) : (
          <FormateurView
            promotions={promotions}
            selectedPromotionId={selectedPromotionId}
            onSelectPromotion={handleSelectPromotion}
            activeSession={activeSession}
            sessionsHistory={sessions}
            tableauLignes={tableauLignes}
            loadingTableau={loading}
            onRefreshTableau={() => refreshTableau(selectedPromotionId)}
            onSessionCreated={handleSessionCreated}
            onSessionUpdated={handleRefresh}
          />
        )}
      </main>

      <BackendSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigChanged={() => window.location.reload()}
      />
    </div>
  );
}

export default App;
