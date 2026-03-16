import React from "react";
import { Link } from "wouter";
import { Business } from "@workspace/api-client-react";
import { MapPin, Star, Instagram, Crown, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BusinessCard({ business, isOwnerView = false }: { business: Business, isOwnerView?: boolean }) {
  const primaryImage = business.images?.find(img => img.isPrimary)?.url || business.images?.[0]?.url || `${import.meta.env.BASE_URL}images/default-business.png`;
  
  // En un escenario real, saber si el negocio es de un usuario premium podría venir en la API.
  // Por ahora lo simulamos con un status visual.
  const isPremium = business.categoryName === "Premium"; // Mock para UI visual si no viene en API, o asumimos que lo sabemos.
  
  return (
    <Link href={`/businesses/${business.id}`} className="block group">
      <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 h-full flex flex-col relative">
        
        {/* Premium Badge */}
        {isPremium && (
          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Crown className="w-3 h-3" />
            DESTACADO
          </div>
        )}

        {/* Owner Status Badge */}
        {isOwnerView && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant={
              business.status === 'approved' ? 'default' : 
              business.status === 'rejected' ? 'destructive' : 'secondary'
            } className="shadow-md backdrop-blur-md bg-background/90">
              {business.status === 'approved' ? 'Aprobado' : 
               business.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
            </Badge>
          </div>
        )}

        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
          <img 
            src={primaryImage} 
            alt={business.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-bold text-lg leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {business.name}
            </h3>
            {business.averageRating ? (
              <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-xs font-semibold shrink-0">
                <Star className="w-3 h-3 fill-current" />
                {business.averageRating.toFixed(1)}
              </div>
            ) : null}
          </div>
          
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-3">
            <MapPin className="w-4 h-4 shrink-0 text-primary/70" />
            <span className="truncate">{business.address}</span>
          </div>

          <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
            <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 font-medium">
              {business.categoryName || "Categoría"}
            </Badge>
            
            {business.instagram && (
              <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                <Instagram className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
