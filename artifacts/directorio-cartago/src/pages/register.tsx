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
import { Store, UserPlus } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Escribe un nombre mas claro"),
  email: z.string().email("Ingresa un correo valido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
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
          title: "Cuenta creada",
          description: "Bienvenido a Directorio Cartago.",
        });
        setLocation(data.user.role === "business_owner" ? "/my-businesses" : "/");
      },
      onError: (error) => {
        toast({
          title: "No pudimos crear tu cuenta",
          description:
            error.response?.data?.message || "Intenta de nuevo con otros datos.",
          variant: "destructive",
        });
      },
    },
  });

  const selectedRole = watch("role");

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation({ data });
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-12">
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] bg-card p-8 shadow-xl border border-border/60">
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <UserPlus className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-display font-bold">Crear cuenta</h1>
                <p className="mt-2 text-muted-foreground">
                  Elige el tipo de perfil y empieza a usar el directorio.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <Label className="mb-3 block text-base font-semibold">
                    Tipo de cuenta
                  </Label>
                  <RadioGroup
                    value={selectedRole}
                    onValueChange={(value) =>
                      setValue("role", value as RegisterFormValues["role"])
                    }
                    className="grid gap-4 md:grid-cols-2"
                  >
                    <div>
                      <RadioGroupItem value="visitor" id="visitor" className="peer sr-only" />
                      <Label
                        htmlFor="visitor"
                        className="flex cursor-pointer flex-col rounded-2xl border-2 border-muted bg-background p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <span className="font-semibold">Visitante</span>
                        <span className="mt-1 text-xs text-muted-foreground">
                          Para explorar negocios, guardar referencias y contactar comercios.
                        </span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="business_owner"
                        id="business_owner"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="business_owner"
                        className="flex cursor-pointer flex-col rounded-2xl border-2 border-muted bg-background p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <span className="font-semibold">Negocio</span>
                        <span className="mt-1 text-xs text-muted-foreground">
                          Para publicar tu empresa y administrar tu ficha comercial.
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      className="h-11 rounded-xl"
                      placeholder="Nombre y apellido"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefono</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      className="h-11 rounded-xl"
                      placeholder="300 000 0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo electronico</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="h-11 rounded-xl"
                    placeholder="tu@correo.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contrasena</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    className="h-11 rounded-xl"
                    placeholder="Minimo 6 caracteres"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Al registrarte aceptas nuestra{" "}
                  <Link href="/privacidad" className="text-primary hover:underline">
                    politica de privacidad
                  </Link>{" "}
                  y los{" "}
                  <Link href="/terminos" className="text-primary hover:underline">
                    terminos del servicio
                  </Link>
                  .
                </p>

                <Button type="submit" disabled={isPending} className="h-12 w-full rounded-xl">
                  {isPending ? "Creando cuenta..." : "Crear mi cuenta"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Ya tienes cuenta?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Inicia sesion aqui
                </Link>
              </p>
            </div>

            <div className="hidden rounded-[2rem] bg-gradient-to-br from-foreground to-foreground/90 p-10 text-white shadow-2xl lg:block">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Store className="h-7 w-7" />
              </div>
              <h2 className="mb-4 text-4xl font-display font-bold">
                Publica tu negocio y gana presencia local
              </h2>
              <p className="max-w-md text-white/80">
                Crea tu cuenta, registra tu empresa y empieza a aparecer en las
                busquedas del directorio comercial de Cartago.
              </p>
              <div className="mt-10 space-y-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-semibold">Mas alcance</p>
                  <p className="text-sm text-white/75">
                    Tus clientes te encuentran mas facil por categoria y servicio.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-semibold">Ficha profesional</p>
                  <p className="text-sm text-white/75">
                    Muestra imagenes, horarios, ubicacion y canales de contacto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
