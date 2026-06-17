"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  CURRENCY_COOKIE,
  CURRENCY_OVERRIDE_KEY,
  CURRENCY_CHANGE_EVENT,
  isSupportedCurrency,
  DEFAULT_DISPLAY_CURRENCY,
} from "@/lib/currency";

interface LocationData {
  country: string;
  countryCode: string;
  currency: string;
}

interface LocationContextType {
  country: string;
  countryCode: string;
  detectedCurrency: string;
  displayCurrency: string;
  loading: boolean;
  /** Manually override the display currency (persists to localStorage + cookie). */
  setCurrency: (code: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountry] = useState("United States");
  const [countryCode, setCountryCode] = useState("US");
  const [detectedCurrency, setDetectedCurrency] = useState("USD");
  const [displayCurrency, setDisplayCurrency] = useState(DEFAULT_DISPLAY_CURRENCY);
  const [loading, setLoading] = useState(true);

  // Resolve currency on mount: localStorage override > detected (cookie / geo) > default
  useEffect(() => {
    async function fetchLocation() {
      try {
        const res = await fetch("/api/geo");
        if (!res.ok) throw new Error("Failed to fetch location");
        const data: LocationData = await res.json();

        setCountry(data.country);
        setCountryCode(data.countryCode);
        setDetectedCurrency(data.currency || "USD");

        // Determine display currency
        let resolved = DEFAULT_DISPLAY_CURRENCY;

        // 1. Manual override in localStorage
        try {
          const override = window.localStorage.getItem(CURRENCY_OVERRIDE_KEY);
          if (isSupportedCurrency(override)) {
            resolved = override!.toUpperCase();
          }
        } catch {
          /* ignore */
        }

        // 2. Currency cookie (set by middleware from GeoIP)
        if (resolved === DEFAULT_DISPLAY_CURRENCY) {
          const cookie = readCookie(CURRENCY_COOKIE);
          if (isSupportedCurrency(cookie)) {
            resolved = cookie!.toUpperCase();
          }
        }

        // 3. Detected from geo
        if (resolved === DEFAULT_DISPLAY_CURRENCY) {
          if (isSupportedCurrency(data.currency)) {
            resolved = data.currency!.toUpperCase();
          }
        }

        setDisplayCurrency(resolved);
      } catch (error) {
        console.error("Failed to fetch location:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLocation();
  }, []);

  // Listen for currency changes from the switcher
  useEffect(() => {
    const update = () => {
      try {
        const override = window.localStorage.getItem(CURRENCY_OVERRIDE_KEY);
        if (isSupportedCurrency(override)) {
          setDisplayCurrency(override!.toUpperCase());
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener(CURRENCY_CHANGE_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(CURRENCY_CHANGE_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const setCurrency = useCallback((code: string) => {
    if (!isSupportedCurrency(code)) return;
    const upper = code.toUpperCase();
    try {
      window.localStorage.setItem(CURRENCY_OVERRIDE_KEY, upper);
    } catch {
      /* ignore */
    }
    document.cookie = `${CURRENCY_COOKIE}=${upper}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setDisplayCurrency(upper);
    try {
      window.dispatchEvent(new Event(CURRENCY_CHANGE_EVENT));
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        country,
        countryCode,
        detectedCurrency,
        displayCurrency,
        loading,
        setCurrency,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextType {
  const ctx = useContext(LocationContext);
  if (ctx === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return ctx;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
