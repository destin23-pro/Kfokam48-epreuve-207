# Backlog du Projet — Épreuve KFOKAM48

## Epic 1 : Infrastructure & Configuration
- **[US-01]** En tant que développeur, je veux configurer l'environnement Docker avec PostgreSQL afin d'avoir une base de données isolée et reproductible. *(Statut: DONE)*
- **[US-02]** En tant que développeur, je veux initialiser la structure du projet backend Spring Boot afin de poser les fondations architecturales. *(Statut: DONE)*

## Epic 2 : Modélisation des Données & Persistance
- **[US-03]** En tant que système, je veux gérer les entités JPA (User, Product, Order, OrderItem) pour persister le domaine métier. *(Statut: DONE)*
- **[US-04]** En tant que système, je veux disposer de repositories Spring Data JPA pour exécuter les opérations CRUD sur PostgreSQL. *(Statut: DONE)*

## Epic 3 : Couche Métier & DTOs
- **[US-05]** En tant que développeur, je veux implémenter les objets DTO et les services métier (UserService, ProductService, OrderService) pour découpler l'API de la persistance. *(Statut: DONE)*

## Epic 4 : Exposition de l'API REST
- **[US-06]** En tant que client HTTP, je veux accéder aux endpoints REST `/api/users`, `/api/products` et `/api/orders` pour effectuer les opérations CRUD. *(Statut: IN_PROGRESS)*
- **[US-07]** En tant que développeur, je veux documenter l'API via une spécification OpenAPI 3.0 (`api/contrat.yaml`). *(Statut: TO_DO)*

## Epic 5 : Sécurité & Authentification
- **[US-08]** En tant qu'utilisateur, je veux m'authentifier via JWT pour sécuriser mes accès aux endpoints de l'API. *(Statut: DONE)*

## Epic 6 : Tests & Intégration Continue
- **[US-09]** En tant que développeur, je veux écrire des tests unitaires et d'intégration pour valider la robustesse de la couche service et des controllers. *(Statut: TO_DO)*
