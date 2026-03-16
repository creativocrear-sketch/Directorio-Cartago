import React, { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateBusiness, useUpdateBusiness, useGetBusiness, useGetCategories } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Store, MapPin, Phone, Share2, Image as ImageIcon, Plus, Trash2 } from "lucide-react";

const bizSchema = z.object({
  name: z.string().min(2, "Requerido"),
  description: z.string().optional(),
  address: z.string().min(5, "Requerido"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  website: z.string().optional(),
  googleMapsUrl: z.string().optional(),
  schedule: z.string().optional(),
  categoryId: z.coerce.number().min(1, "Selecciona una categoría"),
  images: z.array(z.object({ url: z.string().url("Debe ser una URL válida") }))
});

type BizFormValues = z.infer<typeof bizSchema>;

export default function BusinessForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: categories } = useGetCategories();
  const { data: existingBiz, isLoading: loadingBiz } = useGetBusiness(Number(id), { query: { enabled: isEdit } });

  const form = useForm<BizFormValues>({
    resolver: zodResolver(bizSchema),
    defaultValues: {
      name: "", address: "", description: "", phone: "", whatsapp: "", instagram: "", facebook: "",
      website: "", googleMapsUrl: "", schedule: "", categoryId: 0,
      images: [{ url: "" }]
    }
  });

  const { fields: imageFields, append, remove } = useFieldArray({ control: form.control, name: "images" });

  useEffect(() => {
    if (isEdit && existingBiz) {
      form.reset({
        name: existingBiz.name,
        address: existingBiz.address,
        description: existingBiz.description || "",
        phone: existingBiz.phone || "",
        whatsapp: existingBiz.whatsapp || "",
        instagram: existingBiz.instagram || "",
        facebook: existingBiz.facebook || "",
        website: existingBiz.website || "",
        googleMapsUrl: existingBiz.googleMapsUrl || "",
        schedule: existingBiz.schedule || "",
        categoryId: existingBiz.categoryId || 0,
        images: existingBiz.images?.length ? existingBiz.images.map(img => ({ url: img.url })) : [{ url: "" }]
      });
    }
  }, [existingBiz, isEdit, form]);

  const { mutate: createMutate, isPending: creating } = useCreateBusiness({
    mutation: {
      onSuccess: () => {
        toast({ title: "Negocio creado", description: "En revisión por un administrador." });
        setLocation("/my-businesses");
      }
    }
  });

  const { mutate: updateMutate, isPending: updating } = useUpdateBusiness({
    mutation: {
      onSuccess: () => {
        toast({ title: "Negocio actualizado" });
        setLocation("/my-businesses");
      }
    }
  });

  const onSubmit = (data: BizFormValues) => {
    const payload = {
      ...data,
      images: data.images.map(img => img.url).filter(url => url.length > 0)
    };
    
    if (isEdit) {
      updateMutate({ id: Number(id), data: payload });
    } else {
      createMutate({ data: payload });
    }
  };

  if (isEdit && loadingBiz) return <Layout><div className="p-20 text-center">Cargando...</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-display font-bold mb-8">{isEdit ? "Editar Negocio" : "Publicar Negocio"}</h1>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Basic Info */}
          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
            <div className="flex items-center gap-2 text-primary font-bold mb-6 pb-4 border-b border-border">
              <Store className="w-5 h-5" /> Información Básica
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nombre del Negocio *</Label>
                <Input {...form.register("name")} className="rounded-xl bg-muted/50" />
              </div>
              
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select 
                  value={form.watch("categoryId") ? String(form.watch("categoryId")) : undefined} 
                  onValueChange={(v) => form.setValue("categoryId", Number(v))}
                >
                  <SelectTrigger className="rounded-xl bg-muted/50">
                    <SelectValue placeholder="Seleccione una..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Descripción Corta</Label>
                <Textarea {...form.register("description")} className="rounded-xl bg-muted/50 min-h-[100px]" />
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
            <div className="flex items-center gap-2 text-primary font-bold mb-6 pb-4 border-b border-border">
              <MapPin className="w-5 h-5" /> Ubicación y Contacto
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label>Dirección Física *</Label>
                <Input {...form.register("address")} className="rounded-xl bg-muted/50" />
              </div>
              
              <div className="space-y-2">
                <Label>Teléfono Fijo / Móvil</Label>
                <Input {...form.register("phone")} className="rounded-xl bg-muted/50" />
              </div>

              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input {...form.register("whatsapp")} className="rounded-xl bg-muted/50" placeholder="+57 300 000 0000" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>URL Google Maps (Embebido) <span className="text-xs text-muted-foreground font-normal">(Premium)</span></Label>
                <Input {...form.register("googleMapsUrl")} className="rounded-xl bg-muted/50" placeholder="https://www.google.com/maps/embed?..." />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Horarios de Atención</Label>
                <Textarea {...form.register("schedule")} className="rounded-xl bg-muted/50 h-20" placeholder="Lun-Vie: 8am - 6pm..." />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
            <div className="flex items-center gap-2 text-primary font-bold mb-6 pb-4 border-b border-border">
              <Share2 className="w-5 h-5" /> Redes Sociales <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded ml-2">Algunos campos son Premium</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Instagram (URL)</Label>
                <Input {...form.register("instagram")} className="rounded-xl bg-muted/50" placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-2">
                <Label>Facebook (URL)</Label>
                <Input {...form.register("facebook")} className="rounded-xl bg-muted/50" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Sitio Web</Label>
                <Input {...form.register("website")} className="rounded-xl bg-muted/50" />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-2 text-primary font-bold">
                <ImageIcon className="w-5 h-5" /> Imágenes
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ url: "" })} className="rounded-lg h-8">
                <Plus className="w-4 h-4 mr-1" /> Añadir
              </Button>
            </div>
            
            <div className="space-y-4">
              {imageFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">URL Imagen {index + 1}</Label>
                    <Input {...form.register(`images.${index}.url`)} className="rounded-xl bg-muted/50" placeholder="https://..." />
                    {form.formState.errors.images?.[index]?.url && <p className="text-xs text-destructive">{form.formState.errors.images[index].url?.message}</p>}
                  </div>
                  {imageFields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="mt-5 text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-2">La primera imagen será la foto de portada. Usuarios Premium pueden mostrar hasta 5 en galería.</p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="ghost" onClick={() => setLocation("/my-businesses")} className="rounded-xl">Cancelar</Button>
            <Button type="submit" disabled={creating || updating} className="rounded-xl px-8 bg-primary hover:bg-primary/90 text-white shadow-lg">
              {isEdit ? "Guardar Cambios" : "Publicar Negocio"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
