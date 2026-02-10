# Detail des Estimations -- ConcepteurBiere

Ce document explique comment chaque valeur est calculee, les hypotheses utilisees, les limites de ces estimations, et comment les ajuster en mode expert.

---

## Principes generaux

Toutes les estimations sont calculees en temps reel dans `src/lib/calculations.ts` et `src/lib/waterCalc.ts`. Elles utilisent des formules brassicoles standard simplifiees pour un contexte amateur. **Les resultats reels dependent de votre equipement, de la fraicheur de vos ingredients, et de votre processus.**

### Hypotheses par defaut

L'application utilise les constantes suivantes, definies pour un brasseur amateur avec un equipement standard :

| Parametre | Valeur par defaut | Description |
|---|---|---|
| Efficacite d'empatage | 72 % | Rendement d'extraction des sucres des grains |
| Absorption grains | 0.8 L/kg | Eau retenue par les grains apres filtration |
| Pertes fixes | 1.0 L | Pertes fond de cuve, transferts, etc. |
| Evaporation | 2.0 L/h | Eau evaporee pendant l'ebullition |
| Ratio empatage | 2.7 L/kg | Litres d'eau par kg de grain pour l'empatage |
| Pertes trub | 0.5 L | Residus de houblon et proteines en fin d'ebullition |

Ces valeurs sont des estimations conservatrices. Elles conviennent pour la majorite des systemes amateurs (cuve 30-40 L, chauffe gaz ou electrique, filtration par sac ou cuve-filtre).

---

## OG -- Densite Initiale (methode PPG)

### Formule

```
OG = 1 + somme(masse_lbs x PPG x efficacite) / (volume_gal x 1000)
```

Ou :
- **masse_lbs** = masse du malt en livres (kg x 2.20462)
- **PPG** (Points Per Pound per Gallon) = (potential_gravity - 1) x 1000. Chaque malt du catalogue a une valeur de `potential_gravity`. Par exemple, le malt Pilsner a 1.037, donc PPG = 37.
- **efficacite** = 0.72 (72 %) pour les malts, 1.0 (100 %) pour les adjuvants (sucres)
- **volume_gal** = volume en gallons US (litres x 0.264172)

### Exemple de calcul

Pour 4 kg de malt Pilsner (potential_gravity = 1.037) dans 20 L avec 72 % d'efficacite :

```
masse_lbs = 4 x 2.20462 = 8.82 lbs
PPG = (1.037 - 1) x 1000 = 37
volume_gal = 20 x 0.264172 = 5.28 gal
gravity_points = 8.82 x 37 x 0.72 = 235.0
OG = 1 + 235.0 / (5.28 x 1000) = 1 + 0.0445 = 1.045
```

### Hypotheses et limites

- **L'efficacite reelle varie entre 60 % (debutant) et 85 % (systeme optimise)**. La valeur de 72 % est un compromis raisonnable pour un systeme amateur correctement utilise.
- Le concassage des grains, la duree d'empatage, le pH de l'eau et la methode de filtration influencent l'efficacite mais ne sont pas pris en compte dans le calcul.
- Les pertes (grains, trub, evaporation) ne sont pas deduites du volume dans le calcul de l'OG. Le volume utilise est le volume final cible.
- Les adjuvants (sucres, miel) sont calcules avec une efficacite de 100 % car ils se dissolvent entierement.

### Interpretation

| OG | Interpretation |
|---|---|
| < 1.035 | Biere tres legere (session) |
| 1.035 - 1.050 | Biere standard |
| 1.050 - 1.065 | Biere moyennement forte |
| 1.065 - 1.080 | Biere forte |
| > 1.080 | Biere tres forte (Barley Wine, Imperial) |

### Ajustement en mode expert

Si vous connaissez votre efficacite reelle (mesuree sur vos brassins precedents), vous pouvez adapter vos quantites de grain. Par exemple, si votre efficacite est de 65 % au lieu de 72 %, vous devrez utiliser environ 10 % de grain en plus pour atteindre la meme OG.

Formule d'ajustement :
```
masse_ajustee = masse_recette x (efficacite_recette / efficacite_reelle)
```

---

## FG -- Densite Finale

### Formule

```
FG = 1 + (OG - 1) x (1 - attenuation / 100)
```

Ou :
- **attenuation** = valeur propre a chaque levure du catalogue (en %). Si aucune levure n'est selectionnee, 75 % par defaut.

### Exemple de calcul

Avec OG = 1.050 et levure US-05 (attenuation 81 %) :

```
gravity_points = (1.050 - 1) x 1000 = 50
fg_points = 50 x (1 - 81/100) = 50 x 0.19 = 9.5
FG = 1 + 9.5 / 1000 = 1.010
```

### Hypotheses et limites

- L'attenuation reelle depend fortement de la **temperature d'empatage** :
  - Empatage a 62-64 deg.C : plus de sucres fermentescibles = attenuation reelle plus haute que la valeur nominale
  - Empatage a 68-70 deg.C : plus de dextrines = attenuation reelle plus basse
  - Cette interaction n'est pas modelisee dans le calcul actuel.
- Le stress de la levure, la sante du starter, l'oxygenation du mout et la temperature de fermentation influencent aussi l'attenuation.
- Certaines levures peuvent sous-performer si les conditions ne sont pas ideales.

### Interpretation

| FG | Interpretation |
|---|---|
| < 1.005 | Tres seche |
| 1.005 - 1.010 | Seche a moyenne |
| 1.010 - 1.015 | Corps moyen |
| 1.015 - 1.020 | Ronde et douce |
| > 1.020 | Tres ronde/sucree |

---

## ABV -- Taux d'Alcool

### Formule

```
ABV = (OG - FG) x 131.25
```

### Hypotheses et limites

- C'est la formule simplifiee classique, derivee de la relation de Balling.
- **Precise a environ +/- 0.3 % pour les bieres jusqu'a 8 % ABV**.
- Pour les bieres tres fortes (> 10 %), des formules plus complexes existent (formule de Hall, formule de Cutaia-Reid-Speers) mais l'ecart reste faible (< 0.5 %).
- Le sucre de refermentation ajoute environ 0.3-0.5 % d'ABV supplementaire, non comptabilise dans ce calcul.
- La formule ne prend pas en compte la densite du CO2 dissous.

### Exemple

```
OG = 1.052, FG = 1.012
ABV = (1.052 - 1.012) x 131.25 = 0.040 x 131.25 = 5.25 %
```

---

## IBU -- Amertume (formule Tinseth)

### Formule

```
utilisation = bignessFactor x boilTimeFactor

bignessFactor = 1.65 x 0.000125^(OG - 1)
boilTimeFactor = (1 - e^(-0.04 x temps_min)) / 4.15

IBU = somme( (alpha_acid / 100) x utilisation x masse_g x 1000 / volume_L )
```

Pour chaque ajout de houblon, on calcule :
- **bignessFactor** : un mout plus dense extrait moins d'amertume (les sucres « protegent » contre l'isomerisation)
- **boilTimeFactor** : plus le houblon est bouilli longtemps, plus il y a d'isomerisation (jusqu'a un plafond)
- **utilisation** : le produit des deux facteurs, typiquement entre 0.05 (5 min) et 0.25 (60 min)

### Exemple de calcul

25 g de Saaz (3.5 % AA) a 60 min dans 20 L avec OG = 1.045 :

```
bignessFactor = 1.65 x 0.000125^(1.045 - 1) = 1.65 x 0.000125^0.045
             = 1.65 x 0.652 = 1.076
boilTimeFactor = (1 - e^(-0.04 x 60)) / 4.15
               = (1 - e^(-2.4)) / 4.15
               = (1 - 0.0907) / 4.15
               = 0.219
utilisation = 1.076 x 0.219 = 0.236

IBU = (3.5 / 100) x 0.236 x 25 x 1000 / 20
    = 0.035 x 0.236 x 25000 / 20
    = 0.035 x 0.236 x 1250
    = 10.3 IBU
```

### Hypotheses et limites

- La formule Tinseth est une approximation empirique. Elle est consideree comme la plus fiable pour les brassins amateurs, mais reste une estimation.
- **Houblonnage tardif** (< 5 min) : la formule sous-estime parfois l'amertume reelle, car le mout reste chaud pendant le refroidissement.
- **Dry-hop** : le houblonnage a froid n'est PAS pris en compte dans le calcul des IBU (pas de champ dedie dans le wizard actuel).
- **Forme du houblon** : les pellets (granules) donnent environ 10 % d'IBU en plus que les cones entiers, car ils se dispersent mieux. Ce facteur n'est pas ajuste dans le calcul.
- **Vigueur de l'ebullition** : une ebullition plus vigoureuse augmente l'isomerisation. La formule ne prend pas ce facteur en compte.

### Interpretation

| IBU | Interpretation | Exemple de style |
|---|---|---|
| 5-15 | Tres douce | Blanche, Berliner |
| 15-25 | Douce | Blonde, Lager |
| 25-35 | Moderee | Pale Ale, Ambrée |
| 35-50 | Prononcee | IPA |
| 50-70 | Forte | Double IPA |
| 70+ | Tres forte | Imperial IPA |

---

## EBC -- Couleur (methode Morey)

### Formule

La methode Morey convertit la couleur des malts en une estimation de la couleur de la biere finie, en passant par l'echelle MCU (Malt Color Units) :

```
Lovibond = (EBC_malt + 1.2) / 2.026      (conversion EBC -> Lovibond)
MCU = somme(Lovibond x masse_lbs / volume_gal)
SRM = 1.4922 x MCU^0.6859
EBC = SRM x 1.97
```

Ou :
- **EBC_malt** = couleur EBC de chaque malt (donnee du catalogue)
- **masse_lbs** = masse en livres
- **volume_gal** = volume en gallons US

### Exemple de calcul

4 kg de Pilsner (3 EBC) + 0.3 kg de Crystal 60 (120 EBC) dans 20 L :

```
Pilsner :
  Lovibond = (3 + 1.2) / 2.026 = 2.07
  masse_lbs = 4 x 2.20462 = 8.82
  MCU_pilsner = 2.07 x 8.82 / 5.28 = 3.46

Crystal :
  Lovibond = (120 + 1.2) / 2.026 = 59.8
  masse_lbs = 0.3 x 2.20462 = 0.66
  MCU_crystal = 59.8 x 0.66 / 5.28 = 7.48

MCU_total = 3.46 + 7.48 = 10.94
SRM = 1.4922 x 10.94^0.6859 = 1.4922 x 6.58 = 9.82
EBC = 9.82 x 1.97 = 19.3
```

Resultat : environ 19 EBC, soit une biere doree.

### Hypotheses et limites

- La couleur EBC de chaque malt provient du catalogue (valeur indicative du fabricant). La couleur reelle peut varier d'un lot a l'autre.
- L'ebullition fonce legerement la biere (reaction de Maillard), ce qui n'est pas pris en compte.
- Les adjuvants colores (cafe, cacao, fruits rouges...) ne sont pas inclus dans le calcul.
- La methode Morey est une approximation logarithmique. Elle est moins precise pour les MCU tres eleves (bieres tres foncees) ou tres faibles (bieres ultra-pales).

### Interpretation

| EBC | Couleur | Exemples |
|---|---|---|
| < 8 | Tres pale | Pilsner |
| 8-15 | Blonde | Blonde, Kolsch |
| 15-25 | Doree | Pale Ale |
| 25-35 | Ambree | Ambrée, Bitter |
| 35-50 | Cuivree | IPA, Dubbel |
| 50-70 | Brune | Brown Ale, Porter |
| 70-100 | Brun fonce | Stout |
| > 100 | Noire | Imperial Stout |

---

## CO2 -- Carbonatation

### Formule (embouteillage)

```
CO2_volumes = sucre_g/L / 4 + 0.85
```

### Parametres

- **sucre_g/L** : grammes de sucre par litre ajoute a l'embouteillage (4-10 g/L)
- **0.85** : CO2 residuel estime dans la biere apres fermentation. Cette valeur suppose une temperature de fin de fermentation d'environ 20 deg.C. A plus basse temperature, le CO2 residuel est plus eleve (la biere retient plus de gaz a froid).

### Exemple

```
Sucre = 6 g/L
CO2_volumes = 6 / 4 + 0.85 = 1.5 + 0.85 = 2.35 volumes
```

C'est une carbonatation standard, agreable pour la plupart des styles.

### Hypotheses et limites

- La constante 0.85 est une approximation pour une fermentation a 20 deg.C. Pour une lager fermentee a 12 deg.C, le CO2 residuel est plus proche de 1.0-1.1.
- Pour un fut, un defaut de 2.5 volumes est utilise (carbonatation forcee au CO2 externe).
- La formule est une simplification lineaire, valable entre 4-10 g/L de sucre. Au-dela, la relation n'est plus lineaire et le risque de surpression augmente fortement.

### Interpretation

| Volumes CO2 | Interpretation | Exemples |
|---|---|---|
| < 1.8 | Peu petillante | Cask Ale anglaise |
| 1.8-2.3 | Legerement petillante | Bitter, Brown Ale |
| 2.3-2.8 | Standard | Pale Ale, Lager |
| 2.8-3.3 | Bien petillante | Blanche, Saison |
| > 3.3 | Tres petillante | Lambic, Gueuze |

---

## Valeurs typiques par style

| Style | OG | FG | ABV | IBU | EBC |
|---|---|---|---|---|---|
| Blonde | 1.040-1.050 | 1.008-1.012 | 4-5.5 % | 15-25 | 6-12 |
| Ambrée | 1.045-1.055 | 1.010-1.015 | 4.5-6 % | 20-35 | 20-35 |
| Brune | 1.045-1.060 | 1.012-1.018 | 4.5-6 % | 15-25 | 40-70 |
| IPA | 1.055-1.070 | 1.010-1.015 | 5.5-7.5 % | 40-70 | 10-25 |
| Stout | 1.045-1.065 | 1.010-1.018 | 4-6.5 % | 25-45 | 60-100+ |
| Blanche | 1.040-1.050 | 1.008-1.012 | 4-5 % | 10-20 | 4-10 |
| Pilsner | 1.042-1.050 | 1.008-1.012 | 4-5.5 % | 25-40 | 4-8 |
| Saison | 1.048-1.065 | 1.002-1.008 | 5-8 % | 20-35 | 6-15 |

---

## Comment ameliorer la precision

1. **Mesurer votre efficacite reelle** : brassez 2-3 fois, mesurez l'OG avec un densimetre, et calculez votre efficacite personnelle avec la formule :
   ```
   efficacite = (OG_mesuree - 1) x volume_L / somme(masse_kg x PPG_malt x 0.001)
   ```
   Puis ajustez vos quantites de grain en consequence.

2. **Mesurer vos pertes** : notez le volume avant et apres ebullition pour connaitre votre taux d'evaporation reel. Notez le volume final dans le fermenteur pour connaitre vos pertes totales.

3. **Calibrer l'absorption des grains** : mesurez le volume de mout recupere apres filtration et comparez avec le volume d'eau ajoute. La difference divisee par le poids de grain donne votre absorption reelle.

4. **Utiliser un densimetre** : comparez l'OG mesuree a l'OG estimee pour ajuster. Si l'OG mesuree est systematiquement 5-10 points en dessous, augmentez vos quantites de grain ou optimisez votre empatage.

5. **Peser precisement** : une balance au gramme fait une grande difference, surtout pour les houblons et le sucre de refermentation.

### Ajustements pour le mode expert

En mode expert, vous pouvez affiner votre brassage en prenant en compte :

- **Votre efficacite reelle** : utilisez la valeur mesuree au lieu de 72 % pour dimensionner vos grains.
- **Vos pertes reelles** : si vous savez que votre systeme perd 1.5 L au lieu de 1.0 L, ajustez vos volumes d'eau en consequence.
- **Votre taux d'evaporation** : mesurez-le en brassant une fois avec de l'eau seule si necessaire.
- **Le pH de l'eau** : un pH d'empatage de 5.2-5.4 optimise l'activite enzymatique et donc l'efficacite. Des sels de brassage peuvent etre necessaires.
- **La forme du houblon** : les pellets donnent environ 10 % d'IBU en plus que les cones. Ajustez vos quantites si vous utilisez des cones.

---

## Reference technique

Le code source des calculs se trouve dans les fichiers suivants :

- `src/lib/calculations.ts` : OG, FG, ABV, IBU, EBC, CO2
- `src/lib/waterCalc.ts` : volumes d'eau (empatage, rincage, pertes)
- `src/lib/recipeProcedure.ts` : generation de la procedure de fabrication
- `src/lib/riskRules.ts` : regles de detection de risques
- `src/lib/validation.ts` : validation des saisies par etape
