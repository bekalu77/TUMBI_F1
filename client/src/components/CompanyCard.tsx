import { MapPin, Package } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface CompanyCardProps {
  id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  productCount: number;
  logo?: string;
  onClick?: () => void;
}

export default function CompanyCard({
  id,
  name,
  description,
  location,
  category,
  productCount,
  logo,
  onClick,
}: CompanyCardProps) {
  return (
    <Card
      className="cursor-pointer hover-elevate active-elevate-2 transition-transform hover:-translate-y-1"
      onClick={onClick}
      data-testid={`card-company-${id}`}
    >
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
        <Avatar className="h-16 w-16">
          {logo ? (
            <img src={logo} alt={name} className="object-cover" />
          ) : (
            <AvatarFallback className="text-xl">{name[0]}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-xl line-clamp-1">{name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{category}</Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{productCount} products</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
