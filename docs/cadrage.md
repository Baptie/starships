# Document de cadrage — Jeu spatial roguelite navigateur

*Version 6*

---

## 1. Résumé du concept

Un jeu sur navigateur où le joueur dirige un vaisseau spatial et son équipage lors d'une expédition. Chaque partie ("run") dure 3 à 5 minutes et se joue exclusivement au clic : une succession d'écrans d'événements, chacun proposant 2 à 3 décisions. L'objectif est de découvrir le plus de planètes possible avant que le vaisseau ne soit perdu.

La mort est permanente : à chaque nouvelle partie, un nouveau vaisseau est généré. Une monnaie spéciale, récupérée sur des planètes rares appelées **Anomalies**, persiste entre les runs et permet de débloquer des avantages de départ.

**Référence d'inspiration** : Destiny Eleven, pour la simplicité du modèle « décision → résultat simulé → conséquence chiffrée », sans gameplay d'action.

---

## 2. Contraintes du projet

| Contrainte | Détail |
|---|---|
| Plateforme | Navigateur, version mobile privilégiée |
| Architecture | Front seul, stockage en cache utilisateur — pas de back-end |
| Format de partie | Runs courtes, 3 à 5 minutes |
| Interaction | Clics sur des boutons uniquement — aucun déplacement, aucune action en temps réel |
| Objectif produit | Potentiel viral |
| Mécaniques | Volontairement peu nombreuses et simples |
| Monétisation | Aucune |
| Classement | Aucun |

---

## 3. Boucle de jeu

1. **Génération** — un nom de vaisseau est tiré aléatoirement. Les jauges sont initialisées, avec les bonus permanents éventuels du joueur.
2. **Ouverture de chapitre** — une galaxie au nom généré est annoncée.
3. **Écran d'événement** — une situation est décrite, 2 à 3 boutons sont proposés.
4. **Résolution** — le choix modifie une ou deux jauges ; un texte décrit la conséquence.
5. **Répétition** — 2 à 4 événements par chapitre, puis passage au chapitre suivant.
6. **Fin de run** — déclenchée quand une jauge physique atteint zéro.
7. **Écran de statistiques** — bilan du run, message de fin contextualisé, monnaie gagnée.

---

## 4. Structure en chapitres

Un run est découpé en **chapitres**, chacun correspondant à l'exploration d'une **galaxie au nom généré aléatoirement**.

- Chaque chapitre contient **2 à 4 événements**, tirés aléatoirement.
- Le changement de chapitre sert de respiration narrative et de repère de progression pour le joueur.
- Le nom de galaxie enrichit le récapitulatif de fin de run (« perdu dans la galaxie X »).

Longueur cible d'un run : environ 8 à 12 événements, soit 3 à 4 chapitres. *(À valider en test.)*

---

## 5. Système de statistiques

Toutes les statistiques sont sur une **échelle 0 à 100**.

### 5.1 Jauges physiques — atteindre zéro termine le run

- **Carburant** — initial 100
- **Coque** — initial 100

Ce sont les deux seules conditions de défaite.

### 5.2 Stats — ni défaite, ni modulateur

- **Moral** — initial 70
- **Réputation** — initial 50

Ce sont de simples cibles de gains et de pertes. Elles ne modulent aucun tirage.

### 5.3 Monnaie de run

Une monnaie **propre au run**, distincte de la monnaie d'Anomalie qui, elle, persiste entre les parties.

- Montant de départ : **2000**
- **Solde de mission : +5000 à l'ouverture de chaque chapitre**, versée par la station commanditaire qui a affrété le vaisseau
- Sert à payer les options à coût monétaire
- Perdue en fin de run *(la conversion éventuelle vers la monnaie d'Anomalie sera arbitrée avec les événements de type planète)*

La solde donne à l'économie un revenu de base indépendant des événements rencontrés, et fait du passage de chapitre un moment de respiration. Elle justifie aussi narrativement l'expédition : l'équipage est mandaté, pas errant.

### 5.4 Skills — évoluent au fil des décisions

- **Combat**, **Mécanique**, **Relationnel**, **Exploration**

Chaque option déclare le skill qui la gouverne. Les skills **montent en cas de réussite et peuvent descendre en cas d'échec** — ce qui contrebalance la boucle positive de progression.

**Règle de cohérence** : le skill gagné ou perdu par une option est toujours celui qui la gouverne.

**Profil de départ** : répartition d'un budget de 200 points sur les 4 skills, chacun entre 20 et 80.

### 5.5 Séquence de résolution

**1. Le coût est prélevé** — immédiatement, quel que soit le résultat. Une option peut coûter du carburant, de la monnaie ou de la réputation.

**2. Calcul de la probabilité**

```
P_final = P_base + (Skill - 50) × 0,7
```

Borné entre 5 % et 95 %. Point neutre à 50.

**3. Tirage** d'un jet d100. Réussite si le jet est inférieur ou égal à `P_final`.

**4. Détection du critique**

```
Fenêtre de réussite critique = 5 + Skill × 0,10   (plafonnée par P_final)
Fenêtre d'échec critique     = 15 - Skill × 0,10
```

Le jet est une réussite critique s'il tombe dans la fenêtre basse, un échec critique s'il tombe dans la fenêtre haute. Un skill à 0 donne 5 % de réussite critique et 15 % d'échec critique ; un skill à 100 inverse exactement le rapport.

**5. Application des effets** — une option peut toucher **jusqu'à deux statistiques en gain et deux en perte**.

### 5.6 Règles d'effet

**Fourchettes** — un montant écrit `8000-12000` est tiré au hasard dans l'intervalle à chaque résolution.

**Critiques** — les effets sont **doublés**. Sur une fourchette, on prend directement la borne haute (gain maximal en réussite critique, perte maximale en échec critique).

### 5.7 Courbe de difficulté — plancher haut, liberté croissante

Les skills montent au cours du run, ce qui rend les tirages de plus en plus favorables. Cette boucle est assumée et compensée de deux façons :

- **Les options difficiles ont une `P_base` basse** (30 %). Avec un skill à 20, elles tombent à 9 % ; avec un skill à 80, elles remontent à 51 %. Le profil de départ dicte donc le gameplay en début de run.
- **Chaque événement propose une option sécurisée** à `P_base` élevée (75-85 %), viable même sans le bon skill. Elle permet de traverser l'événement sans y gagner grand-chose, plutôt que de rester bloqué.
- **Les skills peuvent baisser** en cas d'échec, ce qui empêche la progression d'être strictement monotone.

**Exemple** — « Patrouille pirate » offre trois voies :

| Option | Skill | Profil |
|---|---|---|
| Combattre | Combat | Vaisseau militaire |
| Payer un péage | Relationnel | Vaisseau diplomate |
| Fuir | Exploration | Vaisseau explorateur |

### 5.8 Bornes de P_base

| Type d'option | P_base |
|---|---|
| Sécurisée | 85 % |
| Facile | 60 % |
| Moyenne | 45 % |
| Difficile | 30 % |

## 6. Système de planètes

### 6.1 L'objectif du run

L'objectif du joueur est de **découvrir des planètes**. Le nombre de planètes découvertes constitue le score principal du run.

### 6.2 L'événement de détection

Chaque planète détectée propose **3 choix** :

| Choix | Effet |
|---|---|
| **Explorer** | Tire aléatoirement le type de la planète parmi 4 (voir 6.3) et applique ses effets |
| **Scanner à distance** | Gain faible mais sûr, planète comptabilisée au score, aucun risque |
| **Ignorer** | Aucun effet, la planète n'est pas comptée |

### 6.3 Les 4 types de planète (tirés à l'exploration)

| Type | Probabilité | Effet |
|---|---|---|
| **Classique** | 50 % | Gain de 2000 à 5000 en monnaie de run |
| **Anomalie** | 10 % | Gain de 15000 à 20000 en monnaie de run, un peu de monnaie persistante, et un trophée de collection |
| **Paradisiaque** | 20 % | Le joueur peut choisir de s'arrêter ici : victoire, et conversion d'une partie de la monnaie de run en monnaie persistante (voir 6.4). S'il continue, le run se poursuit normalement |
| **Infernale** | 20 % | Débuff sévère : perte de 50 % de la monnaie de run ; la coque est ramenée à 10 % si elle était au-dessus. **Si la coque était déjà à 10 % ou moins, le vaisseau explose : fin de run.** |

### 6.4 La conversion de fin heureuse

Sur une planète Paradisiaque, s'arrêter convertit **0,01 % de la monnaie de run accumulée** en monnaie persistante.

*Exemple : 50000 de monnaie de run accumulée → 5 de monnaie persistante obtenue.*

C'est le seul moment du jeu où la monnaie de run, normalement perdue à la fin d'un run, produit un gain durable. Ça crée une tension directe avec la solde de chapitre et les gains d'exploration : plus le joueur a accumulé avant de tomber sur une Paradisiaque, plus l'arrêt est rentable — ce qui récompense un run prudent et prolongé plutôt qu'un arrêt précoce.

**Point à trancher** : la version précédente de ce document prévoyait qu'une planète paradisiaque refusée ait une probabilité de réapparition décroissante (table 100/70/50/30/10/5/2 selon le nombre de refus). Avec la nouvelle structure, chaque exploration tire indépendamment 20 % de chance de tomber sur une Paradisiaque — la décroissance n'a plus de sens telle quelle. À confirmer : le taux reste fixe à 20 % à chaque exploration, ou faut-il réintroduire une décroissance après plusieurs refus consécutifs ?

### 6.5 Génération procédurale de planète

Chaque planète est générée sur 5 caractéristiques combinables, indépendamment de son type :

| Caractéristique | Valeurs |
|---|---|
| Climat | Infernal · Chaud · Tempéré · Froid · Glacial |
| Terrain | Eau · Jungle · Désert rocailleux · Désert glacé · Gaz |
| Atmosphère | Inexistante · Toxique · Irrespirable · Respirable · Dense |
| Système stellaire | Planète errante · 1 soleil · 2 soleils · 3 soleils · Trou noir · Étoile à neutrons |
| Écosystème | Pas de vie · Vie primitive · Vie animale · Vie intelligente · Société complexe établie |

**Rareté pondérée** : certaines valeurs sont tirées avec une probabilité plus faible (un système à 3 soleils, un trou noir, une société complexe établie). Un nom de planète aux composantes rares signale visuellement une découverte notable, indépendamment du type tiré à l'exploration.

#### Génération du nom

```
[Préfixe — Système] + [Racine aléatoire] + [Suffixe — Climat]
```

| Système | Préfixe | Climat | Suffixe |
|---|---|---|---|
| Errante | Kesh- | Infernal | -agon |
| 1 soleil | Sol- | Chaud | -ora |
| 2 soleils | Bi- | Tempéré | -eth |
| 3 soleils | Tri- | Froid | -ice |
| Trou noir | Abys- | Glacial | -friz |
| Étoile à neutrons | Puls- | | |

Racine tirée dans une banque dédiée (*-tara, -mund, -oth, -vex, -illia, -kar, -nyx…*, à étoffer). Exemple : `Bi-Vex-ice`.

#### Génération de la description

Assemblée sur un gabarit fixe à partir des 3 caractéristiques restantes :

```
[Terrain] [Atmosphère], climat [Climat], [Écosystème].
```

*Exemple : « Désert rocailleux à l'atmosphère toxique, climat infernal, aucune vie détectée. »*

Le nom sert à l'identification rapide et à la collection ; la description porte le détail qui rend la découverte mémorable dans le récap partageable.

### 6.6 Anomalies et méta-progression

**La monnaie persistante** (obtenue sur les Anomalies et lors d'une fin heureuse) :
- est stockée **au niveau du joueur**, pas du run ;
- persiste après la mort du vaisseau ;
- permet de débloquer des avantages appliqués aux runs suivantes.

**Nature des avantages** — à définir dans une phase ultérieure. Principe directeur : des bonus de départ (jauge initiale augmentée, probabilité d'Anomalie accrue, budget de skills augmenté) plutôt que de nouvelles mécaniques à coder.

**Point de tuning critique** : le montant de monnaie persistante gagné par Anomalie, et le taux de conversion de la fin heureuse (0,01 %), doivent être calibrés ensemble pour qu'aucune des deux sources ne domine totalement l'autre.

### 6.7 Portefeuille de trophées

Chaque planète Anomalie découverte ajoute un trophée au portefeuille du joueur (persistant, comme la monnaie).

- **Le trophée est lié à la combinaison exacte des 5 caractéristiques** de la planète (nom complet + description), pas à un trophée générique « Anomalie découverte ».
- L'espace de combinaisons étant très large, le portefeuille offre un objectif de collection **quasi infini** — dans le même esprit combinatoire que la génération de planètes elle-même.
- Découvrir deux fois la même combinaison rare ne rapporte pas de nouveau trophée : c'est ce qui pousse à explorer davantage plutôt qu'à répéter les runs à l'identique.

---

## 7. Pool d'événements

Le détail chiffré — `P_base`, coût, gains, pertes, notes — est tenu dans l'onglet `Evenements` du classeur `calibrage-jeu-spatial.xlsx`. Onze événements sont calibrés à ce jour, répartis en quatre catégories. **Les événements de type planète sont en cours de refonte et ne figurent pas encore dans le pool.**

### 8.1 Ressources

| Événement | Options (skill) |
|---|---|
| Champ d'astéroïdes | Contourner (Exp, sécurisée) · Foncer (Exp) |
| Épave dérivante | Démonter les pièces (Méc) · Fouiller les registres (Exp) · Ignorer |
| Fuite mineure | Réparer proprement (Méc, sécurisée) · Colmater vite fait (Méc) |
| Station de ravitaillement | Négocier le plein (Rel) · Passer |

### 8.2 Combat

| Événement | Options (skill) |
|---|---|
| Patrouille pirate | Combattre (Cbt) · Payer un péage (Rel) · Fuir (Exp) |
| Créature accrochée à la coque | Repousser (Cbt) · Manœuvre brusque (Exp) |
| Drone de guerre autonome | Détruire (Cbt) · Brouiller ses capteurs (Méc) |

### 8.3 Équipage

| Événement | Options (skill) |
|---|---|
| Dispute à bord | Trancher fermement (Rel) · Laisser faire (Rel, sécurisée) |
| Fatigue accumulée | Repos forcé (déterministe) · Continuer (Rel) |

### 8.4 Réputation

| Événement | Options (skill) |
|---|---|
| Signal de détresse | Porter secours (Rel) · Réparer leur vaisseau (Méc) · Ignorer |
| Marché avec contrebandiers | Négocier (Rel) · Refuser (Exp) |

### 8.5 Points d'équilibrage à surveiller

- **Payer un péage** coûte 10000, soit deux chapitres de solde. L'option reste inaccessible pendant les premiers chapitres.
- **Démonter les pièces** (7000-12000, sans coût) reste la source de revenus la plus rentable, mais la solde de chapitre garantit désormais un revenu plancher.
- **Fuite mineure** ne propose que des options gouvernées par la Mécanique ; c'est la `P_base` de 85 % de « Réparer proprement » qui garantit une issue aux autres profils, pas une alternative de skill.

## 8. Fin de run et écran de statistiques

### 9.1 Fin positive — la planète paradisiaque

Un run peut se **gagner** : à l'exploration d'une planète, un tirage donne le type Paradisiaque (20 % de chance, voir 6.3). Le joueur choisit alors de s'installer ou de repartir.

- **S'installer** termine le run sur une victoire, avec la conversion décrite en 6.4.
- **Repartir** poursuit l'expédition pour continuer à faire monter le score de découverte et accumuler davantage de monnaie de run, au risque de tout perdre à un événement suivant.

C'est le dilemme central du jeu : la victoire et le score tirent dans des directions opposées. S'installer tôt sécurise une fin heureuse mais un score modeste ; repartir promet une conversion plus généreuse au prix du risque de naufrage.

Le message de fin est le seul positif du jeu, et devient de fait le récapitulatif le plus valorisant à partager.

*Ex : « L'équipage du [vaisseau] a posé le pied sur [nom de planète] après [n] planètes explorées. Personne n'a souhaité repartir. »*

### 9.2 Fins négatives — la perte du vaisseau

Deux causes possibles, chacune avec son message :

| Cause | Ton | Exemple |
|---|---|---|
| Carburant | Dérive lente, silencieuse | « Le [vaisseau] dérive désormais sans direction, à court de carburant à des années-lumière de tout secours. » |
| Coque | Spectaculaire, brutal | « Le [vaisseau] s'est disloqué en plein vol, incapable d'encaisser un dernier impact. » |

**Note de conception** : la suppression des vivres et de l'oxygène ramène le nombre de fins négatives de quatre à deux, ce qui appauvrit la variété des récapitulatifs partageables. Compensation recommandée : écrire **plusieurs variantes de message par cause**, tirées aléatoirement et enrichies du contexte du run (galaxie, dernier événement rencontré, skill dominant du vaisseau). Une fin « disloqué en plein vol après avoir foncé dans un champ d'astéroïdes » raconte plus qu'une fin générique.

### 9.3 Écran de statistiques

**L'écran de statistiques** affiche systématiquement, dans un format fixe et compact :
- le nom du vaisseau ;
- son profil de skills de départ ;
- le nombre de planètes découvertes ;
- la galaxie où le run s'est achevé ;
- le nombre de chapitres franchis ;
- le nombre d'Anomalies trouvées ;
- le message de fin correspondant à l'issue.

Ce format constant et court est le principal vecteur viral : il fonctionne comme le récapitulatif de fin de partie de Wordle, facile à comparer et à partager en capture d'écran.

## 9. Architecture technique

**Décision : application front uniquement, sans back-end.** L'ensemble de la logique de jeu et de la persistance s'exécute dans le navigateur, sur le modèle de Destiny Eleven.

**Front** — SPA légère, mobile-first. Contient le moteur de résolution (tables de probabilités pondérées par les jauges), les générateurs de noms, le pool d'événements, et l'affichage.

**Persistance** — stockage local du navigateur :
- données de run en cours : jauges, planètes découvertes, chapitre courant, seed ;
- données de joueur : monnaie d'Anomalie, avantages débloqués, historique de runs.

**Hébergement** — statique (Vercel, Netlify, ou équivalent). Coût quasi nul, aucune maintenance serveur.

### 10.1 Conséquences assumées de ce choix

| Point | Statut |
|---|---|
| Triche possible via la console | Sans impact : pas de classement, pas de compétition, pas de monétisation |
| Perte de progression si le cache est vidé | Risque réel — voir mitigation ci-dessous |
| Pas de multi-appareil | Assumé : la progression reste locale à un navigateur |
| Coût d'infrastructure | Nul |

### 10.2 Mitigation de la perte de progression

Le seul vrai risque est la disparition de la monnaie d'Anomalie si l'utilisateur vide son cache ou change de navigateur. Deux options simples, sans back-end :
- un export/import manuel de la sauvegarde sous forme de code à copier ;
- un avertissement explicite dans le jeu sur la nature locale de la sauvegarde.

Un back-end minimal pourra être ajouté ultérieurement si un classement ou une synchronisation devient souhaitable — mais ce n'est pas nécessaire au lancement.

---

## 10. Direction artistique

**Minimaliste, thème spatial.** Piste retenue : un pixel art travaillé, plus soigné que le pixel art rétro classique — lisible sur petit écran, économique à produire, cohérent avec le format texte + boutons.

Principes :
- fond sombre, palette restreinte ;
- typographie lisible, priorité absolue sur mobile ;
- les jauges sont l'élément visuel permanent : elles doivent être lisibles en un coup d'œil ;
- illustrations d'événement optionnelles, jamais bloquantes pour le développement.

---

## 11. Annexe — calibrage

Le classeur `calibrage-jeu-spatial.xlsx` accompagne ce document : il contient les valeurs initiales, le tableau des options à remplir et un simulateur de formule.

### 12.1 Valeurs initiales

| Statistique | Famille | Échelle | Valeur initiale |
|---|---|---|---|
| Carburant | Physique | 0-100 | 100 |
| Coque | Physique | 0-100 | 100 |
| Moral de l'équipage | Virtuelle | 0-10 | 7 |
| Réputation galactique | Virtuelle | 0-10 | 5 |
| Combat | Skill | 0-10 | tiré au départ |
| Mécanique | Skill | 0-10 | tiré au départ |
| Relationnel | Skill | 0-10 | tiré au départ |
| Exploration | Skill | 0-10 | tiré au départ |

Les skills sont répartis à la génération sur un budget fixe (proposition : 20 points, chacun entre 2 et 8).

### 12.2 Tableau des options

Le détail par option — `P_base`, jauge gouvernante, skill de catégorie, effets en cas de réussite et d'échec — est tenu dans l'onglet `Evenements` du classeur.

Rappels pour le remplissage :
- `P_base` s'exprime en pourcentage entier, avant application de la formule ;
- une option ne référence qu'une seule jauge virtuelle, en plus du skill de sa catégorie ;
- un événement ne touche qu'une ou deux statistiques au maximum ;
- garder au moins une option déterministe par événement donne au joueur une porte de sortie sûre.

## 12. Points restant à trancher

1. **Taux de la planète Paradisiaque après refus** — fixe à 20 % à chaque exploration, ou décroissance après plusieurs refus consécutifs ? (voir 6.4)
2. **Calibrage croisé** monnaie persistante d'Anomalie / taux de conversion de la fin heureuse (0,01 %), pour équilibrer les deux sources.
3. **Banque de racines** pour la génération de nom de planète — liste complète à écrire.
4. **Pondération de rareté** précise pour Système stellaire et Écosystème (quelles valeurs sont rares, à quel taux).
5. **Monnaie de run à zéro** — simple plancher bloquant les options payantes, ou cinquième condition de fin de run ?
6. **Équilibrage économique** — voir les points de la section 8.5.
7. **Paliers de conditionnement** — seuils de skill ou de stat rendant une option indisponible plutôt qu'improbable.
8. **Liste des avantages déblocables** avec la monnaie persistante, et leur coût.
9. **Nombre de chapitres** par run : fixe ou variable jusqu'à l'une des deux issues ?
10. **Variantes de messages de fin** — nombre de formulations par cause, et éléments de contexte injectés.
