# ConcepteurBiere

Assistant interactif de brassage de biere maison. Application Next.js avec TypeScript, Tailwind CSS et Framer Motion.

---

## Lancer le projet

### Prerequis

- Node.js 18 ou superieur
- npm 9 ou superieur

### Installation et demarrage

```bash
# Installer les dependances
npm install

# Lancer le serveur de developpement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans un navigateur.

### Build de production

```bash
npm run build
npm start
```

---

## Fonctionnalites

- **Wizard multi-etapes** (9 etapes) avec animations Framer Motion
- **Calculs en temps reel** : OG, FG, ABV, IBU, EBC, CO2
- **Mode Debutant / Expert** : adapte le niveau de detail et d'aide
- **Assistant anti-erreurs** :
  - Checklist d'hygiene par etape (data-driven, extensible)
  - Detection de risques en temps reel (priming, temperature, cuve, etc.)
  - Panneau d'alertes avec explications pedagogiques
- **Panneau d'estimations** avec interpretations simples et details techniques
- **Lexique du brasseur** : glossaire complet accessible partout (OG, IBU, DMS...)
- **Calcul automatique des volumes d'eau** (empatage, rincage, pertes)
- **Procedure de fabrication A-Z** generee a partir de la recette
- **Conseils contextuels** a chaque etape
- **Export/import** de recettes en JSON
- **Interface responsive** (desktop et mobile)
- **Donnees via API routes** Next.js (JSON statique)

---

## Mode Debutant / Expert

Un toggle dans le header permet de basculer entre les deux modes :

- **Debutant** : explications detaillees, checklists ouvertes, interpretations simples
- **Expert** : informations compactes, formules de calcul, checklists repliables

---

## Import / Export de recettes

- **Exporter** : a l'etape 8 (Resume), cliquez sur "Exporter la recette (JSON)". Le fichier est telecharge.
- **Importer** : a l'etape 8, cliquez sur "Importer une recette" et selectionnez un fichier JSON exporte precedemment. L'application remplira automatiquement toutes les etapes.

Les recettes importees sont compatibles meme si elles ont ete creees avant l'ajout de certains champs (fallback sur les valeurs par defaut).

---

## Ou se trouvent les donnees JSON

Toutes les donnees de reference de l'application sont stockees dans le repertoire `public/data/` sous forme de fichiers JSON statiques. Ces fichiers sont servis via les API routes Next.js (dans `src/app/api/`).

```
public/data/
  equipment.json     # Liste du materiel (34 items)
  malts.json         # Malts et cereales (20 items)
  hops.json          # Houblons (20 items)
  yeasts.json        # Levures (12 items)
  styles.json        # Styles de biere (12 items)
  adjuncts.json      # Adjuvants (12 items)
  tips.json          # Conseils contextuels (28 entrees)
  glossary.json      # Glossaire des termes brassicoles (26 entrees)
```

Le glossaire utilise dans l'application est defini dans `src/data/glossary.ts` (donnees TypeScript internes) et egalement disponible au format JSON dans `public/data/glossary.json` pour un usage externe ou programmatique.

---

## Ajouter un malt, un houblon ou une levure

Les donnees sont dans `public/data/`. Pour ajouter un ingredient, ouvrez le fichier JSON correspondant et ajoutez un objet en respectant le format existant.

### Ajouter un malt

Ouvrez `public/data/malts.json` et ajoutez un objet :

```json
{
  "id": "mon_malt",
  "name": "Mon Malt",
  "type": "base",
  "color_ebc": 5,
  "potential_gravity": 1.037,
  "description": "Description du malt.",
  "origin": "France"
}
```

Champs :
- `id` : identifiant unique (snake_case, sans espaces)
- `name` : nom affiche dans l'interface
- `type` : `"base"` ou `"specialty"` (malt de base ou malt special)
- `color_ebc` : couleur du malt en EBC (nombre entier)
- `potential_gravity` : densite potentielle (ex: 1.037 pour un malt Pilsner)
- `description` : texte descriptif
- `origin` : pays d'origine

### Ajouter un houblon

Ouvrez `public/data/hops.json` et ajoutez un objet :

```json
{
  "id": "mon_houblon",
  "name": "Mon Houblon",
  "alpha_acid": 6.5,
  "type": "aroma",
  "description": "Description du houblon.",
  "origin": "France"
}
```

Champs :
- `alpha_acid` : taux d'acide alpha en % (nombre decimal)
- `type` : `"bittering"`, `"aroma"` ou `"dual"` (amerisant, aromatique ou mixte)

### Ajouter une levure

Ouvrez `public/data/yeasts.json` et ajoutez un objet :

```json
{
  "id": "ma_levure",
  "name": "Ma Levure",
  "type": "ale",
  "attenuation": 78,
  "temp_min": 15,
  "temp_max": 24,
  "temp_ideal": 20,
  "description": "Description de la levure.",
  "manufacturer": "Mon Fabricant"
}
```

Champs :
- `type` : `"ale"` ou `"lager"`
- `attenuation` : attenuation en % (nombre entier)
- `temp_min`, `temp_max`, `temp_ideal` : temperatures en deg.C

Apres modification, relancez le serveur de developpement (`npm run dev`) pour que les nouvelles donnees soient prises en compte.

---

## Comment fonctionne « Eau & Volumes »

L'application calcule automatiquement tous les volumes d'eau necessaires pour votre brassin a partir de deux informations : le **poids total de grain** (somme des malts ajoutes a l'etape 2) et le **volume final cible** (defini a l'etape 1).

### Constantes utilisees

| Parametre | Valeur | Description |
|---|---|---|
| Ratio empatage | 2.7 L/kg | Eau chaude par kg de grain |
| Absorption grains | 0.8 L/kg | Eau retenue par les grains |
| Pertes fixes | 1.0 L | Pertes transferts et fond de cuve |
| Evaporation | 2.0 L/h | Eau evaporee pendant l'ebullition |
| Pertes trub | 0.5 L | Residus de houblon/proteines |

### Formules

```
Eau d'empatage   = poids_grain x 2.7
Volume pre-ebul. = volume_final + evaporation + trub
Eau de rincage   = volume_pre_ebul - eau_empatage + absorption_grains
Eau totale       = eau_empatage + eau_rincage
```

### Exemple : 20 L avec 5 kg de grain, ebullition 60 min

- Eau d'empatage : 5 x 2.7 = 13.5 L
- Evaporation : 2.0 x 1 = 2.0 L
- Volume pre-ebullition : 20 + 2.0 + 0.5 = 22.5 L
- Absorption : 5 x 0.8 = 4.0 L
- Eau de rincage : 22.5 - 13.5 + 4.0 = 13.0 L
- Eau totale : 13.5 + 13.0 = 26.5 L

Pour les methodes Kit et Extrait, il n'y a pas d'empatage ni de rincage. L'eau sert a diluer l'extrait et compenser les pertes d'ebullition.

Le code source de ces calculs se trouve dans `src/lib/waterCalc.ts`. Pour plus de details et d'exemples, voir [docs/eau-volumes.md](docs/eau-volumes.md).

---

## Comment fonctionne la procedure A-Z

A l'etape 8 (Resume), l'application genere une procedure de fabrication complete et personnalisee. Cette procedure est construite dynamiquement a partir de l'etat complet de la recette par le fichier `src/lib/recipeProcedure.ts`.

La procedure prend en compte :

- **Les ingredients exacts** : noms et quantites de chaque malt, houblon, levure
- **Le materiel disponible** : si vous avez un refroidisseur, un densimetre, un controle de temperature, les instructions s'adaptent
- **Les volumes d'eau calcules** : eau d'empatage, eau de rincage, volume pre-ebullition
- **La chronologie des houblons** : chaque ajout est positionne dans le temps d'ebullition (T-60, T-15, T-5, flame-out)
- **Les temperatures** : empatage, fermentation primaire, secondaire
- **Le mode de conditionnement** : embouteillage (avec calcul du sucre total) ou mise en fut

Les etapes generees sont :

1. Preparation et Hygiene
2. Chauffe de l'eau
3. Empatage (tout-grain uniquement)
4. Filtration et Rincage (tout-grain uniquement)
5. Ebullition et Houblonnage
6. Refroidissement
7. Transfert en fermenteur
8. Ensemencement de la levure
9. Fermentation
10. Conditionnement (embouteillage ou mise en fut)
11. Maturation et Degustation

Chaque etape contient des instructions detaillees, des conseils pratiques et des alertes de securite.

---

## Structure du projet

```
src/
  app/
    page.tsx              # Page principale (wizard)
    layout.tsx            # Layout racine
    globals.css           # Styles globaux
    api/                  # Routes API (equipment, malts, hops, yeasts, styles, adjuncts, tips)
  components/
    Wizard.tsx            # Composant wizard multi-etapes + integration assistant
    steps/                # Composants pour chaque etape (0-8)
    ui/
      BeerGlass.tsx       # Visuel SVG du verre de biere
      LiveStats.tsx       # Panneau de statistiques en temps reel
      StepIndicator.tsx   # Indicateur de progression
      StyleComparison.tsx # Comparaison avec le style cible
      Tip.tsx             # Encadre de conseil
      Tooltip.tsx         # Infobulle
      ValidationErrors.tsx # Affichage des erreurs
    assistant/
      HygieneChecklist.tsx # Checklist d'hygiene par etape
      RiskPanel.tsx        # Panneau d'alertes de risques
      RiskBadge.tsx        # Badge compact d'alertes
    estimations/
      EstimationsPanel.tsx # Panneau d'estimations pedagogique
    help/
      GlossaryModal.tsx    # Modal du lexique / glossaire
  context/
    RecipeContext.tsx      # Contexte React (recette + assistant + mode)
  data/
    hygieneChecklist.ts   # Donnees de la checklist d'hygiene
    glossary.ts           # Donnees du lexique
  lib/
    types.ts              # Types TypeScript
    calculations.ts       # Calculs brassicoles (OG, FG, IBU, EBC, ABV)
    waterCalc.ts          # Calculs d'eau et de volumes
    recipeProcedure.ts    # Generateur de procedure A-Z
    validation.ts         # Validation par etape
    riskRules.ts          # Moteur de regles de risques
    uiMode.ts             # Helpers Debutant/Expert
public/
  data/
    equipment.json        # Liste du materiel (34 items)
    malts.json            # Malts et cereales (20 items)
    hops.json             # Houblons (20 items)
    yeasts.json           # Levures (12 items)
    styles.json           # Styles de biere (12 items)
    adjuncts.json         # Adjuvants (12 items)
    tips.json             # Conseils contextuels (28 entrees)
    glossary.json         # Glossaire (26 entrees)
docs/
  guide-debutant.md       # Guide complet pour debutants
  lexique.md              # Lexique des termes brassicoles
  estimations.md          # Detail des formules d'estimation
  eau-volumes.md          # Calculs d'eau expliques pas a pas
  assistant.md            # Comment etendre l'assistant
```

---

## Etendre l'assistant

Voir [docs/assistant.md](docs/assistant.md) pour ajouter :
- Des items a la checklist d'hygiene
- Des nouvelles regles de detection de risques
- Des termes au glossaire (`src/data/glossary.ts`)

---

## Pas de persistance

L'etat de la recette est en memoire uniquement. Aucun localStorage, IndexedDB ou base de donnees n'est utilise. Utilisez l'export JSON pour sauvegarder vos recettes.

---

## Documentation

- [Guide du debutant](docs/guide-debutant.md) -- "Je n'y connais rien, par ou commencer ?"
- [Lexique](docs/lexique.md) -- Toutes les abreviations et termes techniques
- [Detail des estimations](docs/estimations.md) -- Formules, hypotheses, limites, exemples
- [Eau et Volumes](docs/eau-volumes.md) -- Calculs d'eau expliques pas a pas avec exemples concrets
- [Etendre l'assistant](docs/assistant.md) -- Comment ajouter des regles de risque et des items a la checklist
