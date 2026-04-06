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
  email: z.string().email("Ingresa un correo valido"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { mutate, isPending } = useForgotPassword({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Solicitud enviada",
          description: "Si el correo existe, recibiras instrucciones para recuperar el acceso.",
        });
      },
      onError: () => {
        toast({
          title: "No pudimos enviarlo",
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
      <div className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-12">
        <div className="mx-auto max-w-md rounded-[2rem] border border-border/60 bg-card p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Mail className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-display font-bold">Recuperar acceso</h1>
            <p className="mt-2 text-muted-foreground">
              Escribe tu correo y te enviaremos indicaciones para restablecer la cuenta.
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

            <Button type="submit" disabled={isPending} className="h-12 w-full rounded-xl">
              {isPending ? "Enviando..." : "Enviar instrucciones"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Volver a iniciar sesion
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
