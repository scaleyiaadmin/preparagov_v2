
import React from 'react';
import DFDCard from '@/components/Dashboard/DFDCard';
import PCACard from '@/components/Dashboard/PCACard';
import DocumentsCard from '@/components/Dashboard/DocumentsCard';
import NewsSection from '../components/Dashboard/NewsSection';

const Dashboard = () => {
  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do planejamento de contratações</p>
      </div>

      {/* Cards Principais - Layout Antigo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DFDCard />
        <PCACard />
        <DocumentsCard />
      </div>

      {/* Notícias sobre Planejamento */}
      <NewsSection />
    </div>
  );
};

export default Dashboard;
