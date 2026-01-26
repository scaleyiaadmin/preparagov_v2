
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, DollarSign, Clock, AlertTriangle } from 'lucide-react';

interface PCAStatsCardsProps {
  selectedYear: string;
  totalItens: number;
  valorTotal: string;
  pendentesAprovacao: number;
  solicitacoesCancelamento: number;
  onPendentesClick: () => void;
  onSolicitacoesClick: () => void;
}

const PCAStatsCards = ({
  selectedYear,
  totalItens,
  valorTotal,
  pendentesAprovacao,
  solicitacoesCancelamento,
  onPendentesClick,
  onSolicitacoesClick
}: PCAStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <FileText size={16} className="text-blue-600" />
            <span>Total de Itens no PCA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{totalItens}</div>
          <p className="text-sm text-gray-600">{selectedYear}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <DollarSign size={16} className="text-green-600" />
            <span>Valor Total do PCA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{valorTotal}</div>
          <p className="text-sm text-gray-600">{selectedYear}</p>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onPendentesClick}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Clock size={16} className="text-orange-600" />
            <span>DFDs Pendentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">{pendentesAprovacao}</div>
          <Button variant="link" className="p-0 h-auto text-sm text-orange-600">
            Clique para gerenciar
          </Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSolicitacoesClick}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <AlertTriangle size={16} className="text-red-600" />
            <span>Solicitações de Cancelamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">{solicitacoesCancelamento}</div>
          <Button variant="link" className="p-0 h-auto text-sm text-red-600">
            Clique para gerenciar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PCAStatsCards;
