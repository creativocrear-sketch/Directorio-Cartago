import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Menu, User, LogOut, LayoutDashboard, Crown, Briefcase } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/businesses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const onLogout = () => {
    logout();
    setLocation("/");
  };

  const NavLinks = () => (
    <>
      <Link href="/businesses" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        Directorio
      </Link>
      <Link href="/plans" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        Planes
      </Link>
      <Link href="/privacidad" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        Privacidad
      </Link>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight hidden sm:block text-foreground">
                Cartago<span className="text-primary">Directorio</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 ml-6">
              <NavLinks />
            </nav>
          </div>

          <div className="flex-1 max-w-md hidden lg:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar negocios, servicios..."
                className="w-full pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.hasActiveSubscription && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-xs font-bold shadow-sm">
                    <Crown className="w-3.5 h-3.5" />
                    Premium
                  </div>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-muted/50 hover:bg-muted border border-border/50">
                      <span className="font-semibold text-primary">{user?.name.charAt(0).toUpperCase()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl">
                    <div className="px-2 py-1.5 mb-2">
                      <p className="font-semibold text-sm truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link href="/profile" className="flex items-center w-full">
                        <User className="mr-2 w-4 h-4" /> Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                    
                    {(user?.role === "business_owner" || user?.role === "admin") && (
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                        <Link href="/my-businesses" className="flex items-center w-full">
                          <Briefcase className="mr-2 w-4 h-4" /> Mis Negocios
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {user?.role === "admin" && (
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer text-primary focus:text-primary">
                        <Link href="/admin" className="flex items-center w-full">
                          <LayoutDashboard className="mr-2 w-4 h-4" /> Panel Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="rounded-xl text-destructive focus:text-destructive cursor-pointer">
                      <LogOut className="mr-2 w-4 h-4" /> Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" asChild className="rounded-full font-medium">
                  <Link href="/login">Ingresar</Link>
                </Button>
                <Button asChild className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white font-medium">
                  <Link href="/register">Registrarse</Link>
                </Button>
              </div>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden rounded-full">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 py-6">
                  <Link href="/" className="font-display font-bold text-2xl tracking-tight text-foreground">
                    Cartago<span className="text-primary">Directorio</span>
                  </Link>
                  <nav className="flex flex-col gap-4">
                    <NavLinks />
                  </nav>
                  {!isAuthenticated && (
                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
                      <Button variant="outline" asChild className="w-full justify-start rounded-xl">
                        <Link href="/login">Ingresar</Link>
                      </Button>
                      <Button asChild className="w-full justify-start rounded-xl">
                        <Link href="/register">Registrarse</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="bg-card border-t border-border mt-auto py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Cartago<span className="text-primary">Directorio</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              El directorio comercial más completo de Cartago, Valle del Cauca. Encuentra los mejores negocios, servicios y profesionales locales en un solo lugar.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/businesses" className="hover:text-primary">Directorio</Link></li>
              <li><Link href="/plans" className="hover:text-primary">Planes Premium</Link></li>
              <li><Link href="/register" className="hover:text-primary">Publicar mi negocio</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacidad" className="hover:text-primary">Política de Privacidad (Ley 1581)</Link></li>
              <li><Link href="/terminos" className="hover:text-primary">Términos y Condiciones</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Directorio Cartago. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
