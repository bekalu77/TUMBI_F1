import { createContext, useContext, useState } from "react";

type Language = "en" | "am";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    home: "Home",
    categories: "Categories",
    browseProducts: "Browse Products",
    browseCompanies: "Browse Companies",
    favorites: "Favorites",
    about: "About",
    login: "Login",
    register: "Register",
    logout: "Logout",
    editProfile: "Edit Profile",
    registerCompany: "Register a Company",
    searchMaterials: "Search for materials...",
    findQualityMaterials: "Find Quality Construction Materials",
    popularCategories: "Popular Categories",
    recentlyAdded: "Recently Added Materials",
    addProduct: "Add Product",
    filters: "Filters",
    priceRange: "Price Range",
    category: "Category",
    unit: "Unit",
    location: "Location",
    sortBy: "Sort By",
    latest: "Latest",
    priceLowHigh: "Price: Low to High",
    priceHighLow: "Price: High to Low",
    applyFilters: "Apply Filters",
    resetFilters: "Reset",
    viewDetails: "View Details",
    edit: "Edit",
    delete: "Delete",
    cement: "Cement",
    steel: "Steel",
    wood: "Wood",
    tiles: "Tiles",
    paint: "Paint",
    other: "Other",
  },
  am: {
    home: "ቤት",
    categories: "ምድቦች",
    browseProducts: "ምርቶችን ያስሱ",
    browseCompanies: "ኩባንያዎችን ያስሱ",
    favorites: "የተወደዱ",
    about: "ስለ እኛ",
    login: "ግባ",
    register: "ይመዝገቡ",
    logout: "ውጣ",
    editProfile: "መገለጫን ያስተካክሉ",
    registerCompany: "ኩባንያ ያስመዝግቡ",
    searchMaterials: "ቁሳቁሶችን ይፈልጉ...",
    findQualityMaterials: "ጥራት ያለው የግንባታ እቃዎች ያግኙ",
    popularCategories: "ታዋቂ ምድቦች",
    recentlyAdded: "በቅርቡ የተጨመሩ እቃዎች",
    addProduct: "ምርት ጨምር",
    filters: "ማጣሪያዎች",
    priceRange: "የዋጋ ክልል",
    category: "ምድብ",
    unit: "መለኪያ",
    location: "አድራሻ",
    sortBy: "ደርድር በ",
    latest: "የቅርብ ጊዜ",
    priceLowHigh: "ዋጋ: ዝቅተኛ ወደ ከፍተኛ",
    priceHighLow: "ዋጋ: ከፍተኛ ወደ ዝቅተኛ",
    applyFilters: "ማጣሪያዎችን ተግብር",
    resetFilters: "ዳግም አስጀምር",
    viewDetails: "ዝርዝሮችን ይመልከቱ",
    edit: "አርትዕ",
    delete: "ሰርዝ",
    cement: "ሲሚንቶ",
    steel: "ብረት",
    wood: "እንጨት",
    tiles: "ሰሌዳዎች",
    paint: "ቀለም",
    other: "ሌላ",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "am" : "en"));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
