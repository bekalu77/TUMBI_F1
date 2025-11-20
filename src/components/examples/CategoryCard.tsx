import { Package } from "lucide-react";
import CategoryCard from "../CategoryCard";

export default function CategoryCardExample() {
  return (
    <div className="p-8 grid grid-cols-3 gap-4">
      <CategoryCard icon={Package} label="Cement" count={24} onClick={() => console.log("Cement clicked")} />
      <CategoryCard icon={Package} label="Steel" count={18} onClick={() => console.log("Steel clicked")} />
      <CategoryCard icon={Package} label="Wood" count={32} onClick={() => console.log("Wood clicked")} />
    </div>
  );
}
