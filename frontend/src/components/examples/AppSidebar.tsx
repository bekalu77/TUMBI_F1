import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../AppSidebar";

export default function AppSidebarExample() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
