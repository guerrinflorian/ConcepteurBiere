/**
 * Moteur de règles de détection de risques en temps réel.
 *
 * Chaque règle évalue l'état de la recette et retourne un risque si les
 * conditions sont remplies. Les risques sont triés par sévérité (danger > warn > info).
 *
 * Pour ajouter une règle : ajouter un objet dans le tableau `riskRules`.
 * La fonction `when(ctx)` reçoit tout le contexte nécessaire pour évaluer la condition.
 */

import { Recipe, Yeast, Equipment } from "./types";

export type RiskLevel = "info" | "warn" | "danger";

export interface Risk {
  id: string;
  level: RiskLevel;
  title: string;
  message: string;
  /** Explication simple pour les débutants : pourquoi ce risque est important */
  whyItMatters: string;
  /** Actions concrètes pour corriger ou prévenir */
  howToFix: string[];
}

interface RiskRule {
  id: string;
  /** Évalue si la règle s'applique ; retourne null si pas de risque, un Risk sinon */
  evaluate(ctx: RiskContext): Risk | null;
}

/** Contexte dérivé de la recette, passé à chaque règle */
export interface RiskContext {
  recipe: Recipe;
  yeast: Yeast | undefined;
  /** Capacité de la plus grande cuve sélectionnée (en litres), ou undefined */
  kettleCapacityL: number | undefined;
  hasChiller: boolean;
  hasTempControl: boolean;
  hasHydrometer: boolean;
}

/**
 * Construit le contexte de risque à partir de la recette et des données de référence.
 */
export function buildRiskContext(
  recipe: Recipe,
  yeast: Yeast | undefined,
  equipmentData: Equipment[]
): RiskContext {
  const selectedEquipment = recipe.profile.selectedEquipment
    .map((id) => equipmentData.find((e) => e.id === id))
    .filter(Boolean) as Equipment[];

  // Déterminer la capacité de la cuve (extraire le nombre de litres du nom)
  const kettles = selectedEquipment.filter((e) => e.category === "cuve");
  let kettleCapacityL: number | undefined;
  for (const k of kettles) {
    const match = k.name.match(/(\d+)\s*[Ll]/);
    if (match) {
      const cap = parseInt(match[1]);
      if (!kettleCapacityL || cap > kettleCapacityL) kettleCapacityL = cap;
    }
  }

  const hasChiller = selectedEquipment.some((e) => e.category === "refroidissement");
  const hasTempControl = selectedEquipment.some((e) => e.category === "température");
  const hasHydrometer = recipe.profile.selectedEquipment.includes("hydrometer");

  return {
    recipe,
    yeast,
    kettleCapacityL,
    hasChiller,
    hasTempControl,
    hasHydrometer,
  };
}

/** Toutes les règles de risque */
const riskRules: RiskRule[] = [
  // 1) Priming trop élevé (sucre de refermentation)
  {
    id: "priming_high",
    evaluate(ctx) {
      const { recipe } = ctx;
      if (recipe.conditioning.mode !== "bottles") return null;
      const sugar = recipe.conditioning.sugarPerLiter;

      if (sugar > 9) {
        return {
          id: "priming_danger",
          level: "danger",
          title: "Sucre de refermentation dangereux !",
          message: `${sugar} g/L de sucre est très élevé. Risque d'explosion de bouteilles (gushing/bombe).`,
          whyItMatters:
            "Trop de sucre produit trop de CO₂ dans la bouteille fermée. La pression peut dépasser la résistance du verre et faire exploser les bouteilles. C'est dangereux (éclats de verre) et salissant.",
          howToFix: [
            "Réduisez le sucre à 5-7 g/L pour une carbonatation standard",
            "8 g/L maximum pour une bière très pétillante (Saison, Blanche)",
            "Vérifiez que la fermentation est bien terminée avant d'embouteiller (FG stable 2 jours)",
            "Utilisez des bouteilles résistantes à la pression (pas de bouteilles fines/décoratives)",
          ],
        };
      }
      if (sugar >= 8) {
        return {
          id: "priming_warn",
          level: "warn",
          title: "Sucre de refermentation élevé",
          message: `${sugar} g/L est au-dessus de la moyenne. Assurez-vous que la fermentation est complètement terminée.`,
          whyItMatters:
            "Si la fermentation primaire n'est pas totalement terminée, le sucre résiduel + le sucre ajouté peuvent créer une surpression. Certains styles tolèrent cette carbonatation élevée (Saison, Blanche), d'autres non.",
          howToFix: [
            "Vérifiez la FG avec un densimètre avant d'embouteiller",
            "Si vous voulez une forte carbonatation, utilisez des bouteilles de champagne ou des bouteilles épaisses",
            "7 g/L est un bon compromis pour la plupart des styles",
          ],
        };
      }
      return null;
    },
  },

  // 2) Fermentation trop chaude pour la levure
  {
    id: "ferm_temp_hot",
    evaluate(ctx) {
      const { recipe, yeast } = ctx;
      if (!yeast) return null;

      const temp = recipe.fermentation.fermentationTemp;
      const maxTemp = yeast.temp_max;

      if (temp > maxTemp + 3) {
        return {
          id: "ferm_temp_danger",
          level: "danger",
          title: "Température de fermentation bien trop élevée !",
          message: `${temp}°C dépasse de ${(temp - maxTemp).toFixed(0)}°C le maximum de la levure ${yeast.name} (${maxTemp}°C max).`,
          whyItMatters:
            "À cette température, la levure est très stressée et produit des quantités excessives d'esters (goût de solvant, banane forte) et de fusel (alcools supérieurs qui donnent mal à la tête). La bière peut devenir imbuvable.",
          howToFix: [
            `Réduisez la température à ${yeast.temp_ideal}°C (idéale pour cette levure)`,
            "Utilisez un frigo, une ceinture chauffante avec thermostat, ou placez le fermenteur dans un endroit plus frais",
            "En été, un bain d'eau avec des bouteilles de glace peut aider",
            `Plage recommandée : ${yeast.temp_min}–${yeast.temp_max}°C`,
          ],
        };
      }
      if (temp > maxTemp + 1) {
        return {
          id: "ferm_temp_warn",
          level: "warn",
          title: "Température de fermentation un peu élevée",
          message: `${temp}°C est au-dessus du maximum recommandé (${maxTemp}°C) pour ${yeast.name}.`,
          whyItMatters:
            "La levure peut produire des esters fruités plus intenses que prévu. Acceptable pour certains styles (Saison, Blanche) mais indésirable pour les bières neutres (Lager, Pale Ale).",
          howToFix: [
            `Essayez de descendre à ${yeast.temp_ideal}°C si possible`,
            "Surveillez les arômes en fin de fermentation",
            `Plage recommandée : ${yeast.temp_min}–${yeast.temp_max}°C`,
          ],
        };
      }
      return null;
    },
  },

  // 3) Fermentation trop froide pour la levure
  {
    id: "ferm_temp_cold",
    evaluate(ctx) {
      const { recipe, yeast } = ctx;
      if (!yeast) return null;

      const temp = recipe.fermentation.fermentationTemp;
      const minTemp = yeast.temp_min;

      if (temp < minTemp - 3) {
        return {
          id: "ferm_temp_cold_danger",
          level: "danger",
          title: "Température de fermentation bien trop basse !",
          message: `${temp}°C est ${(minTemp - temp).toFixed(0)}°C en dessous du minimum de ${yeast.name} (${minTemp}°C min).`,
          whyItMatters:
            "La levure va s'endormir ou mourir. La fermentation sera très lente ou bloquée, laissant des sucres résiduels et un goût vert (acétaldéhyde/pomme verte).",
          howToFix: [
            `Augmentez la température à au moins ${minTemp}°C`,
            `Température idéale : ${yeast.temp_ideal}°C`,
            "Utilisez une ceinture chauffante ou placez le fermenteur dans un endroit plus chaud",
          ],
        };
      }
      if (temp < minTemp) {
        return {
          id: "ferm_temp_cold_warn",
          level: "warn",
          title: "Température de fermentation basse",
          message: `${temp}°C est en dessous du minimum recommandé (${minTemp}°C) pour ${yeast.name}.`,
          whyItMatters:
            "La fermentation sera plus lente et pourrait ne pas atteindre l'atténuation prévue. La bière pourra être plus sucrée et moins alcoolisée que prévu.",
          howToFix: [
            `Essayez de monter à ${yeast.temp_ideal}°C`,
            "Prévoyez une fermentation plus longue (quelques jours de plus)",
          ],
        };
      }
      return null;
    },
  },

  // 4) Pas de refroidissement rapide
  {
    id: "no_chiller",
    evaluate(ctx) {
      const { recipe, hasChiller } = ctx;
      if (hasChiller) return null;

      const vol = recipe.params.volume;

      if (vol >= 25) {
        return {
          id: "no_chiller_danger",
          level: "danger",
          title: "Pas de refroidisseur pour un grand volume",
          message: `Refroidir ${vol}L sans refroidisseur prendra très longtemps (1h+ pour un bain de glace).`,
          whyItMatters:
            "Entre 30°C et 60°C, les bactéries se multiplient rapidement dans le moût. Un refroidissement lent favorise aussi la formation de DMS (goût de maïs cuit). Pour un volume de ${vol}L, c'est particulièrement risqué.",
          howToFix: [
            "Investissez dans un refroidisseur à immersion (cuivre ou inox, ~30-50€)",
            "Alternative : préparez un bain de glace très important (>10 kg de glace)",
            "Divisez le moût dans plusieurs récipients plus petits pour accélérer le refroidissement",
            "Commencez l'ébullition avec 20% d'eau en moins et complétez avec de l'eau stérile froide",
          ],
        };
      }
      if (vol >= 15) {
        return {
          id: "no_chiller_warn",
          level: "warn",
          title: "Pas de refroidisseur de moût",
          message: `Pour ${vol}L, un refroidissement au bain de glace sera lent (~30-45 min).`,
          whyItMatters:
            "Un refroidissement lent augmente le risque d'infection et de DMS. Pour des volumes de 15L+, un refroidisseur est fortement recommandé.",
          howToFix: [
            "Un bain de glace (évier ou baignoire) peut fonctionner pour ce volume",
            "Préparez au moins 5 kg de glace",
            "Ne couvrez pas la cuve (la vapeur de DMS doit s'échapper)",
            "Un refroidisseur à immersion est un investissement rentable dès 15L",
          ],
        };
      }
      return null;
    },
  },

  // 5) Cuve trop petite / débordement
  {
    id: "kettle_overflow",
    evaluate(ctx) {
      const { recipe, kettleCapacityL } = ctx;
      if (!kettleCapacityL) return null;

      const vol = recipe.params.volume;
      // Il faut au moins 25% de marge pour l'ébullition (mousse, évaporation)
      if (kettleCapacityL < vol * 1.25) {
        return {
          id: "kettle_overflow_danger",
          level: "danger",
          title: "Cuve probablement trop petite !",
          message: `Votre cuve (${kettleCapacityL}L) est trop juste pour ${vol}L de moût. Risque de débordement à l'ébullition.`,
          whyItMatters:
            "Au début de l'ébullition, le moût mousse fortement (le « hot break »). Sans marge suffisante, le moût déborde sur la cuisinière — c'est un gâchis collant et potentiellement dangereux (moût bouillant).",
          howToFix: [
            `Réduisez le volume à ${Math.floor(kettleCapacityL / 1.3)}L maximum`,
            "Ou utilisez une cuve plus grande",
            "Surveillez l'ébullition de près pendant les 5 premières minutes et baissez le feu si ça mousse",
            "Avoir un spray d'eau froide à portée de main aide à casser la mousse",
          ],
        };
      }
      if (kettleCapacityL < vol * 1.35) {
        return {
          id: "kettle_overflow_warn",
          level: "warn",
          title: "Marge de cuve un peu juste",
          message: `Votre cuve (${kettleCapacityL}L) laisse peu de marge pour ${vol}L. Surveillez l'ébullition.`,
          whyItMatters:
            "Avec seulement ~" + Math.round(((kettleCapacityL - vol) / vol) * 100) + "% de marge, le risque de débordement au hot break est réel. Prévoir 30-35% de marge est idéal.",
          howToFix: [
            "Surveillez attentivement les premières minutes de l'ébullition",
            "Réduisez le feu dès les premiers signes de mousse",
            `Volume maximum recommandé pour cette cuve : ${Math.floor(kettleCapacityL / 1.35)}L`,
          ],
        };
      }
      return null;
    },
  },

  // 6) Pas de densimètre
  {
    id: "no_hydrometer",
    evaluate(ctx) {
      if (ctx.hasHydrometer) return null;
      return {
        id: "no_hydrometer_info",
        level: "info",
        title: "Pas de densimètre",
        message: "Vous n'avez pas indiqué posséder un densimètre.",
        whyItMatters:
          "Le densimètre est essentiel pour savoir si la fermentation est terminée. Sans lui, vous risquez d'embouteiller trop tôt (→ bouteilles qui explosent) ou d'avoir un ABV différent de prévu.",
        howToFix: [
          "Investissez dans un densimètre basique (~5-10€) — c'est l'outil le plus utile du brasseur",
          "Alternative : un réfractomètre (~15-20€) est plus rapide et nécessite moins de moût",
          "En attendant, attendez au moins 3 semaines de fermentation avant d'embouteiller",
        ],
      };
    },
  },

  // 7) Lager sans contrôle de température
  {
    id: "lager_no_temp_control",
    evaluate(ctx) {
      const { yeast, hasTempControl } = ctx;
      if (!yeast || yeast.type !== "lager" || hasTempControl) return null;
      return {
        id: "lager_no_temp",
        level: "warn",
        title: "Lager sans contrôle de température",
        message: `La levure ${yeast.name} est une lager qui nécessite ${yeast.temp_min}-${yeast.temp_max}°C.`,
        whyItMatters:
          "Les levures lager doivent fermenter à basse température (8-15°C). À température ambiante, elles produiront des faux-goûts (soufre, esters). Sans frigo ou chambre froide, le résultat sera très différent d'une vraie lager.",
        howToFix: [
          "Utilisez un réfrigérateur avec un contrôleur de température",
          "Ou choisissez une levure ale qui fonctionne à température ambiante",
          "En hiver, un garage non chauffé peut convenir si la température est stable autour de 10-12°C",
        ],
      };
    },
  },

  // 8) Malt de base insuffisant
  {
    id: "low_base_malt",
    evaluate(ctx) {
      const { recipe } = ctx;
      const malts = recipe.malts.filter((m) => m.maltId && m.amount > 0);
      if (malts.length === 0) return null;

      // On ne peut pas vérifier le type ici sans maltsData, mais on l'aura dans le composant
      // Cette règle est une sécurité générale
      const totalAmount = malts.reduce((sum, m) => sum + m.amount, 0);
      if (totalAmount > 0 && totalAmount < recipe.params.volume * 0.15) {
        return {
          id: "low_grain_amount",
          level: "warn",
          title: "Quantité de grain très faible",
          message: `${totalAmount.toFixed(1)} kg de grain pour ${recipe.params.volume}L semble insuffisant.`,
          whyItMatters:
            "En général, il faut environ 4-6 kg de grain pour 20L de bière. Avec trop peu de grain, la bière sera très légère en corps et en alcool.",
          howToFix: [
            `Pour ${recipe.params.volume}L, visez ${(recipe.params.volume * 0.25).toFixed(1)}-${(recipe.params.volume * 0.3).toFixed(1)} kg de grain total`,
            "Le malt de base devrait représenter au moins 60% du total",
          ],
        };
      }
      return null;
    },
  },
];

/**
 * Évalue toutes les règles de risque et retourne les risques triés par sévérité.
 * Les risques masqués (dismissedRiskIds) sont exclus.
 */
export function getRisks(ctx: RiskContext, dismissedRiskIds: string[] = []): Risk[] {
  const risks: Risk[] = [];

  for (const rule of riskRules) {
    const risk = rule.evaluate(ctx);
    if (risk && !dismissedRiskIds.includes(risk.id)) {
      risks.push(risk);
    }
  }

  // Tri : danger d'abord, puis warn, puis info
  const levelOrder: Record<RiskLevel, number> = { danger: 0, warn: 1, info: 2 };
  risks.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  return risks;
}
