import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
  colors: {
    primary: string;
    accent: string;
    background: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getContrastColor(hexColor: string): "light" | "dark" {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "dark" : "light";
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const { data: configs } = useQuery({
    queryKey: ["site-config"],
    queryFn: () => api.get<any[]>("/site-config"),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (configs && Array.isArray(configs)) {
      const getCfg = (key: string) => {
        const churchSpec = configs.find(c => c.key === key && c.churchId === 1);
        if (churchSpec) return churchSpec.value;
        return configs.find(c => c.key === key)?.value;
      };

      const primary = getCfg("theme_primary_color");
      const accent = getCfg("theme_accent_color");
      const background = getCfg("theme_background_color");

      // Tailwind 유틸리티 클래스가 직접 참조하는 --color-* 변수를 설정
      if (primary) {
        const fg = getContrastColor(primary) === "dark" ? "#000000" : "#ffffff";
        root.style.setProperty("--color-primary", primary);
        root.style.setProperty("--color-primary-foreground", fg);
        root.style.setProperty("--primary", primary);
        root.style.setProperty("--primary-foreground", fg);
      }
      if (accent) {
        root.style.setProperty("--color-accent-gold", accent);
        root.style.setProperty("--accent-gold", accent);
      }
      if (background) {
        root.style.setProperty("--color-background", background);
        if (getContrastColor(background) === "light") {
          root.style.setProperty("--color-foreground", "#f8fafc");
          root.style.setProperty("--color-card", "rgba(255,255,255,0.05)");
          root.style.setProperty("--color-muted", "rgba(255,255,255,0.1)");
          root.style.setProperty("--color-border", "rgba(255,255,255,0.1)");
        } else {
          root.style.setProperty("--color-foreground", "#020617");
          root.style.setProperty("--color-card", "#ffffff");
          root.style.setProperty("--color-muted", "#f1f5f9");
          root.style.setProperty("--color-border", "#e2e8f0");
        }
      }
    }
  }, [theme, configs]);

  const toggleTheme = switchable ? () => setTheme(prev => prev === "light" ? "dark" : "light") : undefined;

  const colors = {
    primary: configs?.find(c => c.key === "theme_primary_color")?.value || "#002147",
    accent: configs?.find(c => c.key === "theme_accent_color")?.value || "#facc15",
    background: configs?.find(c => c.key === "theme_background_color")?.value || "#ffffff",
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
