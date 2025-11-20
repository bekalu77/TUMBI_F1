import ProductCard from "../ProductCard";
import productImage from "@assets/stock_images/construction_materia_151531d6.jpg";

export default function ProductCardExample() {
  return (
    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductCard
        id="1"
        name="Portland Cement Grade 42.5"
        company="Derba Midroc Cement"
        category="Cement"
        price={450}
        unit="bag"
        image={productImage}
        onClick={() => console.log("Product clicked")}
      />
      <ProductCard
        id="2"
        name="Steel Rebar 12mm"
        company="Ethiopian Steel"
        category="Steel"
        price={2800}
        unit="ton"
        image={productImage}
        onClick={() => console.log("Product clicked")}
      />
    </div>
  );
}
