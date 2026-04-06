import React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Layout } from "@/components/layout";
import { useAuth } from "@/components/auth-provider";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
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
          title: "¡Bienvenido de nuevo!",
          description: "Has iniciado sesión correctamente.",
        });
        setLocation("/");
      },
      onError: (error) => {
        toast({
          title: "Error al iniciar sesión",
          description: error.response?.data?.message || "Credenciales incorrectas",
          variant: "destructive",
        });
      },
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation({ data });
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-xl border border-border/50 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />

          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <MapPin className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Hola de nuevo
            </h1>
            <p className="text-muted-foreground mt-2">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="rounded-xl h-12 bg-background focus:bg-white"
                placeholder="tu@correo.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="rounded-xl h-12 bg-background focus:bg-white"
                placeholder="********"
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20"
            >
              {isPending ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          <p className="text-center mt-8 text-sm text-muted-foreground relative z-10">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
