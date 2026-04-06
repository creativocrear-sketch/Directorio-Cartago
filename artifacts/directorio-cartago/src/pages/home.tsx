import React from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { BusinessCard } from "@/components/business-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  TrendingUp,
  Store,
  UtensilsCrossed,
  Wrench,
  Heart,
  GraduationCap,
  Music,
  Laptop,
  Sparkles,
} from "lucide-react";
import { useGetBusinesses, useGetCategories } from "@workspace/api-client-react";
import { fallbackCategories, getFallbackBusinesses } from "@/lib/fallback-directory";

const iconMap: Record<string, React.ElementType> = {
  Restaurantes: UtensilsCrossed,
  Tiendas: Store,
  Servicios: Wrench,
  Salud: Heart,
  Educacion: GraduationCap,
  Entretenimiento: Music,
  Tecnologia: Laptop,
};

export default function Home() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = React.useState("");

  const { data: businessesData, isLoading: loadingBiz } = useGetBusinesses({
    status: "approved",
    limit: 6,
  });
  const { data: categories, isLoading: loadingCat } = useGetCategories();
  const fallbackFeatured = React.useMemo(
    () => getFallbackBusinesses({ limit: 6 }),
    [],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setLocation(`/businesses?search=${encodeURIComponent(search)}`);
    }
  };

  const featuredBusinesses =
    businessesData?.businesses && businessesData.businesses.length > 0
      ? businessesData.businesses
      : fallbackFeatured.businesses;
  const visibleCategories = categories?.length ? categories : fallbackCategories;
  const stats = [
    {
      label: "Negocios activos",
      value: featuredBusinesses.length > 0 ? `${featuredBusinesses.length}+` : "24+",
    },
    {
      label: "Categorias destacadas",
      value: `${visibleCategories.length}`,
    },
    {
      label: "Consultas rapidas",
      value: "24/7",
    },
  ];

  return (
    <Layout>
      <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Fondo Cartago"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <MapPin className="w-4 h-4" />
            <span>Descubre lo mejor de Cartago, Valle</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Encuentra todo lo que necesitas en tu ciudad
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            El directorio comercial mas completo y actualizado de Cartago.
            Restaurantes, servicios, tiendas y mas, a un clic de distancia.
          </p>

          <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <form
              onSubmit={handleSearch}
              className="relative glass p-2 rounded-2xl flex items-center shadow-2xl"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Que estas buscando? Ej. Pizzeria, abogado, ferreteria..."
                  className="w-full h-14 pl-12 pr-4 bg-transparent border-none shadow-none focus-visible:ring-0 text-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
              >
                Buscar
              </Button>
            </form>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl px-6 py-5 text-left shadow-lg shadow-black/5"
              >
                <div className="text-3xl font-display font-bold text-foreground">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background relative z-20 -mt-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-display font-bold">Explora por Categorias</h2>
            <Button variant="ghost" asChild className="hidden sm:flex text-primary">
              <Link href="/businesses">Ver todo -&gt;</Link>
            </Button>
          </div>

          {loadingCat && !visibleCategories.length ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-auto-fit gap-4 sm:gap-6 justify-center">
              {visibleCategories.slice(0, 8).map((cat) => {
                const Icon = iconMap[cat.name] || Store;
                return (
                  <Link key={cat.id} href={`/businesses?categoryId=${cat.id}`} className="group">
                    <div className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 h-full">
                      <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {cat.businessCount} negocios
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider mb-2">
                <TrendingUp className="w-4 h-4" />
                Destacados
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                Negocios recientes
              </h2>
            </div>
            <Button asChild variant="outline" className="rounded-full bg-white">
              <Link href="/businesses">Ver directorio completo</Link>
            </Button>
          </div>

          {loadingBiz && !featuredBusinesses.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-90 z-0" />
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold mb-5">
            <Sparkles className="w-4 h-4" />
            Mejora tu presencia digital local
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Tienes un negocio en Cartago?
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10">
            Unete a nuestro directorio y llega a miles de clientes potenciales.
            El registro basico es completamente gratis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="bg-white text-primary hover:bg-white/90 font-bold px-8 h-14 rounded-xl shadow-xl"
            >
              <Link href="/register">Registrar mi negocio</Link>
            </Button>
            <Button
              size="lg"
              asChild
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-bold px-8 h-14 rounded-xl"
            >
              <Link href="/plans">Ver planes Premium</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
