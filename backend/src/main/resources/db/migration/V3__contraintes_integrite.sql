-- V3 : Contraintes d'intégrité
-- RG5 : un étudiant ne peut avoir qu'une seule présence par session
ALTER TABLE presences
    ADD CONSTRAINT uq_presence_session_etudiant UNIQUE (session_id, etudiant_id);

-- Cycle de vie d'un exercice : DEPOSE -> EN_RELECTURE -> RELU (diagramme D4)
-- On élargit la contrainte CHECK de la table exercices sans casser l'existant.
ALTER TABLE exercices DROP CONSTRAINT IF EXISTS exercices_status_check;
ALTER TABLE exercices
    ADD CONSTRAINT exercices_status_check
    CHECK (status IN ('DEPOSE', 'EN_RELECTURE', 'RELU', 'VALIDE', 'EN_RETARD', 'ANNULE'));