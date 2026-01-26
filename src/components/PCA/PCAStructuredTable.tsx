
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Hash, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate, getPriorityColor, getAllSecretarias } from '@/utils/pcaConsolidation';

interface ConsolidatedItemByType {
  id: string;
  descricao: string;
  unidadeMedida: string;
  detalhamentoTecnico?: string;
  quantidadeTotal: number;
  valorTotal: number;
  dataContratacaoOficial: string;
  prioridadeOficial: 'Alta' | 'Média' | 'Baixa';
  tipoDFD: string;
  secretarias: Record<string, {
    quantidade: number;
    valor: number;
    prioridade: 'Alta' | 'Média' | 'Baixa';
    dataInformada: string;
    dfdId: string;
  }>;
}

interface PCAStructuredTableProps {
  itemsByType: Record<string, ConsolidatedItemByType[]>;
  selectedYear: string;
}

const PCAStructuredTable = ({ itemsByType, selectedYear }: PCAStructuredTableProps) => {
  const allSecretarias = getAllSecretarias(itemsByType);
  const totalItems = Object.values(itemsByType).reduce((sum, items) => sum + items.length, 0);
  const totalValue = Object.values(itemsByType).reduce((sum, items) => 
    sum + items.reduce((itemSum, item) => itemSum + item.valorTotal, 0), 0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>PCA - Plano de Contratações Anual {selectedYear}</CardTitle>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Hash size={16} className="text-blue-600" />
              <span>{totalItems} itens únicos</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign size={16} className="text-green-600" />
              <span className="font-medium">{formatCurrency(totalValue)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {Object.entries(itemsByType).map(([tipoDFD, items]) => (
          <div key={tipoDFD} className="space-y-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">{tipoDFD}</h3>
              <Badge variant="secondary">
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </Badge>
            </div>
            
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[300px]">Item</TableHead>
                    <TableHead className="text-right min-w-[120px]">Qtd. Total</TableHead>
                    <TableHead className="text-right min-w-[140px]">Valor Total</TableHead>
                    <TableHead className="min-w-[130px]">Data Contratação</TableHead>
                    <TableHead className="min-w-[100px]">Prioridade</TableHead>
                    {allSecretarias.map(secretaria => (
                      <TableHead key={secretaria} className="text-center min-w-[150px]">
                        {secretaria}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.descricao} - {item.unidadeMedida}
                          </div>
                          {item.detalhamentoTecnico && (
                            <div className="text-sm text-gray-500 mt-1">
                              {item.detalhamentoTecnico}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">
                          {item.quantidadeTotal.toLocaleString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium text-green-700">
                          {formatCurrency(item.valorTotal)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-sm">{formatDate(item.dataContratacaoOficial)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(item.prioridadeOficial)}>
                          {item.prioridadeOficial}
                        </Badge>
                      </TableCell>
                      {allSecretarias.map(secretaria => {
                        const secretariaData = item.secretarias[secretaria];
                        return (
                          <TableCell key={secretaria} className="text-center">
                            {secretariaData ? (
                              <div className="text-sm">
                                <div className="font-medium">
                                  Qtd: {secretariaData.quantidade.toLocaleString('pt-BR')}
                                </div>
                                <div className="text-green-600">
                                  {formatCurrency(secretariaData.valor)}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">
                                <div>Qtd: 0</div>
                                <div>R$ 0,00</div>
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PCAStructuredTable;
