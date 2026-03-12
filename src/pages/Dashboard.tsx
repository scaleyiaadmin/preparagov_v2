
import React from 'react';
import StatsCards from '@/components/Dashboard/StatsCards';
import DashboardCharts from '@/components/Dashboard/DashboardCharts';
import RecentItemsList from '@/components/Dashboard/RecentItemsList';
import NewsSection from '../components/Dashboard/NewsSection';

const Dashboard = () => {
  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao PreparaGov. Aqui está o resumo do seu planejamento.</p>
      </div>

      {/* Estatísticas Rápidas */}
      <StatsCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Gráficos e Visão Geral */}
        <div className="xl:col-span-2 space-y-8">
          <DashboardCharts />
          <NewsSection />
        </div>

        {/* Lateral: Atividades Recentes */}
        <div className="space-y-8">
          <RecentItemsList />
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">
            <h4 className="font-bold mb-2">Dica da IA 💡</h4>
            <p className="text-sm opacity-90 leading-relaxed">
              Você tem 3 DFDs aprovados que ainda não foram encaminhados para o ETP. 
              Clique aqui para otimizar seu processo.
            </p>
            <button className="mt-4 text-xs font-semibold bg-white/20 hover:bg-white/30 transition-colors py-2 px-4 rounded-full backdrop-blur-sm">
              Ver DFDs Pendentes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
