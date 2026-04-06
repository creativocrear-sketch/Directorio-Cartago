import React from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetSubscriptionPlans, useSubscribe } from "@workspace/api-client-react";
import { AlertCircle, Check, Crown, MapPinned, PhoneCall, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const freeFeatures = [
  "Ficha visible en el directorio",
  "Nombre, descripcion y categoria",
  "Imagen principal del negocio",
  "Presencia basica en resultados",
];

const premiumFeatures = [
  "Todo lo del plan basico",
  "Hasta 5 imagenes por negocio",
  "Telefono y WhatsApp visibles",
  "Enlaces a sitio web y redes sociales",
  "Mapa y horario del local",
  "Mayor visibilidad en el directorio",
];

const fallbackPlans = [
  {
    id: 9001,
    name: "Premium Mensual",
    description: "Ideal para empezar a destacar tu negocio cada mes.",
    price: 9900,
    durationDays: 30,
    isActive: true,
  },
  {
    id: 9002,
    name: "Premium Trimestral",
    description: "Mas continuidad y mejor valor para negocios activos.",
    price: 24900,
    durationDays: 90,
    isActive: true,
  },
];

export default function Plans() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: plans, isLoading } = useGetSubscriptionPlans();

  const availablePlans =
    plans?.filter((plan) => plan.isActive).length
      ? plans.filter((plan) => plan.isActive)
      : fallbackPlans;

  const { mutate: subscribeMutate, isPending } = useSubscribe({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Suscripcion activada",
          description: "Tu cuenta ya tiene acceso Premium.",
        });
        window.location.reload();
      },
      onError: () => {
        toast({
          title: "No se pudo completar",
          description: "Intenta de nuevo en unos minutos.",
          variant: "destructive",
        });
      },
    },
  });

  const handleSubscribe = (planId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesion",
        description: "Debes iniciar sesion para activar un plan.",
      });
      return;
    }

    subscribeMutate({
      data: { planId, paymentReference: `SIM-${Date.now()}` },
    });
  };

  return (
    <Layout>
      <section className="relative overflow-hidden bg-foreground py-20 text-background">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-screen" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
              <Crown className="h-4 w-4 text-secondary" />
              Impulsa tu negocio en Cartago
            </div>
            <h1 className="mb-4 text-4xl font-display font-bold md:text-5xl">
              Planes pensados para que tu negocio destaque
            </h1>
            <p className="text-lg text-background/80">
              Mejora tu visibilidad, muestra mas informacion y convierte mas visitas
              en clientes reales desde el directorio.
            </p>
          </div>
        </div>
      </section>

      <section className="container relative z-10 mx-auto -mt-10 px-4 pb-16">
        {user?.hasActiveSubscription && (
          <Alert className="mx-auto mb-10 max-w-3xl border-emerald-200 bg-emerald-50 text-emerald-900">
            <AlertCircle className="h-5 w-5 text-emerald-600" />
            <AlertDescription>
              Ya tienes una suscripcion Premium activa. Puedes seguir editando y
              aprovechando todos sus beneficios.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <Rocket className="mb-4 h-8 w-8 text-primary" />
            <h2 className="mb-2 text-lg font-semibold">Mas visibilidad</h2>
            <p className="text-sm text-muted-foreground">
              Muestra mejor tu negocio y gana protagonismo frente a la competencia.
            </p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <PhoneCall className="mb-4 h-8 w-8 text-primary" />
            <h2 className="mb-2 text-lg font-semibold">Contactos directos</h2>
            <p className="text-sm text-muted-foreground">
              Activa telefono, WhatsApp y enlaces externos para cerrar mas ventas.
            </p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <MapPinned className="mb-4 h-8 w-8 text-primary" />
            <h2 className="mb-2 text-lg font-semibold">Ficha mas completa</h2>
            <p className="text-sm text-muted-foreground">
              Comparte ubicacion, horarios, imagenes y datos clave para generar confianza.
            </p>
          </div>
        </div>

        <div className="grid max-w-6xl gap-8 lg:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Basico
              </p>
              <h3 className="text-3xl font-display font-bold">Gratis</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Para empezar a aparecer en el directorio y validar tu presencia local.
              </p>
            </div>

            <ul className="space-y-4">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button variant="outline" className="mt-8 h-12 w-full rounded-xl" disabled>
              Plan actual
            </Button>
          </div>

          {isLoading ? (
            <>
              <div className="h-[34rem] animate-pulse rounded-3xl bg-muted" />
              <div className="h-[34rem] animate-pulse rounded-3xl bg-muted" />
            </>
          ) : (
            availablePlans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl border p-8 shadow-xl ${
                  index === 0
                    ? "border-primary/50 bg-gradient-to-b from-primary/10 to-background"
                    : "border-border bg-card"
                }`}
              >
                {index === 0 && (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-md">
                    Recomendado
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-display font-bold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="text-4xl font-display font-bold text-foreground">
                    ${plan.price.toLocaleString("es-CO")}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Vigencia de {plan.durationDays} dias
                  </p>
                </div>

                <ul className="space-y-4">
                  {premiumFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isPending || user?.hasActiveSubscription}
                  className="mt-8 h-12 w-full rounded-xl text-base font-semibold"
                >
                  {isPending
                    ? "Procesando..."
                    : user?.hasActiveSubscription
                      ? "Tu cuenta ya es Premium"
                      : "Activar plan"}
                </Button>
              </div>
            ))
          )}
        </div>
      </section>
    </Layout>
  );
}
