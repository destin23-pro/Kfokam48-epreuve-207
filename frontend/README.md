# KFOKAM48 - Suivi des Présences et Évaluations

Système académique de gestion des présences en temps réel, dépôts d'exercices, relectures croisées et tableau de bord formateur.

## Stack

- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS
- **Backend** : Spring Boot 3 (Java 17+)
- **Base de données** : PostgreSQL 15 (Docker)

## Démarrage

### Prérequis
- Docker & Docker Compose
- Java 17+ & Maven
- Node.js 18+ (pour le frontend)

### Commands

```bash
# 1. Lancer la base de données
docker compose up -d

# 2. Lancer le backend
cd backend
mvn spring-boot:run

# 3. Lancer le frontend
cd frontend
npm install
npm run dev
```

## Fonctionnalités
- Espace Formateur : ouvrir session + code d'émargement, tableau de bord complet
- Espace Étudiant : émargement par code, dépôt de TP, relecture croisée par les pairs
- Tableau de bord : présence, exercices déposés, moyenne, relectures en attente

## Architecture
- `frontend/` : Application React (Vite, TypeScript, Tailwind)
- `backend/` : API REST Spring Boot (Java 17+, PostgreSQL)

## Développement
```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && mvn spring-boot:run
```
