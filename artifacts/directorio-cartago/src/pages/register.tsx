import React from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Layout } from "@/components/layout";
import { useAuth } from "@/components/auth-provider";
import { useRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  phone: z.string().optional(),
  role: z.enum(["visitor", "business_owner"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login: setAuthContext } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "visitor" },
  });

  const { mutate: registerMutation, isPending } = useRegister({
    mutation: {
      onSuccess: (data) => {
        setAuthContext(data.token, data.user);
        toast({
          title: "¡Cuenta creada!",
          description: "Bienvenido a Directorio Cartago.",
        });
        setLocation(data.user.role === "business_owner" ? "/my-businesses" : "/");
      },
      onError: (error) => {
        toast({
          title: "Error de registro",
          description: error.response?.data?.message || "Hubo un problema",
          variant: "destructive",
        });
      },
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation({ data });
  };

  const selectedRole = watch("role");

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/30 py-12">
        <div className="w-full max-w-xl bg-card rounded-3xl p-8 shadow-xl border border-border/50 relative overflow-hidden">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center mb-4 shadow-lg shadow-secondary/20">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Crear Cuenta
            </h1>
            <p className="text-muted-foreground mt-2">
              Únete a la red más grande de Cartago
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-2xl border border-border">
              <Label className="text-base font-bold mb-3 block">
                ¿Qué tipo de cuenta deseas?
              </Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={(value) => setValue("role", value as RegisterFormValues["role"])}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="visitor" id="visitor" className="peer sr-only" />
                  <Label
                    htmlFor="visitor"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent/5 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                  >
                    <span className="font-bold text-lg mb-1">Visitante</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Para buscar y calificar negocios
                    </span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="business_owner"
                    id="owner"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="owner"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent/5 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                  >
                    <span className="font-bold text-lg mb-1">Negocio</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Para publicar y gestionar tu empresa
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="rounded-xl h-11"
                  placeholder="Juan Pérez"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  className="rounded-xl h-11"
                  placeholder="310 000 0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="rounded-xl h-11"
                placeholder="tu@correo.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="rounded-xl h-11"
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="text-xs text-muted-foreground px-1">
              Al registrarte aceptas nuestra{" "}
              <Link href="/privacidad" className="text-primary hover:underline">
                Política de Privacidad
              </Link>
              .
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20"
            >
              {isPending ? "Creando cuenta..." : "Crear mi cuenta"}
            </Button>
          </form>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
