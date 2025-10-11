import { useState } from "react";
import CompanyDetailModal from "../CompanyDetailModal";
import { Button } from "@/components/ui/button";
import productImage from "@assets/stock_images/construction_materia_151531d6.jpg";

export default function CompanyDetailModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Company Detail</Button>
      <CompanyDetailModal
        open={open}
        onOpenChange={setOpen}
        company={{
          id: "1",
          name: "Derba Midroc Cement",
          description: "Leading cement manufacturer in Ethiopia with state-of-the-art production facilities. We are committed to providing high-quality construction materials to support Ethiopia's infrastructure development.",
          location: "Addis Ababa, Ethiopia",
          products: [
            {
              id: "1",
              name: "Portland Cement Grade 42.5",
              company: "Derba Midroc Cement",
              category: "Cement",
              price: 450,
              unit: "bag",
              image: productImage,
            },
            {
              id: "2",
              name: "Portland Cement Grade 32.5",
              company: "Derba Midroc Cement",
              category: "Cement",
              price: 380,
              unit: "bag",
              image: productImage,
            },
          ],
          isOwner: true,
        }}
        onEdit={() => console.log("Edit clicked")}
        onDelete={() => console.log("Delete clicked")}
      />
    </div>
  );
}
