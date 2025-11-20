import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      data-testid="button-language-toggle"
      className="font-semibold"
    >
      {language === "en" ? "አማ" : "EN"}
    </Button>
  );
}
