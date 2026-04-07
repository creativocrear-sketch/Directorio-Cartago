import React, { useMemo } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useAuth } from "@/components/auth-provider";
import { useGetBusinesses, useDeleteBusiness } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Crown,
  Eye,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getBusinessFallbackImage,
  getBusinessImageSrc,
} from "@/lib/business-media";
import { useDemoBusinesses } from "@/lib/demo-businesses";

function getStatusLabel(status: string) {
  if (status === "approved") return "Aprobado";
  if (status === "rejected") return "Rechazado";
  return "Pendiente";
}

export default function MyBusinesses() {
  const { user, isDemoSession } = useAuth();
  const { toast } = useToast();
  const { businesses: demoBusinesses, deleteBusiness: deleteDemoBusiness } = useDemoBusinesses();
  const { data, isLoading, refetch } = useGetBusinesses({ limit: 100 });

  const isDemoPremium = isDemoSession && user?.email === "premium@directoriocartago.co";
  const myBusinesses = useMemo(() => {
    if (isDemoPremium) {
      return demoBusinesses.filter((business) => business.ownerId === user?.id);
    }
    return data?.businesses?.filter((business) => business.ownerId === user?.id) || [];
  }, [data?.businesses, demoBusinesses, isDemoPremium, user?.id]);

  const { mutate: deleteMutation } = useDeleteBusiness({
    mutation: {
      onSuccess: () => {
        toast({ title: "Negocio eliminado" });
        refetch();
      },
      onError: () =>
        toast({
          title: "Error al eliminar",
          variant: "destructive",
        }),
    },
  });

  if (user?.role === "visitor") {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <h2 className="text-2xl font-bold">No tienes permisos</h2>
          <p className="mb-6 text-muted-foreground">
            Debes ser dueno de negocio para acceder a esta seccion.
          </p>
        </div>
      </Layout>
    );
  }

  const approvedCount = myBusinesses.filter((item) => item.status === "approved").length;
  const pendingCount = myBusinesses.filter((item) => item.status === "pending").length;

  const handleDelete = (id: number) => {
    if (isDemoPremium) {
      deleteDemoBusiness(id);
      toast({
        title: "Negocio eliminado",
        description: "La ficha demo se elimino de este navegador.",
      });
      return;
    }

    deleteMutation({ id });
  };

  return (
    <Layout>
      <div className="border-b border-border/50 bg-muted/20 py-10">
        <div className="container mx-auto flex flex-col items-start justify-between gap-4 px-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Mis negocios
            </h1>
            <p className="mt-1 text-muted-foreground">
              Administra tus fichas, revisa su estado y mejora tu presencia en el directorio.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {user?.hasActiveSubscription && (
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                <Crown className="h-4 w-4" />
                Cuenta Premium activa
              </div>
            )}
            <Button asChild className="h-11 rounded-xl shadow-md">
              <Link href="/businesses/new">
                <Plus className="mr-2 h-4 w-4" /> Agregar negocio
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-8 px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Negocios visibles</p>
            <p className="mt-2 text-3xl font-display font-bold">{approvedCount}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">En revision</p>
            <p className="mt-2 text-3xl font-display font-bold">{pendingCount}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Nivel de cuenta</p>
            <p className="mt-2 text-xl font-semibold">
              {user?.hasActiveSubscription ? "Premium" : "Basica"}
            </p>
          </div>
        </div>

        {isDemoPremium && (
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-sm text-muted-foreground">
              Este modo demo ya es editable: puedes crear, editar y eliminar fichas desde
              este navegador sin esperar a que responda el backend.
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
              Lo que guardes aqui tambien aparecera en el listado y en la ficha publica
              del directorio mientras mantengas esta sesion demo.
            </div>
          </div>
        )}

        {isLoading && !isDemoPremium ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : myBusinesses.length === 0 ? (
          <div className="rounded-3xl border border-border border-dashed bg-card py-20 text-center">
            <ClipboardList className="mx-auto mb-4 h-12 w-12 text-primary/70" />
            <h3 className="mb-2 text-xl font-bold">Aun no tienes negocios publicados</h3>
            <p className="mb-6 text-muted-foreground">
              Crea tu primera ficha para empezar a aparecer en el directorio.
            </p>
            <Button asChild className="rounded-xl">
              <Link href="/businesses/new">Publicar ahora</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {myBusinesses.map((biz) => (
              <div
                key={biz.id}
                className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center"
              >
                <img
                  src={getBusinessImageSrc(biz)}
                  alt={biz.name}
                  className="h-32 w-full rounded-xl bg-muted object-cover md:w-36"
                  onError={(event) => {
                    event.currentTarget.src = getBusinessFallbackImage(biz.categoryName);
                  }}
                />

                <div className="flex-1">
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <h3 className="text-xl font-bold">{biz.name}</h3>
                    <Badge
                      variant={
                        biz.status === "approved"
                          ? "default"
                          : biz.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {getStatusLabel(biz.status)}
                    </Badge>
                    {user?.hasActiveSubscription && (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                        Premium
                      </Badge>
                    )}
                    {isDemoPremium && (
                      <Badge variant="secondary" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        Demo editable
                      </Badge>
                    )}
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {biz.description}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      Categoria: {biz.categoryName}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <PhoneCall className="h-3.5 w-3.5 text-primary" />
                      {biz.phone || "Sin telefono visible"}
                    </span>
                    {biz.status === "approved" ? (
                      <span className="inline-flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Visible en el directorio
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" asChild className="rounded-lg">
                      <Link href={`/businesses/${biz.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar negocio?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta accion no se puede deshacer. Se borraran los datos de {biz.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(biz.id)}
                            className="rounded-xl bg-destructive hover:bg-destructive/90"
                          >
                            Si, eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button variant="link" size="sm" asChild className="rounded-lg px-0 text-primary">
                      <Link href={`/businesses/${biz.id}`}>Ver pagina publica</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
