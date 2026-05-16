"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const themeOptions: Array<{
  value: Theme;
  label: string;
  icon: typeof Sun;
}> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("nucleus-theme-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("nucleus-theme-change", callback);
  };
};

const getServerSnapshot = (): Theme => "system";

const getClientSnapshot = (): Theme => {
  const storedTheme = window.localStorage.getItem("nucleus-theme");

  if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
    return storedTheme;
  }

  return "system";
};

function resolveTheme(theme: Theme) {
  if (theme !== "system") {
    return theme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolvedTheme = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => applyTheme("system");
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  const updateTheme = (nextTheme: Theme) => {
    window.localStorage.setItem("nucleus-theme", nextTheme);
    window.dispatchEvent(new Event("nucleus-theme-change"));
  };

  return (
    <div className="inline-flex rounded-lg border bg-background p-1">
      {themeOptions.map((option) => {
        const Icon = option.icon;

        return (
          <Button
            key={option.value}
            type="button"
            variant={theme === option.value ? "secondary" : "ghost"}
            size="icon-sm"
            className={cn(theme === option.value && "shadow-sm")}
            aria-label={`Use ${option.label} theme`}
            title={`${option.label} theme`}
            onClick={() => updateTheme(option.value)}
          >
            <Icon />
          </Button>
        );
      })}
    </div>
  );
}
