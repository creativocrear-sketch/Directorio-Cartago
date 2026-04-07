import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Menu, User, LogOut, LayoutDashboard, Crown, Briefcase, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isDemoSession, logout } = useAuth();
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
      <Link href="/businesses" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Directorio
      </Link>
      <Link href="/plans" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Planes
      </Link>
      <Link href="/privacidad" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        Privacidad
      </Link>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="group flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <MapPin className="h-6 w-6" />
              </div>
              <span className="hidden font-display text-xl font-bold tracking-tight text-foreground sm:block">
                Cartago<span className="text-primary">Directorio</span>
              </span>
            </Link>

            <nav className="ml-6 hidden items-center gap-6 md:flex">
              <NavLinks />
            </nav>
          </div>

          <div className="hidden max-w-md flex-1 lg:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar negocios, servicios..."
                className="w-full rounded-full border-transparent bg-muted/50 pl-10 focus:border-primary focus:bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isDemoSession ? (
                  <div className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary sm:flex">
                    <Sparkles className="h-3.5 w-3.5" />
                    Demo activa
                  </div>
                ) : null}
                {user?.hasActiveSubscription && (
                  <div className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm sm:flex">
                    <Crown className="h-3.5 w-3.5" />
                    Premium
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border/50 bg-muted/50 hover:bg-muted">
                      <span className="font-semibold text-primary">{user?.name.charAt(0).toUpperCase()}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                    <div className="mb-2 px-2 py-1.5">
                      <p className="truncate text-sm font-semibold">{user?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                      <Link href="/profile" className="flex w-full items-center">
                        <User className="mr-2 h-4 w-4" /> Mi perfil
                      </Link>
                    </DropdownMenuItem>

                    {(user?.role === "business_owner" || user?.role === "admin") && (
                      <DropdownMenuItem asChild className="cursor-pointer rounded-xl">
                        <Link href="/my-businesses" className="flex w-full items-center">
                          <Briefcase className="mr-2 h-4 w-4" /> Mis negocios
                        </Link>
                      </DropdownMenuItem>
                    )}

                    {user?.role === "admin" && (
                      <DropdownMenuItem asChild className="cursor-pointer rounded-xl text-primary focus:text-primary">
                        <Link href="/admin" className="flex w-full items-center">
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Panel Admin
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="cursor-pointer rounded-xl text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Cerrar sesion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Button variant="ghost" asChild className="rounded-full font-medium">
                  <Link href="/login">Ingresar</Link>
                </Button>
                <Button asChild className="rounded-full bg-primary font-medium text-white shadow-lg shadow-primary/20 hover:bg-primary/90">
                  <Link href="/register">Registrarse</Link>
                </Button>
              </div>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 py-6">
                  <Link href="/" className="font-display text-2xl font-bold tracking-tight text-foreground">
                    Cartago<span className="text-primary">Directorio</span>
                  </Link>

                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar negocios..."
                      className="rounded-full pl-10"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                  </form>

                  <nav className="flex flex-col gap-4">
                    <NavLinks />
                    {isAuthenticated ? (
                      <>
                        <Link href="/profile" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                          Mi perfil
                        </Link>
                        {(user?.role === "business_owner" || user?.role === "admin") && (
                          <Link href="/my-businesses" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                            Mis negocios
                          </Link>
                        )}
                        {user?.role === "admin" && (
                          <Link href="/admin" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
                            Panel Admin
                          </Link>
                        )}
                      </>
                    ) : null}
                  </nav>

                  {!isAuthenticated ? (
                    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
                      <Button variant="outline" asChild className="w-full justify-start rounded-xl">
                        <Link href="/login">Ingresar</Link>
                      </Button>
                      <Button asChild className="w-full justify-start rounded-xl">
                        <Link href="/register">Registrarse</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                        {isDemoSession
                          ? "Sesion demo activa en este navegador."
                          : "Sesion iniciada correctamente."}
                      </div>
                      <Button variant="outline" onClick={onLogout} className="w-full justify-start rounded-xl">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesion
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="w-full flex-1">{children}</main>

      <footer className="mt-auto border-t border-border bg-card py-12">
        <div className="container mx-auto grid grid-cols-1 gap-8 px-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="group mb-4 inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                Cartago<span className="text-primary">Directorio</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              El directorio comercial mas completo de Cartago, Valle del Cauca. Encuentra los mejores negocios, servicios y profesionales locales en un solo lugar.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-bold">Enlaces</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/businesses" className="hover:text-primary">Directorio</Link></li>
              <li><Link href="/plans" className="hover:text-primary">Planes Premium</Link></li>
              <li><Link href="/register" className="hover:text-primary">Publicar mi negocio</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacidad" className="hover:text-primary">Politica de Privacidad (Ley 1581)</Link></li>
              <li><Link href="/terminos" className="hover:text-primary">Terminos y Condiciones</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto mt-12 border-t border-border/50 px-4 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Directorio Cartago. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
