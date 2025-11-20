import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "../Header";

export default function HeaderExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Header onMenuClick={() => console.log("Menu clicked")} isAuthenticated={true} />
      </LanguageProvider>
    </ThemeProvider>
  );
}
