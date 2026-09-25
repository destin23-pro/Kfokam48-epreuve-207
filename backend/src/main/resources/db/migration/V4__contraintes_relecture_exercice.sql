-- V4 : Contraintes de gestion portées par le schéma (diagramme D2)

-- EF5 : une relecture est créée EN_ATTENTE au dépôt, sans note ni commentaire.
-- RG3 : une fois rendue, la note est un entier de 0 à 20.
ALTER TABLE relectures ALTER COLUMN note DROP NOT NULL;
ALTER TABLE relectures
    ADD CONSTRAINT ck_relecture_note CHECK (note IS NULL OR note BETWEEN 0 AND 20);

-- RG7 : un seul relecteur par exercice.
ALTER TABLE relectures
    ADD CONSTRAINT uq_relecture_exercice UNIQUE (exercice_id);

-- RG9 : un seul exercice par étudiant et par session.
ALTER TABLE exercices
    ADD CONSTRAINT uq_exercice_session_etudiant UNIQUE (session_id, etudiant_id);

-- RG11 : la source d'une présence vaut ETUDIANT ou FORMATEUR.
ALTER TABLE presences
    ADD CONSTRAINT ck_presence_source CHECK (source IN ('ETUDIANT', 'FORMATEUR'));
