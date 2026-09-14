# Dépenses Dauphine — V1

Prototype PWA mobile pour le suivi des dépenses étudiantes.

## Fonctionnalités
- Interface Étudiant / Parents
- Photo de ticket depuis mobile
- OCR local dans le navigateur avec Tesseract.js
- Pré-remplissage date / montant / commerce / catégorie quand possible
- Validation obligatoire par l'étudiant avant enregistrement
- Vue jour / semaine / mois
- Répartition par catégories côté parents
- Historique stocké localement dans le navigateur
- Installation comme application mobile (PWA)

## Important
Cette V1 est un prototype front-end. Les données sont enregistrées dans `localStorage` sur l'appareil utilisé.
Les numéros de téléphone réels ne sont volontairement pas intégrés au code afin de ne pas les exposer dans un dépôt GitHub public.

Pour une version familiale multi-appareils avec connexion par SMS, ajouter un backend (par exemple Supabase) : Auth OTP SMS, base Postgres, stockage des photos et règles d'accès par rôle.

## GitHub Pages
1. Créez un dépôt GitHub, par exemple `depenses-dauphine`.
2. Copiez tous les fichiers de ce dossier à la racine du dépôt.
3. Dans GitHub : Settings > Pages > Deploy from a branch > `main` / root.
4. Ouvrez l'URL GitHub Pages sur l'iPhone puis utilisez « Ajouter à l'écran d'accueil ».

## Sécurité
Pour une V2 en production : ne jamais mettre de clé d'API OCR ou d'identifiants privés directement dans `app.js`.
