import React from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/components/auth-provider";
import { useUpdateProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, User } from "lucide-react";

function formatRole(role?: string) {
  if (role === "business_owner") return "Negocio";
  if (role === "admin") return "Administrador";
  return "Visitante";
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = React.useState(user?.name || "");
  const [phone, setPhone] = React.useState(user?.phone || "");

  const { mutate, isPending } = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Perfil actualizado",
          description: "Tus datos se guardaron correctamente.",
        });
        window.location.reload();
      },
      onError: () =>
        toast({
          title: "No se pudo guardar",
          description: "Intenta nuevamente.",
          variant: "destructive",
        }),
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutate({ data: { name, phone } });
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold">Mi perfil</h1>
            <p className="text-muted-foreground">
              Actualiza tu informacion personal y revisa el estado de tu cuenta.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="300 000 0000"
                />
              </div>

              <div className="space-y-2">
                <Label>Correo electronico</Label>
                <Input value={user?.email || ""} disabled className="h-11 rounded-xl bg-muted/60" />
              </div>

              <Button type="submit" disabled={isPending} className="rounded-xl px-8">
                {isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">Rol de la cuenta</p>
              <p className="mt-2 text-xl font-semibold">{formatRole(user?.role)}</p>
              {user?.hasActiveSubscription && (
                <div className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                  Premium activo
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <Shield className="h-5 w-5" />
                <h2 className="font-semibold">Proteccion de datos</h2>
              </div>
              <p className="text-sm">
                Tus datos se gestionan bajo los lineamientos de privacidad de la
                plataforma y solo se usan para operar tu cuenta y tus negocios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
