# Guide du Debutant -- ConcepteurBiere

Bienvenue ! Ce guide vous accompagne pas a pas pour creer votre premiere recette de biere avec ConcepteurBiere. Aucune connaissance prealable n'est necessaire.

---

## C'est quoi, brasser de la biere ?

Brasser, c'est transformer des cereales (principalement de l'orge maltee) en biere, grace a l'eau, au houblon et a la levure. Voici les grandes etapes :

1. **Empatage** : on trempe les grains concasses dans de l'eau chaude (~66 deg.C) pour en extraire les sucres.
2. **Ebullition** : on fait bouillir le mout (le jus sucre) et on ajoute du houblon pour l'amertume et l'arome.
3. **Refroidissement** : on refroidit le mout rapidement pour eviter les contaminations.
4. **Fermentation** : on ajoute la levure qui transforme les sucres en alcool et en CO2.
5. **Conditionnement** : on met en bouteilles avec un peu de sucre pour la carbonatation, ou en fut.

ConcepteurBiere vous guide a travers chacune de ces etapes et calcule automatiquement les caracteristiques de votre biere (alcool, amertume, couleur...).

---

## Ouvrir l'application

1. Installez les dependances si ce n'est pas deja fait :

```bash
npm install
```

2. Lancez le serveur de developpement :

```bash
npm run dev
```

3. Ouvrez votre navigateur a l'adresse [http://localhost:3000](http://localhost:3000).

L'ecran d'accueil affiche le wizard de creation de recette. Vous pouvez commencer immediatement.

---

## Choisir « Creer une recette »

L'application demarre directement sur le wizard multi-etapes. Vous n'avez qu'a suivre les etapes dans l'ordre, de la premiere a la derniere. Un indicateur de progression en haut de l'ecran vous montre ou vous en etes.

### Mode Debutant / Expert

En haut de l'ecran, un toggle permet de basculer entre **Debutant** et **Expert** :

- **Mode Debutant** (recommande pour commencer) :
  - Explications detaillees a chaque etape
  - Checklists d'hygiene ouvertes avec conseils complets
  - Interpretations simples des valeurs (« amertume faible », « couleur blonde »...)
  - Seuls les champs essentiels sont mis en avant

- **Mode Expert** :
  - Informations compactes
  - Formules de calcul visibles
  - Checklists repliables
  - Acces a tous les parametres avances

Si c'est votre premiere fois, restez en mode Debutant.

---

## Les 9 etapes du wizard

### Etape 0 -- Profil et Materiel

**Objectif** : dire a l'application qui vous etes et ce que vous possedez.

- Indiquez si vous etes **amateur** ou **professionnel**. L'application adaptera ses conseils et ses niveaux d'alerte en consequence.
- Cochez le materiel que vous possedez dans la liste proposee (cuve, fermenteur, thermometre, densimetre, refroidisseur, etc.).
- L'application utilisera cette information pour personnaliser la procedure de fabrication. Par exemple, si vous n'avez pas de refroidisseur, elle vous proposera la methode du bain de glace.

**Minimum necessaire** : une cuve d'empatage/ebullition, un fermenteur, un thermometre. Un densimetre est tres recommande pour savoir quand embouteiller.

**Conseil** : ne trichez pas sur le materiel ! L'application genere des instructions adaptees a ce que vous avez reellement.

### Etape 1 -- Parametres de base

**Objectif** : definir les grandes lignes de votre brassin.

- **Nom de la recette** (optionnel) : donnez un nom a votre creation pour la retrouver facilement.
- **Volume** : le volume final de biere que vous souhaitez obtenir, en litres. 20 L est le standard pour un brasseur amateur (environ 60 bouteilles de 33 cL).
- **Methode de brassage** : choisissez parmi :
  - **Tout-grain** : vous partez de grains de malt concasses. C'est la methode traditionnelle, plus complexe mais offrant un controle total.
  - **Extrait** : vous utilisez de l'extrait de malt (sirop ou poudre). Plus simple, ideal pour debuter.
  - **Kit** : vous suivez un kit pre-dose avec les instructions du fabricant.
- **Style cible** (optionnel) : choisissez un style de biere (Blonde, IPA, Stout, etc.). L'application comparera vos valeurs estimees (OG, IBU, EBC) aux fourchettes du style et vous alertera si vous sortez des clous.

**Conseil** : pour un premier brassin, choisissez 20 L et le style « Blonde » ou « Pale Ale ». Ce sont des styles tolerants aux petites erreurs.

### Etape 2 -- Malts et Cereales

**Objectif** : choisir les grains qui fourniront les sucres et la couleur de votre biere.

- Le **malt de base** constitue la majorite du grain (60-100 %). Il fournit les enzymes et les sucres fermentescibles. Exemples : Pilsner, Pale Ale, Munich.
- Les **malts speciaux** (5-20 %) apportent couleur, corps et saveurs : caramel, biscuit, chocolat, torrefie...
- Pour chaque malt, indiquez la **quantite en kg**. L'application met a jour les estimations (OG, EBC) en temps reel.
- Vous pouvez aussi ajouter des **adjuvants** : sucres, epices, fruits, cafe, etc. Ils sont optionnels.

**Quantites typiques pour 20 L** :
- Malt de base : 3.5 a 5.5 kg
- Malts speciaux : 0.2 a 1.0 kg au total

**Conseil** : commencez simple. Un malt de base (Pilsner) + un malt special (Carapils 0.3 kg) suffit pour une premiere blonde.

### Etape 3 -- Houblons

**Objectif** : definir l'amertume et les aromes de votre biere.

- Le houblon apporte **amertume** (ajout en debut d'ebullition) et **aromes** (ajout tardif ou a froid).
- Pour chaque ajout, indiquez :
  - La **variete** de houblon (Saaz, Cascade, Citra, etc.)
  - La **quantite** en grammes
  - Le **timing** d'ajout en minutes avant la fin de l'ebullition :
    - **60 min** : amertume pure, peu d'arome
    - **30 min** : amertume + debut d'arome
    - **15 min** : equilibre amertume/arome
    - **5 min** : principalement de l'arome
    - **0 min (flame-out)** : arome maximum, quasi pas d'amertume
- L'application calcule les IBU (amertume) en temps reel avec la formule Tinseth.

**Quantites typiques pour 20 L** :
- Houblon d'amertume (60 min) : 15-30 g
- Houblon d'arome (10-0 min) : 10-30 g

**Conseil** : un seul houblon peut suffire pour une premiere recette. Essayez 25 g de Saaz a 60 min + 15 g a 10 min pour une blonde equilibree.

### Etape 4 -- Levure

**Objectif** : choisir le micro-organisme qui transformera les sucres en alcool.

- Choisissez une levure dans le catalogue propose.
- Deux grandes familles :
  - **Ale** (fermentation haute, 18-22 deg.C) : fermente a temperature ambiante. La plus simple pour debuter.
  - **Lager** (fermentation basse, 8-15 deg.C) : necessite un frigo ou une chambre froide. Plus exigeante.
- L'application affiche les caracteristiques de chaque levure : plage de temperature, attenuation (capacite a consommer les sucres), profil aromatique.
- La temperature de fermentation et l'attenuation sont utilisees pour calculer la FG et l'ABV.

**Conseil** : pour debuter, choisissez une levure ale neutre comme la **US-05** (Safale). Elle est fiable, tolerante et donne un profil propre.

### Etape 5 -- Eau et Empatage/Ebullition

**Objectif** : definir les parametres du processus de transformation des grains en mout.

Cette etape comporte deux parties :

**Eau et Volumes** (calcule automatiquement) :
- L'application calcule automatiquement les volumes d'eau necessaires a partir du poids de grain et du volume cible :
  - **Eau d'empatage** : ratio 2.7 L par kg de grain
  - **Eau de rincage (sparge)** : calculee pour atteindre le volume pre-ebullition
  - **Volume pre-ebullition** : volume final + evaporation + pertes trub
  - **Pertes totales** : absorption grains (0.8 L/kg) + pertes fixes (1.0 L) + trub (0.5 L) + evaporation (2.0 L/h)
- Vous n'avez rien a calculer vous-meme. Consultez [eau-volumes.md](./eau-volumes.md) pour comprendre le detail.

**Empatage** :
- **Temperature d'empatage** (60-72 deg.C) :
  - Basse (62-64 deg.C) : biere seche et alcoolisee
  - Moyenne (65-67 deg.C) : bon equilibre
  - Haute (68-70 deg.C) : biere ronde et moelleuse
- **Duree d'empatage** : 60 minutes est le standard.

**Ebullition** :
- **Duree d'ebullition** : 60 min est le standard. 90 min pour les Pilsners (pour eliminer le DMS lie au malt Pilsner).

**Conseil** : 66 deg.C pendant 60 min est un bon point de depart pour la plupart des styles.

### Etape 6 -- Fermentation

**Objectif** : definir les conditions de fermentation de la levure.

- **Temperature de fermentation** : la temperature a laquelle vous maintiendrez le fermenteur. Elle depend de la levure choisie.
  - Ale : 18-22 deg.C (temperature ambiante dans la plupart des logements)
  - Lager : 8-15 deg.C (necessite un controle de temperature)
- **Duree de fermentation primaire** :
  - Ale : 7-14 jours
  - Lager : 14-21 jours
- **Fermentation secondaire** (optionnel) : transfert dans un second fermenteur pour clarifier ou ajouter des ingredients (dry-hop, fruits). Si vous debutez, vous pouvez la sauter.
- L'application vous alerte si la temperature choisie est hors de la plage recommandee pour votre levure.

**Conseil** : la stabilite de temperature est plus importante que la temperature exacte. Evitez les variations de plus de 2 deg.C par jour.

### Etape 7 -- Conditionnement

**Objectif** : definir comment vous allez carbonater et emballer votre biere.

- **Mode de conditionnement** :
  - **Embouteillage** (refermentation naturelle) : vous ajoutez du sucre dans la biere avant de la mettre en bouteilles. La levure residuelle consomme ce sucre et produit du CO2 qui carbonate la biere.
  - **Fut** (carbonatation forcee) : vous utilisez du CO2 externe pour carbonater la biere dans un fut pressurise.
- **Sucre de refermentation** (embouteillage uniquement) :
  - Quantite typique : 5-7 g/L
  - L'application calcule le sucre total necessaire (g/L x volume)
  - Elle calcule aussi les volumes de CO2 resultants

**Conseil** : pour un premier brassin en bouteilles, utilisez 6 g/L de sucre blanc. C'est un bon compromis pour une carbonatation standard. Ne depassez JAMAIS 8 g/L : risque de surpression et d'explosion de bouteilles.

### Etape 8 -- Resume et Procedure

**Objectif** : verifier votre recette et obtenir la procedure complete.

Cette etape est la synthese de tout votre travail :

- **Resume des valeurs estimees** : OG, FG, ABV, IBU, EBC, CO2 volumes. L'application les compare aux fourchettes du style cible si vous en avez choisi un.
- **Procedure de fabrication A-Z** : l'application genere une procedure complete et personnalisee, etape par etape, en tenant compte de :
  - Vos ingredients exacts (noms, quantites)
  - Votre materiel (avec/sans refroidisseur, avec/sans densimetre...)
  - Vos volumes d'eau calcules
  - La chronologie des ajouts de houblon pendant l'ebullition
  - Les temperatures et durees de chaque phase
- **Panneau d'alertes** : l'assistant verifie une derniere fois votre recette et signale tout risque (sucre trop eleve, temperature hors plage, pas assez de malt de base...).
- **Export de la recette** : cliquez sur « Exporter la recette (JSON) » pour telecharger un fichier JSON contenant toute la recette. Vous pourrez le re-importer plus tard.
- **Import d'une recette** : cliquez sur « Importer une recette » pour charger un fichier JSON exporte precedemment. Toutes les etapes seront remplies automatiquement.

**Conseil** : imprimez ou enregistrez la procedure avant le jour du brassage. Relisez-la la veille pour bien vous preparer.

---

## L'Assistant anti-erreurs

L'application integre un assistant qui surveille votre recette en temps reel :

- **Badge d'alertes** (en haut de l'ecran) : affiche le nombre de risques detectes. Cliquez dessus pour voir le detail.
- **Checklist d'hygiene** : a chaque etape, une liste de bonnes pratiques a cocher. En mode debutant, elle est ouverte par defaut avec des explications detaillees.
- **Panneau de risques** : l'assistant vous previent si un parametre est dangereux :
  - Sucre de refermentation trop eleve (> 8 g/L)
  - Temperature de fermentation hors plage de la levure
  - Pas assez de malt de base (< 60 % du grain total)
  - Cuve trop petite pour le volume
  - Volume d'eau insuffisant
  - etc.

Chaque alerte est accompagnee d'une explication pedagogique et d'une suggestion pour corriger le probleme.

---

## Le Lexique

Cliquez sur le bouton **Lexique** en haut de l'ecran pour acceder au glossaire complet. Vous y trouverez :

- Toutes les abreviations (OG, FG, IBU, EBC, ABV...)
- Les termes techniques (empatage, dry-hop, DMS, lagering...)
- Les defauts courants et comment les eviter (oxydation, infection, esters...)
- Le materiel et son utilite (densimetre, refroidisseur...)

Le lexique est aussi disponible dans le fichier [lexique.md](./lexique.md).

---

## Votre premiere recette : une Blonde simple

Voici un point de depart pour 20 litres :

| Parametre | Valeur |
|---|---|
| Style | Blonde |
| Volume | 20 L |
| Methode | Tout-grain |
| Malt de base | Pilsner -- 4 kg |
| Malt special | Carapils -- 0.3 kg |
| Houblon (60 min) | Saaz -- 25 g |
| Houblon (10 min) | Saaz -- 15 g |
| Levure | US-05 (Safale) |
| Temperature d'empatage | 66 deg.C pendant 60 min |
| Duree d'ebullition | 60 min |
| Temperature de fermentation | 20 deg.C pendant 10 jours |
| Sucre de refermentation | 6 g/L |

**Resultat attendu** : environ 4.5 % ABV, environ 20 IBU, environ 8 EBC (blonde doree), peu amere, facile a boire.

**Volumes d'eau calcules** (automatiquement par l'application) :
- Eau d'empatage : 11.6 L
- Eau de rincage : 12.9 L
- Eau totale : 24.5 L
- Volume pre-ebullition : 22.5 L

---

## Les erreurs les plus courantes

1. **Mauvaise hygiene** : desinfectez TOUT ce qui touche le mout apres l'ebullition. C'est la cause numero 1 de brassins rates.
2. **Embouteiller trop tot** : la fermentation n'est pas toujours terminee au bout de 7 jours. Mesurez la FG deux jours de suite avec un densimetre. Si les mesures sont identiques, vous pouvez embouteiller.
3. **Trop de sucre de refermentation** : au-dessus de 8 g/L, le risque de surpression et d'explosion de bouteilles est reel. Restez dans la fourchette 5-7 g/L.
4. **Temperature de fermentation instable** : essayez de maintenir la temperature a plus ou moins 2 deg.C. Les variations brusques stressent la levure et produisent des faux-gouts.
5. **Impatience** : la biere a besoin de temps. Laissez au moins 2-3 semaines de refermentation en bouteille avant de gouter. Les bieres fortes gagnent a maturir 1 a 3 mois.
6. **Ouvrir le fermenteur** : pendant la fermentation, resistez a la tentation de soulever le couvercle. Chaque ouverture est un risque d'infection.
7. **Negliger le refroidissement** : refroidissez le mout le plus vite possible apres l'ebullition. Entre 30 deg.C et 60 deg.C, les bacteries se multiplient rapidement.

---

## Etapes suivantes

Une fois votre premiere recette reussie, vous pouvez :

- Tester d'autres styles (Ambrée, IPA, Stout...)
- Passer en mode Expert pour acceder a tous les parametres
- Experimenter avec les malts speciaux et les houblons aromatiques
- Ajuster votre efficacite d'empatage apres quelques brassins (voir [estimations.md](./estimations.md))
- Consulter le [lexique](./lexique.md) pour approfondir vos connaissances

---

## Liens utiles

- [Lexique complet](./lexique.md) -- toutes les definitions
- [Detail des estimations](./estimations.md) -- formules, hypotheses, limites
- [Eau et Volumes](./eau-volumes.md) -- calculs d'eau expliques pas a pas
- [Etendre l'assistant](./assistant.md) -- ajouter des regles et des items
