# CLAUDE.md

Contexte projet chargé automatiquement par Claude Code. Contient les décisions
de game design déjà arbitrées. **Ne pas les remettre en question sans demande
explicite** — elles sont le résultat d'un cadrage complet.

---

## Le projet en une phrase

Jeu de rôle spatial roguelite jouable dans le navigateur, mobile-first, en runs
de 3 à 5 minutes, entièrement au clic sur des boutons. Le joueur dirige un
vaisseau et son équipage ; l'objectif est de découvrir des planètes avant de
perdre le vaisseau, ou de s'installer sur une planète paradisiaque.

Inspiration de référence : **Destiny Eleven**, pour le modèle
« décision → résultat simulé → conséquence chiffrée », sans gameplay d'action.

---

## Contraintes non négociables

| Contrainte | Détail |
|---|---|
| Plateforme | Navigateur, **mobile-first** |
| Architecture | **Front uniquement**, aucune API, aucun back-end |
| Persistance | Stockage local du navigateur |
| Interaction | Clics sur boutons — **aucun déplacement, aucun temps réel** |
| Durée d'un run | 3 à 5 minutes, soit 8 à 12 événements |
| Mécaniques | Volontairement peu nombreuses et simples |
| Classement | Aucun |
| Monétisation | Aucune |
| Hébergement | Statique |

Conséquence assumée : la triche via la console est possible et sans impact
(pas de classement, pas de compétition). Ne pas ajouter d'anti-triche.

---

## Modèle de données du run

### Jauges physiques — 0 à 100 — zéro termine le run
- `carburant` (initial 100)
- `coque` (initial 100)

### Stats — 0 à 100 — ni défaite, ni modulateur
- `moral` (initial 70)
- `reputation` (initial 50)

### Monnaie de run
- `monnaieRun` (initial 2000)
- **+5000 à l'ouverture de chaque chapitre** (solde de la station commanditaire)
- Perdue en fin de run, sauf conversion via planète paradisiaque

### Skills — 0 à 100 — évoluent pendant le run
- `combat`, `mecanique`, `relationnel`, `exploration`
- Répartition au départ : budget **200 points**, chacun entre **20 et 80**
- Montent en cas de réussite, **peuvent descendre** en cas d'échec
- Règle : le skill gagné ou perdu par une option est **toujours celui qui la gouverne**

### Persistant (hors run)
- `monnaiePersistante`
- `trophees[]` — un trophée par combinaison exacte de caractéristiques de planète Anomalie

---

## Résolution d'une option

```
1. Coût prélevé immédiatement, quel que soit le résultat
2. P_final = P_base + (Skill - 50) * 0.7        // borné 5..95
3. Jet d100 ; réussite si jet <= P_final
4. Fenêtre réussite critique = min(P_final, 5 + Skill * 0.10)
   Fenêtre échec critique    = 15 - Skill * 0.10
5. Application des effets (jusqu'à 2 gains, jusqu'à 2 pertes)
```

**Fourchettes** — un gain noté `8000-12000` est tiré au hasard dans l'intervalle.

**Critique** — effets doublés ; sur une fourchette, on prend la borne haute
(gain max en réussite critique, perte max en échec critique).

### Bornes de P_base
| Type d'option | P_base |
|---|---|
| Sécurisée | 85 |
| Facile | 60 |
| Moyenne | 45 |
| Difficile | 30 |

**Règle de design** : chaque événement doit offrir une issue viable à un profil
qui n'a pas le bon skill — soit via une option gouvernée par un autre skill,
soit via une option sécurisée à P_base élevée.

---

## Structure d'un run

- Découpé en **chapitres** ; un chapitre = l'exploration d'une galaxie au nom généré
- **2 à 4 événements par chapitre**, tirés aléatoirement
- Solde de +5000 créditée à l'ouverture de chaque chapitre

### Fins possibles

**Victoire** — s'installer sur une planète paradisiaque. Convertit **0,01 % de
la monnaie de run accumulée** en monnaie persistante.

**Défaite** — deux causes, deux messages distincts :
- `carburant = 0` → dérive silencieuse
- `coque = 0` → dislocation en vol

Prévoir **plusieurs variantes de message par cause**, enrichies du contexte
(galaxie, dernier événement, skill dominant) : le récapitulatif de fin est le
principal vecteur viral du jeu, sur le modèle de Wordle.

---

## Événement planète

À la détection, 3 choix : **Explorer**, **Scanner à distance** (gain faible et
sûr, planète comptée), **Ignorer** (aucun effet, non comptée).

Explorer tire le type :

| Type | Proba | Effet |
|---|---|---|
| Classique | 50 % | 2000-5000 monnaie de run |
| Anomalie | 10 % | 15000-20000 monnaie de run + monnaie persistante + trophée |
| Paradisiaque | 20 % | Option de s'arrêter (victoire + conversion) ou de repartir |
| Infernale | 20 % | -50 % monnaie de run ; coque ramenée à 10 %, **ou explosion si coque déjà ≤ 10 %** |

### Génération procédurale

Cinq caractéristiques tirées indépendamment, avec **pondération de rareté** :

- **Climat** : Infernal · Chaud · Tempéré · Froid · Glacial
- **Terrain** : Eau · Jungle · Désert rocailleux · Désert glacé · Gaz
- **Atmosphère** : Inexistante · Toxique · Irrespirable · Respirable · Dense
- **Système** : Errante · 1 soleil · 2 soleils · 3 soleils · Trou noir · Étoile à neutrons
- **Écosystème** : Pas de vie · Vie primitive · Vie animale · Vie intelligente · Société complexe établie

**Nom** = `[préfixe Système] + [racine] + [suffixe Climat]`

| Système | Préfixe | | Climat | Suffixe |
|---|---|---|---|---|
| Errante | `Kesh-` | | Infernal | `-agon` |
| 1 soleil | `Sol-` | | Chaud | `-ora` |
| 2 soleils | `Bi-` | | Tempéré | `-eth` |
| 3 soleils | `Tri-` | | Froid | `-ice` |
| Trou noir | `Abys-` | | Glacial | `-friz` |
| Étoile à neutrons | `Puls-` | | | |

Exemple : `Bi-Vex-ice`.

**Description** = `[Terrain] [Atmosphère], climat [Climat], [Écosystème].`

**Trophées** : liés à la **combinaison exacte** des 5 caractéristiques. Une
combinaison déjà possédée ne rapporte pas de nouveau trophée.

---

## Direction artistique

Minimaliste, thème spatial, piste **pixel art travaillé**. Fond sombre, palette
restreinte, typographie lisible en priorité mobile. Les jauges sont l'élément
visuel permanent. Illustrations d'événement optionnelles, jamais bloquantes.

---

## Où trouver quoi

| Fichier | Contenu |
|---|---|
| `docs/cadrage.md` | Document de cadrage complet, source de vérité du design |
| `docs/calibrage.xlsx` | Toutes les valeurs chiffrées : stats, événements, planètes |
| `src/data/` | Données de jeu extraites du calibrage (événements, tables) |
| `src/engine/` | Moteur de résolution, générateurs, gestion d'état |
| `src/ui/` | Écrans et composants |

**Le classeur `docs/calibrage.xlsx` est la source de vérité des valeurs.**
Ne pas coder de valeur en dur dans le moteur : les données de jeu vivent dans
`src/data/`, dérivées du classeur.

---

## Points encore ouverts

1. Taux de la planète Paradisiaque après un refus : fixe à 20 %, ou décroissant ?
2. Montant de monnaie persistante par Anomalie, à calibrer avec le taux de conversion (0,01 %).
3. Banque de racines pour la génération de noms (7 provisoires, à étoffer).
4. Pondération de rareté précise pour Système et Écosystème.
5. Monnaie de run à zéro : plancher bloquant, ou condition de fin de run ?
6. Paliers de conditionnement rendant une option indisponible plutôt qu'improbable.
7. Liste des avantages achetables avec la monnaie persistante, et leur coût.
8. Nombre de chapitres par run : fixe ou variable ?
9. Variantes de messages de fin par cause.

---

## Équilibrage à surveiller

- **Payer un péage** coûte 10000, soit deux chapitres de solde : inaccessible en début de run.
- **Démonter les pièces** (7000-12000, sans coût) reste la source de revenus la plus rentable.
- **Fuite mineure** n'offre que des options Mécanique ; c'est la P_base à 85 de
  « Réparer proprement » qui garantit une issue aux autres profils.
- Les skills qui montent créent une **boucle positive** : elle est assumée, compensée
  par un plancher haut sur les options difficiles et par la possibilité de perdre des skills.

---

## Conventions de travail

- Réponses et commentaires de code **en français**.
- Pas de dépendance lourde sans raison : le projet doit rester déployable en statique.
- Pas de `localStorage` mocké : la persistance locale est une vraie contrainte fonctionnelle.
- Toute nouvelle option d'événement doit déclarer : skill gouvernant, P_base,
  coût éventuel, 1-2 gains, 1-2 pertes, et une note explicative.
