
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Hash, DollarSign } from 'lucide-react';
import { formatCurrency, getAllSecretarias } from '@/utils/pcaConsolidation';
import PCAStructuredTable from './PCAStructuredTable';
import PCAStructuredExportModal from './PCAStructuredExportModal';

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

interface PCAVisualizationModalProps {
  open: boolean;
  onClose: () => void;
  selectedYear: string;
  itemsByType: Record<string, ConsolidatedItemByType[]>;
}

const PCAVisualizationModal = ({
  open,
  onClose,
  selectedYear,
  itemsByType
}: PCAVisualizationModalProps) => {
  const [showExportModal, setShowExportModal] = useState(false);

  const totalItems = Object.values(itemsByType).reduce((sum, items) => sum + items.length, 0);
  const totalValue = Object.values(itemsByType).reduce((sum, items) => 
    sum + items.reduce((itemSum, item) => itemSum + item.valorTotal, 0), 0
  );
  const allSecretarias = getAllSecretarias(itemsByType);

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              PCA - Plano de Contratações Anual {selectedYear}
            </DialogTitle>
            <div className="flex items-center justify-center space-x-6 text-sm mt-2">
              <div className="flex items-center space-x-1">
                <Hash size={16} className="text-blue-600" />
                <span>{totalItems} itens únicos</span>
              </div>
              <div className="flex items-center space-x-1">
                <DollarSign size={16} className="text-green-600" />
                <span className="font-medium">{formatCurrency(totalValue)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Badge variant="secondary">
                  {allSecretarias.length} secretarias envolvidas
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {/* Structured PCA Table */}
          <div className="mt-4">
            <PCAStructuredTable 
              itemsByType={itemsByType} 
              selectedYear={selectedYear} 
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportModal(true)}>
              <Download size={16} className="mr-2" />
              Exportar PCA
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PCAStructuredExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        itemsByType={itemsByType}
        selectedYear={selectedYear}
      />
    </>
  );
};

export default PCAVisualizationModal;
