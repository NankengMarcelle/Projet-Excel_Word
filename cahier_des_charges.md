# CAHIER DES CHARGES
## Application de Conversion Excel → Word
### Version 1.0 — Août 2026

---

## 1. CONTEXTE ET OBJECTIFS

### 1.1 Contexte général

Dans le cadre des opérations internes de l'entreprise, les équipes métier manipulent quotidiennement des données structurées sous forme de fichiers Excel (rapports, tableaux de bord, données RH, finances, etc.). Il est fréquemment nécessaire de transmettre ces données sous forme de documents Word formatés à des parties prenantes (direction, clients, partenaires) qui n'ont pas accès aux outils tableur ou qui nécessitent un document formel.

Cette opération est aujourd'hui réalisée **manuellement**, ce qui génère :
- Une perte de temps significative (copier-coller, reformatage)
- Des erreurs de transcription
- Une absence de traçabilité et d'uniformité dans les documents produits

### 1.2 Objectifs du projet

| ID | Objectif |
|----|----------|
| OBJ-01 | Automatiser la conversion de fichiers Excel (.xlsx, .xls) en documents Word (.docx) |
| OBJ-02 | Proposer une interface web accessible depuis n'importe quel poste du réseau interne |
| OBJ-03 | Garantir la confidentialité des données via une authentification et une autorisation sécurisées |
| OBJ-04 | Journaliser toutes les opérations pour des besoins d'audit et de conformité |
| OBJ-05 | Permettre une mise en forme du document Word (titre, en-têtes, tableaux stylisés) |

---

## 2. PÉRIMÈTRE FONCTIONNEL

### 2.1 Acteurs

| Acteur | Description |
|--------|-------------|
| **Utilisateur métier** | Collaborateur interne qui upload un fichier Excel et télécharge le Word généré |
| **Administrateur** | Responsable IT qui gère les comptes, visualise les logs d'audit |

### 2.2 Cas d'utilisation

```
[Utilisateur]
  ├── S'inscrire / Se connecter
  ├── Uploader un fichier Excel
  ├── Choisir un modèle de mise en forme Word
  ├── Lancer la conversion
  ├── Télécharger le document Word généré
  └── Consulter l'historique de ses conversions

[Administrateur]
  ├── Gérer les comptes utilisateurs (activer / désactiver)
  └── Consulter les logs d'audit (qui a converti quoi, quand)
```

### 2.3 Exigences fonctionnelles

| ID | Exigence | Priorité |
|----|----------|----------|
| F-01 | L'application doit accepter les fichiers .xlsx et .xls | MUST |
| F-02 | La taille maximale d'un fichier uploadé est de 10 Mo | MUST |
| F-03 | Chaque feuille Excel devient une section dans le Word | MUST |
| F-04 | Les en-têtes de colonnes Excel deviennent les en-têtes du tableau Word | MUST |
| F-05 | L'utilisateur peut télécharger le fichier Word dans les 5 minutes qui suivent la conversion | MUST |
| F-06 | Un historique des 10 dernières conversions est accessible à l'utilisateur | SHOULD |
| F-07 | L'utilisateur peut choisir un modèle de style (Standard, Rapport, Facturation) | COULD |
| F-08 | L'administrateur peut désactiver un compte utilisateur | MUST |

---

## 3. EXIGENCES NON FONCTIONNELLES

### 3.1 Sécurité (Bulletin Sécurité)

| ID | Mesure | Détail |
|----|--------|--------|
| S-01 | **Authentification JWT** | Token d'accès (15 min) + Refresh token (7 jours), stocké en cookie HttpOnly |
| S-02 | **Validation du fichier** | Vérification des magic bytes, du type MIME, et de l'extension côté serveur |
| S-03 | **Isolation des fichiers** | Les fichiers uploadés sont stockés dans un répertoire temporaire, hors webroot, supprimés après 5 min |
| S-04 | **CORS restrictif** | Seule l'origine de l'interface frontend est autorisée |
| S-05 | **En-têtes de sécurité HTTP** | X-Frame-Options, X-Content-Type-Options, Content-Security-Policy, HSTS |
| S-06 | **Rate limiting** | Maximum 10 conversions/minute par utilisateur authentifié |
| S-07 | **Sanitisation des entrées** | Les valeurs des cellules Excel sont nettoyées avant écriture (protection contre l'injection de formules) |
| S-08 | **Audit log** | Chaque opération est journalisée avec : ID utilisateur, timestamp, hash SHA-256 du fichier, statut |
| S-09 | **Chiffrement en transit** | HTTPS obligatoire en production (TLS 1.2+) |
| S-10 | **Gestion des erreurs** | Les messages d'erreur retournés au client ne doivent jamais exposer la stack trace ou les détails internes |

### 3.2 Performance

| Critère | Cible |
|---------|-------|
| Temps de conversion | < 5 secondes pour un fichier de 1 000 lignes |
| Disponibilité | 99,5% (hors maintenance planifiée) |
| Capacité simultanée | 20 conversions simultanées |

### 3.3 Maintenabilité

- Code source versionné sur dépôt Git (GitLab interne)
- Séparation stricte Backend / Frontend
- Documentation technique (Swagger/OpenAPI pour les APIs)
- Couverture de tests unitaires ≥ 80%

---

## 4. ARCHITECTURE TECHNIQUE

### 4.1 Stack technique

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **Backend** | Java 17 + Spring Boot 3 | Standard entreprise, robuste, large écosystème |
| **Sécurité** | Spring Security + JJWT 0.12 | Intégration native, JWT moderne |
| **Parsing Excel** | Apache POI 5.x | Bibliothèque de référence Java pour les formats Office |
| **Génération Word** | Apache POI XWPF | Même bibliothèque, cohérence, licence Apache 2.0 |
| **Base de données** | PostgreSQL 15 | SGBDR open-source, fiable, ACID |
| **ORM** | Spring Data JPA / Hibernate | Productivité, portabilité |
| **Frontend** | React 18 + Vite | SPA moderne, rapide, communauté active |
| **Client HTTP** | Axios | Gestion des intercepteurs pour JWT |
| **Conteneurisation** | Docker + Docker Compose | Déploiement reproductible |
| **Serveur web** | Nginx (reverse proxy) | Terminaison TLS, proxy vers le backend |

### 4.2 Architecture de déploiement

```
                   ┌──────────┐
      Internet/    │  Nginx   │  HTTPS :443
      Intranet ──► │ (Reverse │──────────────────────────┐
                   │  Proxy)  │                          │
                   └──────────┘                          │
                         │                               │
              ┌──────────▼──────────┐      ┌────────────▼────────────┐
              │  Frontend (React)   │      │   Backend (Spring Boot)  │
              │  Port: 3000/80      │      │   Port: 8080             │
              └─────────────────────┘      └────────────┬────────────┘
                                                        │
                                           ┌────────────▼────────────┐
                                           │   PostgreSQL DB          │
                                           │   Port: 5432             │
                                           └─────────────────────────┘
```

---

## 5. LIVRABLES

| Livrable | Description | Délai estimé |
|----------|-------------|--------------|
| L-01 | Cahier des charges validé (ce document) | Semaine 1 |
| L-02 | Présentation PowerPoint du projet | Semaine 1 |
| L-03 | Maquettes UI (wireframes des pages) | Semaine 1 |
| L-04 | Backend Spring Boot (API REST sécurisée) | Semaine 2-3 |
| L-05 | Frontend React (interface utilisateur) | Semaine 2-3 |
| L-06 | Tests unitaires et d'intégration | Semaine 3 |
| L-07 | Documentation Swagger/OpenAPI | Semaine 3 |
| L-08 | Docker Compose + guide de déploiement | Semaine 4 |
| L-09 | Recette fonctionnelle | Semaine 4 |

---

## 6. CONTRAINTES

- L'ensemble du code source doit être hébergé sur le **dépôt Git interne** de l'entreprise
- Les licences des dépendances utilisées doivent être compatibles avec un usage commercial (Apache 2.0, MIT)
- L'application doit pouvoir être déployée sur un **serveur Linux Ubuntu 22.04 LTS**
- Aucune donnée sensible (fichiers, logs) ne doit être stockée en dehors du périmètre réseau de l'entreprise

---

## 7. CRITÈRES D'ACCEPTATION

Le projet sera considéré comme terminé lorsque :
1. Un utilisateur peut se connecter, uploader un fichier Excel de 500 lignes, et télécharger le Word correspondant en moins de 10 secondes
2. Toutes les tentatives d'accès non authentifiées aux endpoints `/api/convert` et `/api/download` retournent HTTP 401
3. Un fichier non-Excel uploadé est rejeté avec un message d'erreur clair (HTTP 400)
4. L'administrateur peut voir les logs d'audit des 30 derniers jours
5. La couverture de tests est ≥ 80% sur le backend

---

*Document rédigé le 06 Août 2026 — Version 1.0*
*Projet : Solution Excel → Word | Équipe IT*
