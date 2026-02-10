"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  grouped?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "— Choisir —",
  className = "",
  grouped = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Group options if needed
  const groupedOptions = grouped
    ? filtered.reduce<Record<string, SelectOption[]>>((acc, opt) => {
        const g = opt.group || "";
        if (!acc[g]) acc[g] = [];
        acc[g].push(opt);
        return acc;
      }, {})
    : null;

  // Flat list for keyboard navigation
  const flatFiltered = filtered;

  const close = useCallback(() => {
    setIsOpen(false);
    setSearch("");
    setHighlightIndex(-1);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [isOpen, close]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-option-index]");
      items[highlightIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < flatFiltered.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : flatFiltered.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0 && flatFiltered[highlightIndex]) {
          onChange(flatFiltered[highlightIndex].value);
          close();
        }
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
    }
  }

  function handleSelect(val: string) {
    onChange(val);
    close();
  }

  function handleOpen() {
    setIsOpen(true);
    setSearch("");
    setHighlightIndex(-1);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const displayValue = selectedOption?.label || "";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger button */}
      {!isOpen ? (
        <button
          type="button"
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none bg-white text-sm text-left flex items-center justify-between gap-2"
        >
          <span className={displayValue ? "text-gray-800" : "text-gray-400"}>
            {displayValue || placeholder}
          </span>
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setHighlightIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher..."
          className="w-full px-3 py-2 border border-amber-400 rounded-lg ring-2 ring-amber-400 outline-none bg-white text-sm"
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg text-sm"
        >
          {/* Empty option */}
          <li
            data-option-index={-1}
            onClick={() => handleSelect("")}
            className="px-3 py-2 text-gray-400 cursor-pointer hover:bg-gray-50"
          >
            {placeholder}
          </li>

          {flatFiltered.length === 0 && (
            <li className="px-3 py-2 text-gray-400 italic">Aucun résultat</li>
          )}

          {grouped && groupedOptions
            ? Object.entries(groupedOptions).map(([group, items]) => (
                <li key={group}>
                  {group && (
                    <div className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-50 uppercase tracking-wide sticky top-0">
                      {group}
                    </div>
                  )}
                  {items.map((opt) => {
                    const idx = flatFiltered.indexOf(opt);
                    return (
                      <div
                        key={opt.value}
                        data-option-index={idx}
                        onClick={() => handleSelect(opt.value)}
                        className={`px-3 py-2 cursor-pointer transition-colors ${
                          idx === highlightIndex
                            ? "bg-amber-100 text-amber-900"
                            : opt.value === value
                            ? "bg-amber-50 text-amber-800"
                            : "hover:bg-gray-50 text-gray-800"
                        }`}
                      >
                        {opt.label}
                      </div>
                    );
                  })}
                </li>
              ))
            : flatFiltered.map((opt, idx) => (
                <li
                  key={opt.value}
                  data-option-index={idx}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    idx === highlightIndex
                      ? "bg-amber-100 text-amber-900"
                      : opt.value === value
                      ? "bg-amber-50 text-amber-800"
                      : "hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  {opt.label}
                </li>
              ))}
        </ul>
      )}
    </div>
  );
}
