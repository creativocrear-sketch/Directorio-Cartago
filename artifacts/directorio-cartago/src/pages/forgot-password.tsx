import React from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail } from "lucide-react";
import { useForgotPassword } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } =
    useForm<ForgotPasswordValues>({
      resolver: zodResolver(forgotPasswordSchema),
    });

  const { mutate, isPending } = useForgotPassword({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Solicitud enviada",
          description: "Si el correo existe, recibirás un enlace de recuperación.",
        });
      },
      onError: () => {
        toast({
          title: "No se pudo enviar",
          description: "Intenta de nuevo en unos minutos.",
          variant: "destructive",
        });
      },
    },
  });

  const onSubmit = (data: ForgotPasswordValues) => {
    mutate({ data });
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-xl border border-border/50">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center mb-4 shadow-lg shadow-secondary/20">
              <Mail className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Recuperar acceso
            </h1>
            <p className="text-muted-foreground mt-2">
              Te enviaremos instrucciones para restablecer tu contraseña.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20"
            >
              {isPending ? "Enviando..." : "Enviar enlace"}
            </Button>
          </form>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            <Link href="/login" className="text-primary font-bold hover:underline">
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
