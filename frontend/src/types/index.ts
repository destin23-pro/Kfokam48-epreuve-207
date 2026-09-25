/**
 * Modèles de données & DTOs pour le Système KFOKAM48
 * Correspondant aux 5 endpoints Spring Boot REST (/api/*)
 */

// 1. Session de cours créée par le formateur
export interface CreateSessionDTO {
  titre: string;
  promotionId: number;
}

export interface SessionResponse {
  id: number;
  code: string;
  ouvertureAt: string; // ISO 8601 string
  expirationAt: string; // ISO 8601 string
  titre?: string;
  promotionId?: number;
}

// 2. Émargement de présence par l'étudiant
export interface CreatePresenceDTO {
  code: string;
  etudiantId: number;
}

export interface PresenceResponse {
  id: number;
  sessionId: number;
  etudiantId: number;
  source: string; // ex: "WEB_ETUDIANT", "QR_CODE", "DIRECT"
  createdAt?: string;
}

// 3. Dépôt d'exercice par l'étudiant
export interface CreateExerciceDTO {
  sessionId: number;
  etudiantId: number;
  lien: string; // Lien GitHub, GitLab, Google Drive, etc.
}

export interface ExerciceResponse {
  id: number;
  sessionId?: number;
  etudiantId?: number;
  lien?: string;
  statut: 'DEPOSE' | 'EN_RELECTURE' | 'VALIDE' | 'A_CORRIGER' | string;
  createdAt?: string;
}

// 4. Relecture croisée par les pairs
export interface CreateRelectureDTO {
  note: number; // 0 à 20
  commentaire: string;
}

export interface RelectureItem {
  id: number;
  exerciceId: number;
  exerciceTitre: string;
  exerciceLien: string;
  auteurEtudiantId: number;
  auteurNom: string;
  sessionId: number;
  sessionTitre: string;
  statut: 'EN_ATTENTE' | 'CORRIGE';
  note?: number;
  commentaire?: string;
}

// 5. Ligne du Tableau de bord global
export interface TableauLigne {
  etudiantId: number;
  nom: string;
  presences: number;
  exercicesDeposes: number;
  moyenne: number | null; // Note sur 20, null si aucune note reçue (RG14)
  relecturesEnAttente: number;
  email?: string;
  avatarUrl?: string;
}

// Types auxiliaires pour l'UI et le contexte académique
export interface Promotion {
  id: number;
  nom: string;
}

export interface EtudiantInfo {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  email: string;
  promotionId: number;
}

export type RoleType = 'etudiant' | 'formateur';

export interface ApiErrorDetail {
  status: number;
  message: string;
  code?: string;
  timestamp?: string;
}
