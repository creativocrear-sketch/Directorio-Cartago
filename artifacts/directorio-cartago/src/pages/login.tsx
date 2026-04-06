import React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Layout } from "@/components/layout";
import {
  DEMO_ADMIN_USER,
  DEMO_PREMIUM_USER,
  useAuth,
} from "@/components/auth-provider";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo valido"),
  password: z.string().min(1, "La contrasena es obligatoria"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login: setAuthContext } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate: loginMutation, isPending } = useLogin({
    mutation: {
      onSuccess: (data) => {
        setAuthContext(data.token, data.user);
        toast({
          title: "Sesion iniciada",
          description: "Ya puedes explorar y gestionar tu cuenta.",
        });
        setLocation("/");
      },
      onError: (error) => {
        toast({
          title: "No pudimos iniciar sesion",
          description:
            error.response?.data?.message || "Revisa tus credenciales e intenta de nuevo.",
          variant: "destructive",
        });
      },
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    const normalizedEmail = data.email.trim().toLowerCase();

    if (
      normalizedEmail === DEMO_ADMIN_USER.email &&
      data.password === "admin123"
    ) {
      setAuthContext(`demo-token:${DEMO_ADMIN_USER.email}`, DEMO_ADMIN_USER);
      toast({
        title: "Sesion demo iniciada",
        description: "Entraste con el perfil administrador de demostracion.",
      });
      setLocation("/admin");
      return;
    }

    if (
      normalizedEmail === DEMO_PREMIUM_USER.email &&
      data.password === "premium123"
    ) {
      setAuthContext(`demo-token:${DEMO_PREMIUM_USER.email}`, DEMO_PREMIUM_USER);
      toast({
        title: "Sesion demo iniciada",
        description: "Entraste con el perfil Premium de demostracion.",
      });
      setLocation("/my-businesses");
      return;
    }

    loginMutation({ data });
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-12">
        <div className="container mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden rounded-[2rem] bg-gradient-to-br from-primary to-accent p-10 text-white shadow-2xl lg:block">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <MapPin className="h-7 w-7" />
            </div>
            <h1 className="mb-4 text-4xl font-display font-bold">
              Entra y sigue haciendo crecer tu presencia local
            </h1>
            <p className="max-w-md text-white/85">
              Consulta tu perfil, administra negocios, mejora tu ficha comercial
              y mantente visible dentro del directorio de Cartago.
            </p>
            <div className="mt-10 space-y-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-semibold">Acceso a tu panel</p>
                <p className="text-sm text-white/80">
                  Gestiona tus publicaciones y actualiza la informacion de tu negocio.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-semibold">Seguridad y control</p>
                <p className="text-sm text-white/80">
                  Mantiene tus datos organizados y listos para una mejor atencion.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/60 bg-card p-8 shadow-xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-display font-bold">Iniciar sesion</h2>
              <p className="mt-2 text-muted-foreground">
                Accede a tu cuenta para administrar tu experiencia en el directorio.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electronico</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="h-12 rounded-xl"
                  placeholder="tu@correo.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contrasena</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Olvide mi contrasena
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="h-12 rounded-xl"
                  placeholder="Ingresa tu contrasena"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isPending} className="h-12 w-full rounded-xl">
                {isPending ? "Ingresando..." : "Entrar"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Aun no tienes cuenta?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Registrate aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
