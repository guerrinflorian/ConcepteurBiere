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
        className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
      >
        <p className="text-sm font-semibold text-red-800 mb-1">
          Veuillez corriger les points suivants :
        </p>
        <ul className="list-disc list-inside space-y-1">
          {errors.map((error, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="text-sm text-red-700"
            >
              {error}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </AnimatePresence>
  );
}
