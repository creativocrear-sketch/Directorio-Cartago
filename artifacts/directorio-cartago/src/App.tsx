import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import NotFound from "@/pages/not-found";

// Pages
import Home from "./pages/home";
import Businesses from "./pages/businesses";
import BusinessDetail from "./pages/business-detail";
import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgot-password";
import Profile from "./pages/profile";
import MyBusinesses from "./pages/my-businesses";
import BusinessForm from "./pages/business-form";
import AdminPanel from "./pages/admin-panel";
import Plans from "./pages/plans";
import Privacy from "./pages/privacy";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/businesses" component={Businesses} />
      <Route path="/businesses/new" component={BusinessForm} />
      <Route path="/businesses/:id" component={BusinessDetail} />
      <Route path="/businesses/:id/edit" component={BusinessForm} />

      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/profile" component={Profile} />
      <Route path="/my-businesses" component={MyBusinesses} />

      <Route path="/admin" component={AdminPanel} />
      <Route path="/plans" component={Plans} />
      <Route path="/privacidad" component={Privacy} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
