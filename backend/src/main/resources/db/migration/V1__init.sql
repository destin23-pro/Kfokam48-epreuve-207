-- V1__init.sql - Migration initiale pour KFOKAM48
-- Table : promotions
CREATE TABLE promotions (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL
);

-- Table : etudiants
CREATE TABLE etudiants (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    promotion_id BIGINT NOT NULL,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
);

-- Table : sessions
CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL UNIQUE,
    ouverture_at TIMESTAMP NOT NULL,
    expiration_at TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('OUVERTE', 'FERMEE', 'COMPLETE')),
    promotion_id BIGINT NOT NULL,
    teacher_id BIGINT,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
);

-- Table : presence
CREATE TABLE presences (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    etudiant_id BIGINT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'RETARD', 'INCONNU')),
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (etudiant_id) REFERENCES etudiants(id)
);

-- Table : exercices
CREATE TABLE exercices (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    etudiant_id BIGINT NOT NULL,
    lien VARCHAR(255) NOT NULL,
    soumission_at TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('VALIDE', 'EN_RETARD', 'ANNULE')),
    FOREIGN KEY (session_id) REFERENCES sessions(id),
    FOREIGN KEY (etudiant_id) REFERENCES etudiants(id)
);

-- Table : relectures
CREATE TABLE relectures (
    id BIGSERIAL PRIMARY KEY,
    exercice_id BIGINT NOT NULL,
    etudiant_id BIGINT NOT NULL,
    note INTEGER NOT NULL,
    commentaire TEXT,
    soumission_at TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('EN_ATTENTE', 'REALISE', 'ANNULEE')),
    FOREIGN KEY (exercice_id) REFERENCES exercices(id),
    FOREIGN KEY (etudiant_id) REFERENCES etudiants(id)
);
