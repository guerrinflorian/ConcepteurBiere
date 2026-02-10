"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  if (!text) return null;

  // Détermine si la tooltip doit être affichée en haut ou en bas
  useEffect(() => {
    if (!show || !triggerRef.current || !tooltipRef.current) return;

    setTimeout(() => {
      const triggerRect = triggerRef.current?.getBoundingClientRect();
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();

      if (triggerRect && tooltipRect) {
        // S'il y a moins de 150px au-dessus, afficher en bas
        if (triggerRect.top < 150) {
          setPosition("bottom");
        } else {
          setPosition("top");
        }
      }
    }, 0);
  }, [show]);

  return (
    <span
      ref={triggerRef}
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
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 left-1/2 -translate-x-1/2 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-2xl pointer-events-none border border-gray-700 ${
              position === "top"
                ? "bottom-full mb-3"
                : "top-full mt-3"
            }`}
          >
            <span className="leading-relaxed text-gray-100 block">{text}</span>
            {/* Arrow - adapté selon la position */}
            {position === "top" ? (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900" />
            ) : (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-gray-900" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
