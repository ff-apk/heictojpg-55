import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

type Theme = 'light' | 'dark' | 'system';

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    return savedTheme || "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);

      const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
      const handleThemeChange = (e: MediaQueryListEvent) => {
        if (theme === "system") {
          root.classList.remove("light", "dark");
          root.classList.add(e.matches ? "dark" : "light");
        }
      };

      darkThemeMq.addEventListener("change", handleThemeChange);
      return () => darkThemeMq.removeEventListener("change", handleThemeChange);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4 mr-2" />;
      case "dark":
        return <Moon className="h-4 w-4 mr-2" />;
      default:
        return <Monitor className="h-4 w-4 mr-2" />;
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
  if (newTheme === "system") {
    localStorage.removeItem("theme"); // Remove theme from localStorage
  } else {
    localStorage.setItem("theme", newTheme);
  }

  setTheme(newTheme);
  toast({
    title: "Theme Changed",
    description: `Color set to ${newTheme === "system" ? "System default" : newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`,
    duration: 5000,
  });
};

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="default" className="flex items-center gap-2">
          {getThemeIcon()}
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-[#030c21] border-border">
        <DropdownMenuItem onClick={() => handleThemeChange("light")} className="gap-2">
          <Sun className="h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")} className="gap-2">
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")} className="gap-2">
          <Monitor className="h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
