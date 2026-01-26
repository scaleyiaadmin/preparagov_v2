
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
import Admin from "./pages/Admin";
import SuperAdmin from "./pages/SuperAdmin";
import GerenciarUsuarios from "./pages/GerenciarUsuarios";
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
              <Route path="admin" element={<Admin />} />
              <Route path="super-admin" element={<SuperAdmin />} />
              <Route path="usuarios" element={<GerenciarUsuarios />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
