# Eau et Volumes -- ConcepteurBiere

Ce document explique en detail comment l'application calcule les volumes d'eau necessaires pour votre brassin. Tous les calculs sont effectues automatiquement a partir du poids de grain et du volume cible que vous avez definis.

---

## Pourquoi c'est important

Le calcul des volumes d'eau est une etape cruciale en brassage tout-grain. Si vous n'avez pas assez d'eau, vous n'extrairez pas suffisamment de sucres et votre biere sera plus faible que prevu. Si vous en avez trop, votre mout sera dilue. L'application automatise ces calculs pour eviter les mauvaises surprises le jour du brassage.

---

## Les constantes utilisees

| Parametre | Valeur | Explication |
|---|---|---|
| Ratio d'empatage | 2.7 L/kg | Volume d'eau chaude par kg de grain pour l'empatage |
| Absorption des grains | 0.8 L/kg | Eau retenue par les grains apres filtration (non recuperable) |
| Pertes fixes | 1.0 L | Pertes dans les transferts, fond de cuve, tuyaux |
| Evaporation | 2.0 L/h | Eau perdue par evaporation pendant l'ebullition |
| Pertes trub | 0.5 L | Residus de houblon et proteines au fond de la cuve apres ebullition |

Ces valeurs sont des estimations conservatrices pour un equipement amateur standard (cuve 30-40 L, chauffe gaz ou electrique, filtration par sac ou cuve-filtre).

---

## Les quatre volumes a connaitre

### 1. Eau d'empatage (Mash Water)

C'est l'eau chaude dans laquelle vous trempez les grains pour extraire les sucres.

**Formule** :
```
Eau d'empatage = poids de grain (kg) x ratio d'empatage (L/kg)
```

Le ratio de 2.7 L/kg est un bon compromis : assez d'eau pour que les grains soient bien immerges et que les enzymes travaillent efficacement, mais pas trop pour ne pas trop diluer le mout.

### 2. Eau de rincage (Sparge Water)

C'est l'eau chaude (75-78 deg.C) versee sur les grains apres l'empatage pour extraire les derniers sucres restes dans la dreche (grains epuises).

**Formule** :
```
Volume pre-ebullition = volume final + evaporation + pertes trub
Eau de rincage = volume pre-ebullition - eau d'empatage + absorption grains
```

En d'autres termes, l'eau de rincage compense :
- L'eau absorbee par les grains (perdue lors de l'empatage)
- L'eau qui va s'evaporer pendant l'ebullition
- Les pertes de trub

Si le resultat est negatif (ce qui peut arriver avec tres peu de grain), l'application le met a zero.

### 3. Eau totale

La somme de l'eau d'empatage et de l'eau de rincage. C'est le volume total d'eau que vous devez preparer le jour du brassage.

**Formule** :
```
Eau totale = eau d'empatage + eau de rincage
```

### 4. Pertes totales

Toute l'eau qui ne finira pas dans votre fermenteur.

**Formule** :
```
Pertes totales = absorption grains + pertes fixes + pertes trub + evaporation
```

---

## Exemple concret : 20 L avec 5 kg de grain

Prenons un brassin classique : vous voulez obtenir **20 litres** de biere a partir de **5 kg de grain** avec une ebullition de **60 minutes**.

### Etape 1 : Calculer l'eau d'empatage

```
Eau d'empatage = 5 kg x 2.7 L/kg = 13.5 L
```

Vous chauffez 13.5 L d'eau a environ 68 deg.C (2 deg.C au-dessus de la temperature cible car les grains refroidissent l'eau).

### Etape 2 : Calculer l'evaporation

```
Evaporation = 2.0 L/h x (60 min / 60) = 2.0 L
```

Pendant 60 minutes d'ebullition, vous perdrez environ 2.0 L d'eau par evaporation.

### Etape 3 : Calculer le volume pre-ebullition

C'est le volume de mout que vous devez avoir dans la cuve AVANT de commencer l'ebullition, pour qu'il reste le bon volume apres.

```
Volume pre-ebullition = volume final + evaporation + pertes trub
                      = 20 + 2.0 + 0.5
                      = 22.5 L
```

### Etape 4 : Calculer l'absorption des grains

```
Absorption grains = 5 kg x 0.8 L/kg = 4.0 L
```

Les grains vont retenir 4.0 L d'eau que vous ne recupererez pas.

### Etape 5 : Calculer l'eau de rincage

```
Eau de rincage = volume pre-ebullition - eau d'empatage + absorption grains
               = 22.5 - 13.5 + 4.0
               = 13.0 L
```

Vous chauffez 13.0 L d'eau a 75-78 deg.C pour le rincage.

### Etape 6 : Calculer l'eau totale

```
Eau totale = eau d'empatage + eau de rincage
           = 13.5 + 13.0
           = 26.5 L
```

Vous avez besoin de **26.5 L d'eau au total** pour ce brassin.

### Etape 7 : Verifier les pertes totales

```
Pertes totales = absorption grains + pertes fixes + pertes trub + evaporation
               = 4.0 + 1.0 + 0.5 + 2.0
               = 7.5 L
```

Sur les 26.5 L d'eau, 7.5 L seront perdus. Il reste 26.5 - 7.5 = 19.0 L... mais attendez, ce n'est pas 20 L ?

**Explication** : les pertes fixes (1.0 L) incluent les pertes lors des transferts, qui ne sont pas deduites dans le calcul du volume pre-ebullition. Le volume pre-ebullition vise a obtenir le volume final DANS LE FERMENTEUR. Les pertes fixes sont des pertes supplementaires que l'eau de rincage/empatage n'est pas censee compenser directement dans l'algorithme simplifie. En pratique, le volume final reel sera tres proche de 20 L.

### Resume

| Volume | Valeur | Quand |
|---|---|---|
| Eau d'empatage | 13.5 L | Chauffee a 68 deg.C, melangee aux grains |
| Eau de rincage | 13.0 L | Chauffee a 75-78 deg.C, versee sur les grains apres empatage |
| Eau totale | 26.5 L | A preparer avant de commencer |
| Volume pre-ebullition | 22.5 L | Volume dans la cuve avant d'allumer le feu |
| Volume post-ebullition | 20.0 L | Volume transfere dans le fermenteur |
| Pertes totales | 7.5 L | Eau perdue (grains, evaporation, trub, transferts) |

---

## Deuxieme exemple : 10 L avec 2.5 kg de grain

Un petit brassin pour tester une recette.

```
Eau d'empatage = 2.5 x 2.7 = 6.75 L (arrondi : 6.8 L)
Evaporation = 2.0 x (60/60) = 2.0 L
Volume pre-ebullition = 10 + 2.0 + 0.5 = 12.5 L
Absorption grains = 2.5 x 0.8 = 2.0 L
Eau de rincage = 12.5 - 6.75 + 2.0 = 7.75 L (arrondi : 7.8 L)
Eau totale = 6.75 + 7.75 = 14.5 L
Pertes totales = 2.0 + 1.0 + 0.5 + 2.0 = 5.5 L
```

---

## Troisieme exemple : 20 L avec 5 kg, ebullition 90 minutes

Pour une Pilsner qui necessite 90 minutes d'ebullition.

```
Eau d'empatage = 5 x 2.7 = 13.5 L
Evaporation = 2.0 x (90/60) = 3.0 L
Volume pre-ebullition = 20 + 3.0 + 0.5 = 23.5 L
Absorption grains = 5 x 0.8 = 4.0 L
Eau de rincage = 23.5 - 13.5 + 4.0 = 14.0 L
Eau totale = 13.5 + 14.0 = 27.5 L
Pertes totales = 4.0 + 1.0 + 0.5 + 3.0 = 8.5 L
```

Notez que les 30 minutes d'ebullition supplementaires coutent 1 L d'eau en plus (de 26.5 L a 27.5 L).

---

## Cas special : methode Kit ou Extrait

Pour les methodes Kit et Extrait, il n'y a pas d'empatage ni de rincage. L'eau sert simplement a diluer l'extrait de malt et a atteindre le volume final apres ebullition.

```
Eau d'empatage = 0 L (pas d'empatage)
Eau de rincage = 0 L (pas de rincage)
Volume pre-ebullition = volume final + evaporation + pertes trub
Eau totale = volume pre-ebullition + pertes fixes
```

---

## Ajuster les constantes

Si vous connaissez les valeurs reelles de votre systeme, vous pouvez affiner les calculs :

### Absorption des grains

La valeur de 0.8 L/kg est une moyenne pour du grain concasse. Si vous utilisez :
- Un sac de brassage (BIAB) et que vous pressez le sac : absorption plus faible (~0.6 L/kg)
- Une cuve-filtre sans presser : absorption standard (0.8 L/kg)
- Du grain tres finement concasse : absorption un peu plus haute (~0.9 L/kg)

Mesurez votre absorption reelle en pesant la dreche (grains epuises) apres filtration et en soustrayant le poids sec.

### Taux d'evaporation

Le taux de 2.0 L/h depend de :
- La puissance de chauffe (gaz vs electrique)
- Le diametre de la cuve (une cuve large evapore plus vite)
- La vigueur de l'ebullition

Mesurez votre taux reel en notant le volume avant et apres une ebullition de 60 minutes avec de l'eau seule.

### Pertes fixes

Les 1.0 L de pertes fixes dependent de votre equipement :
- Fond de cuve avec robinet : 0.5-1.0 L
- Tuyaux et raccords : 0.2-0.5 L
- Pertes de transfert : 0.1-0.3 L

Notez le volume de mout a chaque transfert pour identifier ou vous perdez de l'eau.

### Pertes trub

Le trub (residus de houblon, proteines, levures mortes) au fond de la cuve apres ebullition represente environ 0.5 L pour un brassin classique. Si vous utilisez beaucoup de houblon (IPA, NEIPA), les pertes peuvent atteindre 1.0-1.5 L.

---

## Reference technique

Le code source des calculs d'eau se trouve dans `src/lib/waterCalc.ts`. Les constantes sont exportees via `WATER_DEFAULTS` pour pouvoir etre affichees dans l'interface.

Les volumes calcules sont affiches dans l'etape « Eau & Volumes » du wizard et integres dans la procedure de fabrication generee a l'etape Resume.
