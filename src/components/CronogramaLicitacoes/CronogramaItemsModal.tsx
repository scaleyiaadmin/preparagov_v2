
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency, getPriorityColor, formatDate } from '../../utils/pcaConsolidation';
import { Building2, Package, FileText } from 'lucide-react';
import { CronogramaItem } from '../../hooks/useCronogramaData';
import DFDPreviewModal from './DFDPreviewModal';

interface CronogramaItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  licitacao: CronogramaItem | null;
}

const CronogramaItemsModal = ({ isOpen, onClose, licitacao }: CronogramaItemsModalProps) => {
  const [showDFDPreview, setShowDFDPreview] = useState(false);
  const [selectedDFDId, setSelectedDFDId] = useState<string>('');

  console.log('Dados da licitação:', licitacao);

  const handleDFDClick = (dfdId: string) => {
    setSelectedDFDId(dfdId);
    setShowDFDPreview(true);
  };

  // Garantir que itensConsolidados sempre seja um array válido - SEMPRE executar o hook
  const itensConsolidados = React.useMemo(() => {
    if (!licitacao || !licitacao.itensConsolidados || !Array.isArray(licitacao.itensConsolidados)) {
      console.log('Criando itens consolidados a partir dos dados disponíveis');
      // Fallback: criar a partir dos dados básicos da licitação se disponível
      if (licitacao) {
        return [{
          descricao: `Item consolidado - ${licitacao.tipoDFD || 'Tipo não informado'}`,
          unidadeMedida: licitacao.unidadeMedida || 'Unidade',
          quantidadeTotal: licitacao.quantidadeTotal || 0,
          valorTotal: typeof licitacao.valorTotal === 'string'
            ? parseFloat(licitacao.valorTotal.replace(/[^\d,]/g, '').replace(',', '.')) || 0
            : licitacao.valorTotal || 0
        }];
      }
      return [];
    }

    return licitacao.itensConsolidados;
  }, [licitacao]);

  // Mapear DFDs para suas respectivas secretarias - SEMPRE executar o hook
  const dfdSecretariaMap = React.useMemo(() => {
    const map = new Map();

    if (licitacao && licitacao.secretariasData && typeof licitacao.secretariasData === 'object') {
      Object.entries(licitacao.secretariasData).forEach(([secretaria, dados]) => {
        if (dados && dados.dfdId) {
          map.set(dados.dfdId, secretaria);
        }
      });
    }

    // Fallback: mapear usando arrays paralelos
    if (licitacao && licitacao.dfdIds && licitacao.secretariasNomes) {
      licitacao.dfdIds.forEach((dfdId: string, index: number) => {
        if (!map.has(dfdId)) {
          map.set(dfdId, licitacao.secretariasNomes[index] || 'Secretaria não identificada');
        }
      });
    }

    return map;
  }, [licitacao]);

  // Renderização condicional APÓS todos os hooks
  if (!licitacao) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package size={20} className="mr-2" />
              Detalhes da Licitação
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhuma licitação selecionada</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package size={20} className="mr-2" />
              Detalhes da Licitação: {licitacao.tipoDFD || 'Tipo não informado'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Bloco Superior - Informações Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-700">Tipo de DFD</label>
                <p className="text-sm text-gray-900 font-medium">{licitacao.tipoDFD || 'Não informado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Prioridade</label>
                <div className="mt-1">
                  <Badge className={getPriorityColor(licitacao.prioridade || 'Média')}>
                    {licitacao.prioridade || 'Não informada'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Data de Contratação</label>
                <p className="text-sm text-gray-900">{formatDate(licitacao.dataContratacao)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Data Sugerida de Abertura</label>
                <p className="text-sm text-gray-900">{formatDate(licitacao.dataSugeridaAbertura)}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Valor Total da Licitação</label>
                <p className="text-lg text-gray-900 font-bold">{licitacao.valorTotal || 'R$ 0,00'}</p>
              </div>
            </div>

            {/* Secretarias Envolvidas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Building2 size={18} className="mr-2" />
                Secretarias Envolvidas ({licitacao.secretariasNomes?.length || 0})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {licitacao.secretariasNomes?.map((secretaria: string, index: number) => (
                  <div key={secretaria} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Badge variant="outline" className="font-mono font-bold">
                      {licitacao.secretariasSiglas?.[index] || 'N/A'}
                    </Badge>
                    <span className="text-sm text-gray-700 flex-1">{secretaria}</span>
                  </div>
                )) || (
                    <div className="col-span-full">
                      <p className="text-gray-500 text-sm">Nenhuma secretaria encontrada</p>
                    </div>
                  )}
              </div>
            </div>

            {/* DFDs Envolvidos */}
            {licitacao.dfdIds && licitacao.dfdIds.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <FileText size={18} className="mr-2" />
                  DFDs Envolvidos ({licitacao.dfdIds.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {licitacao.dfdIds.map((dfdId: string, index: number) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDFDClick(dfdId)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          {dfdId}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{dfdSecretariaMap.get(dfdId) || 'Secretaria não identificada'}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}

            {/* Tabela de Itens Consolidados */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Itens Consolidados ({itensConsolidados.length})
              </h3>
              {itensConsolidados.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Nenhum item consolidado encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead className="text-right">Quantidade Total</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itensConsolidados.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.descricao || 'Descrição não informada'}</p>
                              {item.detalhamentoTecnico && (
                                <p className="text-sm text-gray-500">{item.detalhamentoTecnico}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {item.unidadeMedida || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.quantidadeTotal || 0}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.valorTotal || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Resumo Final */}
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-900 mb-2">Resumo da Licitação</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-orange-700">Total de Secretarias:</span>
                  <span className="ml-2 font-medium">{licitacao.secretariasNomes?.length || 0}</span>
                </div>
                <div>
                  <span className="text-orange-700">Total de DFDs:</span>
                  <span className="ml-2 font-medium">{licitacao.dfdIds?.length || 0}</span>
                </div>
                <div>
                  <span className="text-orange-700">Total de Itens:</span>
                  <span className="ml-2 font-medium">{itensConsolidados.length}</span>
                </div>
                <div className="md:col-span-3">
                  <span className="text-orange-700">Valor Total:</span>
                  <span className="ml-2 font-medium text-lg">{licitacao.valorTotal || 'R$ 0,00'}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DFD Preview Modal */}
      <DFDPreviewModal
        isOpen={showDFDPreview}
        onClose={() => setShowDFDPreview(false)}
        dfdId={selectedDFDId}
      />
    </TooltipProvider>
  );
};

export default CronogramaItemsModal;
