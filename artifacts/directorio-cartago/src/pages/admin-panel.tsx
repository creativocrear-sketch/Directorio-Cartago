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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fallbackBusinesses, fallbackCategories } from "@/lib/fallback-directory";

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
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Layout><div className="p-20 text-center">Acceso denegado.</div></Layout>;
  }

  const isDemoAdmin = user.email === "admin@directoriocartago.co";

  return (
    <Layout>
      <div className="bg-foreground py-12 text-background">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-display font-bold">Panel de administracion</h1>
          {isDemoAdmin && (
            <p className="mt-2 text-sm text-background/75">
              Estas viendo el modo demo del panel mientras la API real termina de estar lista.
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
              del directorio. El modo demo te deja explorar la estructura sin alterar datos.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <Search className="h-5 w-5 text-primary" />
              Enfoque sugerido
            </div>
            <p className="text-sm text-muted-foreground">
              Revisa primero pendientes, luego usuarios con Premium y por ultimo categorias
              duplicadas o poco claras para mantener el directorio ordenado.
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

  const stats = data ?? {
    totalUsers: DEMO_USERS.length,
    approvedBusinesses: fallbackBusinesses.length,
    pendingBusinesses: 3,
    activeSubscriptions: 1,
    totalCategories: fallbackCategories.length,
  };

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
          Los datos de este resumen estan en modo demo.
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total usuarios" value={stats.totalUsers} icon={Users} color="bg-blue-500" />
        <StatCard title="Negocios aprobados" value={stats.approvedBusinesses} icon={Store} color="bg-emerald-500" />
        <StatCard title="Pendientes" value={stats.pendingBusinesses} icon={LayoutDashboard} color="bg-amber-500" />
        <StatCard title="Suscripciones activas" value={stats.activeSubscriptions} icon={CreditCard} color="bg-primary" />
        <StatCard title="Categorias" value={stats.totalCategories} icon={Tags} color="bg-fuchsia-500" />
      </div>
    </div>
  );
}

function BusinessesTab({ isDemo }: { isDemo: boolean }) {
  const { data, refetch } = useGetBusinesses({ status: "pending", limit: 50 });
  const { toast } = useToast();
  const approve = useApproveBusiness({ onSuccess: () => { toast({ title: "Aprobado" }); refetch(); } });
  const reject = useRejectBusiness({ onSuccess: () => { toast({ title: "Rechazado" }); refetch(); } });

  const demoBusinesses = useMemo(
    () =>
      fallbackBusinesses.slice(0, 3).map((business, index) => ({
        ...business,
        ownerName: index === 0 ? "Usuario Premium Demo" : "Propietario demo",
      })),
    [],
  );

  const rows = data?.businesses?.length ? data.businesses : demoBusinesses;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="border-b border-border p-6">
        <h3 className="text-lg font-bold">Solicitudes y negocios visibles</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Negocio</th>
              <th className="px-6 py-4">Propietario</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((business) => (
              <tr key={business.id} className="hover:bg-muted/20">
                <td className="px-6 py-4 font-medium">{business.name}</td>
                <td className="px-6 py-4">{business.ownerName || "Sin dato"}</td>
                <td className="px-6 py-4">{new Date(business.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-600 hover:bg-emerald-50"
                      disabled={isDemo}
                      onClick={() => approve.mutate({ id: business.id })}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      disabled={isDemo}
                      onClick={() =>
                        reject.mutate({ id: business.id, data: { reason: "Incumple normas" } })
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
      </div>
    </div>
  );
}
