
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import DFD from "./pages/DFD";
import PCA from "./pages/PCA";
import ETP from "./pages/ETP";
import MapaRiscos from "./pages/MapaRiscos";
import CronogramaLicitacoes from "./pages/CronogramaLicitacoes";
import TermoReferencia from "./pages/TermoReferencia";
import Edital from "./pages/Edital";
import Perfil from "./pages/Perfil";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPrefeituras from "./pages/admin/Prefeituras";
import AdminUsuarios from "./pages/admin/Usuarios";
import AdminSecretarias from "./pages/admin/Secretarias";
import AdminConfiguracoes from "./pages/admin/Configuracoes";
import AdminLogin from "./pages/admin/Login";
import AdminRoute from "./components/AdminRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Plataforma Admin (Independente) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="prefeituras" element={<AdminPrefeituras />} />
                <Route path="secretarias" element={<AdminSecretarias />} />
                <Route path="usuarios" element={<AdminUsuarios />} />
                <Route path="settings" element={<AdminConfiguracoes />} />
                {/* Outras rotas administrativas aqui */}
              </Route>
            </Route>

            {/* Plataforma de Usuário / Secretárias (Atual) */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="dfd" element={<DFD />} />
              <Route path="pca" element={<PCA />} />
              <Route path="etp" element={<ETP />} />
              <Route path="riscos" element={<MapaRiscos />} />
              <Route path="cronograma" element={<CronogramaLicitacoes />} />
              <Route path="termo" element={<TermoReferencia />} />
              <Route path="edital" element={<Edital />} />
              <Route path="perfil" element={<Perfil />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
