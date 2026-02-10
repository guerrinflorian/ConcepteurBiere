"use client";

/**
 * Encadré de conseil contextuel affiché dans les étapes du wizard.
 */
export default function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg text-sm text-amber-900">
      <span className="font-semibold">Conseil : </span>
      {children}
    </div>
  );
}
