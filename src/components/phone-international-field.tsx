"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Country } from "country-state-city";
import type { ICountry } from "country-state-city";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  digitsOnly,
  getMaxNationalPhoneDigits,
  getNationalNumberHint,
  getNationalNumberPlaceholder,
  validateNationalPhone,
} from "@/lib/phone-e164";

type DialOption = {
  iso: string;
  /** Shown on closed trigger (e.g. +91) */
  triggerLabel: string;
  /** Shown in open list: code + country name */
  listLabel: string;
  searchText: string;
  dial: string;
};

function DialCodeSearchable({
  id,
  valueIso,
  options,
  onSelect,
  placeholder,
  disabled,
}: {
  id: string;
  valueIso: string;
  options: DialOption[];
  onSelect: (iso: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selectedTriggerText = React.useMemo(() => {
    const hit = options.find((o) => o.iso === valueIso);
    return hit?.triggerLabel ?? "";
  }, [options, valueIso]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.searchText.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 min-w-[4.75rem] max-w-[7.5rem] shrink-0 justify-between border-input bg-background px-2 py-2 text-sm font-normal tabular-nums",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
        >
          <span className="truncate text-left text-sm">{selectedTriggerText || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,20rem)] p-0" align="start">
        <div className="border-b p-2">
          <Input
            placeholder="Search +91 or India…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <ScrollArea className="h-[min(50vh,260px)]">
          <div className="p-1">
            {filtered.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">No matches.</p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.iso}
                  type="button"
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    valueIso === opt.iso && "bg-accent",
                  )}
                  onClick={() => {
                    onSelect(opt.iso);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4 shrink-0", valueIso === opt.iso ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{opt.listLabel}</span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export type PhoneInternationalFieldProps = {
  phoneCountryIso: string;
  phoneNationalDigits: string;
  setPhoneCountryIso: (iso: string) => void;
  setPhoneNationalDigits: (digits: string) => void;
  /** When set and user hasn’t chosen a dial code yet, match ISO from company address country name. */
  addressCountryName?: string;
  disabled?: boolean;
  className?: string;
  hideLabel?: boolean;
  /** When true, appends * to the field label (onboarding forms). */
  showRequiredIndicator?: boolean;
  /** When true, hides the default hint under the field (errors still show). */
  hideHint?: boolean;
};

export function PhoneInternationalField({
  phoneCountryIso,
  phoneNationalDigits,
  setPhoneCountryIso,
  setPhoneNationalDigits,
  addressCountryName,
  disabled,
  className,
  hideLabel,
  showRequiredIndicator = false,
  hideHint = false,
}: PhoneInternationalFieldProps) {
  const [touched, setTouched] = React.useState(false);

  const dialOptions = React.useMemo(() => {
    const list = Country.getAllCountries() as ICountry[];

    const mapped: DialOption[] = list
      .map((c) => {
        const triggerLabel = `+${c.phonecode}`;
        const listLabel = `+${c.phonecode} · ${c.name}`;
        const searchText = `${c.name} ${c.isoCode} ${c.phonecode} +${c.phonecode}`;
        return {
          iso: c.isoCode,
          triggerLabel,
          listLabel,
          searchText,
          dial: c.phonecode,
        };
      })
      .sort((a, b) => {
        const na = Number.parseInt(a.dial, 10);
        const nb = Number.parseInt(b.dial, 10);
        if (na !== nb) return na - nb;
        return a.iso.localeCompare(b.iso);
      });

    return mapped;
  }, []);

  React.useEffect(() => {
    if (!addressCountryName?.trim()) return;
    const list = Country.getAllCountries() as ICountry[];
    const found = list.find((c) => c.name === addressCountryName.trim());
    if (found) setPhoneCountryIso(found.isoCode);
  }, [addressCountryName, setPhoneCountryIso]);

  const maxDigits = React.useMemo(
    () => getMaxNationalPhoneDigits(phoneCountryIso),
    [phoneCountryIso],
  );
  const placeholder = React.useMemo(
    () => getNationalNumberPlaceholder(phoneCountryIso),
    [phoneCountryIso],
  );
  const hint = React.useMemo(
    () => getNationalNumberHint(phoneCountryIso),
    [phoneCountryIso],
  );
  const validation = React.useMemo(
    () => validateNationalPhone(phoneCountryIso, phoneNationalDigits),
    [phoneCountryIso, phoneNationalDigits],
  );
  const showError = touched && phoneNationalDigits.length > 0 && !validation.ok;

  return (
    <div className={cn("flex min-w-0 w-full flex-col gap-1.5", className)}>
      {!hideLabel && (
        <Label className="mb-0">Phone number{showRequiredIndicator ? " *" : ""}</Label>
      )}
      <div className="flex min-w-0 w-full flex-col gap-2 sm:flex-row sm:items-start">
        <DialCodeSearchable
          id="phone-dial"
          valueIso={phoneCountryIso}
          options={dialOptions}
          onSelect={(iso) => {
            setTouched(false);
            setPhoneCountryIso(iso);
          }}
          placeholder="+91"
          disabled={disabled}
        />
        <div className="min-w-0 flex-1">
          <Input
            id="phone-national"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder={placeholder}
            value={phoneNationalDigits}
            onChange={(e) => {
              setTouched(false);
              setPhoneNationalDigits(digitsOnly(e.target.value).slice(0, maxDigits));
            }}
            onBlur={() => setTouched(true)}
            required
            disabled={disabled}
            aria-invalid={showError}
            className={cn("h-10 w-full min-w-0", showError && "border-destructive focus-visible:ring-destructive")}
          />
        </div>
      </div>
      {(showError || !hideHint) && (
        <p className={cn("text-xs", showError ? "text-destructive" : "text-muted-foreground")}>
          {showError ? validation.error : `Required: ${hint}.`}
        </p>
      )}
    </div>
  );
}
