import React from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/components/auth-provider";
import { useUpdateProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Shield } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = React.useState(user?.name || "");
  const [phone, setPhone] = React.useState(user?.phone || "");

  const { mutate, isPending } = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        toast({ title: "Perfil actualizado", description: "Tus datos se guardaron correctamente." });
        window.location.reload(); // Simple refresh to update context
      },
      onError: () => toast({ title: "Error", variant: "destructive" })
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ data: { name, phone } });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <h1 className="text-3xl font-display font-bold mb-8">Mi Perfil</h1>
        
        <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground uppercase tracking-wide font-medium">
                  Rol: {user?.role}
                </span>
                {user?.hasActiveSubscription && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md uppercase tracking-wide font-bold">
                    Premium
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl h-11 bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} className="rounded-xl h-11 bg-muted/50" />
            </div>

            <Button type="submit" disabled={isPending} className="rounded-xl px-8 bg-primary">
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </form>
        </div>

        <div className="mt-8 p-6 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4 text-amber-800">
          <Shield className="w-6 h-6 shrink-0 mt-1" />
          <div>
            <h4 className="font-bold mb-1">Protección de Datos</h4>
            <p className="text-sm opacity-90">
              Tus datos están protegidos según la Ley 1581 de Colombia. No compartimos tu información personal con terceros sin tu consentimiento.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
