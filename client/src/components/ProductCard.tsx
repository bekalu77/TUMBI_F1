import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  name: string;
  company: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  onClick?: () => void;
}

export default function ProductCard({
  id,
  name,
  company,
  category,
  price,
  unit,
  image,
  onClick,
}: ProductCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover-elevate active-elevate-2 transition-transform hover:-translate-y-1"
      onClick={onClick}
      data-testid={`card-product-${id}`}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      <CardContent className="p-4">
        <Badge className="mb-2" variant="secondary">{category}</Badge>
        <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{company}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-primary">{price.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">ETB/{unit}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
