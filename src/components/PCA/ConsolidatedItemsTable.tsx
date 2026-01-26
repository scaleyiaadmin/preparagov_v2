
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Building2, Calendar, Hash, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate, getPriorityColor } from '@/utils/pcaConsolidation';
import ItemDetailModal from './ItemDetailModal';

interface ConsolidatedItem {
  id: string;
  descricao: string;
  unidadeMedida: string;
  detalhamentoTecnico?: string;
  quantidadeTotal: number;
  valorTotal: number;
  dataContratacaoOficial: string;
  prioridadeOficial: 'Alta' | 'Média' | 'Baixa';
  secretarias: {
    nome: string;
    quantidade: number;
    valor: number;
    prioridade: 'Alta' | 'Média' | 'Baixa';
    dataInformada: string;
    dfdId: string;
  }[];
}

interface ConsolidatedItemsTableProps {
  items: ConsolidatedItem[];
  selectedYear: string;
}

const ConsolidatedItemsTable = ({ items, selectedYear }: ConsolidatedItemsTableProps) => {
  const [selectedItem, setSelectedItem] = useState<ConsolidatedItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewDetails = (item: ConsolidatedItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const totalValue = items.reduce((sum, item) => sum + item.valorTotal, 0);
  const totalItems = items.length;
  const totalSecretarias = new Set(items.flatMap(item => item.secretarias.map(s => s.nome))).size;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Itens Consolidados do PCA {selectedYear}</CardTitle>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Hash size={16} className="text-blue-600" />
                <span>{totalItems} itens únicos</span>
              </div>
              <div className="flex items-center space-x-1">
                <Building2 size={16} className="text-purple-600" />
                <span>{totalSecretarias} secretarias</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign size={16} className="text-green-600" />
                <span className="font-medium">{formatCurrency(totalValue)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantidade Total</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead>Data de Contratação</TableHead>
                  <TableHead>Secretarias</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{item.descricao}</div>
                        <div className="text-sm text-gray-500">
                          Unidade: {item.unidadeMedida}
                        </div>
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
                        <span>{formatDate(item.dataContratacaoOficial)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Building2 size={14} className="text-gray-400" />
                        <span className="text-sm">
                          {item.secretarias.length === 1 
                            ? item.secretarias[0].nome
                            : `${item.secretarias.length} secretarias`
                          }
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(item.prioridadeOficial)}>
                        {item.prioridadeOficial}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(item)}
                      >
                        <Eye size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ItemDetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        item={selectedItem}
      />
    </>
  );
};

export default ConsolidatedItemsTable;
