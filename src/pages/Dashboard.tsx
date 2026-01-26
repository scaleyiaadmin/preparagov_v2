
import React from 'react';
import DFDCard from '../components/Dashboard/DFDCard';
import PCACard from '../components/Dashboard/PCACard';
import DocumentsCard from '../components/Dashboard/DocumentsCard';
import NewsSection from '../components/Dashboard/NewsSection';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do planejamento de contratações</p>
      </div>

      {/* Main Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DFDCard />
        <PCACard />
        <DocumentsCard />
      </div>

      {/* News Section */}
      <NewsSection />
    </div>
  );
};

export default Dashboard;
