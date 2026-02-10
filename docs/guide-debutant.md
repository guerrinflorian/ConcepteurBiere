# Guide du Débutant — ConcepteurBière

Bienvenue ! Ce guide vous accompagne pas à pas pour créer votre première recette de bière avec ConcepteurBière. Aucune connaissance préalable n'est nécessaire.

---

## C'est quoi, brasser de la bière ?

Brasser, c'est transformer des céréales (principalement de l'orge maltée) en bière, grâce à l'eau, au houblon et à la levure. Voici les grandes étapes :

1. **Empâtage** : on trempe les grains dans de l'eau chaude (~66°C) pour en extraire les sucres.
2. **Ébullition** : on fait bouillir le moût (le jus sucré) et on ajoute du houblon pour l'amertume et l'arôme.
3. **Refroidissement** : on refroidit le moût rapidement pour éviter les contaminations.
4. **Fermentation** : on ajoute la levure qui transforme les sucres en alcool et en CO₂.
5. **Conditionnement** : on met en bouteilles avec un peu de sucre pour la carbonatation, ou en fût.

ConcepteurBière vous guide à travers chacune de ces étapes et calcule automatiquement les caractéristiques de votre bière (alcool, amertume, couleur…).

---

## Comment utiliser l'application

### Mode Débutant / Expert

En haut de l'écran, vous pouvez choisir entre **Débutant** et **Expert** :

- **Mode Débutant** (recommandé pour commencer) :
  - Explications détaillées à chaque étape
  - Checklists d'hygiène ouvertes avec conseils complets
  - Interprétations simples des valeurs (« amertume faible », « couleur blonde »…)
  - Seuls les champs essentiels sont mis en avant

- **Mode Expert** :
  - Informations compactes
  - Formules de calcul visibles
  - Checklists repliables

### Les 9 étapes du wizard

#### Étape 0 — Profil & Matériel
- Indiquez si vous êtes amateur ou professionnel.
- Cochez le matériel que vous possédez. L'application adaptera ses conseils.
- **Minimum nécessaire** : une cuve, un fermenteur, un thermomètre. Un densimètre est très recommandé.

#### Étape 1 — Paramètres de base
- Donnez un nom à votre recette (optionnel).
- Choisissez le volume (20L est standard pour un amateur).
- Choisissez un style cible (optionnel) : l'application comparera vos valeurs aux fourchettes du style.

#### Étape 2 — Malts & Céréales
- Le **malt de base** constitue la majorité du grain (≥60%). Il fournit les sucres.
- Les **malts spéciaux** (5-20%) apportent couleur et saveurs : caramel, biscuit, chocolat…
- **Quantité typique** : 4-6 kg pour 20L.
- Les **adjuvants** (sucres, épices, fruits) sont optionnels.

#### Étape 3 — Houblons
- Le houblon apporte **amertume** (ajout en début d'ébullition) et **arômes** (ajout tardif).
- Le **timing** est crucial : 60 min = amertume pure, 0 min = arômes purs.
- **Quantité typique** : 20-50 g pour 20L.

#### Étape 4 — Levure
- La levure transforme les sucres en alcool.
- **Ale** : fermente à 18-22°C (température ambiante).
- **Lager** : fermente à 8-15°C (nécessite un frigo).
- L'application ajuste automatiquement la température de fermentation.

#### Étape 5 — Empâtage & Ébullition
- **Température d'empâtage** (60-72°C) : basse = bière sèche, haute = bière ronde.
- **Durée d'ébullition** : 60 min standard, 90 min pour les Pilsners.

#### Étape 6 — Fermentation
- Maintenez la température stable (±2°C).
- **Durée** : 7-14 jours (ale) ou 14-21 jours (lager).
- La fermentation secondaire est optionnelle (pour clarifier ou ajouter des ingrédients).

#### Étape 7 — Conditionnement
- **Embouteillage** : ajoutez du sucre (5-7 g/L) pour la carbonatation naturelle. Attendez 2-3 semaines.
- **Fût** : carbonatation forcée avec CO₂ externe.
- ⚠️ Ne mettez pas trop de sucre (>8 g/L = risque de surpression).

#### Étape 8 — Résumé
- Vérifiez toutes les valeurs.
- Exportez votre recette en JSON.
- Imprimez pour le jour du brassage.

### L'Assistant anti-erreurs

L'assistant surveille votre recette en temps réel :

- **Badge d'alertes** (en haut) : cliquez pour voir les risques détectés.
- **Checklist d'hygiène** : à chaque étape, cochez les bonnes pratiques.
- **Risques** : l'assistant vous prévient si un paramètre est dangereux (sucre trop élevé, température hors plage, cuve trop petite…).

### Le Lexique

Cliquez sur **📖 Lexique** en haut pour accéder au glossaire complet. Vous y trouverez :
- Toutes les abréviations (OG, FG, IBU, EBC, ABV…)
- Les termes techniques (empâtage, dry-hop, DMS…)
- Les défauts courants et comment les éviter

---

## Votre première recette : une Blonde simple

Voici un point de départ pour 20 litres :

| Paramètre | Valeur |
|---|---|
| Style | Blonde |
| Volume | 20 L |
| Malt de base | Pilsner — 4 kg |
| Malt spécial | Carapils — 0.3 kg |
| Houblon (60 min) | Saaz — 25 g |
| Houblon (10 min) | Saaz — 15 g |
| Levure | US-05 |
| Empâtage | 66°C pendant 60 min |
| Ébullition | 60 min |
| Fermentation | 20°C pendant 10 jours |
| Sucre | 6 g/L |

**Résultat attendu** : ~4.5% ABV, ~20 IBU, ~8 EBC (blonde dorée), peu amère, facile à boire.

---

## Les erreurs les plus courantes

1. **Mauvaise hygiène** : Désinfectez TOUT ce qui touche le moût après ébullition.
2. **Embouteiller trop tôt** : La fermentation n'est pas toujours terminée au bout de 7 jours. Mesurez la FG 2 jours de suite.
3. **Trop de sucre** : >8 g/L = risque d'explosion de bouteilles.
4. **Température de fermentation instable** : Essayez de maintenir ±2°C.
5. **Impatience** : La bière a besoin de temps. Laissez au moins 2-3 semaines de refermentation en bouteille.

---

## Liens utiles

- [Lexique complet](./lexique.md)
- [Détail des estimations](./estimations.md)
- [Étendre l'assistant](./assistant.md)
