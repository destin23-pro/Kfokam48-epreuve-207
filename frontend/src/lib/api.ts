import {
  CreateSessionDTO,
  SessionResponse,
  CreatePresenceDTO,
  PresenceResponse,
  CreateExerciceDTO,
  ExerciceResponse,
  CreateRelectureDTO,
  TableauLigne,
  RelectureItem,
  Promotion,
  EtudiantInfo,
} from '../types';
import {
  TABLEAU_INITIAL,
  RELECTURES_INITIALES,
  SESSIONS_HISTORIQUE_INITIALES,
  PROMOTIONS_INITIALES,
  ETUDIANTS_INITIALS,
} from './mockData';

// Configuration de l'URL du Backend Spring Boot
const STORAGE_KEY_BASE_URL = 'kfokam48_api_base_url';
const STORAGE_KEY_USE_LIVE = 'kfokam48_use_live_api';
const STORAGE_KEY_SESSIONS = 'kfokam48_sessions_store';
const STORAGE_KEY_TABLEAU = 'kfokam48_tableau_store';
const STORAGE_KEY_PRESENCES = 'kfokam48_presences_store';
const STORAGE_KEY_RELECTURES = 'kfokam48_relectures_store';

export const DEFAULT_BASE_URL = 'http://localhost:8080/api';

export function getStoredBaseUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_BASE_URL;
  return localStorage.getItem(STORAGE_KEY_BASE_URL) || DEFAULT_BASE_URL;
}

export function setStoredBaseUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_BASE_URL, url.trim().replace(/\/+$/, ''));
}

export function isLiveApiEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const val = localStorage.getItem(STORAGE_KEY_USE_LIVE);
  return val === 'true';
}

export function setLiveApiEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_USE_LIVE, String(enabled));
}

// ----------------------------------------------------
// Classe d'Erreur Personnalisée pour HTTP 400, 404, 409, 410, etc.
// ----------------------------------------------------
export class ApiHttpError extends Error {
  status: number;
  code?: string;
  detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = 'ApiHttpError';
    this.status = status;
    this.detail = detail;
  }
}

// Helper pour formater les messages d'erreurs académiques selon le code HTTP
export function translateHttpError(status: number, serverMsg?: string): string {
  if (serverMsg && serverMsg.trim().length > 0 && !serverMsg.startsWith('{')) {
    return serverMsg;
  }

  switch (status) {
    case 400:
      return 'Données de requête invalides ou incomplètes. Vérifiez vos saisies.';
    case 404:
      return 'Session introuvable. Veuillez vérifier le code saisi (6 caractères).';
    case 409:
      return 'Émargement déjà effectué : votre présence est déjà validée pour cette session.';
    case 410:
      return "Session expirée ! Le délai d'émargement de 15 minutes est écoulé.";
    case 500:
      return 'Erreur interne du serveur Spring Boot. Contactez le support technique.';
    default:
      return `Erreur réseau ou HTTP (${status}). Vérifiez la disponibilité du serveur.`;
  }
}

// ----------------------------------------------------
// Stockage Local pour la simulation académique
// ----------------------------------------------------
function getLocalSessions(): SessionResponse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(SESSIONS_HISTORIQUE_INITIALES));
      return SESSIONS_HISTORIQUE_INITIALES;
    }
    return JSON.parse(raw);
  } catch {
    return SESSIONS_HISTORIQUE_INITIALES;
  }
}

function saveLocalSessions(sessions: SessionResponse[]): void {
  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
}

function getLocalTableau(promotionId: number): TableauLigne[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_TABLEAU}_${promotionId}`);
    if (!raw) {
      const init = TABLEAU_INITIAL[promotionId] || TABLEAU_INITIAL[1];
      localStorage.setItem(`${STORAGE_KEY_TABLEAU}_${promotionId}`, JSON.stringify(init));
      return init;
    }
    return JSON.parse(raw);
  } catch {
    return TABLEAU_INITIAL[promotionId] || TABLEAU_INITIAL[1];
  }
}

function saveLocalTableau(promotionId: number, rows: TableauLigne[]): void {
  localStorage.setItem(`${STORAGE_KEY_TABLEAU}_${promotionId}`, JSON.stringify(rows));
}

function getLocalPresences(): Record<string, number[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRESENCES);
    return raw ? JSON.parse(raw) : { KF8942: [101] };
  } catch {
    return { KF8942: [101] };
  }
}

function saveLocalPresences(map: Record<string, number[]>): void {
  localStorage.setItem(STORAGE_KEY_PRESENCES, JSON.stringify(map));
}

function getLocalRelectures(): RelectureItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RELECTURES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RELECTURES, JSON.stringify(RELECTURES_INITIALES));
      return RELECTURES_INITIALES;
    }
    return JSON.parse(raw);
  } catch {
    return RELECTURES_INITIALES;
  }
}

function saveLocalRelectures(list: RelectureItem[]): void {
  localStorage.setItem(STORAGE_KEY_RELECTURES, JSON.stringify(list));
}

// ----------------------------------------------------
// CLIENT API PRINCIPAL (Spring Boot REST)
// ----------------------------------------------------

/**
 * 1. POST /api/sessions : Création d'une session par le formateur
 * Payload : { titre: string, promotionId: number }
 * Réponse : { id: number, code: string, ouvertureAt: string, expirationAt: string }
 */
export async function createSessionApi(payload: CreateSessionDTO): Promise<SessionResponse> {
  if (isLiveApiEnabled()) {
    try {
      const res = await fetch(`${getStoredBaseUrl()}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = '';
        try {
          const errBody = await res.json();
          msg = errBody.message || errBody.error || '';
        } catch {
          msg = await res.text();
        }
        throw new ApiHttpError(res.status, translateHttpError(res.status, msg), msg);
      }

      return await res.json();
    } catch (err: unknown) {
      if (err instanceof ApiHttpError) throw err;
      throw new ApiHttpError(
        0,
        `Impossible de contacter le serveur Spring Boot à ${getStoredBaseUrl()}. Vérifiez qu'il est bien démarré sur le port 8080.`
      );
    }
  }

  // Simulation locale : délai réseau réaliste
  await new Promise((r) => setTimeout(r, 450));

  if (!payload.titre?.trim() || !payload.promotionId) {
    throw new ApiHttpError(400, 'Titre de la session et Promotion requis.');
  }

  // Génération d'un code unique à 6 caractères alphanumériques (style KF48-XXXX)
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  let randCode = 'KF';
  for (let i = 0; i < 4; i++) {
    const pool = i % 2 === 0 ? letters : numbers;
    randCode += pool[Math.floor(Math.random() * pool.length)];
  }

  const now = new Date();
  const expires = new Date(now.getTime() + 15 * 60 * 1000); // Expiration stricte dans 15 minutes

  const newSession: SessionResponse = {
    id: Date.now(),
    code: randCode,
    titre: payload.titre.trim(),
    promotionId: payload.promotionId,
    ouvertureAt: now.toISOString(),
    expirationAt: expires.toISOString(),
  };

  const sessions = getLocalSessions();
  sessions.unshift(newSession);
  saveLocalSessions(sessions);

  return newSession;
}

/**
 * 2. POST /api/presences : Émargement de l'étudiant via un code unique
 * Payload : { code: string, etudiantId: number }
 * Réponse : { id: number, sessionId: number, etudiantId: number, source: string }
 */
export async function validerPresenceApi(payload: CreatePresenceDTO): Promise<PresenceResponse> {
  const cleanCode = (payload.code || '').trim().toUpperCase();

  if (isLiveApiEnabled()) {
    try {
      const res = await fetch(`${getStoredBaseUrl()}/presences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cleanCode,
          etudiantId: Number(payload.etudiantId),
        }),
      });

      if (!res.ok) {
        let msg = '';
        try {
          const errBody = await res.json();
          msg = errBody.message || errBody.error || '';
        } catch {
          msg = await res.text();
        }
        throw new ApiHttpError(res.status, translateHttpError(res.status, msg), msg);
      }

      return await res.json();
    } catch (err: unknown) {
      if (err instanceof ApiHttpError) throw err;
      throw new ApiHttpError(
        0,
        `Connexion échouée à ${getStoredBaseUrl()}. Le backend Spring Boot est-il démarré ?`
      );
    }
  }

  // Simulation locale : validation des règles métier strictes
  await new Promise((r) => setTimeout(r, 400));

  if (!cleanCode || cleanCode.length < 4 || !payload.etudiantId) {
    throw new ApiHttpError(400, 'Format de code ou identifiant étudiant invalide.');
  }

  const sessions = getLocalSessions();
  const session = sessions.find((s) => s.code.toUpperCase() === cleanCode);

  if (!session) {
    throw new ApiHttpError(404, `Session inexistante. Le code "${cleanCode}" est introuvable.`);
  }

  // Vérification de l'expiration (15 minutes)
  const expireDate = new Date(session.expirationAt).getTime();
  const now = Date.now();
  if (now > expireDate) {
    throw new ApiHttpError(
      410,
      `Session expirée ! Le code "${cleanCode}" n'est plus valable (délai de 15 minutes dépassé).`
    );
  }

  // Vérification des doublons (409 Conflict)
  const presencesMap = getLocalPresences();
  const dejaEmarge = presencesMap[cleanCode] || [];
  if (dejaEmarge.includes(Number(payload.etudiantId))) {
    throw new ApiHttpError(
      409,
      `Vous avez déjà validé votre présence pour cette session (code ${cleanCode}).`
    );
  }

  // Enregistrement
  presencesMap[cleanCode] = [...dejaEmarge, Number(payload.etudiantId)];
  saveLocalPresences(presencesMap);

  // Mise à jour du tableau de suivi (incrémenter présences)
  if (session.promotionId) {
    const tableau = getLocalTableau(session.promotionId);
    const updated = tableau.map((row) => {
      if (row.etudiantId === Number(payload.etudiantId)) {
        return { ...row, presences: row.presences + 1 };
      }
      return row;
    });
    saveLocalTableau(session.promotionId, updated);
  }

  return {
    id: Date.now(),
    sessionId: session.id,
    etudiantId: Number(payload.etudiantId),
    source: 'WEB_ETUDIANT',
    createdAt: new Date().toISOString(),
  };
}

/**
 * 3. POST /api/exercices : Dépôt d'un exercice par l'étudiant
 * Payload : { sessionId: number, etudiantId: number, lien: string }
 * Réponse : { id: number, statut: string }
 */
export async function deposerExerciceApi(payload: CreateExerciceDTO): Promise<ExerciceResponse> {
  if (isLiveApiEnabled()) {
    try {
      const res = await fetch(`${getStoredBaseUrl()}/exercices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = '';
        try {
          const errBody = await res.json();
          msg = errBody.message || errBody.error || '';
        } catch {
          msg = await res.text();
        }
        throw new ApiHttpError(res.status, translateHttpError(res.status, msg), msg);
      }

      return await res.json();
    } catch (err: unknown) {
      if (err instanceof ApiHttpError) throw err;
      throw new ApiHttpError(0, `Impossible de déposer l'exercice : serveur injoignable.`);
    }
  }

  // Simulation locale
  await new Promise((r) => setTimeout(r, 500));

  if (!payload.sessionId || !payload.etudiantId || !payload.lien?.trim()) {
    throw new ApiHttpError(400, 'Tous les champs (session, étudiant, lien) sont obligatoires.');
  }

  // Validation d'URL basique
  const urlRegex = /^(https?:\/\/)/i;
  if (!urlRegex.test(payload.lien.trim())) {
    throw new ApiHttpError(
      400,
      'Le lien doit être une URL valide commençant par http:// ou https:// (GitHub, Drive, etc.).'
    );
  }

  // Mise à jour du tableau
  const sessions = getLocalSessions();
  const session = sessions.find((s) => s.id === payload.sessionId);
  if (session && session.promotionId) {
    const tableau = getLocalTableau(session.promotionId);
    const updated = tableau.map((row) => {
      if (row.etudiantId === Number(payload.etudiantId)) {
        return {
          ...row,
          exercicesDeposes: row.exercicesDeposes + 1,
          relecturesEnAttente: row.relecturesEnAttente + 1,
        };
      }
      return row;
    });
    saveLocalTableau(session.promotionId, updated);
  }

  return {
    id: Date.now(),
    sessionId: payload.sessionId,
    etudiantId: payload.etudiantId,
    lien: payload.lien.trim(),
    statut: 'DEPOSE',
    createdAt: new Date().toISOString(),
  };
}

/**
 * 4. POST /api/relectures/{id} : Soumission d'une relecture croisée par un pair
 * Payload : { note: number (0 à 20), commentaire: string }
 * Réponse : 200 OK
 */
export async function soumettreRelectureApi(
  relectureId: number,
  payload: CreateRelectureDTO
): Promise<{ success: boolean; message: string }> {
  if (isLiveApiEnabled()) {
    try {
      const res = await fetch(`${getStoredBaseUrl()}/relectures/${relectureId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = '';
        try {
          const errBody = await res.json();
          msg = errBody.message || errBody.error || '';
        } catch {
          msg = await res.text();
        }
        throw new ApiHttpError(res.status, translateHttpError(res.status, msg), msg);
      }

      return { success: true, message: 'Relecture enregistrée avec succès.' };
    } catch (err: unknown) {
      if (err instanceof ApiHttpError) throw err;
      throw new ApiHttpError(0, `Échec de l'envoi de la relecture au backend.`);
    }
  }

  // Simulation locale
  await new Promise((r) => setTimeout(r, 450));

  if (payload.note < 0 || payload.note > 20 || isNaN(payload.note)) {
    throw new ApiHttpError(400, 'La note doit être comprise strictement entre 0 et 20.');
  }

  if (!payload.commentaire || payload.commentaire.trim().length < 5) {
    throw new ApiHttpError(400, 'Le commentaire de relecture doit faire au moins 5 caractères.');
  }

  const relectures = getLocalRelectures();
  const index = relectures.findIndex((r) => r.id === relectureId);
  if (index !== -1) {
    relectures[index] = {
      ...relectures[index],
      statut: 'CORRIGE',
      note: Number(payload.note),
      commentaire: payload.commentaire.trim(),
    };
    saveLocalRelectures(relectures);
  }

  return { success: true, message: 'Relecture croisée soumise et notée avec succès (200 OK).' };
}

/**
 * 5. GET /api/tableau?promotionId=X : Tableau de bord de suivi pour le formateur
 * Réponse : [ { etudiantId: number, nom: string, presences: number, exercicesDeposes: number, moyenne: number, relecturesEnAttente: number } ]
 */
export async function getTableauApi(promotionId: number): Promise<TableauLigne[]> {
  if (isLiveApiEnabled()) {
    try {
      const res = await fetch(`${getStoredBaseUrl()}/tableau?promotionId=${promotionId}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        let msg = '';
        try {
          const errBody = await res.json();
          msg = errBody.message || errBody.error || '';
        } catch {
          msg = await res.text();
        }
        throw new ApiHttpError(res.status, translateHttpError(res.status, msg), msg);
      }

      return await res.json();
    } catch (err: unknown) {
      if (err instanceof ApiHttpError) throw err;
      throw new ApiHttpError(
        0,
        `Impossible de récupérer le tableau de bord auprès de ${getStoredBaseUrl()}.`
      );
    }
  }

  // Simulation locale
  await new Promise((r) => setTimeout(r, 350));
  return getLocalTableau(promotionId);
}

// ----------------------------------------------------
// Lectures libres (en plus des 5 opérations imposées)
// ----------------------------------------------------

/** GET /api/promotions : référentiel des promotions. */
export async function getPromotionsApi(): Promise<Promotion[]> {
  if (isLiveApiEnabled()) {
    const res = await fetch(`${getStoredBaseUrl()}/promotions`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) return await res.json();
  }
  return getAllPromotions();
}

/** GET /api/etudiants?promotionId=X : la liste des étudiants. */
export async function getEtudiantsApi(promotionId?: number): Promise<EtudiantInfo[]> {
  if (isLiveApiEnabled()) {
    try {
      const qs = promotionId ? `?promotionId=${promotionId}` : '';
      const res = await fetch(`${getStoredBaseUrl()}/etudiants${qs}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const list = await res.json();
        return list.map((e: { id: number; nom: string; prenom: string; email: string; promotionId: number }) => ({
          id: e.id,
          nom: e.nom,
          prenom: e.prenom,
          matricule: `KF-2026-${e.id % 100}`,
          email: e.email,
          promotionId: e.promotionId,
        }));
      }
    } catch {
      // retombe sur la simulation locale ci-dessous
    }
  }
  return ETUDIANTS_INITIALS.filter((e) => (promotionId ? e.promotionId === promotionId : true));
}

/** GET /api/sessions : sessions passées et session active (démo). */
export async function getSessionsApi(): Promise<SessionResponse[]> {
  if (isLiveApiEnabled()) {
    try {
      const res = await fetch(`${getStoredBaseUrl()}/sessions`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) return await res.json();
    } catch {
      // simulation locale
    }
  }
  return getLocalSessions();
}

/** GET /api/relectures?relecteurId=X : relectures assignées à l'étudiant. */
export async function getRelecturesApi(relecteurId: number): Promise<RelectureItem[]> {
  if (isLiveApiEnabled()) {
    try {
      const res = await fetch(`${getStoredBaseUrl()}/relectures?relecteurId=${relecteurId}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) return await res.json();
    } catch {
      // simulation locale
    }
  }
  return getLocalRelectures().filter((r) => r.auteurEtudiantId !== relecteurId);
}

// ----------------------------------------------------
// Helpers utilitaires complémentaires pour l'application
// ----------------------------------------------------
export function getAllSessions(): SessionResponse[] {
  return getLocalSessions();
}

export function getActiveSession(): SessionResponse | null {
  const sessions = getLocalSessions();
  const now = Date.now();
  return (
    sessions.find((s) => {
      const exp = new Date(s.expirationAt).getTime();
      return exp > now;
    }) || null
  );
}

export function getAllRelectures(): RelectureItem[] {
  return getLocalRelectures();
}

export function getAllPromotions() {
  return PROMOTIONS_INITIALES;
}

export function expireSessionNow(sessionId: number): void {
  const sessions = getLocalSessions();
  const updated = sessions.map((s) =>
    s.id === sessionId ? { ...s, expirationAt: new Date(Date.now() - 1000).toISOString() } : s
  );
  saveLocalSessions(updated);
}
