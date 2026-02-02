import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 bg-card/80 backdrop-blur-sm border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-hippie-yellow" />
      ) : (
        <Moon className="h-5 w-5 text-hippie-purple" />
      )}
    </Button>
  );
};

export default ThemeToggle;
