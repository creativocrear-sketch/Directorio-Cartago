import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Compass, MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="container mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-16">
        <div className="w-full rounded-[2rem] border border-border/70 bg-card p-10 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPinOff className="h-10 w-10" />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Error 404
          </p>
          <h1 className="mb-4 text-4xl font-display font-bold">
            Esta pagina no existe en el directorio
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            Puede que el enlace este incompleto, que el negocio haya cambiado de ruta
            o que la pagina ya no este disponible.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-xl">
              <Link href="/">
                <Compass className="mr-2 h-4 w-4" />
                Ir al inicio
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/businesses">Abrir directorio</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
