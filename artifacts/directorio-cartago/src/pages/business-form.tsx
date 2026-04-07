import React, { useEffect, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateBusiness,
  useUpdateBusiness,
  useGetBusiness,
  useGetCategories,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { fallbackCategories } from "@/lib/fallback-directory";
import { getDirectoryBusinessById, useDemoBusinesses } from "@/lib/demo-businesses";
import {
  Store,
  MapPin,
  Share2,
  Image as ImageIcon,
  Plus,
  Trash2,
  Sparkles,
  Clock3,
  Globe,
  ShieldCheck,
} from "lucide-react";

const bizSchema = z.object({
  name: z.string().min(2, "Escribe un nombre mas claro"),
  description: z.string().max(400, "Usa una descripcion mas corta").optional(),
  address: z.string().min(5, "Escribe una direccion valida"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  website: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  schedule: z.string().optional(),
  categoryId: z.coerce.number().min(1, "Selecciona una categoria"),
  images: z.array(
    z.object({
      url: z
        .string()
        .optional()
        .refine((value) => !value || /^https?:\/\//.test(value), "Ingresa una URL valida"),
    }),
  ),
});

type BizFormValues = z.infer<typeof bizSchema>;

const BUSINESS_TIPS = [
  "Describe claramente que ofreces y para quien.",
  "Agrega una direccion facil de entender para clientes nuevos.",
  "Usa una imagen principal atractiva y bien iluminada.",
  "Incluye horarios reales para evitar mensajes perdidos.",
];

export default function BusinessForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const numericId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isDemoSession } = useAuth();
  const { businesses: demoBusinesses, createBusiness, updateBusiness } = useDemoBusinesses();

  const { data: categories } = useGetCategories();
  const { data: existingBiz, isLoading: loadingBiz } = useGetBusiness(numericId, {
    query: { enabled: isEdit && !isDemoSession },
  });

  const form = useForm<BizFormValues>({
    resolver: zodResolver(bizSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      phone: "",
      whatsapp: "",
      instagram: "",
      facebook: "",
      website: "",
      googleMapsUrl: "",
      schedule: "",
      categoryId: 0,
      images: [{ url: "" }],
    },
  });

  const { fields: imageFields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  });

  const visibleCategories = categories?.length ? categories : fallbackCategories;
  const demoBiz = useMemo(() => {
    if (!isEdit || !isDemoSession) return null;
    return demoBusinesses.find((business) => business.id === numericId) ?? getDirectoryBusinessById(numericId);
  }, [demoBusinesses, isDemoSession, isEdit, numericId]);
  const currentBiz = isDemoSession ? demoBiz : existingBiz;

  useEffect(() => {
    if (!isEdit || !currentBiz) return;

    form.reset({
      name: currentBiz.name,
      address: currentBiz.address,
      description: currentBiz.description || "",
      phone: currentBiz.phone || "",
      whatsapp: currentBiz.whatsapp || "",
      instagram: currentBiz.instagram || "",
      facebook: currentBiz.facebook || "",
      website: currentBiz.website || "",
      googleMapsUrl: currentBiz.googleMapsUrl || "",
      schedule: currentBiz.schedule || "",
      categoryId: currentBiz.categoryId || 0,
      images: currentBiz.images?.length
        ? currentBiz.images.map((img) => ({ url: img.url }))
        : [{ url: "" }],
    });
  }, [currentBiz, form, isEdit]);

  const { mutate: createMutate, isPending: creating } = useCreateBusiness({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Negocio enviado",
          description: "Tu ficha quedo creada y paso a revision administrativa.",
        });
        setLocation("/my-businesses");
      },
      onError: () => {
        toast({
          title: "No se pudo publicar",
          description: "Revisa los datos e intenta de nuevo.",
          variant: "destructive",
        });
      },
    },
  });

  const { mutate: updateMutate, isPending: updating } = useUpdateBusiness({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Cambios guardados",
          description: "La informacion del negocio fue actualizada.",
        });
        setLocation("/my-businesses");
      },
      onError: () => {
        toast({
          title: "No se pudo actualizar",
          description: "Intenta nuevamente en unos minutos.",
          variant: "destructive",
        });
      },
    },
  });

  const submitting = creating || updating;
  const previewImage = form.watch("images.0.url");
  const description = form.watch("description") || "";
  const categoryId = form.watch("categoryId");

  const selectedCategory = useMemo(
    () => visibleCategories.find((category) => category.id === categoryId),
    [visibleCategories, categoryId],
  );

  const onSubmit = (data: BizFormValues) => {
    const payload = {
      ...data,
      images: data.images
        .map((image) => image.url.trim())
        .filter((url) => url.length > 0),
    };

    if (isDemoSession && user) {
      if (isEdit) {
        updateBusiness(numericId, payload, user);
        toast({
          title: "Cambios guardados",
          description: "La ficha demo se actualizo correctamente.",
        });
      } else {
        createBusiness(payload, user);
        toast({
          title: "Negocio creado",
          description: "Tu ficha demo ya aparece en Mis Negocios y en el directorio.",
        });
      }
      setLocation("/my-businesses");
      return;
    }

    if (isEdit) {
      updateMutate({ id: numericId, data: payload });
      return;
    }

    createMutate({ data: payload });
  };

  if (isEdit && loadingBiz && !isDemoSession) {
    return (
      <Layout>
        <div className="p-20 text-center">Cargando formulario del negocio...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Gestion comercial
            </p>
            <h1 className="text-3xl font-display font-bold">
              {isEdit ? "Editar negocio" : "Publicar negocio"}
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Completa la ficha con informacion clara, imagenes y canales de contacto
              para que tu negocio inspire confianza desde el primer vistazo.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/my-businesses")}
            className="rounded-xl"
          >
            Volver a Mis Negocios
          </Button>
        </div>

        {isDemoSession && (
          <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-sm text-muted-foreground">
            Este formulario esta en modo demo editable. Todo lo que guardes se conserva
            en este navegador para que puedas probar crear, editar y borrar negocios.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-2 border-b border-border pb-4 font-bold text-primary">
                <Store className="h-5 w-5" />
                Informacion basica
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nombre del negocio</Label>
                  <Input {...form.register("name")} className="rounded-xl bg-muted/50" />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={categoryId ? String(categoryId) : undefined}
                    onValueChange={(value) => form.setValue("categoryId", Number(value))}
                  >
                    <SelectTrigger className="rounded-xl bg-muted/50">
                      <SelectValue placeholder="Selecciona una categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {visibleCategories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Descripcion corta</Label>
                  <Textarea
                    {...form.register("description")}
                    className="min-h-[120px] rounded-xl bg-muted/50"
                    placeholder="Cuentale al cliente que te hace especial, que vendes y por que deberia contactarte."
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Hazla clara, concreta y util para quien te encuentra por primera vez.</span>
                    <span>{description.length}/400</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-2 border-b border-border pb-4 font-bold text-primary">
                <MapPin className="h-5 w-5" />
                Ubicacion y contacto
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Direccion</Label>
                  <Input
                    {...form.register("address")}
                    className="rounded-xl bg-muted/50"
                    placeholder="Ej. Carrera 5 #10-23, Centro, Cartago"
                  />
                  {form.formState.errors.address && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Telefono</Label>
                  <Input
                    {...form.register("phone")}
                    className="rounded-xl bg-muted/50"
                    placeholder="3001234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    {...form.register("whatsapp")}
                    className="rounded-xl bg-muted/50"
                    placeholder="573001234567"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Horario de atencion</Label>
                  <Textarea
                    {...form.register("schedule")}
                    className="min-h-[90px] rounded-xl bg-muted/50"
                    placeholder={"Lunes a viernes\n8:00 a. m. - 6:00 p. m.\nSabados 9:00 a. m. - 1:00 p. m."}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>
                    Enlace de Google Maps
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      Premium
                    </span>
                  </Label>
                  <Input
                    {...form.register("googleMapsUrl")}
                    className="rounded-xl bg-muted/50"
                    placeholder="https://www.google.com/maps/..."
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-2 border-b border-border pb-4 font-bold text-primary">
                <Share2 className="h-5 w-5" />
                Presencia digital
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input
                    {...form.register("instagram")}
                    className="rounded-xl bg-muted/50"
                    placeholder="@tunegocio o https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input
                    {...form.register("facebook")}
                    className="rounded-xl bg-muted/50"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Sitio web</Label>
                  <Input
                    {...form.register("website")}
                    className="rounded-xl bg-muted/50"
                    placeholder="https://tu-negocio.com"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <ImageIcon className="h-5 w-5" />
                  Imagenes del negocio
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ url: "" })}
                  className="h-9 rounded-lg"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Anadir
                </Button>
              </div>

              <div className="space-y-4">
                {imageFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">
                        URL imagen {index + 1}
                        {index === 0 ? " - Portada" : ""}
                      </Label>
                      <Input
                        {...form.register(`images.${index}.url`)}
                        className="rounded-xl bg-muted/50"
                        placeholder="https://..."
                      />
                      {form.formState.errors.images?.[index]?.url && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.images[index]?.url?.message}
                        </p>
                      )}
                    </div>
                    {imageFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="mt-5 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  La primera imagen sera la portada. En Premium puedes mostrar una ficha
                  mucho mas completa y visual.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setLocation("/my-businesses")}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-xl px-8">
                {submitting
                  ? "Guardando..."
                  : isEdit
                    ? "Guardar cambios"
                    : "Publicar negocio"}
              </Button>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
              <div className="aspect-[4/3] bg-muted">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                    <ImageIcon className="h-10 w-10" />
                    <p className="text-sm">La portada aparecera aqui</p>
                  </div>
                )}
              </div>
              <div className="space-y-2 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Vista previa
                </p>
                <h2 className="text-xl font-display font-bold">
                  {form.watch("name") || "Nombre del negocio"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory?.name || "Categoria por definir"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {form.watch("address") || "La direccion aparecera aqui"}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 font-bold text-primary">
                <Sparkles className="h-5 w-5" />
                Recomendaciones
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {BUSINESS_TIPS.map((tip) => (
                  <li key={tip} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 font-bold text-primary">
                <Clock3 className="h-5 w-5" />
                Que pasa despues
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>1. Guardas o publicas tu ficha.</p>
                <p>2. En demo, la informacion se actualiza al instante.</p>
                <p>3. Tu negocio aparece en Mis Negocios y en el directorio.</p>
                <p>4. Desde Premium puedes ensayar todo el flujo comercial antes del backend final.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 font-bold text-primary">
                {isDemoSession ? <ShieldCheck className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                {isDemoSession ? "Modo demo util" : "Consejo rapido"}
              </div>
              <p className="text-sm text-muted-foreground">
                {isDemoSession
                  ? "Prueba cambios reales con tus fichas: crea una, edita otra y luego vuelve al panel para revisar estados y detalle publico."
                  : "Si tu negocio depende mucho de visitas presenciales, prioriza direccion, WhatsApp y horario. Son los tres datos que mas ayudan a convertir visitas en contactos reales."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
