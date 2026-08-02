# Vaisseau — jeu de rôle spatial roguelite

Jeu navigateur mobile-first. Runs de 3 à 5 minutes, entièrement au clic.
Le joueur dirige un vaisseau et son équipage à travers des galaxies générées,
et tente de découvrir un maximum de planètes avant de perdre le vaisseau — ou
de trouver une planète paradisiaque où s'installer.

## Principes

- **Pas de back-end.** Tout tourne dans le navigateur, persistance en stockage local.
- **Pas de gameplay d'action.** Chaque écran est un choix entre 2 ou 3 boutons.
- **Mort permanente.** Chaque run génère un nouveau vaisseau.
- **Méta-progression.** Une monnaie persistante et un portefeuille de trophées
  survivent d'un run à l'autre.

## Structure

```
docs/          cadrage fonctionnel et classeur de calibrage
src/data/      données de jeu (événements, tables de génération)
src/engine/    moteur de résolution, générateurs, état du run
src/ui/        écrans et composants
public/        assets statiques
```

## Documentation

- `docs/cadrage.md` — document de cadrage complet, source de vérité du design
- `docs/calibrage.xlsx` — toutes les valeurs chiffrées
- `CLAUDE.md` — contexte projet chargé automatiquement par Claude Code

## Démarrer

```
npm install
npm run dev
```

## État

Prototype jouable de bout en bout : accueil, allocation des skills,
événements narratifs, détection/exploration de planètes, victoire
(paradisiaque) et défaite (carburant/coque) avec message contextuel.
