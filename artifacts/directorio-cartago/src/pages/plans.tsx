import React from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { useGetSubscriptionPlans, useSubscribe } from "@workspace/api-client-react";
import { Check, Crown, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Plans() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: plans, isLoading } = useGetSubscriptionPlans();
  
  const { mutate: subscribeMutate, isPending } = useSubscribe({
    mutation: {
      onSuccess: () => {
        toast({ title: "Suscripción exitosa", description: "Ahora tienes acceso Premium." });
        window.location.reload(); // Quick way to refresh user context
      },
      onError: () => {
        toast({ title: "Error", description: "No se pudo procesar la suscripción.", variant: "destructive" });
      }
    }
  });

  const handleSubscribe = (planId: number) => {
    if (!isAuthenticated) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para suscribirte." });
      return;
    }
    // Simulate payment reference
    subscribeMutate({ data: { planId, paymentReference: `SIM-${Date.now()}` } });
  };

  const freeFeatures = [
    "Aparecer en el directorio",
    "Nombre y descripción básica",
    "1 imagen principal",
    "Enlace a Instagram"
  ];

  const premiumFeatures = [
    "Todo lo del plan Gratis",
    "Hasta 5 imágenes en galería",
    "Número de teléfono y WhatsApp directo",
    "Mapa interactivo de Google",
    "Enlaces a todas las redes y web",
    "Insignia DESTACADO",
    "Prioridad en resultados de búsqueda"
  ];

  return (
    <Layout>
      <div className="bg-foreground text-background py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay" />
        <div className="container relative z-10 mx-auto px-4">
          <Crown className="w-16 h-16 text-secondary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Planes para tu Negocio</h1>
          <p className="text-xl text-background/80 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades. Atrae más clientes destacando tu negocio en Cartago.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 -mt-10 relative z-20">
        
        {user?.hasActiveSubscription && (
          <Alert className="mb-12 max-w-3xl mx-auto bg-emerald-50 border-emerald-200 text-emerald-800">
            <AlertCircle className="h-5 w-5 text-emerald-600" />
            <AlertDescription className="font-medium ml-2">
              Ya tienes una suscripción Premium activa. ¡Disfruta de todos los beneficios!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto justify-center">
          
          {/* Free Plan */}
          <div className="bg-card rounded-3xl border border-border p-8 shadow-lg flex flex-col mt-4">
            <h3 className="text-2xl font-bold mb-2">Básico</h3>
            <p className="text-muted-foreground text-sm mb-6">Para empezar a tener presencia online.</p>
            <div className="text-4xl font-display font-bold mb-8">Gratis</div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {freeFeatures.map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            
            <Button variant="outline" className="w-full rounded-xl h-12" disabled>Plan Actual</Button>
          </div>

          {/* Premium Plans from API */}
          {isLoading ? (
            <div className="bg-muted animate-pulse rounded-3xl h-[500px]" />
          ) : (
            plans?.filter(p => p.isActive).map((plan) => (
              <div key={plan.id} className="bg-gradient-to-b from-primary/10 to-background rounded-3xl border-2 border-primary/50 p-8 shadow-xl relative flex flex-col transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                  Recomendado
                </div>
                
                <h3 className="text-2xl font-bold text-primary mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                <div className="text-4xl font-display font-bold mb-2">
                  ${plan.price.toLocaleString('es-CO')}
                  <span className="text-lg text-muted-foreground font-normal"> / {plan.durationDays} días</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1 mt-6">
                  {premiumFeatures.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span className="font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isPending || user?.hasActiveSubscription}
                  className="w-full rounded-xl h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                >
                  {isPending ? "Procesando..." : user?.hasActiveSubscription ? "Ya eres Premium" : "Obtener Premium"}
                </Button>
              </div>
            ))
          )}

        </div>
      </div>
    </Layout>
  );
}
