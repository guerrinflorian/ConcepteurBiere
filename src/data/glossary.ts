/**
 * Lexique / Glossaire des termes brassicoles.
 *
 * Chaque entrée contient :
 * - term : l'abréviation ou le terme technique
 * - fullName : le nom complet
 * - category : pour le filtrage (mesure, processus, ingrédient, défaut)
 * - definition : explication simple et accessible
 * - whyItMatters : pourquoi c'est important pour le brasseur
 * - typicalValues : fourchettes de valeurs typiques (si applicable)
 * - example : un exemple concret
 *
 * Pour ajouter un terme : ajoutez un objet dans le tableau glossary.
 */

export interface GlossaryEntry {
  term: string;
  fullName: string;
  category: "mesure" | "processus" | "ingredient" | "defaut" | "equipement";
  definition: string;
  whyItMatters: string;
  typicalValues?: string;
  example?: string;
}

export const glossary: GlossaryEntry[] = [
  // === MESURES ===
  {
    term: "OG",
    fullName: "Original Gravity (Densité Initiale)",
    category: "mesure",
    definition:
      "La densité du moût avant fermentation, mesurée avec un densimètre ou un réfractomètre. Elle indique la quantité de sucres dissous dans le moût. Plus il y a de sucres, plus la bière sera potentiellement alcoolisée.",
    whyItMatters:
      "L'OG permet de prédire le taux d'alcool final et de vérifier que l'empâtage a bien extrait les sucres des grains. Si l'OG est trop basse, la bière sera faible en alcool et en corps.",
    typicalValues:
      "1.030–1.045 (bière légère), 1.045–1.060 (standard), 1.060–1.080 (forte), 1.080+ (très forte/barley wine)",
    example:
      "Une Blonde typique a une OG de ~1.045. Cela signifie que le moût est 4,5% plus dense que l'eau pure.",
  },
  {
    term: "FG",
    fullName: "Final Gravity (Densité Finale)",
    category: "mesure",
    definition:
      "La densité de la bière après fermentation. La levure a consommé une partie des sucres et les a transformés en alcool et CO₂. La FG indique les sucres résiduels.",
    whyItMatters:
      "Une FG basse = bière sèche (peu de sucres résiduels). Une FG haute = bière plus ronde et sucrée. Si la FG ne descend pas assez, la fermentation est peut-être bloquée.",
    typicalValues:
      "1.005–1.010 (bière sèche), 1.010–1.015 (moyenne), 1.015–1.025 (douce/ronde)",
    example:
      "Si OG = 1.050 et FG = 1.010, la levure a consommé 80% des sucres (atténuation de 80%).",
  },
  {
    term: "ABV",
    fullName: "Alcohol By Volume (Taux d'Alcool)",
    category: "mesure",
    definition:
      "Le pourcentage d'alcool dans la bière, calculé à partir de la différence entre OG et FG. La formule simplifiée est : ABV ≈ (OG - FG) × 131.25.",
    whyItMatters:
      "C'est l'information la plus parlante pour le consommateur. En France, les bières vont de ~3% (légère) à ~12%+ (barley wine). Au-delà de certains seuils, la législation impose un étiquetage spécifique.",
    typicalValues:
      "3–4% (session), 4–6% (standard), 6–8% (forte), 8–12% (très forte)",
    example:
      "Une Pale Ale à OG 1.052 et FG 1.012 donne ABV ≈ (1.052 - 1.012) × 131.25 ≈ 5.3%.",
  },
  {
    term: "IBU",
    fullName: "International Bitterness Units (Unités d'Amertume)",
    category: "mesure",
    definition:
      "Mesure de l'amertume apportée par le houblon. Plus la valeur est élevée, plus la bière est amère. L'IBU est calculé à partir de la quantité de houblon, son taux d'acide alpha et le temps d'ébullition.",
    whyItMatters:
      "L'amertume équilibre le sucré des malts. Trop d'IBU = bière agressive. Pas assez = bière sucrée/écoeurante. L'équilibre IBU/OG détermine le profil gustatif.",
    typicalValues:
      "5–15 (légère, Blanche), 15–30 (équilibrée, Lager), 30–50 (amère, Pale Ale), 50–70+ (très amère, IPA/DIPA)",
    example:
      "Une IPA à 60 IBU est nettement amère. Une Blanche à 12 IBU est très douce.",
  },
  {
    term: "EBC",
    fullName: "European Brewery Convention (Couleur de la Bière)",
    category: "mesure",
    definition:
      "Échelle de mesure de la couleur de la bière, standard en Europe. Calculée à partir de la couleur des malts et de leur proportion. Plus le nombre est élevé, plus la bière est foncée.",
    whyItMatters:
      "La couleur donne une première impression visuelle et est souvent corrélée au profil de saveur (malts torréfiés = foncé = notes de café/chocolat).",
    typicalValues:
      "4–8 (très pâle/Pilsner), 8–15 (blonde), 15–25 (dorée), 25–35 (ambrée), 35–50 (cuivrée), 50–70 (brune), 70+ (noire/Stout)",
    example:
      "Une Stout à 80 EBC est noire opaque. Une Pilsner à 6 EBC est jaune paille.",
  },
  {
    term: "SRM",
    fullName: "Standard Reference Method",
    category: "mesure",
    definition:
      "Échelle de couleur américaine. Conversion : EBC ≈ SRM × 1.97. Utilisée principalement aux États-Unis.",
    whyItMatters:
      "Si vous suivez une recette américaine, les couleurs seront en SRM. Multipliez par ~2 pour obtenir l'EBC.",
    typicalValues: "2–40+ (même logique que l'EBC mais valeurs ~2× plus petites)",
    example: "10 SRM ≈ 20 EBC (une bière dorée/ambrée).",
  },
  {
    term: "°P / Plato",
    fullName: "Degrés Plato",
    category: "mesure",
    definition:
      "Autre façon d'exprimer la densité du moût, en pourcentage de sucre. 1°P = 1 g de sucre pour 100 g de moût. Plus intuitif que l'OG pour certains brasseurs.",
    whyItMatters:
      "Couramment utilisé par les brasseurs professionnels et en Europe continentale. Permet de visualiser directement la « teneur en sucre » du moût.",
    typicalValues: "8–12°P (standard), 12–18°P (forte), 18°P+ (très forte)",
    example: "Une OG de 1.048 ≈ 12°P, soit 12% de sucre en masse.",
  },
  {
    term: "CO₂ volumes",
    fullName: "Volumes de CO₂ (Carbonatation)",
    category: "mesure",
    definition:
      "Mesure de la quantité de gaz carbonique dissous dans la bière. 1 volume = 1 litre de CO₂ (à pression atmosphérique) dissous dans 1 litre de bière.",
    whyItMatters:
      "La carbonatation influence la sensation en bouche (pétillance), la mousse, et la perception des saveurs. Chaque style a un niveau de carbonatation idéal.",
    typicalValues:
      "1.5–2.0 (peu pétillante, cask ale), 2.0–2.5 (standard), 2.5–3.0 (pétillante, Blanche), 3.0–4.0+ (très pétillante, Saison/Lambic)",
    example:
      "Avec 7 g/L de sucre, on obtient environ 2.6 volumes de CO₂ — un pétillant standard.",
  },
  {
    term: "Atténuation",
    fullName: "Atténuation apparente",
    category: "mesure",
    definition:
      "Le pourcentage de sucres que la levure est capable de transformer en alcool. Atténuation = (OG - FG) / (OG - 1) × 100. Plus l'atténuation est élevée, plus la bière est sèche.",
    whyItMatters:
      "Le choix de la levure et la température d'empâtage influencent l'atténuation. Une levure à haute atténuation donnera une bière plus sèche et plus alcoolisée.",
    typicalValues: "70–80% (standard), 80–90% (haute, bière sèche), 60–70% (basse, bière ronde)",
    example:
      "US-05 à 81% d'atténuation : OG 1.050 → FG ≈ 1.010 → bière moyennement sèche.",
  },

  // === PROCESSUS ===
  {
    term: "Empâtage",
    fullName: "Empâtage (Mashing)",
    category: "processus",
    definition:
      "Étape où les grains concassés sont mélangés à de l'eau chaude (60-72°C) pour activer les enzymes qui convertissent l'amidon en sucres fermentescibles.",
    whyItMatters:
      "La température d'empâtage détermine le ratio entre sucres fermentescibles (→ alcool) et non-fermentescibles (→ corps/douceur). C'est un levier majeur du profil de la bière.",
    typicalValues: "60–72°C pendant 60 minutes",
    example:
      "Empâtage à 64°C = bière sèche et alcoolisée. Empâtage à 68°C = bière plus ronde et moelleuse.",
  },
  {
    term: "Ébullition",
    fullName: "Ébullition (Boil)",
    category: "processus",
    definition:
      "Le moût est porté à ébullition pendant 60-90 minutes. On y ajoute le houblon à différents moments. L'ébullition stérilise le moût, extrait l'amertume du houblon, et élimine des composés indésirables (DMS).",
    whyItMatters:
      "Sans ébullition : pas d'amertume, risque d'infection, goûts parasites. C'est aussi le moment où se fixent les arômes du houblon.",
    typicalValues: "60 min (standard), 90 min (Pilsner, bière forte)",
  },
  {
    term: "Dry-hop",
    fullName: "Houblonnage à froid (Dry Hopping)",
    category: "processus",
    definition:
      "Ajout de houblon directement dans le fermenteur, après la fermentation primaire. N'ajoute PAS d'amertume mais apporte un maximum d'arômes (agrumes, fruits tropicaux, résine…).",
    whyItMatters:
      "Technique incontournable pour les IPA et NEIPA modernes. Permet d'obtenir des arômes de houblon intenses sans amertume excessive.",
    example: "50-100 g de Citra en dry-hop pendant 3-5 jours pour une NEIPA aromatique.",
  },
  {
    term: "Whirlpool",
    fullName: "Tourbillon (Whirlpool/Flame-out)",
    category: "processus",
    definition:
      "Ajout de houblon juste après avoir éteint le feu (0 minutes d'ébullition). Le moût est encore chaud (~80-95°C) mais ne bout plus.",
    whyItMatters:
      "Apporte à la fois des arômes et une légère amertume, entre l'ajout à l'ébullition et le dry-hop. Bon compromis pour des bières aromatiques.",
  },
  {
    term: "Refermentation",
    fullName: "Refermentation en bouteille",
    category: "processus",
    definition:
      "Ajout d'une petite quantité de sucre au moment de l'embouteillage. La levure restante consomme ce sucre et produit du CO₂ qui carbonate la bière naturellement dans la bouteille fermée.",
    whyItMatters:
      "C'est la méthode traditionnelle de carbonatation pour le brassage amateur. Alternative : carbonatation forcée en fût (CO₂ externe).",
    typicalValues: "5-8 g/L de sucre pour une carbonatation standard",
    example:
      "7 g/L de sucre → ~2.6 volumes CO₂ → pétillance standard. Attendre 2-3 semaines à ~20°C.",
  },
  {
    term: "Lagering",
    fullName: "Garde à froid (Lagering)",
    category: "processus",
    definition:
      "Maturation prolongée à basse température (0-4°C) pendant plusieurs semaines. Caractéristique des bières Lager. Clarifie la bière et adoucit les saveurs.",
    whyItMatters:
      "Donne aux Lagers leur goût propre et net. Sans lagering, une lager sera trouble et pourra avoir des saveurs vertes (acétaldéhyde).",
    typicalValues: "0-4°C pendant 4-8 semaines",
  },

  // === INGRÉDIENTS ===
  {
    term: "Malt de base",
    fullName: "Malt de base (Base Malt)",
    category: "ingredient",
    definition:
      "Le malt principal qui constitue 60-100% du grain. Il fournit les enzymes nécessaires à la conversion de l'amidon et la majorité des sucres fermentescibles.",
    whyItMatters:
      "Sans malt de base, pas de conversion enzymatique = pas de sucres = pas de bière. C'est la fondation de la recette.",
    typicalValues: "60-100% du grain total. Pour 20L : 3-6 kg.",
    example: "Pilsner Malt pour les blondes, Pale Ale Malt pour les ales anglaises.",
  },
  {
    term: "Malt spécial",
    fullName: "Malt spécial / Malt de caractère",
    category: "ingredient",
    definition:
      "Malts ajoutés en petite quantité (5-20%) pour apporter couleur, corps et saveurs spécifiques : caramel, biscuit, chocolat, café, etc.",
    whyItMatters:
      "Ce sont eux qui donnent sa personnalité à la bière. Sans malts spéciaux, la bière serait fade et pâle.",
    typicalValues: "5-20% du grain total. Rarement plus de 1 kg pour 20L.",
    example: "Crystal 60 pour du caramel, Chocolate Malt pour du chocolat/café.",
  },
  {
    term: "Acide alpha",
    fullName: "Acide Alpha (Alpha Acid / AA%)",
    category: "ingredient",
    definition:
      "Le taux d'acide alpha d'un houblon, exprimé en %. C'est la substance qui, une fois isomérisée par l'ébullition, donne l'amertume à la bière.",
    whyItMatters:
      "Plus le % AA est élevé, plus le houblon est amer pour une même quantité. Cela influence directement le calcul des IBU.",
    typicalValues: "3-6% (aromatique), 6-10% (mixte), 10-15%+ (amérisant)",
    example:
      "Saaz à 3.5% AA = houblon aromatique doux. Columbus à 15% AA = houblon très amérisant.",
  },
  {
    term: "Levure",
    fullName: "Levure (Yeast)",
    category: "ingredient",
    definition:
      "Micro-organisme (Saccharomyces cerevisiae pour les ales, S. pastorianus pour les lagers) qui consomme les sucres du moût et produit de l'alcool, du CO₂ et des arômes.",
    whyItMatters:
      "La levure est responsable de 50% du profil aromatique de la bière. Le choix de la souche influence l'atténuation, les esters (fruité), les phénols (épicé) et la clarté.",
    example:
      "US-05 = levure neutre et fiable. Belle Saison = saveurs poivrées et épicées. WB-06 = banane et clou de girofle (Blanche).",
  },

  // === DÉFAUTS ===
  {
    term: "DMS",
    fullName: "Diméthylsulfure",
    category: "defaut",
    definition:
      "Composé chimique qui donne un goût de maïs cuit, de légume cuit ou de chou. Produit pendant l'ébullition à partir du précurseur SMM (présent dans le malt).",
    whyItMatters:
      "Un des défauts les plus courants chez les débutants. Se forme si l'ébullition est trop courte, si le moût est couvert pendant l'ébullition, ou si le refroidissement est trop lent.",
    example:
      "Solution : ébullition vigoureuse 60+ min (90 min pour Pilsner), couvercle ouvert, refroidissement rapide.",
  },
  {
    term: "Oxydation",
    fullName: "Oxydation de la bière",
    category: "defaut",
    definition:
      "Contact de la bière avec l'oxygène après fermentation. Donne des goûts de carton mouillé, de sherry ou de fruit trop mûr.",
    whyItMatters:
      "L'oxygène est l'ennemi de la bière finie. Avant fermentation, l'oxygène est souhaité (la levure en a besoin). Après, il faut le minimiser.",
    example:
      "Transférez en douceur (siphon, pas de splash). Remplissez les bouteilles jusqu'au goulot. Évitez les transferts inutiles.",
  },
  {
    term: "Infection",
    fullName: "Infection / Contamination bactérienne",
    category: "defaut",
    definition:
      "Présence de bactéries ou levures sauvages indésirables dans le moût/bière. Donne des saveurs acides, aigres, vinaigrées, ou des textures visqueuses.",
    whyItMatters:
      "La cause principale de brassins ratés. Se prévient par un nettoyage et une désinfection rigoureux de tout ce qui touche le moût après ébullition.",
    example:
      "Symptômes : pellicule blanche sur la bière, goût aigre inattendu, bulles du barboteur après 3+ semaines.",
  },
  {
    term: "Esters",
    fullName: "Esters (arômes fruités)",
    category: "defaut",
    definition:
      "Composés aromatiques produits par la levure pendant la fermentation. Donnent des arômes de banane, pomme, poire, fruits tropicaux. Souhaités dans certains styles (Blanche, Saison), indésirables dans d'autres (Lager, Pilsner).",
    whyItMatters:
      "Une fermentation trop chaude produit trop d'esters. Le contrôle de la température est essentiel pour maîtriser le profil aromatique.",
    example:
      "WB-06 à 22°C = banane prononcée (bien pour une Blanche). US-05 à 22°C = esters fruités légers (neutre).",
  },
  {
    term: "Faux-goûts",
    fullName: "Off-flavors (Faux-goûts)",
    category: "defaut",
    definition:
      "Terme générique pour toutes les saveurs indésirables dans la bière : DMS (maïs), diacétyle (beurre), acétaldéhyde (pomme verte), phénols (médicament), esters excessifs (solvant).",
    whyItMatters:
      "Chaque faux-goût a une cause identifiable et une solution. Apprendre à les reconnaître et les prévenir est essentiel pour progresser en brassage.",
    example:
      "Diacétyle (beurre) → laisser la levure « nettoyer » en fin de fermentation (diacetyl rest). Acétaldéhyde (pomme verte) → fermentation trop courte.",
  },

  // === ÉQUIPEMENT ===
  {
    term: "Densimètre",
    fullName: "Densimètre / Hydromètre",
    category: "equipement",
    definition:
      "Instrument en verre qui flotte dans le moût/bière et indique la densité. Permet de mesurer l'OG et la FG, donc de calculer l'ABV et de confirmer la fin de fermentation.",
    whyItMatters:
      "Sans densimètre, on brasse « à l'aveugle ». C'est l'outil le plus important après le fermenteur pour un brasseur amateur.",
    example:
      "Deux mesures de FG identiques à 48h d'intervalle = fermentation terminée, on peut embouteiller.",
  },
  {
    term: "Refroidisseur",
    fullName: "Refroidisseur de moût (Wort Chiller)",
    category: "equipement",
    definition:
      "Serpentin en cuivre ou inox plongé dans le moût chaud, dans lequel circule de l'eau froide. Permet de refroidir le moût de 100°C à 20°C en 15-30 minutes.",
    whyItMatters:
      "Un refroidissement rapide réduit le risque d'infection et la formation de DMS. Sans refroidisseur, il faut utiliser un bain de glace (plus lent).",
  },
  // ===== ENTRÉES SUPPLÉMENTAIRES =====
  {
    term: "Brassin",
    fullName: "Brassin (Batch)",
    category: "processus",
    definition:
      "La quantité de bière produite en une seule fois, exprimée en litres. Ex : un brassin de 20 L signifie que l'on brasse pour obtenir 20 litres finis.",
    whyItMatters:
      "La taille du brassin influence les quantités d'ingrédients, la gestion de l'équipement et l'échelle des pertes (trub, charbon actif).",
    typicalValues: "5–30 L (amateur), 50–1000+ L (pro)",
    example: "Brasser 20 L nécessite ~3–5 kg de malts selon la densité souhaitée.",
  },
  {
    term: "Grist",
    fullName: "Grist / Grain bill (Concassé)",
    category: "ingredient",
    definition:
      "Mélange total des malts (et adjoints) que l'on utilise pour un brassin. Inclut le malt de base et les malts spéciaux.",
    whyItMatters:
      "Le grist détermine le profil de saveur, la couleur et la quantité de sucres disponibles pour la fermentation.",
    example: "Grist pour une Pale Ale : 85% Pale Malt, 10% Crystal, 5% Munich.",
  },
  {
    term: "Concassage",
    fullName: "Concassage des grains (Crushing/Milling)",
    category: "processus",
    definition:
      "Action de casser l'enveloppe du grain pour exposer l'endosperme amidonné tout en conservant des fragments de la balle (hull).",
    whyItMatters:
      "Un concassage trop fin bloque la filtration; trop grossier réduit l'extraction des sucres. Trouver le bon réglage est crucial.",
    example: "Régler le moulin pour laisser des fragments de coque et une mouture uniforme.",
  },
  {
    term: "Lauter / Décantation",
    fullName: "Lautering (Lauter tun)",
    category: "processus",
    definition:
      "Séparation du liquide sucré (moût) des résidus de grains après l'empâtage, généralement via un lauter-tun ou une cuve filtrante.",
    whyItMatters:
      "Permet d'extraire le maximum de sucres tout en gardant la filtration fluide; technique importante pour le rendement.",
    example: "Recirculation initiale (vorlauf) jusqu'à clarification, puis récupération du moût clair.",
  },
  {
    term: "Sparge",
    fullName: "Sparging (Rinçage des grains)",
    category: "processus",
    definition:
      "Rinçage des drêches avec de l'eau chaude pour extraire les sucres restants après empâtage. Se fait généralement par pulse, continu ou fly-sparge.",
    whyItMatters:
      "Le sparge augmente le rendement d'extraction. Mal réalisé, il peut extraire des tanins (goûts astringents).",
    typicalValues: "Eau de sparge 75–78°C selon recette",
  },
  {
    term: "Mash out",
    fullName: "Mash out (Arrêt d'empâtage)",
    category: "processus",
    definition:
      "Élévation de la température du mash à ~76–78°C juste avant le lautering pour arrêter l'activité enzymatique et fluidifier le moût.",
    whyItMatters:
      "Aide à réduire la viscosité et facilite le rinçage des drêches; stabilise la conversion des sucres.",
  },
  {
    term: "Décantation / Trub",
    fullName: "Trub (Dépôts après ébullition)",
    category: "equipement",
    definition:
      "Dépôts de protéines coagulées, résidus de houblon et autres particules qui se forment pendant l'ébullition et sédimentent au fond de la marmite.",
    whyItMatters:
      "Éviter de transférer le trub dans le fermenteur réduit les défauts, mais garder un peu de trub peut aider la levure au départ.",
  },
  {
    term: "Kettle / Marmite",
    fullName: "Marmite d'ébullition (Brew Kettle)",
    category: "equipement",
    definition:
      "Cuve où le moût est porté à ébullition et où on ajoute le houblon aux différents paliers.",
    whyItMatters:
      "La taille et la forme influencent la réduction (evaporation), l'extraction des houblons et la gestion des ébullitions vigoureuses.",
  },
  {
    term: "Krausen",
    fullName: "Krausen (mousse de fermentation)",
    category: "processus",
    definition:
      "Mousse formée par l'activité de la levure pendant la fermentation primaire. Contient levure active et protéines.",
    whyItMatters:
      "Sa formation et sa chute donnent des indices sur la vigueur de la fermentation. Un krausen persistant peut être signe d'infection ou d'activité prolongée.",
  },
  {
    term: "Krausening",
    fullName: "Krausening (Référmentation naturelle)",
    category: "processus",
    definition:
      "Technique de carbonatation consistant à ajouter du moût jeune et actif à une bière terminée pour relancer une refermentation propre en bouteille/fût.",
    whyItMatters:
      "Préférée par certains brasseurs pour une carbonatation plus propre que l'ajout de sucre sec.",
  },
  {
    term: "Ensemencement",
    fullName: "Pitching (Ensemencement de levure)",
    category: "processus",
    definition:
      "Ajout de levure au moût refroidi. La quantité (pitching rate) et la vitalité de la levure déterminent la santé de la fermentation.",
    whyItMatters:
      "Sous-ensemencer peut provoquer des esters/faux-goûts; sur-ensemencer peut réduire la complexité. Le bon dosage est essentiel.",
    example: "Pour ales: 0.75–1.5 million cellules/ml/°P; pour lagers: ~1.5–2.5M.",
  },
  {
    term: "Starter",
    fullName: "Starter de levure (Levain)",
    category: "processus",
    definition:
      "Pré-culture de levure faite en faisant démarrer la levure dans un petit volume de moût (ou extrait) pour augmenter le nombre de cellules et leur vitalité avant l'ensemencement.",
    whyItMatters:
      "Permet d'ensemencer correctement de gros brassins ou des moûts à haute densité sans sous-ensemencer.",
  },
  {
    term: "Oxygénation / Aération",
    fullName: "Oxygénation / Aération du moût",
    category: "processus",
    definition:
      "Introduction d'oxygène (ou d'air) dans le moût avant l'ensemencement pour permettre à la levure de se multiplier et d'effectuer une fermentation saine.",
    whyItMatters:
      "Insuffisamment d'oxygène = fermentation lente, production d'esters/faux-goûts; trop d'oxygène après fermentation = oxydation.",
    example: "Aération par agitation vigoureuse 60–90s ou injection d'O₂ pure pendant 5–60s selon débit.",
  },
  {
    term: "Floculation",
    fullName: "Floculation (décantation de la levure)",
    category: "processus",
    definition:
      "Tendance d'une souche de levure à s'agglomérer et retomber au fond du fermenteur après la fermentation.",
    whyItMatters:
      "Une floculation élevée facilite la clarification; une faible floculation peut nécessiter une filtration ou une clarification supplémentaire.",
  },
  {
    term: "Cold crash",
    fullName: "Cold Crash (Refroidissement brutal)",
    category: "processus",
    definition:
      "Refroidissement rapide de la bière finie à basse température (0–4°C) pendant 24–72h pour faire chuter les particules en suspension et clarifier la bière.",
    whyItMatters:
      "Améliore la clarté et stabilise la bière avant l'embouteillage ou le conditionnement en fût.",
  },
  {
    term: "Diacetyl rest",
    fullName: "Diacetyl rest (Repos diacétyle)",
    category: "processus",
    definition:
      "Élever légèrement la température en fin de fermentation (surtout pour lagers) pour permettre à la levure de réduire le diacétyle (goût de beurre).",
    whyItMatters:
      "Prévenir le goût beurré dans les lagers; souvent 1-3 jours à 18-20°C après fermentation principale.",
  },
  {
    term: "Dextrines",
    fullName: "Dextrines (sucres non fermentescibles)",
    category: "ingredient",
    definition:
      "Sucres lourds non fermentescibles par la levure, apportant corps, rondeur et sensation de sucrosité en bouche.",
    whyItMatters:
      "La proportion de dextrines influence le 'body' et la tenue en bouche de la bière.",
  },
  {
    term: "Adjoint",
    fullName: "Adjoint / Adjunct",
    category: "ingredient",
    definition:
      "Ingrédients autres que le malt (sucre, riz, maïs, fruits, épices) utilisés pour modifier la saveur, la couleur ou la teneur en alcool.",
    whyItMatters:
      "Permet d'ajuster le profil sans augmenter la proportion de malt de base; utilisés fréquemment en bières légères commerciales.",
  },
  {
    term: "Décotion",
    fullName: "Décotion (Decoction)",
    category: "processus",
    definition:
      "Technique d'empâtage ancienne consistant à retirer une partie du mash, la porter à ébullition puis la réincorporer pour augmenter la température et extraire des saveurs torréfiées.",
    whyItMatters:
      "Donne des notes de malt plus complexes et une meilleure couleur pour certaines bières traditionnelles (Pilsner, Märzen).",
  },
  {
    term: "Mouthfeel",
    fullName: "Mouthfeel (Texture en bouche)",
    category: "processus",
    definition:
      "Sensation tactile en bouche : corps, onctuosité, carbonatation et texture. Influencé par les dextrines, l'alcool et la carbonatation.",
    whyItMatters:
      "Détermine si la bière paraît légère, ronde, crémeuse ou aqueuse.",
  },
  {
    term: "Head retention",
    fullName: "Rétention de mousse (Head retention)",
    category: "processus",
    definition:
      "Capacité de la bière à maintenir une mousse stable et persistante. Dépend des protéines du malt, des houblons et des pratiques de brassage.",
    whyItMatters:
      "La mousse influence l'aspect et la perception aromatique; une bonne rétention est souvent signe d'une bière bien faite.",
  },
];
