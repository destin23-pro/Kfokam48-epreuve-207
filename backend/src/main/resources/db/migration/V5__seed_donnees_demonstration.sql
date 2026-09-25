-- V5 : Données de démonstration chargées au démarrage (exigence du sujet : le correcteur
--       ne doit pas ouvrir une application vide). Les identifiants correspondent
--       à ceux attendus par le frontend (promotions 1..3, étudiants 101..302).

-- ------------------------------------------------
-- 1. Promotions
-- ------------------------------------------------
INSERT INTO promotions (id, nom) VALUES
    (1, 'ING-INFO-2026 - Ingénierie Logicielle (2025-2026)'),
    (2, 'M2-DEV-CLOUD - Master 2 Cloud & DevOps (2025-2026)'),
    (3, 'L3-DATA-AI - Licence 3 Data & Intelligence Artificielle (2025-2026)');
SELECT setval('promotions_id_seq', 3, true);

-- ------------------------------------------------
-- 2. Étudiants
-- ------------------------------------------------
INSERT INTO etudiants (id, nom, prenom, email, promotion_id) VALUES
    (101, 'Fokam',     'Christian', 'c.fokam@univ-kfokam.ac', 1),
    (102, 'Ndongmo',   'Mireille',  'm.ndongmo@univ-kfokam.ac', 1),
    (103, 'Kamdem',    'Aristide',  'a.kamdem@univ-kfokam.ac', 1),
    (104, 'Tchouassi', 'Sandra',    's.tchouassi@univ-kfokam.ac', 1),
    (105, 'Biya',      'Loïc',      'l.biya@univ-kfokam.ac', 1),
    (106, 'Moukandjo', 'Valérie',   'v.moukandjo@univ-kfokam.ac', 1),
    (107, 'Kenmogne',  'Boris',     'b.kenmogne@univ-kfokam.ac', 1),
    (108, 'Djoko',     'Astrid',    'a.djoko@univ-kfokam.ac', 1),
    (201, 'Zambo',     'Hervé',     'h.zambo@univ-kfokam.ac', 2),
    (202, 'Ebanda',    'Clarisse',  'c.ebanda@univ-kfokam.ac', 2),
    (203, 'Kengne',    'Franck',    'f.kengne@univ-kfokam.ac', 2),
    (301, 'Atangana',  'Paul',      'p.atangana@univ-kfokam.ac', 3),
    (302, 'Mballa',    'Béatrice',  'b.mballa@univ-kfokam.ac', 3);
SELECT setval('etudiants_id_seq', 302, true);

-- ------------------------------------------------
-- 3. Sessions
--    Session 1 : OUVERTE (code d'émargement immédiatement testable)
--    Sessions 2..12 : historique promo 1  |  20 : promo 2  |  30 : promo 3
-- ------------------------------------------------
INSERT INTO sessions (id, titre, code, ouverture_at, expiration_at, status, promotion_id, teacher_id)
VALUES (
    1,
    'Séance 12 - Architecture Microservices & Spring Boot',
    'KF8942',
    NOW() - INTERVAL '2 minutes',
    NOW() + INTERVAL '13 minutes',
    'OUVERTE',
    1,
    99
);

INSERT INTO sessions (id, titre, code, ouverture_at, expiration_at, status, promotion_id, teacher_id)
SELECT
    2 + g,
    'Séance ' || to_char(11 - g, 'FM00') || ' - Encadrement Java / Spring (promo 1)',
    'K' || to_char(20001 + g, 'FM00000'),
    NOW() - ((g + 1) * INTERVAL '2 days' + INTERVAL '3 hours'),
    NOW() - ((g + 1) * INTERVAL '2 days' + INTERVAL '2 hours 45 minutes'),
    'FERMEE',
    1,
    99
FROM generate_series(0, 10) AS g;

INSERT INTO sessions (id, titre, code, ouverture_at, expiration_at, status, promotion_id, teacher_id)
VALUES
    (20, 'Séance 08 - Containerisation Docker & Kubernetes (promo 2)', 'K40020',
     NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '15 minutes', 'FERMEE', 2, 99),
    (30, 'Séance 06 - Statistiques & Modélisation (promo 3)', 'K40030',
     NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '15 minutes', 'FERMEE', 3, 99);
SELECT setval('sessions_id_seq', 100, true);

-- ------------------------------------------------
-- 4. Présences (source = ETUDIANT)
--    Motif déterministe : (id_etudiant + id_session) % 5 <> 0
-- ------------------------------------------------
INSERT INTO presences (session_id, etudiant_id, "timestamp", status, source)
SELECT s.id, e.id, s.ouverture_at + INTERVAL '5 minutes', 'PRESENT', 'ETUDIANT'
FROM sessions s
         JOIN etudiants e ON e.promotion_id = s.promotion_id
WHERE s.promotion_id = 1
  AND s.id BETWEEN 2 AND 12
  AND ((e.id + s.id) % 5) <> 0;

-- Présence ajoutée manuellement par le formateur (Q14 : source FORMATEUR)
INSERT INTO presences (session_id, etudiant_id, "timestamp", status, source)
VALUES (2, 108, NOW() - INTERVAL '2 days 3 hours', 'PRESENT', 'FORMATEUR');

-- Promo 2 & 3
INSERT INTO presences (session_id, etudiant_id, "timestamp", status, source)
SELECT s.id, e.id, s.ouverture_at + INTERVAL '5 minutes', 'PRESENT', 'ETUDIANT'
FROM sessions s
         JOIN etudiants e ON e.promotion_id = s.promotion_id
WHERE s.id IN (20, 30);

-- ------------------------------------------------
-- 5. Exercices déposés (promo 1 : sessions 10, 11, 12)
--    Motif : (id_etudiant + id_session) % 4 <> 1
-- ------------------------------------------------
INSERT INTO exercices (session_id, etudiant_id, lien, soumission_at, status)
SELECT
    s.id,
    e.id,
    'https://github.com/kfokam48-' || e.id || '/tp-session-' || s.id,
    s.ouverture_at + INTERVAL '1 day',
    'DEPOSE'
FROM sessions s
         JOIN etudiants e ON e.promotion_id = 1
WHERE s.promotion_id = 1
  AND s.id IN (10, 11, 12)
  AND ((e.id + s.id) % 4) <> 1;

-- Promo 2 & 3
INSERT INTO exercices (session_id, etudiant_id, lien, soumission_at, status)
SELECT s.id, e.id,
       'https://github.com/kfokam48-' || e.id || '/tp-session-' || s.id,
       s.ouverture_at + INTERVAL '1 day',
       'DEPOSE'
FROM sessions s
         JOIN etudiants e ON e.promotion_id = s.promotion_id
WHERE s.id IN (20, 30);

-- ------------------------------------------------
-- 6. Relectures : le relecteur est different de l'auteur (Q5/RG2) et choisi dans la
--    meme promotion (Q7). Cycle deterministe : auteur + 1. Une relecture sur six
--    reste EN_ATTENTE (Q11 : l'exercice reste « en attente »). Note entiere 0-20 (Q9).
-- ------------------------------------------------
INSERT INTO relectures (exercice_id, etudiant_id, note, commentaire, soumission_at, status)
SELECT
    ex.id,
    ((ex.etudiant_id - 101 + 1) % 8) + 101,   -- cycle 101..108, jamais l'auteur
    CASE WHEN ex.id % 6 = 0 THEN NULL
         ELSE (ex.etudiant_id + ex.session_id + ex.id) % 13 + 7 END,
    CASE WHEN ex.id % 6 = 0 THEN NULL
         ELSE 'Travail structure, code lisible et teste, bonnes pratiques applicatives respectees.' END,
    CASE WHEN ex.id % 6 = 0 THEN ex.soumission_at            -- date d'attribution
         ELSE ex.soumission_at + INTERVAL '2 days' END,         -- date de rendu
    CASE WHEN ex.id % 6 = 0 THEN 'EN_ATTENTE' ELSE 'REALISE' END
FROM exercices ex
WHERE EXISTS (SELECT 1 FROM sessions s WHERE s.id = ex.session_id AND s.promotion_id = 1);

-- Relectures promo 2 (groupe 201..203)
INSERT INTO relectures (exercice_id, etudiant_id, note, commentaire, soumission_at, status)
SELECT
    ex.id,
    ((ex.etudiant_id - 201 + 1) % 3) + 201,
    (ex.etudiant_id + ex.id) % 13 + 7,
    'Travail structure, code lisible et teste, bonnes pratiques applicatives respectees.',
    ex.soumission_at + INTERVAL '2 days',
    'REALISE'
FROM exercices ex
WHERE EXISTS (SELECT 1 FROM sessions s WHERE s.id = ex.session_id AND s.promotion_id = 2);

-- Relectures promo 3 (groupe 301..302)
INSERT INTO relectures (exercice_id, etudiant_id, note, commentaire, soumission_at, status)
SELECT
    ex.id,
    CASE WHEN ex.etudiant_id = 301 THEN 302 ELSE 301 END,
    (ex.etudiant_id + ex.id) % 13 + 8,
    'Rapport complet, analyse solide et calculs justifies.',
    ex.soumission_at + INTERVAL '2 days',
    'REALISE'
FROM exercices ex
WHERE EXISTS (SELECT 1 FROM sessions s WHERE s.id = ex.session_id AND s.promotion_id = 3);

-- ------------------------------------------------
-- 7. Statut des exercices cohérent avec leurs relectures (diagramme D4)
-- ------------------------------------------------
UPDATE exercices ex SET status = 'RELU'
WHERE EXISTS (SELECT 1 FROM relectures r WHERE r.exercice_id = ex.id AND r.status = 'REALISE');
UPDATE exercices ex SET status = 'EN_RELECTURE'
WHERE EXISTS (SELECT 1 FROM relectures r WHERE r.exercice_id = ex.id AND r.status = 'EN_ATTENTE');
