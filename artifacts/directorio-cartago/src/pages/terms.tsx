import React from "react";
import { Layout } from "@/components/layout";
import { FileText } from "lucide-react";

export default function Terms() {
  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="h-8 w-8" />
          </div>
        </div>

        <h1 className="mb-6 text-center text-4xl font-display font-bold">
          Terminos y condiciones
        </h1>
        <p className="mx-auto mb-12 max-w-3xl text-center text-muted-foreground">
          Estos terminos regulan el uso del directorio, el registro de cuentas y la
          publicacion de negocios dentro de la plataforma.
        </p>

        <div className="prose prose-slate max-w-none rounded-3xl border border-border/70 bg-card p-8 text-muted-foreground shadow-sm prose-headings:font-display prose-headings:text-foreground">
          <h2>1. Uso permitido</h2>
          <p>
            El servicio esta destinado a usuarios y negocios que deseen consultar,
            publicar o administrar informacion comercial de Cartago y sus alrededores.
          </p>

          <h2>2. Responsabilidad sobre el contenido</h2>
          <p>
            Cada usuario es responsable de la informacion que registra. No se permite
            publicar datos falsos, ofensivos, engañosos o que vulneren derechos de terceros.
          </p>

          <h2>3. Publicacion de negocios</h2>
          <p>
            Directorio Cartago puede revisar, ajustar o suspender publicaciones que no
            cumplan lineamientos minimos de calidad, legalidad o claridad comercial.
          </p>

          <h2>4. Suscripciones y funcionalidades Premium</h2>
          <p>
            Algunas funciones pueden estar sujetas a un plan Premium. La activacion
            de estas funciones depende del plan vigente asociado a la cuenta.
          </p>

          <h2>5. Disponibilidad del servicio</h2>
          <p>
            Hacemos esfuerzos razonables para mantener la plataforma disponible, pero
            no garantizamos funcionamiento ininterrumpido o libre de errores.
          </p>

          <h2>6. Contacto</h2>
          <p>
            Si tienes dudas sobre estos terminos, puedes escribirnos a
            <strong> soporte@directoriocartago.com</strong>.
          </p>
        </div>
      </div>
    </Layout>
  );
}
