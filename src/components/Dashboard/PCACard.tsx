
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PCACard = () => {
  const navigate = useNavigate();
  
  const pcaStats = {
    valorTotal: 'R$ 2.850.000,00',
    ano: '2024',
    percentualAprovados: 85,
    totalDFDs: 24,
    dfdAprovados: 9
  };

  const handleClick = () => {
    navigate('/pca');
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-green-100">
              <Calendar size={20} className="text-green-600" />
            </div>
            <span>PCA {pcaStats.ano}</span>
          </div>
          <TrendingUp size={16} className="text-green-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold text-gray-900">{pcaStats.valorTotal}</div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Ano de Vigência:</span>
            <span className="font-semibold text-gray-900">{pcaStats.ano}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">DFDs Aprovados:</span>
              <span className="font-semibold text-gray-900">
                {pcaStats.dfdAprovados}/{pcaStats.totalDFDs}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(pcaStats.dfdAprovados / pcaStats.totalDFDs) * 100}%` }}
              ></div>
            </div>
            
            <div className="text-center">
              <span className="text-2xl font-bold text-green-600">
                {Math.round((pcaStats.dfdAprovados / pcaStats.totalDFDs) * 100)}%
              </span>
              <p className="text-xs text-gray-500">de aprovação</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PCACard;
