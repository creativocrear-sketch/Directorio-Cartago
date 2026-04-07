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
  ArrowRight,
} from "lucide-react";
import { useGetBusinesses, useGetCategories } from "@workspace/api-client-react";
import { fallbackCategories, getFallbackBusinesses } from "@/lib/fallback-directory";
import { useDemoBusinesses } from "@/lib/demo-businesses";

const QUICK_SEARCHES = ["restaurantes", "hoteles", "salud", "tecnologia"];

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
  const fallbackFeatured = React.useMemo(() => getFallbackBusinesses({ limit: 6 }), []);
  const { businesses: demoBusinesses } = useDemoBusinesses();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (search.trim()) {
      setLocation(`/businesses?search=${encodeURIComponent(search)}`);
    }
  };

  const featuredBusinesses = React.useMemo(() => {
    const approvedDemo = demoBusinesses.filter((business) => business.status === "approved");
    const source =
      businessesData?.businesses && businessesData.businesses.length > 0
        ? businessesData.businesses
        : fallbackFeatured.businesses;
    const merged = [...approvedDemo, ...source].filter(
      (business, index, array) =>
        array.findIndex((candidate) => candidate.id === business.id) === index,
    );
    return merged.slice(0, 6);
  }, [businessesData?.businesses, demoBusinesses, fallbackFeatured.businesses]);
  const visibleCategories = categories?.length ? categories : fallbackCategories;

  const stats = [
    {
      label: "Negocios activos",
      value: featuredBusinesses.length > 0 ? `${featuredBusinesses.length}+` : "24+",
    },
    {
      label: "Categorias visibles",
      value: `${visibleCategories.length}`,
    },
    {
      label: "Consultas rapidas",
      value: "24/7",
    },
  ];

  return (
    <Layout>
      <section className="relative overflow-hidden pb-32 pt-24 lg:pb-40 lg:pt-32">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Fondo Cartago"
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto flex flex-col items-center px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <MapPin className="h-4 w-4" />
            <span>Descubre lo mejor de Cartago, Valle</span>
          </div>

          <h1 className="mb-6 max-w-4xl text-5xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 md:text-6xl lg:text-7xl">
            Encuentra negocios y servicios confiables cerca de ti
          </h1>

          <p className="mb-10 max-w-2xl text-lg text-muted-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 md:text-xl">
            El directorio comercial de Cartago para descubrir restaurantes, tiendas,
            salud, tecnologia y servicios locales desde una sola plataforma.
          </p>

          <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <form
              onSubmit={handleSearch}
              className="glass flex items-center rounded-2xl p-2 shadow-2xl"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Que estas buscando? Ej. pizzeria, abogado, ferreteria..."
                  className="h-14 w-full border-none bg-transparent pl-12 pr-4 text-lg shadow-none focus-visible:ring-0"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 rounded-xl bg-primary px-8 text-lg font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Buscar
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {QUICK_SEARCHES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLocation(`/businesses?search=${encodeURIComponent(item)}`)}
                  className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:text-primary"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-2xl px-6 py-5 text-left shadow-lg shadow-black/5">
                <div className="text-3xl font-display font-bold text-foreground">{stat.value}</div>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-10 bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-3xl font-display font-bold">Explora por categorias</h2>
            <Button variant="ghost" asChild className="hidden text-primary sm:flex">
              <Link href="/businesses">Ver todo <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          {loadingCat && !visibleCategories.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 justify-center gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-auto-fit">
              {visibleCategories.slice(0, 8).map((cat) => {
                const Icon = iconMap[cat.name] || Store;
                return (
                  <Link key={cat.id} href={`/businesses?categoryId=${cat.id}`} className="group">
                    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-border/50 bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground transition-colors group-hover:text-primary sm:text-base">
                          {cat.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
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

      <section className="border-y border-border/50 bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
                <TrendingUp className="h-4 w-4" />
                Destacados
              </div>
              <h2 className="text-3xl font-display font-bold md:text-4xl">
                Negocios recientes
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Una seleccion de fichas activas para descubrir lugares confiables y
                resolver necesidades cotidianas en Cartago.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full bg-white">
              <Link href="/businesses">Ver directorio completo</Link>
            </Button>
          </div>

          {loadingBiz && !featuredBusinesses.length ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary to-accent opacity-90" />
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4" />
            Mejora tu presencia digital local
          </div>
          <h2 className="mb-6 text-4xl font-display font-bold md:text-5xl">
            Tienes un negocio en Cartago?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 md:text-xl">
            Unete al directorio y muestra tu negocio con una ficha profesional, datos
            de contacto y mas visibilidad para clientes locales.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="h-14 rounded-xl bg-white px-8 font-bold text-primary shadow-xl hover:bg-white/90">
              <Link href="/register">Registrar mi negocio</Link>
            </Button>
            <Button size="lg" asChild variant="outline" className="h-14 rounded-xl border-white px-8 font-bold text-white hover:bg-white/10">
              <Link href="/plans">Ver planes Premium</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
