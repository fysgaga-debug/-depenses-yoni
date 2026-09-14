# Dépenses Dauphine — V3

Version PWA pour GitHub Pages.

## Nouveautés V3
- Connexion par téléphone + PIN.
- Premier code : `1612`, puis changement obligatoire.
- Session mémorisée sur l’appareil : pas de reconnexion à chaque ouverture.
- Dépenses : jour, semaine, mois, historique mensuel cliquable.
- Messages du jour étudiant / parents.
- **Photo du jour** : une photo par profil et par jour.
- Visibilité : l’étudiant voit les photos de ses parents ; un parent voit uniquement les photos de l’étudiant.
- Réactions : 🔥, 👏, ❤️.
- **Série de jours avec photo** : se remet à 0 si une journée est manquée.
- **Total de flammes reçues** : cumul séparé.
- Nouveau badge/icône Dauphine pour iPhone/PWA : 180, 192 et 512 px.
- Cache PWA versionné pour forcer le rafraîchissement de l’application et de l’icône.

## Important : synchronisation multi-téléphones
Cette V3 stocke les données dans le navigateur (`localStorage`). Toutes les fonctions sont testables sur un appareil, mais pour que Yoni et ses deux parents voient réellement les mêmes photos, réactions, messages et dépenses depuis trois téléphones différents, il faut connecter l’application à une base cloud sécurisée (par exemple Supabase). La structure visuelle et fonctionnelle est déjà prête pour cette étape.

## Installation GitHub
Envoyer **tous les fichiers de ce dossier** à la racine du dépôt GitHub puis `Commit changes` sur `main`.

Après déploiement :
1. Attendre 1 à 2 minutes.
2. Supprimer l’ancienne icône de l’écran d’accueil de l’iPhone.
3. Ouvrir le site dans Safari et actualiser.
4. Partager → Sur l’écran d’accueil → Ajouter.
