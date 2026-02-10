"use client";

import { BeerStyle, CalculatedValues } from "@/lib/types";

interface Props {
  style: BeerStyle;
  calculated: CalculatedValues;
}

function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

function RangeIndicator({
  label,
  value,
  min,
  max,
  unit,
  decimals = 0,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  decimals?: number;
}) {
  const ok = inRange(value, min, max);
  return (
    <div className="flex items-center justify-between text-sm py-1.5">
      <span className="text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">
          {min.toFixed(decimals)}–{max.toFixed(decimals)}{unit}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            ok
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {value.toFixed(decimals)}{unit} {ok ? "\u2713" : "\u2717"}
        </span>
      </div>
    </div>
  );
}

export default function StyleComparison({ style, calculated }: Props) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-bold text-amber-900 mb-3">
        Comparaison avec le style : {style.name}
      </h3>
      <div className="divide-y divide-gray-100">
        <RangeIndicator
          label="Densité initiale (OG)"
          value={calculated.og}
          min={style.og_min}
          max={style.og_max}
          decimals={3}
        />
        <RangeIndicator
          label="Alcool (ABV)"
          value={calculated.abv}
          min={style.abv_min}
          max={style.abv_max}
          unit="%"
          decimals={1}
        />
        <RangeIndicator
          label="Amertume (IBU)"
          value={calculated.ibu}
          min={style.ibu_min}
          max={style.ibu_max}
        />
        <RangeIndicator
          label="Couleur (EBC)"
          value={calculated.ebc}
          min={style.ebc_min}
          max={style.ebc_max}
        />
      </div>
    </div>
  );
}
