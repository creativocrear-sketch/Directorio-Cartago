import React, { useMemo, useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/components/auth-provider";
import {
  useGetAdminStats,
  useAdminGetUsers,
  useGetBusinesses,
  useGetCategories,
  useApproveBusiness,
  useRejectBusiness,
  useAdminUpdateUser,
  useAdminDeleteUser,
  useCreateCategory,
  useDeleteCategory,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Store,
  Tags,
  CreditCard,
  LayoutDashboard,
  Check,
  X,
  Trash2,
  ShieldCheck,
  Search,
  Sparkles,
  Eye,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fallbackCategories } from "@/lib/fallback-directory";
import { useDemoBusinesses } from "@/lib/demo-businesses";

const DEMO_USERS = [
  {
    id: 900001,
    name: "Administrador Demo",
    email: "admin@directoriocartago.co",
    role: "admin" as const,
    phone: null,
    createdAt: "2026-04-06T12:00:00.000Z",
    hasActiveSubscription: false,
  },
  {
    id: 900002,
    name: "Usuario Premium Demo",
    email: "premium@directoriocartago.co",
    role: "business_owner" as const,
    phone: "3005550001",
    createdAt: "2026-04-06T12:00:00.000Z",
    hasActiveSubscription: true,
  },
];

export default function AdminPanel() {
  const { user, isDemoSession } = useAuth();

  if (user?.role !== "admin") {
    return <Layout><div className="p-20 text-center">Acceso denegado.</div></Layout>;
  }

  const isDemoAdmin = isDemoSession && user.email === "admin@directoriocartago.co";

  return (
    <Layout>
      <div className="bg-foreground py-12 text-background">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-display font-bold">Panel de administracion</h1>
          {isDemoAdmin && (
            <p className="mt-2 text-sm text-background/75">
              Este panel demo ya permite aprobar, rechazar y eliminar negocios creados localmente.
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Centro de control
            </div>
            <p className="text-sm text-muted-foreground">
              Desde aqui puedes revisar actividad, usuarios, categorias y fichas visibles
              del directorio. El modo demo ahora te deja gestionar negocios de punta a punta.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <Search className="h-5 w-5 text-primary" />
              Enfoque sugerido
            </div>
            <p className="text-sm text-muted-foreground">
              Revisa primero los pendientes, aprueba los listos para publicar y elimina
              pruebas viejas cuando ya no las necesites.
            </p>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-8 flex h-14 justify-start overflow-x-auto rounded-xl bg-muted/50 p-1 md:justify-center">
            <TabsTrigger value="dashboard" className="h-10 rounded-lg px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"><LayoutDashboard className="mr-2 h-4 w-4" /> Resumen</TabsTrigger>
            <TabsTrigger value="businesses" className="h-10 rounded-lg px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Store className="mr-2 h-4 w-4" /> Negocios</TabsTrigger>
            <TabsTrigger value="users" className="h-10 rounded-lg px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Users className="mr-2 h-4 w-4" /> Usuarios</TabsTrigger>
            <TabsTrigger value="categories" className="h-10 rounded-lg px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Tags className="mr-2 h-4 w-4" /> Categorias</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab isDemo={isDemoAdmin} /></TabsContent>
          <TabsContent value="businesses"><BusinessesTab isDemo={isDemoAdmin} /></TabsContent>
          <TabsContent value="users"><UsersTab isDemo={isDemoAdmin} /></TabsContent>
          <TabsContent value="categories"><CategoriesTab isDemo={isDemoAdmin} /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function DashboardTab({ isDemo }: { isDemo: boolean }) {
  const { data } = useGetAdminStats();
  const { businesses: demoBusinesses } = useDemoBusinesses();

  const demoStats = useMemo(
    () => ({
      totalUsers: DEMO_USERS.length,
      approvedBusinesses: demoBusinesses.filter((business) => business.status === "approved").length,
      pendingBusinesses: demoBusinesses.filter((business) => business.status === "pending").length,
      activeSubscriptions: 1,
      totalCategories: fallbackCategories.length,
    }),
    [demoBusinesses],
  );

  const stats = isDemo ? demoStats : data ?? demoStats;

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white ${color}`}>
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="font-display text-3xl font-bold">{value || 0}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {isDemo && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          Los datos de este resumen reaccionan a lo que haces en el modo demo.
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total usuarios" value={stats.totalUsers} icon={Users} color="bg-blue-500" />
        <StatCard title="Negocios aprobados" value={stats.approvedBusinesses} icon={Store} color="bg-emerald-500" />
        <StatCard title="Pendientes" value={stats.pendingBusinesses} icon={Clock3} color="bg-amber-500" />
        <StatCard title="Suscripciones activas" value={stats.activeSubscriptions} icon={CreditCard} color="bg-primary" />
        <StatCard title="Categorias" value={stats.totalCategories} icon={Tags} color="bg-fuchsia-500" />
      </div>
    </div>
  );
}

function BusinessesTab({ isDemo }: { isDemo: boolean }) {
  const { data, refetch } = useGetBusinesses({ limit: 50 });
  const { toast } = useToast();
  const { businesses: demoBusinesses, updateBusinessStatus, deleteBusiness } = useDemoBusinesses();
  const approve = useApproveBusiness({ onSuccess: () => { toast({ title: "Aprobado" }); refetch(); } });
  const reject = useRejectBusiness({ onSuccess: () => { toast({ title: "Rechazado" }); refetch(); } });

  const rows = isDemo ? demoBusinesses : data?.businesses ?? [];

  const handleApprove = (id: number) => {
    if (isDemo) {
      updateBusinessStatus(id, "approved");
      toast({ title: "Negocio aprobado", description: "La ficha demo ya quedo visible." });
      return;
    }
    approve.mutate({ id });
  };

  const handleReject = (id: number) => {
    if (isDemo) {
      updateBusinessStatus(id, "rejected");
      toast({ title: "Negocio rechazado", description: "La ficha demo quedo marcada como rechazada." });
      return;
    }
    reject.mutate({ id, data: { reason: "Incumple normas" } });
  };

  const handleDelete = (id: number) => {
    if (!isDemo) return;
    deleteBusiness(id);
    toast({ title: "Negocio eliminado", description: "La ficha demo se elimino correctamente." });
  };

  return (
    <div className="space-y-4">
      {isDemo && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          Prueba el rol admin completo: cambia estados y elimina fichas creadas desde el login demo Premium.
        </div>
      )}
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="border-b border-border p-6">
          <h3 className="text-lg font-bold">Solicitudes y negocios visibles</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Negocio</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Propietario</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((business) => (
                <tr key={business.id} className="hover:bg-muted/20">
                  <td className="px-6 py-4">
                    <p className="font-medium">{business.name}</p>
                    <p className="text-xs text-muted-foreground">{business.categoryName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        business.status === "approved"
                          ? "default"
                          : business.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {business.status === "approved"
                        ? "Aprobado"
                        : business.status === "rejected"
                          ? "Rechazado"
                          : "Pendiente"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{business.ownerName || "Sin dato"}</td>
                  <td className="px-6 py-4">{new Date(business.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-600 hover:bg-emerald-50"
                        onClick={() => handleApprove(business.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-600 hover:bg-amber-50"
                        onClick={() => handleReject(business.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {isDemo ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(business.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ isDemo }: { isDemo: boolean }) {
  const { data, refetch } = useAdminGetUsers();
  const update = useAdminUpdateUser({ onSuccess: refetch });
  const del = useAdminDeleteUser({ onSuccess: refetch });
  const rows = data?.users?.length ? data.users : DEMO_USERS;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Premium</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/20">
                <td className="px-6 py-4">
                  <p className="font-medium">{row.name}</p>
                  <p className="text-xs text-muted-foreground">{row.email}</p>
                </td>
                <td className="px-6 py-4">
                  <Select
                    value={row.role}
                    onValueChange={(value: any) => update.mutate({ id: row.id, data: { role: value } })}
                    disabled={isDemo}
                  >
                    <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visitor">Visitante</SelectItem>
                      <SelectItem value="business_owner">Negocio</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-6 py-4">
                  {row.hasActiveSubscription ? (
                    <Badge className="bg-primary">Si</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    disabled={isDemo}
                    onClick={() => del.mutate({ id: row.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isDemo && (
        <div className="border-t border-border bg-muted/20 px-6 py-4 text-sm text-muted-foreground">
          En modo demo los usuarios son de referencia visual; la gestion editable se centra en los negocios.
        </div>
      )}
    </div>
  );
}

function CategoriesTab({ isDemo }: { isDemo: boolean }) {
  const { data, refetch } = useGetCategories();
  const [name, setName] = useState("");
  const create = useCreateCategory({ onSuccess: () => { refetch(); setName(""); } });
  const del = useDeleteCategory({ onSuccess: refetch });
  const rows = data?.length ? data : fallbackCategories;

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="h-fit rounded-3xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="font-bold">Nueva categoria</h3>
        </div>
        <Input
          placeholder="Nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mb-4 bg-muted/50"
          disabled={isDemo}
        />
        <Button
          onClick={() => create.mutate({ data: { name } })}
          disabled={!name || isDemo}
          className="w-full"
        >
          Crear
        </Button>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6 md:col-span-2">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-foreground">Categorias visibles</h3>
            <p className="text-sm text-muted-foreground">
              Sirven de base para organizar los negocios del directorio.
            </p>
          </div>
          {isDemo ? (
            <Badge variant="secondary" className="gap-1">
              <Eye className="h-3 w-3" />
              Solo visual
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          {rows.map((category) => (
            <Badge key={category.id} variant="secondary" className="flex items-center gap-2 px-3 py-1.5 text-sm">
              {category.name}
              <button
                onClick={() => del.mutate({ id: category.id })}
                className="text-muted-foreground hover:text-destructive"
                disabled={isDemo}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        {isDemo && (
          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            La gestion completa de categorias quedo reservada para cuando la API este activa. El flujo demo completo ya funciona sobre negocios y estados.
          </div>
        )}
      </div>
    </div>
  );
}
