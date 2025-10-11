import { LanguageProvider } from "@/contexts/LanguageContext";
import FilterPanel from "../FilterPanel";

export default function FilterPanelExample() {
  return (
    <LanguageProvider>
      <div className="p-8 max-w-sm">
        <FilterPanel
          type="products"
          onApply={(filters) => console.log("Filters applied:", filters)}
          onReset={() => console.log("Filters reset")}
        />
      </div>
    </LanguageProvider>
  );
}
