
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, Hash, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate, getPriorityColor } from '@/utils/pcaConsolidation';

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

interface ItemDetailModalProps {
  open: boolean;
  onClose: () => void;
  item: ConsolidatedItem | null;
}

const ItemDetailModal = ({ open, onClose, item }: ItemDetailModalProps) => {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Detalhamento do Item: {item.descricao}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo Consolidado */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Resumo Consolidado</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Hash size={16} className="text-blue-600 mr-1" />
                  <span className="text-sm text-gray-600">Quantidade Total</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {item.quantidadeTotal.toLocaleString('pt-BR')} {item.unidadeMedida}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <DollarSign size={16} className="text-green-600 mr-1" />
                  <span className="text-sm text-gray-600">Valor Total</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(item.valorTotal)}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Calendar size={16} className="text-purple-600 mr-1" />
                  <span className="text-sm text-gray-600">Data Oficial</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {formatDate(item.dataContratacaoOficial)}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-sm text-gray-600">Prioridade Oficial</span>
                </div>
                <Badge className={getPriorityColor(item.prioridadeOficial)}>
                  {item.prioridadeOficial}
                </Badge>
              </div>
            </div>
          </div>

          {/* Detalhamento Técnico */}
          {item.detalhamentoTecnico && (
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Detalhamento Técnico</h4>
              <p className="text-sm text-gray-700">{item.detalhamentoTecnico}</p>
            </div>
          )}

          {/* Detalhamento por Secretaria */}
          <div>
            <h3 className="font-semibold text-lg mb-3">
              Detalhamento por Secretaria ({item.secretarias.length})
            </h3>
            <div className="space-y-3">
              {item.secretarias.map((secretaria, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Building2 size={16} className="text-blue-600" />
                        <h4 className="font-medium text-gray-900">{secretaria.nome}</h4>
                        <Badge className={getPriorityColor(secretaria.prioridade)}>
                          {secretaria.prioridade}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Quantidade:</span>
                          <div className="font-medium">
                            {secretaria.quantidade.toLocaleString('pt-BR')} {item.unidadeMedida}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Valor:</span>
                          <div className="font-medium text-green-700">
                            {formatCurrency(secretaria.valor)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Data Informada:</span>
                          <div className="font-medium">
                            {formatDate(secretaria.dataInformada)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailModal;
