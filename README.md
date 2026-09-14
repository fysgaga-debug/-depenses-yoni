# Dépenses Dauphine — V2

Version statique PWA pour GitHub Pages.

## Nouveautés
- Connexion par numéro de téléphone + PIN à 4 chiffres.
- Premier code universel : `1612`, puis changement obligatoire.
- Session conservée sur l'appareil.
- Profils Étudiant / Parent.
- Bulle « Message étudiant » et « Message parents » chaque jour.
- Dépenses journalières et totaux jour / semaine / mois.
- Historique mensuel cliquable avec détail des dépenses du mois.
- Logo `dauphine-logo.jpeg` utilisé s'il est présent dans le dépôt, avec fallback si l'image manque.

## Important
Cette V2 utilise le stockage local du navigateur. Les données ne sont pas encore synchronisées entre plusieurs appareils. Pour une vraie utilisation familiale multi-téléphones, prévoir un backend sécurisé (par ex. Supabase) et une authentification serveur.

## Mise en ligne
Remplacer dans la branche `main` les fichiers `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js` et `README.md`. Conserver `dauphine-logo.jpeg` déjà présent dans le dépôt.
