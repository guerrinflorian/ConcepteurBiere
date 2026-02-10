# Détail des Estimations — ConcepteurBière

Ce document explique comment chaque valeur est calculée, les hypothèses utilisées, et les limites de ces estimations.

---

## Principes généraux

Toutes les estimations sont calculées en temps réel dans `src/lib/calculations.ts`. Elles utilisent des formules brassicoles standard simplifiées pour un contexte amateur. **Les résultats réels dépendent de votre équipement, de la fraîcheur de vos ingrédients, et de votre processus.**

---

## OG — Densité Initiale

### Formule (méthode PPG)
```
OG = 1 + Σ(masse_lbs × PPG × efficacité) / (volume_gal × 1000)
```

### Paramètres
- **PPG** (Points Per Pound per Gallon) : extrait de `potential_gravity` de chaque malt. Ex : Pilsner à 1.037 → 37 PPG
- **Efficacité d'empâtage** : fixée à **72%** (valeur typique pour un brasseur amateur)
- **Adjuvants** : efficacité 100% (les sucres se dissolvent entièrement)

### Hypothèses et limites
- L'efficacité réelle varie entre 60% (débutant) et 85% (pro). 72% est un compromis.
- Le concassage, la durée d'empâtage, et le pH influencent l'efficacité mais ne sont pas pris en compte.
- Les pertes (grains, trub, évaporation) ne sont pas déduites du volume.

### Comment interpréter
| OG | Interprétation |
|---|---|
| < 1.035 | Bière très légère |
| 1.035 – 1.050 | Bière standard |
| 1.050 – 1.065 | Bière moyennement forte |
| 1.065 – 1.080 | Bière forte |
| > 1.080 | Bière très forte |

---

## FG — Densité Finale

### Formule
```
FG = 1 + (OG - 1) × (1 - atténuation% / 100)
```

### Paramètres
- **Atténuation** : valeur propre à chaque levure (75-90% pour les levures du catalogue)
- Si aucune levure n'est sélectionnée, une atténuation de 75% est utilisée par défaut

### Hypothèses et limites
- L'atténuation réelle dépend de la température d'empâtage (pas pris en compte ici)
- Un empâtage à 64°C donne une atténuation plus élevée qu'à 68°C
- Le stress de la levure, la santé du starter, et l'oxygénation influencent aussi le résultat

### Comment interpréter
| FG | Interprétation |
|---|---|
| < 1.005 | Très sèche |
| 1.005 – 1.010 | Sèche à moyenne |
| 1.010 – 1.015 | Corps moyen |
| 1.015 – 1.020 | Ronde et douce |
| > 1.020 | Très ronde/sucrée |

---

## ABV — Taux d'Alcool

### Formule
```
ABV = (OG - FG) × 131.25
```

### Hypothèses et limites
- Formule simplifiée classique. Précise à ±0.3% pour les bières < 8% ABV.
- Pour les bières très fortes (> 10%), des formules plus complexes existent mais l'écart reste faible.
- Le sucre de refermentation ajoute ~0.3-0.5% non comptabilisé dans ce calcul.

---

## IBU — Amertume

### Formule (Tinseth)
```
Utilisation = bignessFactor × boilTimeFactor
bignessFactor = 1.65 × 0.000125^(OG - 1)
boilTimeFactor = (1 - e^(-0.04 × temps_min)) / 4.15
IBU = Σ(alpha% × utilisation × masse_g × 1000 / volume_L)
```

### Paramètres
- **Alpha acid** : pourcentage d'acide alpha de chaque houblon (du catalogue)
- **Temps d'ébullition** : de 0 à 60+ minutes
- **OG** : la densité du moût (les moûts denses extraient moins d'amertume)
- **Volume** : le volume du brassin en litres

### Hypothèses et limites
- La formule Tinseth est une approximation. Elle sous-estime les houblonnages tardifs (< 5 min).
- Le dry-hop (houblonnage à froid) n'est PAS pris en compte (pas de champ dans le wizard).
- L'utilisation réelle dépend de la vigueur de l'ébullition et de la forme du houblon (pellets vs cônes).
- Les houblons en pellets donnent ~10% d'IBU en plus (non ajusté ici).

### Comment interpréter
| IBU | Interprétation | Exemple de style |
|---|---|---|
| 5 – 15 | Très douce | Blanche, Berliner |
| 15 – 25 | Douce | Blonde, Lager |
| 25 – 35 | Modérée | Pale Ale, Ambrée |
| 35 – 50 | Prononcée | IPA |
| 50 – 70 | Forte | DIPA |
| 70+ | Très forte | Imperial IPA |

---

## EBC — Couleur

### Formule (Morey adaptée)
```
MCU = Σ(lovibond × masse_lbs / volume_gal)
SRM = 1.4922 × MCU^0.6859
EBC = SRM × 1.97
```

### Conversion Lovibond
```
Lovibond ≈ (EBC_malt + 1.2) / 2.026
```

### Hypothèses et limites
- La couleur EBC de chaque malt provient du catalogue (valeur indicative du fabricant).
- L'ébullition fonce légèrement la bière (non pris en compte).
- Les adjuvants (café, cacao, fruits…) ne sont pas inclus dans le calcul de couleur.
- La méthode Morey est une approximation logarithmique, moins précise pour les MCU très élevés.

### Comment interpréter
| EBC | Couleur | Exemples |
|---|---|---|
| < 8 | Très pâle | Pilsner |
| 8 – 15 | Blonde | Blonde, Kölsch |
| 15 – 25 | Dorée | Pale Ale |
| 25 – 35 | Ambrée | Ambrée, Bitter |
| 35 – 50 | Cuivrée | IPA, Dubbel |
| 50 – 70 | Brune | Brown Ale, Porter |
| 70 – 100 | Brun foncé | Stout |
| > 100 | Noire | Imperial Stout |

---

## CO₂ — Carbonatation

### Formule (embouteillage)
```
CO₂_volumes ≈ sucre_g/L ÷ 4 + 0.85
```

### Paramètres
- **Sucre** : grammes de sucre par litre ajouté à l'embouteillage (4-10 g/L)
- **0.85** : CO₂ résiduel estimé dans la bière après fermentation (varie selon la température)

### Hypothèses et limites
- La constante 0.85 suppose une température de fin de fermentation ~20°C.
- Pour un fût, un défaut de 2.5 volumes est utilisé.
- La formule est une simplification linéaire, valable entre 4-10 g/L.

### Comment interpréter
| Volumes CO₂ | Interprétation | Exemples |
|---|---|---|
| < 1.8 | Peu pétillante | Cask Ale anglaise |
| 1.8 – 2.3 | Légèrement pétillante | Bitter, Brown Ale |
| 2.3 – 2.8 | Standard | Pale Ale, Lager |
| 2.8 – 3.3 | Bien pétillante | Blanche, Saison |
| > 3.3 | Très pétillante | Lambic, Gueuze |

---

## Valeurs typiques par style

| Style | OG | FG | ABV | IBU | EBC |
|---|---|---|---|---|---|
| Blonde | 1.040-1.050 | 1.008-1.012 | 4-5.5% | 15-25 | 6-12 |
| Ambrée | 1.045-1.055 | 1.010-1.015 | 4.5-6% | 20-35 | 20-35 |
| Brune | 1.045-1.060 | 1.012-1.018 | 4.5-6% | 15-25 | 40-70 |
| IPA | 1.055-1.070 | 1.010-1.015 | 5.5-7.5% | 40-70 | 10-25 |
| Stout | 1.045-1.065 | 1.010-1.018 | 4-6.5% | 25-45 | 60-100+ |
| Blanche | 1.040-1.050 | 1.008-1.012 | 4-5% | 10-20 | 4-10 |
| Pilsner | 1.042-1.050 | 1.008-1.012 | 4-5.5% | 25-40 | 4-8 |
| Saison | 1.048-1.065 | 1.002-1.008 | 5-8% | 20-35 | 6-15 |

---

## Comment améliorer la précision

1. **Mesurer votre efficacité réelle** : brassez 2-3 fois, mesurez l'OG avec un densimètre, et calculez votre efficacité personnelle.
2. **Utiliser un densimètre** : comparez l'OG mesurée à l'OG estimée pour ajuster.
3. **Prendre en compte les pertes** : ajoutez ~10-15% au volume pour compenser les pertes.
4. **Peser précisément** : une balance au gramme fait une grande différence.
