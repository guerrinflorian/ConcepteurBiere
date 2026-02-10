/**
 * Générateur de procédure de fabrication A → Z.
 *
 * Produit une liste d'étapes personnalisées selon :
 * - les ingrédients (malts, houblons, levure, sucre)
 * - le volume souhaité
 * - le matériel disponible
 * - les paramètres de processus
 */

import { Recipe, ProcedureStep, Malt, Hop, Yeast, Equipment, Adjunct } from "./types";
import { calculateWaterPlan, totalGrainKg } from "./waterCalc";

interface ProcedureContext {
  recipe: Recipe;
  maltsData: Malt[];
  hopsData: Hop[];
  yeast: Yeast | undefined;
  adjunctsData: Adjunct[];
  equipmentData: Equipment[];
  hasChiller: boolean;
  hasHydrometer: boolean;
  hasTempControl: boolean;
}

export function buildProcedureContext(
  recipe: Recipe,
  maltsData: Malt[],
  hopsData: Hop[],
  yeastsData: Yeast[],
  adjunctsData: Adjunct[],
  equipmentData: Equipment[]
): ProcedureContext {
  const selected = recipe.profile.selectedEquipment
    .map((id) => equipmentData.find((e) => e.id === id))
    .filter(Boolean) as Equipment[];

  return {
    recipe,
    maltsData,
    hopsData,
    yeast: yeastsData.find((y) => y.id === recipe.yeastId),
    adjunctsData,
    equipmentData,
    hasChiller: recipe.equipmentInfo.hasChiller || selected.some((e) => e.category === "refroidissement"),
    hasHydrometer: recipe.equipmentInfo.hasHydrometer || recipe.profile.selectedEquipment.includes("hydrometer"),
    hasTempControl: recipe.equipmentInfo.hasTempControl || selected.some((e) => e.category === "température"),
  };
}

/**
 * Génère la procédure complète de fabrication.
 */
export function generateProcedure(ctx: ProcedureContext): ProcedureStep[] {
  const steps: ProcedureStep[] = [];
  const { recipe } = ctx;
  const waterPlan = calculateWaterPlan(recipe);
  const method = recipe.params.method;
  const isAllGrain = method === "tout_grain";
  const totalSugar = Math.round(recipe.conditioning.sugarPerLiter * recipe.params.volume);

  // 1) Préparation & Hygiène
  steps.push(buildPreparationStep(ctx, waterPlan));

  // 2) Chauffe de l'eau
  steps.push(buildHeatWaterStep(ctx, waterPlan, isAllGrain));

  // 3) Empâtage (tout-grain uniquement)
  if (isAllGrain) {
    steps.push(buildMashStep(ctx, waterPlan));
  }

  // 4) Filtration & Rinçage (tout-grain uniquement)
  if (isAllGrain) {
    steps.push(buildSpargeStep(ctx, waterPlan));
  }

  // 5) Ébullition + ajouts houblon
  steps.push(buildBoilStep(ctx, waterPlan));

  // 6) Refroidissement
  steps.push(buildCoolingStep(ctx));

  // 7) Transfert en fermenteur
  steps.push(buildTransferStep(ctx));

  // 8) Ensemencement levure
  steps.push(buildPitchYeastStep(ctx));

  // 9) Fermentation
  steps.push(buildFermentationStep(ctx));

  // 10) Conditionnement
  steps.push(buildConditioningStep(ctx, totalSugar));

  // 11) Maturation & Dégustation
  steps.push(buildMaturationStep(ctx));

  return steps;
}

// === Constructeurs d'étapes ===

function buildPreparationStep(ctx: ProcedureContext, waterPlan: ReturnType<typeof calculateWaterPlan>): ProcedureStep {
  const equipmentList = ctx.recipe.profile.selectedEquipment
    .map((id) => ctx.equipmentData.find((e) => e.id === id)?.name)
    .filter(Boolean);

  return {
    id: "preparation",
    title: "Préparation & Hygiène",
    durationMin: 20,
    details: [
      "Rassemblez tout votre matériel sur votre plan de travail.",
      equipmentList.length > 0
        ? `Matériel à préparer : ${equipmentList.join(", ")}.`
        : "Préparez votre cuve, fermenteur, thermomètre et ustensiles.",
      "Nettoyez votre fermenteur, siphon, barboteur et tout ce qui touchera le moût APRÈS l'ébullition avec un produit désinfectant (Chemipro, Star San…).",
      "La cuve d'ébullition n'a pas besoin d'être désinfectée (l'ébullition stérilise).",
      `Préparez ${waterPlan.totalWaterL} L d'eau au total.`,
    ],
    tips: [
      "La contamination est l'ennemi n°1 du brasseur. Tout ce qui touche le moût refroidi doit être impeccable.",
      "Préparez un spray de désinfectant pour les imprévus pendant le brassage.",
    ],
    warnings: [
      "Ne négligez JAMAIS cette étape : 90% des brassins ratés sont dus à un défaut d'hygiène.",
    ],
  };
}

function buildHeatWaterStep(
  ctx: ProcedureContext,
  waterPlan: ReturnType<typeof calculateWaterPlan>,
  isAllGrain: boolean
): ProcedureStep {
  const mashTemp = ctx.recipe.mashing.mashTemp;

  if (isAllGrain) {
    return {
      id: "heat_water",
      title: "Chauffe de l'eau d'empâtage",
      durationMin: 20,
      details: [
        `Mesurez ${waterPlan.mashWaterL} L d'eau (eau d'empâtage).`,
        `Chauffez l'eau à ${mashTemp + 2}°C (visez 2°C au-dessus de la cible car la température baisse en ajoutant les grains).`,
        `Température cible d'empâtage : ${mashTemp}°C.`,
        `En parallèle, préparez ${waterPlan.spargeWaterL} L d'eau de rinçage et commencez à la chauffer à 75-78°C.`,
      ],
      tips: [
        "Utilisez un thermomètre fiable. La température d'empâtage est cruciale pour le profil de la bière.",
        `${mashTemp}°C → ${mashTemp < 65 ? "bière sèche et alcoolisée" : mashTemp < 67 ? "bon équilibre corps/alcool" : "bière ronde et moelleuse"}.`,
      ],
    };
  }

  return {
    id: "heat_water",
    title: "Chauffe de l'eau",
    durationMin: 15,
    details: [
      `Mesurez ${waterPlan.totalWaterL} L d'eau.`,
      "Chauffez l'eau à environ 70°C pour dissoudre l'extrait de malt.",
      "Ajoutez l'extrait de malt hors du feu en remuant bien pour éviter les grumeaux.",
      "Remettez sur le feu et portez à ébullition.",
    ],
    tips: [
      "Pour un kit, suivez les instructions du fabricant en priorité.",
      "L'eau sert principalement à diluer l'extrait et atteindre le volume final.",
    ],
  };
}

function buildMashStep(ctx: ProcedureContext, waterPlan: ReturnType<typeof calculateWaterPlan>): ProcedureStep {
  const grainKg = totalGrainKg(ctx.recipe.malts);
  const mashTemp = ctx.recipe.mashing.mashTemp;
  const maltNames = ctx.recipe.malts
    .filter((m) => m.maltId && m.amount > 0)
    .map((m) => {
      const malt = ctx.maltsData.find((md) => md.id === m.maltId);
      return `${malt?.name || m.maltId} (${m.amount} kg)`;
    });

  return {
    id: "mash",
    title: "Empâtage",
    durationMin: 60,
    details: [
      `Versez les ${grainKg.toFixed(1)} kg de grain concassé dans les ${waterPlan.mashWaterL} L d'eau chaude.`,
      `Grains : ${maltNames.join(", ")}.`,
      "Mélangez doucement mais complètement pour éviter les grumeaux de farine (« boules »).",
      `Vérifiez la température : elle doit être à ${mashTemp}°C après mélange.`,
      `Maintenez ${mashTemp}°C pendant 60 minutes. Remuez toutes les 15 min.`,
      "Couvrez la cuve entre les mélanges pour garder la chaleur.",
    ],
    tips: [
      "Si la température baisse trop (>2°C), ajoutez un peu d'eau bouillante et remuez.",
      "L'empâtage convertit l'amidon des grains en sucres fermentescibles grâce aux enzymes.",
      "Après 60 min, faites un test à l'iode (optionnel) : une goutte de moût + iode. Si ça reste brun/jaune, la conversion est complète.",
    ],
    warnings: [
      "Ne dépassez pas 78°C : les tanins extraits donneront une amertume astringente désagréable.",
    ],
  };
}

function buildSpargeStep(ctx: ProcedureContext, waterPlan: ReturnType<typeof calculateWaterPlan>): ProcedureStep {
  return {
    id: "sparge",
    title: "Filtration & Rinçage",
    durationMin: 30,
    details: [
      "Soulevez le panier à grains ou ouvrez le robinet de votre cuve-filtre doucement.",
      "Laissez le moût s'écouler lentement (ne forcez pas, un filet régulier est idéal).",
      `Rincez les grains avec ${waterPlan.spargeWaterL} L d'eau à 75-78°C.`,
      "Versez l'eau de rinçage doucement et uniformément sur les grains.",
      `Vous devez récupérer environ ${waterPlan.preBoilVolumeL} L de moût dans la cuve d'ébullition.`,
    ],
    tips: [
      "Le rinçage extrait les derniers sucres piégés dans les grains.",
      "L'eau de rinçage à 75-78°C facilite l'écoulement sans extraire de tanins.",
      "Si vous n'avez pas de cuve-filtre, vous pouvez utiliser un sac de brassage (BIAB).",
    ],
    warnings: [
      "Ne rincez pas avec de l'eau à plus de 78°C : risque d'extraction de tanins amers.",
    ],
  };
}

function buildBoilStep(ctx: ProcedureContext, waterPlan: ReturnType<typeof calculateWaterPlan>): ProcedureStep {
  const boilMin = ctx.recipe.mashing.boilDuration;
  const hopAdditions = ctx.recipe.hops
    .filter((h) => h.hopId && h.amount > 0)
    .map((h) => {
      const hop = ctx.hopsData.find((hd) => hd.id === h.hopId);
      return { name: hop?.name || h.hopId, amount: h.amount, timing: h.timing, type: hop?.type };
    })
    .sort((a, b) => b.timing - a.timing);

  const details: string[] = [
    `Portez les ${waterPlan.preBoilVolumeL} L de moût à ébullition franche.`,
    "Attention au « hot break » : une mousse abondante se forme au début. Réduisez le feu et remuez si nécessaire.",
    `Maintenez une ébullition vigoureuse pendant ${boilMin} minutes. Ne couvrez PAS la cuve (le DMS doit s'évaporer).`,
  ];

  // Ajouter les ajouts de houblon chronologiquement
  if (hopAdditions.length > 0) {
    details.push("");
    details.push("--- Chronologie des ajouts de houblon ---");
    for (const hop of hopAdditions) {
      const timeLabel = hop.timing === 0
        ? "Flame-out (feu éteint)"
        : `T-${hop.timing} min (= à ${boilMin - hop.timing} min après le début)`;
      const impactLabel = hop.timing >= 30
        ? "(amertume)"
        : hop.timing >= 10
        ? "(amertume + arôme)"
        : hop.timing > 0
        ? "(arôme principalement)"
        : "(arôme maximum, pas d'amertume)";
      details.push(`${timeLabel} : ajouter ${hop.amount} g de ${hop.name} ${impactLabel}`);
    }
  }

  // Adjuvants pendant l'ébullition
  const boilAdjuncts = (ctx.recipe.adjuncts || [])
    .filter((a) => a.adjunctId && a.amount > 0)
    .map((a) => {
      const adj = ctx.adjunctsData.find((ad) => ad.id === a.adjunctId);
      return adj ? `${adj.name} (${a.amount} kg)` : null;
    })
    .filter(Boolean);

  if (boilAdjuncts.length > 0) {
    details.push(`Ajoutez les adjuvants en début d'ébullition : ${boilAdjuncts.join(", ")}.`);
  }

  details.push(`Après ${boilMin} minutes, éteignez le feu. Volume attendu : environ ${waterPlan.postBoilVolumeL} L.`);

  return {
    id: "boil",
    title: "Ébullition & Houblonnage",
    durationMin: boilMin,
    details,
    tips: [
      "Le houblon ajouté tôt (60 min) donne de l'amertume. Ajouté tard (0-15 min) il donne de l'arôme.",
      "Si ça mousse trop au début, un spray d'eau froide ou une cuillère en bois en travers de la cuve peut aider.",
      "L'ébullition élimine le DMS (goût de maïs cuit) — c'est pourquoi on ne couvre pas.",
    ],
    warnings: [
      "Ne quittez pas la cuve des yeux pendant les 10 premières minutes : le débordement arrive vite !",
    ],
  };
}

function buildCoolingStep(ctx: ProcedureContext): ProcedureStep {
  const vol = ctx.recipe.params.volume;

  if (ctx.hasChiller) {
    return {
      id: "cooling",
      title: "Refroidissement",
      durationMin: 20,
      details: [
        "Plongez votre refroidisseur (serpentin/échangeur) dans le moût.",
        "Faites circuler l'eau froide dans le serpentin.",
        `Refroidissez le moût jusqu'à ${ctx.yeast ? ctx.yeast.temp_ideal : 20}°C (température d'ensemencement).`,
        "Agitez doucement le moût autour du serpentin pour accélérer le refroidissement.",
        "Objectif : descendre sous 25°C en 20-30 minutes maximum.",
      ],
      tips: [
        "Plus le refroidissement est rapide, mieux c'est : moins d'infection, moins de DMS, meilleur « cold break » (protéines qui précipitent).",
      ],
    };
  }

  return {
    id: "cooling",
    title: "Refroidissement (sans refroidisseur)",
    durationMin: vol >= 20 ? 60 : 40,
    details: [
      "Préparez un bain d'eau froide + glace dans votre évier, baignoire ou grande bassine.",
      `Plongez la cuve dans le bain de glace. Pour ${vol} L, prévoyez au moins ${Math.ceil(vol / 4)} kg de glace.`,
      "Remuez doucement le moût (avec un ustensile désinfecté) pour accélérer l'échange thermique.",
      `Refroidissez jusqu'à ${ctx.yeast ? ctx.yeast.temp_ideal : 20}°C.`,
      "Changez l'eau du bain si elle devient tiède.",
    ],
    tips: [
      "Préparez les glaçons la veille pour en avoir suffisamment.",
      "Alternative : congelez des bouteilles d'eau et plongez-les dans le moût (bouteilles bien désinfectées à l'extérieur).",
    ],
    warnings: [
      "Entre 30°C et 60°C, les bactéries se multiplient rapidement. Minimisez le temps passé dans cette zone.",
    ],
  };
}

function buildTransferStep(ctx: ProcedureContext): ProcedureStep {
  return {
    id: "transfer",
    title: "Transfert en fermenteur",
    durationMin: 10,
    details: [
      "Transférez le moût refroidi dans votre fermenteur désinfecté à l'aide d'un siphon (ou versez doucement).",
      "Essayez de laisser le dépôt (trub) au fond de la cuve d'ébullition.",
      "Oxygénez le moût : secouez vigoureusement le fermenteur fermé pendant 1-2 minutes, ou utilisez une pierre de diffusion.",
      `Vérifiez le volume : vous devriez avoir environ ${ctx.recipe.params.volume} L.`,
    ],
    tips: [
      "L'oxygénation est IMPORTANTE à ce stade : la levure a besoin d'oxygène pour bien démarrer.",
      "Après cette étape, on ne veut PLUS d'oxygène (c'est l'ennemi de la bière finie).",
    ],
  };
}

function buildPitchYeastStep(ctx: ProcedureContext): ProcedureStep {
  const yeast = ctx.yeast;
  const details: string[] = [];

  if (yeast) {
    details.push(
      `Vérifiez que le moût est à ${yeast.temp_ideal}°C (plage acceptable : ${yeast.temp_min}-${yeast.temp_max}°C).`,
      `Saupoudrez le sachet de levure ${yeast.name} sur le moût.`,
      `Type : ${yeast.type === "ale" ? "Ale (fermentation haute)" : "Lager (fermentation basse)"}.`,
    );
    if (yeast.type === "ale") {
      details.push("Attendez 15 min, puis remuez doucement pour disperser la levure.");
    }
  } else {
    details.push(
      "Vérifiez que le moût est entre 18-22°C.",
      "Saupoudrez la levure sur le moût.",
    );
  }

  details.push(
    "Fermez le fermenteur et installez le barboteur (rempli d'eau ou de désinfectant).",
    "Placez le fermenteur dans un endroit à température stable.",
  );

  return {
    id: "pitch_yeast",
    title: "Ensemencement de la levure",
    durationMin: 5,
    details,
    tips: [
      "Ne versez JAMAIS la levure dans un moût trop chaud (>30°C) : elle mourrait.",
      "La fermentation devrait démarrer dans les 12-24h (bulles dans le barboteur).",
    ],
    warnings: yeast && yeast.type === "lager" && !ctx.hasTempControl
      ? ["Cette levure lager nécessite un contrôle de température (8-15°C). Sans frigo/chambre froide, les résultats seront imprévisibles."]
      : undefined,
  };
}

function buildFermentationStep(ctx: ProcedureContext): ProcedureStep {
  const ferm = ctx.recipe.fermentation;
  const yeast = ctx.yeast;
  const details: string[] = [];

  details.push(
    `Maintenez la température à ${ferm.fermentationTemp}°C${yeast ? ` (plage levure : ${yeast.temp_min}-${yeast.temp_max}°C)` : ""}.`,
    `Fermentation primaire : ${ferm.primaryDays} jours.`,
    "Ne touchez pas au fermenteur pendant les premiers jours. Résistez à la tentation de l'ouvrir !",
  );

  if (ctx.hasHydrometer) {
    details.push(
      `Après ${ferm.primaryDays} jours, prenez une mesure de densité (FG).`,
      "Reprenez une mesure 48h plus tard. Si la densité est stable, la fermentation est terminée.",
    );
  } else {
    details.push(
      `Attendez au minimum ${ferm.primaryDays} jours, idéalement ${ferm.primaryDays + 5} jours pour être sûr que la fermentation est terminée.`,
      "Sans densimètre, mieux vaut attendre quelques jours de plus que risquer un embouteillage prématuré.",
    );
  }

  if (ferm.hasSecondary) {
    details.push(
      `Maturation secondaire : transférez dans un second fermenteur à ${ferm.secondaryTemp}°C pendant ${ferm.secondaryDays} jours.`,
      "Ce transfert clarifie la bière et affine les saveurs.",
    );
  }

  const tips: string[] = [
    "Les bulles du barboteur ne sont pas un indicateur fiable de fin de fermentation. Seul le densimètre est fiable.",
  ];

  if (!ctx.hasTempControl) {
    tips.push(
      "Sans contrôle de température : placez le fermenteur dans l'endroit le plus stable de votre logement (placard, cave).",
      "En été, un bac d'eau autour du fermenteur + ventilateur aide à baisser la température de 2-3°C.",
    );
  }

  return {
    id: "fermentation",
    title: "Fermentation",
    durationMin: ferm.primaryDays * 24 * 60,
    details,
    tips,
  };
}

function buildConditioningStep(ctx: ProcedureContext, totalSugar: number): ProcedureStep {
  const { conditioning } = ctx.recipe;

  if (conditioning.mode === "keg") {
    return {
      id: "conditioning",
      title: "Mise en fût & Carbonatation",
      durationMin: 30,
      details: [
        "Transférez la bière dans un fût propre et désinfecté (purgé au CO₂ si possible).",
        "Connectez le CO₂ et réglez la pression à 2.0-2.5 bar à température de service (~4°C).",
        "Attendez 5-7 jours pour une carbonatation complète.",
        "Alternative rapide : « force carb » à 3 bar pendant 24-48h en secouant le fût.",
      ],
      tips: [
        "La carbonatation forcée est plus rapide et plus contrôlable que la refermentation.",
        "Purgez le fût au CO₂ avant de transférer pour minimiser l'oxydation.",
      ],
    };
  }

  return {
    id: "conditioning",
    title: "Embouteillage",
    durationMin: 60,
    details: [
      "Nettoyez et désinfectez toutes vos bouteilles, capsules et le matériel d'embouteillage.",
      `Préparez le sucre de refermentation : ${conditioning.sugarPerLiter} g/L × ${ctx.recipe.params.volume} L = ${totalSugar} g de sucre.`,
      `Dissolvez les ${totalSugar} g de sucre dans un peu d'eau bouillante (~100 mL). Laissez refroidir.`,
      "Versez la solution sucrée dans un seau d'embouteillage désinfecté.",
      "Transférez la bière doucement (siphon) sur le sirop de sucre. Mélangez très doucement pour homogénéiser.",
      "Remplissez les bouteilles en laissant 2-3 cm sous le goulot.",
      "Capsulez immédiatement chaque bouteille.",
    ],
    tips: [
      "Ne remuez pas trop fort : l'oxygénation à ce stade est néfaste.",
      "Utilisez un tube de remplissage avec arrêt automatique pour un remplissage régulier.",
      `Pour ${ctx.recipe.params.volume} L, prévoyez environ ${Math.ceil(ctx.recipe.params.volume / 0.33)} bouteilles de 33 cL ou ${Math.ceil(ctx.recipe.params.volume / 0.75)} bouteilles de 75 cL.`,
    ],
    warnings: [
      "Assurez-vous que la fermentation est TERMINÉE avant d'embouteiller. Sinon : surpression → bouteilles qui explosent !",
    ],
  };
}

function buildMaturationStep(ctx: ProcedureContext): ProcedureStep {
  const isBottle = ctx.recipe.conditioning.mode === "bottles";

  return {
    id: "maturation",
    title: "Maturation & Dégustation",
    details: [
      ...(isBottle
        ? [
            "Stockez les bouteilles debout à température ambiante (~20°C) pendant 2-3 semaines pour la prise de mousse.",
            "Ensuite, placez au frais (cave, frigo) pour la maturation.",
          ]
        : [
            "Laissez le fût au froid pendant 1-2 semaines pour que les saveurs s'affinent.",
          ]),
      "Patience ! La plupart des bières s'améliorent avec 2-4 semaines de maturation.",
      "Les bières fortes (>7% ABV) gagnent à mûrir 1-3 mois.",
      "Dégustez votre première bouteille après le temps de maturation minimum. Notez vos impressions !",
    ],
    tips: [
      "Goûtez une bouteille chaque semaine pour observer l'évolution.",
      "Si la bière a un léger goût de levure ou de « vert », c'est normal — ça s'améliorera.",
      "Conservez vos bouteilles à l'abri de la lumière (les UV dégradent le houblon → goût de « moufette »).",
    ],
  };
}
