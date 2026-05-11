"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Country, State, City } from "country-state-city";
import type { ICity, ICountry, IState } from "country-state-city";
import zipcodes from "zipcodes";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

type Option = { id: string; label: string };

function SearchableDropdown({
  id,
  label,
  options,
  valueId,  
  onSelect,
  placeholder,
  disabled,
  emptyLabel,
}: {
  id: string;
  label: string;
  options: Option[];
  valueId: string;
  onSelect: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  emptyLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selectedLabel = React.useMemo(() => {
    const hit = options.find((o) => o.id === valueId);
    return hit?.label ?? "";
  }, [options, valueId]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="mb-0">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            size="default"
            className={cn(
              "h-10 w-full shrink-0 justify-between border-input bg-background px-3 py-2 font-normal",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            <span className="truncate text-left">{selectedLabel || placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(100vw-2rem,var(--radix-popover-trigger-width))] max-w-md p-0" align="start">
          <div className="border-b p-2">
            <Input
              placeholder={`Search ${label.toLowerCase()}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9"
            />
          </div>
          <ScrollArea className="h-[min(60vh,280px)]">
            <div className="p-1">
              {filtered.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">{emptyLabel ?? "No matches."}</p>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      valueId === opt.id && "bg-accent",
                    )}
                    onClick={() => {
                      onSelect(opt.id);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4 shrink-0", valueId === opt.id ? "opacity-100" : "opacity-0")} />
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** Keep only digits (ZIP/postal field is numeric-only in this form). */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function tryLookupPostalCode(countryIso: string, stateIso: string, cityName: string): string | null {
  if (!cityName.trim() || !stateIso) return null;
  if (countryIso !== "US" && countryIso !== "CA") return null;
  try {
    const rows = zipcodes.lookupByName(cityName.trim(), stateIso) as Array<{ zip: string } | undefined>;
    if (!rows?.length) return null;
    const z = rows[0]?.zip;
    return z != null ? digitsOnly(String(z)) : null;
  } catch {
    return null;
  }
}

export type LocationAddressFieldsProps = {
  country: string;
  state: string;
  city: string;
  zipCode: string;
  setCountry: (v: string) => void;
  setState: (v: string) => void;
  setCity: (v: string) => void;
  setZipCode: (v: string) => void;
  disabled?: boolean;
};

export function LocationAddressFields({
  country,
  state,
  city,
  zipCode,
  setCountry,
  setState,
  setCity,
  setZipCode,
  disabled,
}: LocationAddressFieldsProps) {
  const countries = React.useMemo(() => Country.getAllCountries() as ICountry[], []);
  const sortedCountries = React.useMemo(
    () => [...countries].sort((a, b) => a.name.localeCompare(b.name)),
    [countries],
  );

  const countryOptions = React.useMemo<Option[]>(
    () => sortedCountries.map((c) => ({ id: c.isoCode, label: c.name })),
    [sortedCountries],
  );

  const selectedCountryIso = React.useMemo(() => {
    const byName = sortedCountries.find((c) => c.name === country);
    return byName?.isoCode ?? "";
  }, [sortedCountries, country]);

  const statesList = React.useMemo<IState[]>(() => {
    if (!selectedCountryIso) return [];
    return State.getStatesOfCountry(selectedCountryIso);
  }, [selectedCountryIso]);

  const stateOptions = React.useMemo<Option[]>(
    () => statesList.map((s) => ({ id: s.isoCode, label: s.name })).sort((a, b) => a.label.localeCompare(b.label)),
    [statesList],
  );

  const selectedStateIso = React.useMemo(() => {
    const hit = statesList.find((s) => s.name === state);
    return hit?.isoCode ?? "";
  }, [statesList, state]);

  const citiesList = React.useMemo<ICity[]>(() => {
    if (!selectedCountryIso || !selectedStateIso) return [];
    return City.getCitiesOfState(selectedCountryIso, selectedStateIso);
  }, [selectedCountryIso, selectedStateIso]);

  const cityOptions = React.useMemo<Option[]>(() => {
    const names = citiesList.map((c) => c.name);
    const uniq = Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    return uniq.map((name) => ({ id: name, label: name }));
  }, [citiesList]);

  const onCountryPick = (isoCode: string) => {
    const c = Country.getCountryByCode(isoCode);
    if (!c) return;
    setCountry(c.name);
    setState("");
    setCity("");
    setZipCode("");
  };

  const onStatePick = (stateIso: string) => {
    if (!selectedCountryIso) return;
    const s = State.getStateByCodeAndCountry(stateIso, selectedCountryIso);
    if (!s) return;
    setState(s.name);
    setCity("");
    setZipCode("");
  };

  const onCityPick = (cityName: string) => {
    setCity(cityName);
    const zip = tryLookupPostalCode(selectedCountryIso, selectedStateIso, cityName);
    if (zip) setZipCode(zip);
  };

  return (
    <div className="space-y-2">
      <div className="grid gap-x-4 gap-y-3 md:grid-cols-2 md:items-start">
        <SearchableDropdown
          id="country"
          label="Country"
          options={countryOptions}
          valueId={selectedCountryIso}
          onSelect={onCountryPick}
          placeholder="Select country"
          disabled={disabled}
        />

        {stateOptions.length > 0 ? (
          <SearchableDropdown
            id="state"
            label="State / Province"
            options={stateOptions}
            valueId={selectedStateIso}
            onSelect={onStatePick}
            placeholder={selectedCountryIso ? "Select state or province" : "Select country first"}
            disabled={disabled || !selectedCountryIso}
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="state-text" className="mb-0">
              State / Province
            </Label>
            <Input
              id="state-text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              disabled={disabled || !selectedCountryIso}
              placeholder={selectedCountryIso ? "Enter state or region" : "Select country first"}
            />
          </div>
        )}

        {cityOptions.length > 0 ? (
          <SearchableDropdown
            id="city"
            label="City"
            options={cityOptions}
            valueId={city}
            onSelect={onCityPick}
            placeholder={selectedStateIso ? "Select city" : "Select state first"}
            disabled={disabled || !selectedStateIso}
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city-text" className="mb-0">
              City
            </Label>
            <Input
              id="city-text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                const z = tryLookupPostalCode(selectedCountryIso, selectedStateIso, e.target.value);
                if (z) setZipCode(z);
              }}
              required
              disabled={disabled || !selectedStateIso}
              placeholder={selectedStateIso ? "Enter city" : "Select state first"}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="zip-code" className="mb-0">
            ZIP / Postal code
          </Label>
          <Input
            id="zip-code"
            inputMode="numeric"
            autoComplete="postal-code"
            value={zipCode}
            onChange={(e) => setZipCode(digitsOnly(e.target.value).slice(0, 12))}
            required
            disabled={disabled}
            placeholder="Digits only (e.g. 382481)"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Use digits only (no letters or spaces). US/Canada: code may auto-fill when you pick a city from the list.
      </p>
    </div>
  );
}
