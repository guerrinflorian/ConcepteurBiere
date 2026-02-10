"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  if (!text) return null;

  return (
    <span
      className="relative inline-flex items-center ml-1"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <span
        role="button"
        tabIndex={0}
        className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold inline-flex items-center justify-center hover:bg-amber-300 transition-colors cursor-help select-none"
        aria-label="Info"
      >
        i
      </span>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
