import React, { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { BusinessCard } from "@/components/business-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, MapPinOff } from "lucide-react";
import { useGetBusinesses, useGetCategories } from "@workspace/api-client-react";

export default function Businesses() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("categoryId") || "all";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [page, setPage] = useState(1);

  // Queries
  const { data: categories } = useGetCategories();
  const { data, isLoading, isError } = useGetBusinesses({
    status: "approved",
    search: searchTerm || undefined,
    categoryId: categoryId !== "all" ? Number(categoryId) : undefined,
    page,
    limit: 12
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset page on new search
  };

  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border/50 pt-10 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">Directorio de Negocios</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
            Encuentra los mejores lugares, profesionales y servicios en Cartago. Utiliza los filtros para refinar tu búsqueda.
          </p>

          <form onSubmit={handleSearchSubmit} className="glass p-3 rounded-2xl flex flex-col md:flex-row gap-3 shadow-lg max-w-4xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, categoría..."
                className="w-full h-12 pl-10 bg-white/50 border-border"
              />
            </div>
            
            <div className="w-full md:w-64">
              <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setPage(1); }}>
                <SelectTrigger className="w-full h-12 bg-white/50 border-border">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Categoría" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories?.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="h-12 px-8 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md">
              Buscar
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-destructive font-medium">Hubo un error al cargar los negocios. Intenta nuevamente.</p>
          </div>
        ) : data?.businesses.length === 0 ? (
          <div className="text-center py-32 bg-muted/20 rounded-3xl border border-border/50 border-dashed">
            <MapPinOff className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-foreground mb-2">No se encontraron resultados</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Intenta buscar con otros términos o cambia la categoría para ver más negocios.
            </p>
            <Button 
              variant="outline" 
              className="mt-6 rounded-xl"
              onClick={() => { setSearchTerm(""); setCategoryId("all"); setPage(1); }}
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.businesses.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                <Button 
                  variant="outline" 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="rounded-xl"
                >
                  Anterior
                </Button>
                <div className="text-sm font-medium text-muted-foreground px-4">
                  Página {page} de {data.totalPages}
                </div>
                <Button 
                  variant="outline" 
                  disabled={page === data.totalPages}
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  className="rounded-xl"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
