/**
 * Checklist d'hygiène par étape du brassage.
 *
 * Chaque étape contient des items à vérifier. Les items peuvent être
 * conditionnels (appliesWhen) selon l'équipement ou le mode de conditionnement.
 *
 * Pour ajouter un item : ajouter un objet dans le tableau `items` de l'étape
 * concernée. L'id doit être unique au sein de toute la checklist.
 */

export interface AppliesWhen {
  /** L'item ne s'affiche que si le mode de conditionnement est celui-ci */
  packagingType?: "bottles" | "keg";
  /** L'item ne s'affiche que si l'utilisateur possède un chiller */
  hasChiller?: boolean;
  /** L'item ne s'affiche que si l'utilisateur possède un contrôle de température */
  hasTempControl?: boolean;
}

export interface ChecklistItem {
  id: string;
  label: string;
  /** Pourquoi c'est important */
  why: string;
  /** Comment faire concrètement */
  how: string;
  severity: "info" | "warn";
  appliesWhen?: AppliesWhen;
}

export interface ChecklistStep {
  stepId: string;
  title: string;
  /** Introduction pédagogique de cette section (affichée en mode débutant) */
  intro: string;
  items: ChecklistItem[];
}

export const hygieneChecklist: ChecklistStep[] = [
  {
    stepId: "step0",
    title: "Hygiène — Préparation du matériel",
    intro:
      "Avant de commencer à brasser, tout votre matériel doit être propre. L'hygiène est LA règle n°1 du brassage : une contamination peut ruiner un brassin entier. Prenez 15 minutes pour bien nettoyer et désinfecter.",
    items: [
      {
        id: "clean_kettle",
        label: "Nettoyer la cuve de brassage",
        why: "Les résidus de brassins précédents peuvent héberger des bactéries et altérer le goût de votre bière. Un nettoyage élimine les dépôts organiques.",
        how: "Rincez à l'eau chaude, frottez avec un produit de nettoyage adapté (PBW, OxiClean), puis rincez abondamment à l'eau claire. Séchez ou laissez égoutter.",
        severity: "warn",
      },
      {
        id: "clean_fermenter",
        label: "Nettoyer et désinfecter le fermenteur",
        why: "Le fermenteur est en contact prolongé avec le moût non protégé (pas d'ébullition). C'est le point le plus critique pour les contaminations.",
        how: "Nettoyez d'abord (PBW ou savon doux), rincez, puis désinfectez avec une solution de StarSan ou acide peracétique. Ne rincez pas après désinfection (StarSan est sans rinçage).",
        severity: "warn",
      },
      {
        id: "clean_tools",
        label: "Désinfecter les petits outils (cuillère, densimètre, siphon…)",
        why: "Chaque objet en contact avec le moût après ébullition est un vecteur potentiel de contamination.",
        how: "Trempez tous les petits outils dans une solution désinfectante pendant au moins 2 minutes avant utilisation.",
        severity: "warn",
      },
      {
        id: "check_airlock",
        label: "Vérifier le barboteur et le joint du fermenteur",
        why: "Un barboteur mal posé ou un joint défectueux laisse entrer l'air (et ses micro-organismes) pendant la fermentation.",
        how: "Remplissez le barboteur avec de l'eau propre ou du StarSan dilué. Vérifiez que le joint du couvercle est bien en place.",
        severity: "info",
      },
    ],
  },
  {
    stepId: "step2",
    title: "Hygiène — Empâtage & Malts",
    intro:
      "Pendant l'empâtage, le risque de contamination est faible car le moût sera bouilli ensuite. Cependant, de bonnes pratiques dès cette étape simplifient la suite.",
    items: [
      {
        id: "rinse_grains",
        label: "Inspecter les grains (pas de moisissure visible)",
        why: "Des grains moisis peuvent introduire des mycotoxines et des saveurs désagréables impossibles à corriger.",
        how: "Avant de concasser, vérifiez visuellement que les grains sont propres, secs, sans taches noires ou vertes. Sentez-les : une odeur de moisi est un signal d'alerte.",
        severity: "info",
      },
      {
        id: "clean_mash_tun",
        label: "Vérifier la propreté de la cuve d'empâtage",
        why: "Même si le moût sera bouilli, des résidus organiques peuvent causer des saveurs parasites et bloquer les filtres.",
        how: "Un rinçage rapide à l'eau chaude suffit à cette étape.",
        severity: "info",
      },
    ],
  },
  {
    stepId: "step5",
    title: "Hygiène — Ébullition & Refroidissement",
    intro:
      "L'ébullition stérilise le moût. À partir du moment où vous éteignez le feu, TOUT ce qui touche le moût doit être désinfecté. C'est le moment le plus critique.",
    items: [
      {
        id: "sanitize_chiller",
        label: "Désinfecter le refroidisseur avant de le plonger dans le moût",
        why: "Le refroidisseur entre en contact direct avec le moût stérile. Toute contamination à ce stade se développera sans obstacle pendant la fermentation.",
        how: "Plongez le serpentin dans le moût 15 minutes avant la fin de l'ébullition (la chaleur le stérilisera), OU trempez-le dans du StarSan.",
        severity: "warn",
        appliesWhen: { hasChiller: true },
      },
      {
        id: "cool_quickly",
        label: "Refroidir le moût le plus rapidement possible (< 30 min idéal)",
        why: "Entre 30°C et 60°C, les bactéries se multiplient très vite. Un refroidissement lent favorise aussi la formation de DMS (goût de maïs cuit).",
        how: "Utilisez un refroidisseur à immersion ou un bain de glace. Visez passer de 100°C à 20°C en moins de 30 minutes.",
        severity: "warn",
      },
      {
        id: "sanitize_transfer",
        label: "Désinfecter tout le circuit de transfert (tuyaux, robinet, entonnoir)",
        why: "Le transfert du moût refroidi vers le fermenteur est un moment à haut risque de contamination.",
        how: "Faites circuler du StarSan dans les tuyaux, trempez les raccords. Ne touchez pas l'intérieur des tuyaux avec les doigts.",
        severity: "warn",
      },
    ],
  },
  {
    stepId: "step6",
    title: "Hygiène — Fermentation",
    intro:
      "Pendant la fermentation, la levure produit du CO₂ et de l'alcool qui protègent partiellement le moût. Mais le risque zéro n'existe pas : gardez de bonnes pratiques.",
    items: [
      {
        id: "no_open_fermenter",
        label: "Ne pas ouvrir le fermenteur inutilement",
        why: "Chaque ouverture expose le moût à l'air ambiant et ses micro-organismes. La curiosité est l'ennemi du brasseur !",
        how: "Résistez à la tentation de vérifier visuellement. Utilisez le barboteur comme indicateur d'activité, ou un densimètre/robinet de prélèvement si disponible.",
        severity: "warn",
      },
      {
        id: "check_airlock_daily",
        label: "Vérifier le niveau d'eau du barboteur régulièrement",
        why: "Si le barboteur s'assèche, l'air entre librement dans le fermenteur. En fermentation active ce n'est pas grave (le CO₂ sort), mais en fin de fermentation c'est risqué.",
        how: "Vérifiez tous les 2-3 jours que le barboteur contient encore du liquide. Complétez avec de l'eau ou du StarSan dilué si besoin.",
        severity: "info",
      },
      {
        id: "sanitize_hydrometer",
        label: "Désinfecter le densimètre et l'éprouvette avant chaque mesure",
        why: "Plonger un outil non désinfecté dans le moût en fermentation peut introduire des bactéries.",
        how: "Trempez le densimètre et l'éprouvette dans du StarSan avant chaque prélèvement. Ne reversez jamais l'échantillon dans le fermenteur.",
        severity: "warn",
      },
    ],
  },
  {
    stepId: "step7",
    title: "Hygiène — Conditionnement",
    intro:
      "L'embouteillage ou la mise en fût est la dernière étape critique. Une contamination ici peut provoquer des bombes (surpression) ou des saveurs aigres/acétiques.",
    items: [
      {
        id: "sanitize_bottles",
        label: "Nettoyer et désinfecter chaque bouteille",
        why: "Les bouteilles réutilisées peuvent contenir des résidus de bière précédente, des moisissures ou des bactéries. Une seule bouteille contaminée = une bouteille perdue.",
        how: "Rincez à l'eau chaude, puis trempez ou rincez avec du StarSan. Laissez égoutter tête en bas. Pour les bouteilles très sales, trempez dans du PBW toute une nuit.",
        severity: "warn",
        appliesWhen: { packagingType: "bottles" },
      },
      {
        id: "sanitize_caps",
        label: "Désinfecter les capsules ou bouchons",
        why: "Les capsules sortent d'un sachet pas toujours stérile. Le joint intérieur peut héberger des contaminants.",
        how: "Trempez les capsules dans du StarSan 2 minutes avant de les utiliser.",
        severity: "info",
        appliesWhen: { packagingType: "bottles" },
      },
      {
        id: "sanitize_siphon",
        label: "Désinfecter le siphon et les tuyaux de transfert",
        why: "Tout le circuit entre le fermenteur et les bouteilles/fût doit être stérile pour éviter une contamination de dernière minute.",
        how: "Faites circuler du StarSan dans le circuit complet. Laissez agir 2 minutes minimum.",
        severity: "warn",
      },
      {
        id: "sanitize_keg",
        label: "Désinfecter le fût et les connecteurs",
        why: "Un fût mal nettoyé est un nid à bactéries. Les joints et les tubes plongeurs sont des zones difficiles à atteindre.",
        how: "Démontez les connecteurs, trempez tout dans du PBW puis rincez. Remplissez le fût de StarSan, pressurisez légèrement pour faire passer la solution dans les tubes, puis videz.",
        severity: "warn",
        appliesWhen: { packagingType: "keg" },
      },
      {
        id: "measure_sugar",
        label: "Peser précisément le sucre de refermentation",
        why: "Trop de sucre = surpression = bouteilles qui explosent (dangereux !). Pas assez = bière plate.",
        how: "Utilisez une balance de cuisine précise au gramme. Dissolvez le sucre dans un peu d'eau bouillante, laissez refroidir, puis mélangez doucement au moût.",
        severity: "warn",
        appliesWhen: { packagingType: "bottles" },
      },
    ],
  },
];
