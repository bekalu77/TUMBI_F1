import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";

interface FilterPanelProps {
  type: "products" | "companies";
  onApply?: (filters: any) => void;
  onReset?: () => void;
}

export default function FilterPanel({ type, onApply, onReset }: FilterPanelProps) {
  const { t } = useLanguage();
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = ["Cement", "Steel", "Wood", "Tiles", "Paint", "Other"];
  const units = ["bag", "ton", "m2", "piece", "lt"];

  const handleApply = () => {
    onApply?.({ priceRange, selectedCategories });
  };

  const handleReset = () => {
    setPriceRange([0, 10000]);
    setSelectedCategories([]);
    onReset?.();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">{t("filters")}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="mb-3 block">{t("category")}</Label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategories([...selectedCategories, category]);
                    } else {
                      setSelectedCategories(selectedCategories.filter((c) => c !== category));
                    }
                  }}
                  data-testid={`checkbox-${category.toLowerCase()}`}
                />
                <label
                  htmlFor={category}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {t(category.toLowerCase())}
                </label>
              </div>
            ))}
          </div>
        </div>

        {type === "products" && (
          <>
            <div>
              <Label className="mb-3 block">{t("priceRange")}</Label>
              <div className="space-y-4">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={10000}
                  step={100}
                  className="w-full"
                  data-testid="slider-price"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{priceRange[0]} ETB</span>
                  <span>{priceRange[1]} ETB</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-3 block">{t("unit")}</Label>
              <Select>
                <SelectTrigger data-testid="select-unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {type === "companies" && (
          <div>
            <Label className="mb-3 block">{t("location")}</Label>
            <Select>
              <SelectTrigger data-testid="select-location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="addis-ababa">Addis Ababa</SelectItem>
                <SelectItem value="dire-dawa">Dire Dawa</SelectItem>
                <SelectItem value="bahir-dar">Bahir Dar</SelectItem>
                <SelectItem value="hawassa">Hawassa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleReset}
          data-testid="button-reset-filters"
        >
          {t("resetFilters")}
        </Button>
        <Button
          className="flex-1"
          onClick={handleApply}
          data-testid="button-apply-filters"
        >
          {t("applyFilters")}
        </Button>
      </div>
    </div>
  );
}
