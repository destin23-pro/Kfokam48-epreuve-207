-- V6 : changement de besoin (issue #25) — deux relecteurs différents par exercice.
-- Migration ajoutée : V1 à V5 ne sont pas modifiées. Les données existantes survivent :
-- les exercices déjà relus par un seul pair gardent leur relecture et leur note.

-- L'ancienne RG7 (un seul relecteur) disparaît...
ALTER TABLE relectures DROP CONSTRAINT uq_relecture_exercice;

-- ...remplacée par : un même étudiant ne relit pas deux fois le même exercice.
-- Le maximum de deux relecteurs est appliqué par ExerciceService.
ALTER TABLE relectures
    ADD CONSTRAINT uq_relecture_exercice_relecteur UNIQUE (exercice_id, etudiant_id);
