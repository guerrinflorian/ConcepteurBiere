"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function ValidationErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-500 text-lg">⚠️</span>
          <p className="text-sm font-bold text-red-800">
            Veuillez corriger les points suivants :
          </p>
        </div>
        <ul className="space-y-1.5 ml-7">
          {errors.map((error, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="text-sm text-red-700 flex items-start gap-2"
            >
              <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
              <span>{error}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </AnimatePresence>
  );
}
