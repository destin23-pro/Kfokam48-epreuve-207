-- V2 : Le champ source d'une présence vaut ETUDIANT ou FORMATEUR (contrat API / Q14)
ALTER TABLE presences ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'ETUDIANT';