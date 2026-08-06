"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LocalizedOption } from "@/lib/profile-options";
import { useLocale } from "./locale-provider";

export function SearchableSelect({ name, options, value = "", placeholder, required = false, onChange }: { name: string; options: LocalizedOption[]; value?: string; placeholder: string; required?: boolean; onChange?: (value: string) => void }) {
  const { locale, t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState(value);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((item) => item.value === selected);

  useEffect(() => { setSelected(value); }, [value]);
  useEffect(() => { setQuery(selectedOption?.labels[locale] || ""); }, [locale, selectedOption]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return options.slice(0, 10);
    return options.filter((item) => `${Object.values(item.labels).join(" ")} ${item.keywords || ""}`.toLocaleLowerCase().includes(normalized)).slice(0, 10);
  }, [options, query]);

  function selectOption(option: LocalizedOption) {
    setSelected(option.value);
    setQuery(option.labels[locale]);
    setOpen(false);
    inputRef.current?.setCustomValidity("");
    onChange?.(option.value);
  }

  return <div className="searchable-select">
    <input ref={inputRef} value={query} required={required} placeholder={placeholder} autoComplete="off" onFocus={() => setOpen(true)} onInvalid={(event) => { if (!selected) event.currentTarget.setCustomValidity(t("selectRequired")); }} onBlur={() => setTimeout(() => setOpen(false), 120)} onChange={(event) => { event.currentTarget.setCustomValidity(t("selectRequired")); setQuery(event.target.value); setSelected(""); onChange?.(""); setOpen(true); }} />
    <input type="hidden" name={name} value={selected} />
    {open && <div className="searchable-options" role="listbox">{filtered.map((option) => <button type="button" role="option" aria-selected={selected === option.value} key={option.value} onMouseDown={(event) => event.preventDefault()} onClick={() => selectOption(option)}>{option.labels[locale]}</button>)}{!filtered.length && <span>{t("noResults")}</span>}</div>}
  </div>;
}
