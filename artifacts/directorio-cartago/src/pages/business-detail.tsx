import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Instagram, Facebook, Globe, Clock, Star, Crown, Lock, MessageCircle } from "lucide-react";
import { useGetBusiness } from "@workspace/api-client-react";

export default function BusinessDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: business, isLoading, isError } = useGetBusiness(Number(id));
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 animate-pulse">
          <div className="h-[400px] bg-muted rounded-3xl mb-8" />
          <div className="h-12 bg-muted rounded w-1/3 mb-4" />
          <div className="h-4 bg-muted rounded w-1/4 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4"><div className="h-32 bg-muted rounded" /></div>
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !business) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Negocio no encontrado</h2>
          <p className="text-muted-foreground mb-6">El negocio que buscas no existe o ha sido eliminado.</p>
          <Button asChild><Link href="/businesses">Volver al directorio</Link></Button>
        </div>
      </Layout>
    );
  }

  const primaryImage = business.images?.find(img => img.isPrimary)?.url || business.images?.[0]?.url || `${import.meta.env.BASE_URL}images/default-business.png`;
  const currentImage = activeImage || primaryImage;
  
  const isPremiumUser = user?.hasActiveSubscription;
  const isOwner = user?.id === business.ownerId;
  const canViewPremiumInfo = isPremiumUser || isOwner || user?.role === 'admin';

  return (
    <Layout>
      {/* Header / Gallery */}
      <div className="bg-muted/20 border-b border-border/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Gallery */}
            <div className="w-full lg:w-1/2 xl:w-7/12">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-border/50 shadow-lg mb-4 bg-black">
                <img src={currentImage} alt={business.name} className="w-full h-full object-contain" />
              </div>
              {business.images && business.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {business.images.map((img) => (
                    <button 
                      key={img.id} 
                      onClick={() => setActiveImage(img.url)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeImage === img.url ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="w-full lg:w-1/2 xl:w-5/12 flex flex-col pt-2 lg:pt-8">
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{business.categoryName}</Badge>
                {business.status !== 'approved' && (
                  <Badge variant="secondary">Estado: {business.status}</Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">{business.name}</h1>
              
              <div className="flex items-center gap-2 text-muted-foreground mb-6 text-lg">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{business.address}</span>
              </div>

              {business.averageRating && (
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.round(business.averageRating!) ? 'fill-current' : 'text-muted'}`} />
                    ))}
                  </div>
                  <span className="font-bold text-foreground">{business.averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">({business.reviewCount} reseñas)</span>
                </div>
              )}

              {/* Free Info (always visible) */}
              <div className="space-y-4 mt-auto border-t border-border pt-6">
                <p className="text-foreground leading-relaxed">
                  {business.description || "Sin descripción disponible."}
                </p>
                
                {business.instagram && (
                  <a href={business.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-pink-600 hover:underline font-medium">
                    <Instagram className="w-5 h-5" /> @{business.instagram.split('/').filter(Boolean).pop()}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Content Area */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Premium Details */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold font-display mb-6">Información de Contacto</h2>
            
            {canViewPremiumInfo ? (
              <div className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-6">
                {business.phone && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground font-medium mb-1">Teléfono</h4>
                      <p className="text-lg font-semibold">{business.phone}</p>
                    </div>
                  </div>
                )}
                
                {business.whatsapp && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground font-medium mb-1">WhatsApp</h4>
                      <a href={`https://wa.me/${business.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="text-lg font-semibold hover:text-emerald-600 hover:underline">
                        {business.whatsapp}
                      </a>
                    </div>
                  </div>
                )}
                
                {business.schedule && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground font-medium mb-1">Horario</h4>
                      <p className="text-base whitespace-pre-line">{business.schedule}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4 pt-4 border-t border-border">
                  {business.facebook && (
                    <Button variant="outline" size="sm" asChild className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50">
                      <a href={business.facebook} target="_blank" rel="noreferrer"><Facebook className="w-4 h-4 mr-2" /> Facebook</a>
                    </Button>
                  )}
                  {business.website && (
                    <Button variant="outline" size="sm" asChild className="rounded-xl">
                      <a href={business.website} target="_blank" rel="noreferrer"><Globe className="w-4 h-4 mr-2" /> Sitio Web</a>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200 shadow-sm text-center relative overflow-hidden">
                <Crown className="w-24 h-24 text-amber-500/20 absolute -right-4 -bottom-4" />
                <Lock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-amber-900 mb-2">Información Exclusiva</h3>
                <p className="text-amber-800/80 mb-6 max-w-md mx-auto">
                  Teléfono, WhatsApp, redes sociales y horarios están disponibles solo para usuarios con suscripción Premium.
                </p>
                <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg shadow-amber-500/30">
                  <Link href="/plans">Suscribirse para ver detalles</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Map */}
          <div>
            <h2 className="text-2xl font-bold font-display mb-6">Ubicación</h2>
            <div className="bg-card rounded-3xl p-2 border border-border shadow-sm h-[400px] overflow-hidden relative">
              {canViewPremiumInfo && business.googleMapsUrl ? (
                // Simple placeholder for iframe if actual embed code isn't perfectly formatted
                <iframe 
                  src={business.googleMapsUrl} 
                  className="w-full h-full rounded-2xl border-0" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa de ubicación"
                />
              ) : (
                <div className="w-full h-full bg-muted/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium mb-2">{business.address}</p>
                  {!canViewPremiumInfo && (
                    <p className="text-xs text-muted-foreground mt-4">
                      Mapa interactivo disponible en <Link href="/plans" className="text-primary hover:underline">Premium</Link>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </Layout>
  );
}
