
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DFDCard = () => {
  const navigate = useNavigate();
  
  const dfdStats = {
    total: 24,
    status: {
      'Pendente Aprovação': 8,
      'Em Elaboração': 5,
      'Aprovado': 9,
      'Cancelado': 2
    },
    tipos: {
      'Materiais de Consumo': 6,
      'Materiais Permanentes': 4,
      'Serviço Continuado': 7,
      'Serviço Não Continuado': 3,
      'Serviço de Engenharia': 3,
      'Termo Aditivo': 1
    },
    prioridades: {
      'Alta': 5,
      'Média': 12,
      'Baixa': 7
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Pendente Aprovação': 'bg-orange-100 text-orange-800',
      'Em Elaboração': 'bg-blue-100 text-blue-800',
      'Aprovado': 'bg-green-100 text-green-800',
      'Cancelado': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'Alta': 'bg-red-100 text-red-800',
      'Média': 'bg-yellow-100 text-yellow-800',
      'Baixa': 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleClick = () => {
    navigate('/dfd');
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-orange-100">
              <FileText size={20} className="text-orange-600" />
            </div>
            <span>Total de DFDs</span>
          </div>
          <TrendingUp size={16} className="text-green-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold text-gray-900">{dfdStats.total}</div>
        
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Por Status</h4>
            <div className="flex flex-wrap gap-1">
              {Object.entries(dfdStats.status).map(([status, count]) => (
                <Badge key={status} className={`${getStatusColor(status)} text-xs`}>
                  {status}: {count}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Por Prioridade</h4>
            <div className="flex flex-wrap gap-1">
              {Object.entries(dfdStats.prioridades).map(([priority, count]) => (
                <Badge key={priority} className={`${getPriorityColor(priority)} text-xs`}>
                  {priority}: {count}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Por Tipo</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {Object.entries(dfdStats.tipos).map(([tipo, count]) => (
                <div key={tipo} className="flex justify-between">
                  <span className="text-gray-600 truncate">{tipo}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DFDCard;
