import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useAuth } from "@/components/auth-provider";
import { useGetBusinesses, useDeleteBusiness } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
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

export default function MyBusinesses() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // No direct API for "my businesses", so fetch all and filter by ownerId
  // In a real app, there should be a dedicated endpoint for scalability.
  const { data, isLoading, refetch } = useGetBusinesses({ limit: 100 });
  const myBusinesses = data?.businesses.filter(b => b.ownerId === user?.id) || [];

  const { mutate: deleteMutation } = useDeleteBusiness({
    mutation: {
      onSuccess: () => {
        toast({ title: "Negocio eliminado" });
        refetch();
      },
      onError: () => toast({ title: "Error al eliminar", variant: "destructive" })
    }
  });

  if (user?.role === "visitor") {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold">No tienes permisos</h2>
          <p className="text-muted-foreground mb-6">Debes ser dueño de negocio para acceder a esta sección.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/20 border-b border-border/50 py-10">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Mis Negocios</h1>
            <p className="text-muted-foreground mt-1">Gestiona tus publicaciones en el directorio.</p>
          </div>
          <Button asChild className="rounded-xl shadow-md h-11 bg-primary text-white">
            <Link href="/businesses/new"><Plus className="w-4 h-4 mr-2" /> Agregar Negocio</Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : myBusinesses.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border border-dashed">
            <h3 className="text-xl font-bold mb-2">No tienes negocios publicados</h3>
            <p className="text-muted-foreground mb-6">Comienza agregando tu primer negocio al directorio.</p>
            <Button asChild className="rounded-xl"><Link href="/businesses/new">Publicar ahora</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {myBusinesses.map(biz => (
              <div key={biz.id} className="bg-card rounded-2xl border border-border p-6 flex flex-col sm:flex-row gap-6 items-center shadow-sm">
                <img 
                  src={biz.images?.[0]?.url || `${import.meta.env.BASE_URL}images/default-business.png`} 
                  alt={biz.name}
                  className="w-32 h-32 rounded-xl object-cover bg-muted"
                />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2 justify-center sm:justify-start">
                    <h3 className="text-xl font-bold">{biz.name}</h3>
                    <Badge variant={biz.status === 'approved' ? 'default' : biz.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {biz.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{biz.description}</p>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <Button variant="outline" size="sm" asChild className="rounded-lg">
                      <Link href={`/businesses/${biz.id}/edit`}><Edit className="w-4 h-4 mr-2" /> Editar</Link>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar negocio?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se borrarán todos los datos de {biz.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteMutation({ id: biz.id })}
                            className="bg-destructive hover:bg-destructive/90 rounded-xl"
                          >
                            Sí, eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button variant="link" size="sm" asChild className="rounded-lg text-primary">
                      <Link href={`/businesses/${biz.id}`}>Ver página</Link>
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
