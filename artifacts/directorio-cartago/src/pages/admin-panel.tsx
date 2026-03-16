import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/components/auth-provider";
import { useGetAdminStats, useAdminGetUsers, useGetBusinesses, useGetCategories, useApproveBusiness, useRejectBusiness, useAdminUpdateUser, useAdminDeleteUser, useCreateCategory, useDeleteCategory } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Store, Tags, CreditCard, LayoutDashboard, Check, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// COMBINED ADMIN VIEWS for efficiency
export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();

  if (user?.role !== "admin") {
    return <Layout><div className="p-20 text-center">Acceso denegado.</div></Layout>;
  }

  return (
    <Layout>
      <div className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-display font-bold">Panel de Administración</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-xl flex overflow-x-auto justify-start md:justify-center mb-8 h-14">
            <TabsTrigger value="dashboard" className="rounded-lg h-10 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"><LayoutDashboard className="w-4 h-4 mr-2" /> Resumen</TabsTrigger>
            <TabsTrigger value="businesses" className="rounded-lg h-10 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Store className="w-4 h-4 mr-2" /> Negocios</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg h-10 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Users className="w-4 h-4 mr-2" /> Usuarios</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg h-10 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"><Tags className="w-4 h-4 mr-2" /> Categorías</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="businesses"><BusinessesTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="categories"><CategoriesTab /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function DashboardTab() {
  const { data } = useGetAdminStats();
  
  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-card rounded-3xl p-6 border border-border shadow-sm flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold font-display">{value || 0}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard title="Total Usuarios" value={data?.totalUsers} icon={Users} color="bg-blue-500" />
      <StatCard title="Negocios Aprobados" value={data?.approvedBusinesses} icon={Store} color="bg-emerald-500" />
      <StatCard title="Aprobaciones Pendientes" value={data?.pendingBusinesses} icon={LayoutDashboard} color="bg-amber-500" />
      <StatCard title="Suscripciones Activas" value={data?.activeSubscriptions} icon={CreditCard} color="bg-primary" />
      <StatCard title="Categorías" value={data?.totalCategories} icon={Tags} color="bg-purple-500" />
    </div>
  );
}

function BusinessesTab() {
  const { data, refetch } = useGetBusinesses({ status: "pending", limit: 50 });
  const { toast } = useToast();
  
  const approve = useApproveBusiness({ onSuccess: () => { toast({title:"Aprobado"}); refetch(); }});
  const reject = useRejectBusiness({ onSuccess: () => { toast({title:"Rechazado"}); refetch(); }});

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-bold">Solicitudes Pendientes</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Negocio</th>
              <th className="px-6 py-4">Propietario</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.businesses.map(b => (
              <tr key={b.id} className="hover:bg-muted/20">
                <td className="px-6 py-4 font-medium">{b.name}</td>
                <td className="px-6 py-4">{b.ownerName}</td>
                <td className="px-6 py-4">{new Date(b.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <Button size="sm" variant="outline" className="text-emerald-600 hover:bg-emerald-50" onClick={() => approve.mutate({id: b.id})}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => reject.mutate({id: b.id, data: {reason: "Incumple normas"}})}>
                    <X className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {data?.businesses.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No hay negocios pendientes</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTab() {
  const { data, refetch } = useAdminGetUsers();
  const update = useAdminUpdateUser({ onSuccess: refetch });
  const del = useAdminDeleteUser({ onSuccess: refetch });

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Premium</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.users.map(u => (
              <tr key={u.id} className="hover:bg-muted/20">
                <td className="px-6 py-4">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-6 py-4">
                  <Select value={u.role} onValueChange={(v: any) => update.mutate({id: u.id, data: {role: v}})}>
                    <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visitor">Visitante</SelectItem>
                      <SelectItem value="business_owner">Negocio</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-6 py-4">
                  {u.hasActiveSubscription ? <Badge className="bg-primary">Sí</Badge> : <span className="text-muted-foreground">-</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => del.mutate({id: u.id})}>
                    <Trash2 className="w-4 h-4" />
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

function CategoriesTab() {
  const { data, refetch } = useGetCategories();
  const [name, setName] = useState("");
  const create = useCreateCategory({ onSuccess: () => { refetch(); setName(""); }});
  const del = useDeleteCategory({ onSuccess: refetch });

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="bg-card rounded-3xl p-6 border border-border h-fit">
        <h3 className="font-bold mb-4">Nueva Categoría</h3>
        <Input placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} className="mb-4 bg-muted/50" />
        <Button onClick={() => create.mutate({data: {name}})} disabled={!name} className="w-full">Crear</Button>
      </div>
      <div className="md:col-span-2 bg-card rounded-3xl border border-border p-6">
        <div className="flex flex-wrap gap-3">
          {data?.map(c => (
            <Badge key={c.id} variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2">
              {c.name}
              <button onClick={() => del.mutate({id: c.id})} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
