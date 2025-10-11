import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import ProductCard from "./ProductCard";

interface CompanyDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: {
    id: string;
    name: string;
    description: string;
    location: string;
    logo?: string;
    products: Array<{
      id: string;
      name: string;
      company: string;
      category: string;
      price: number;
      unit: string;
      image: string;
    }>;
    isOwner?: boolean;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CompanyDetailModal({
  open,
  onOpenChange,
  company,
  onEdit,
  onDelete,
}: CompanyDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
          <Avatar className="h-16 w-16">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="object-cover" />
            ) : (
              <AvatarFallback className="text-2xl">{company.name[0]}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <DialogTitle className="text-2xl font-heading">{company.name}</DialogTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{company.location}</span>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
            <TabsTrigger value="contact" data-testid="tab-contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{company.description}</p>
            </div>

            <div className="rounded-lg overflow-hidden h-64 bg-muted">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.449537478841!2d38.763610775314715!3d9.018678891048447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85f3b6e8e6e5%3A0x3f8e1e6e6e6e6e6e!2sAddis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                title="Company Location"
              />
            </div>

            {company.isOwner && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={onEdit}
                  data-testid="button-edit-company"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Company
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={onDelete}
                  data-testid="button-delete-company"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Company
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {company.products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-semibold">contact@{company.name.toLowerCase().replace(/\s+/g, '')}.com</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-semibold">+251 11 123 4567</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Address</div>
                <div className="font-semibold">{company.location}</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
