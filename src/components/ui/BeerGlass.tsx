"use client";

import { motion } from "framer-motion";
import { ebcToColor } from "@/lib/calculations";

/**
 * Composant visuel : dessin SVG d'un verre de bière avec animations.
 */
export default function BeerGlass({ ebc }: { ebc: number }) {
  const beerColor = ebcToColor(ebc);
  const foamColor = "#FFFDE7";

  // Positions initiales des bulles
  const bubbles = [
    { cx: 45, delay: 0, duration: 2.5, r: 2 },
    { cx: 65, delay: 0.8, duration: 3, r: 1.5 },
    { cx: 55, delay: 1.5, duration: 2.8, r: 1 },
    { cx: 70, delay: 0.3, duration: 3.2, r: 1.5 },
    { cx: 40, delay: 2, duration: 2.6, r: 1 },
    { cx: 60, delay: 1.2, duration: 2.9, r: 1.8 },
  ];

  return (
    <svg
      viewBox="0 0 120 180"
      className="w-28 h-40 mx-auto"
      aria-label="Verre de bière"
    >
      {/* Corps du verre (trapèze arrondi) */}
      <motion.path
        d="M25,45 L20,155 Q20,170 40,170 L80,170 Q100,170 100,155 L95,45 Z"
        animate={{ fill: beerColor }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        stroke="#b8860b"
        strokeWidth="2"
        opacity="0.9"
      />

      {/* Mousse avec oscillation */}
      <motion.ellipse
        cx="60"
        cy="45"
        rx="37"
        ry="12"
        fill={foamColor}
        stroke="#e0d9a8"
        strokeWidth="1"
        animate={{ ry: [12, 13, 11.5, 12] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.ellipse
        cx="45"
        cy="40"
        rx="10"
        ry="6"
        fill="white"
        opacity="0.6"
        animate={{ ry: [6, 7, 5.5, 6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
      <motion.ellipse
        cx="70"
        cy="38"
        rx="12"
        ry="7"
        fill="white"
        opacity="0.5"
        animate={{ ry: [7, 8, 6.5, 7] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />
      <ellipse cx="55" cy="35" rx="8" ry="5" fill="white" opacity="0.4" />

      {/* Bulles montantes animées */}
      {bubbles.map((b, i) => (
        <motion.circle
          key={i}
          cx={b.cx}
          r={b.r}
          fill="white"
          opacity="0.3"
          animate={{
            cy: [150, 50],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            delay: b.delay,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Pied du verre */}
      <rect x="50" y="170" width="20" height="5" rx="2" fill="#b8860b" opacity="0.4" />
    </svg>
  );
}
