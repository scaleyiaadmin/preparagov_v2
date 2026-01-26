
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Building, 
  Calendar, 
  DollarSign,
  ShoppingCart
} from 'lucide-react';

interface ETP {
  id: string;
  titulo: string;
  numeroETP: string;
  secretaria: string;
  dataCriacao: string;
  valorTotal: string;
  descricaoDemanda: string;
  status: string;
}

interface DFD {
  id: string;
  numero: string;
  nome: string;
  valor: string;
  tipo: string;
}

interface ETPSummaryCardProps {
  etp: ETP;
  dfds: DFD[];
}

const ETPSummaryCard = ({ etp, dfds }: ETPSummaryCardProps) => {
  const formatCurrency = (value: string) => {
    return value;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTotalDFDValue = () => {
    return dfds.reduce((total, dfd) => {
      const value = parseFloat(dfd.valor.replace(/[R$.,\s]/g, '').replace(',', '.')) || 0;
      return total + value;
    }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>Resumo do ETP Selecionado</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Informações do ETP */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-3">{etp.titulo}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <FileText size={16} className="text-gray-400" />
                <span className="font-medium">{etp.numeroETP}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Building size={16} className="text-gray-400" />
                <span>{etp.secretaria}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar size={16} className="text-gray-400" />
                <span>Criado: {formatDate(etp.dataCriacao)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <DollarSign size={16} className="text-gray-400" />
                <span className="font-semibold text-green-600">{etp.valorTotal}</span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <span className="font-medium">Descrição da Demanda:</span>
              <p className="mt-1 leading-relaxed">{etp.descricaoDemanda}</p>
            </div>
          </div>

          {/* DFDs Vinculados */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
              <h4 className="font-semibold text-gray-900">
                DFDs Vinculados ({dfds.length})
              </h4>
              <Badge variant="outline" className="text-green-600">
                Total: {getTotalDFDValue()}
              </Badge>
            </div>

            {dfds.length > 0 ? (
              <div className="space-y-2">
                {dfds.map((dfd) => (
                  <div 
                    key={dfd.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{dfd.numero}</span>
                        <Badge variant="secondary" className="text-xs">
                          {dfd.tipo}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{dfd.nome}</p>
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(dfd.valor)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Nenhum DFD vinculado a este ETP</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ETPSummaryCard;
