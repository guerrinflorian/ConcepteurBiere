# ConcepteurBiere

Assistant interactif de brassage de biere maison. Application Next.js avec TypeScript, Tailwind CSS et Framer Motion.

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans un navigateur.

## Build de production

```bash
npm run build
npm start
```

## Structure du projet

```
src/
  app/
    page.tsx              # Page principale (wizard)
    layout.tsx            # Layout racine
    globals.css           # Styles globaux
    api/                  # Routes API (equipment, malts, hops, yeasts, styles)
  components/
    Wizard.tsx            # Composant wizard multi-etapes avec animations
    steps/                # Composants pour chaque etape
      Step0Profile.tsx    # Profil utilisateur & materiel
      Step1Params.tsx     # Parametres de base (nom, volume, style)
      Step2Malts.tsx      # Selection des malts
      Step3Hops.tsx       # Selection des houblons
      Step4Yeast.tsx      # Choix de la levure
      Step5Mashing.tsx    # Empatage & ebullition
      Step6Fermentation.tsx # Fermentation
      Step7Conditioning.tsx # Conditionnement
      Step8Summary.tsx    # Resume & export/import
    ui/
      BeerGlass.tsx       # Visuel SVG du verre de biere
      LiveStats.tsx       # Panneau de statistiques en temps reel
      StepIndicator.tsx   # Indicateur de progression
      Tip.tsx             # Encadre de conseil
  context/
    RecipeContext.tsx      # Contexte React pour l'etat de la recette
  lib/
    types.ts              # Types TypeScript (Malt, Hop, Yeast, Recipe, etc.)
    calculations.ts       # Calculs brassicoles (OG, FG, IBU, EBC, ABV)
public/
  data/
    equipment.json        # Liste du materiel
    malts.json            # Malts et cereales
    hops.json             # Houblons
    yeasts.json           # Levures
    styles.json           # Styles de biere
```

## Ajouter des ingredients

Les donnees sont dans `public/data/`. Pour ajouter un malt par exemple, ouvrir `public/data/malts.json` et ajouter un objet :

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

Meme principe pour les houblons (`hops.json`), levures (`yeasts.json`) et materiel (`equipment.json`).

## Fonctionnalites

- Wizard multi-etapes avec animations Framer Motion
- Calculs en temps reel : OG, FG, ABV, IBU, EBC
- Conseils contextuels a chaque etape
- Export/import de recettes en JSON
- Interface responsive (desktop et mobile)
- Donnees chargees via API routes Next.js
