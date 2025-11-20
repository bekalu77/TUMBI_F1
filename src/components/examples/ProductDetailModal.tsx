import { useState } from "react";
import ProductDetailModal from "../ProductDetailModal";
import { Button } from "@/components/ui/button";
import productImage from "@assets/stock_images/construction_materia_151531d6.jpg";

export default function ProductDetailModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Product Detail</Button>
      <ProductDetailModal
        open={open}
        onOpenChange={setOpen}
        product={{
          id: "1",
          name: "Portland Cement Grade 42.5",
          company: "Derba Midroc Cement",
          category: "Cement",
          price: 450,
          unit: "bag",
          madeOf: "Limestone, Clay",
          description: "High-quality Portland cement suitable for all types of construction. This Grade 42.5 cement provides excellent strength and durability for residential and commercial projects.",
          images: [productImage, productImage, productImage, productImage],
          isOwner: true,
        }}
        onEdit={() => console.log("Edit clicked")}
        onDelete={() => console.log("Delete clicked")}
      />
    </div>
  );
}
