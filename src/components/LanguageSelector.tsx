import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useLanguage, SupportedLanguage } from "@/contexts/LanguageContext";

interface LanguageSelectorProps {
  variant?: "icon" | "full";
  className?: string;
}

const LanguageSelector = ({ variant = "icon", className }: LanguageSelectorProps) => {
  const { language, setLanguage, languageNames, supportedLanguages } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={variant === "icon" ? "icon" : "default"} className={className}>
          <Globe className="h-4 w-4" />
          {variant === "full" && (
            <span className="ml-2">{languageNames[language]}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={lang === language ? "bg-accent" : ""}
          >
            {languageNames[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
