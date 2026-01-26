import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  FileText, 
  Package, 
  Building,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import DFDsLivresModal from './DFDsLivresModal';
import ItensEspecificosModal from './ItensEspecificosModal';

interface TRSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onOriginSelected: (origin: 'cronograma' | 'dfds-livres' | 'itens-especificos', data: any) => void;
}

const TRSelectionModal = ({ open, onClose, onOriginSelected }: TRSelectionModalProps) => {
  const [selectedOrigin, setSelectedOrigin] = useState<'cronograma' | 'dfds-livres' | 'itens-especificos' | null>(null);
  const [selectedLicitacao, setSelectedLicitacao] = useState<any>(null);
  const [showDFDsLivresModal, setShowDFDsLivresModal] = useState(false);
  const [showItensEspecificosModal, setShowItensEspecificosModal] = useState(false);

  // Mock data para licitações do cronograma
  const mockLicitacoes = [
    {
      id: '1',
      tipoDFD: 'Materiais de Consumo',
      dataContratacao: '2024-03-15',
      dataSugeridaAbertura: '2024-02-14',
      prioridade: 'Alta',
      secretariasNomes: ['Secretaria de Educação', 'Secretaria de Saúde'],
      valorTotal: 'R$ 45.000,00',
      dfdIds: ['DFD-001', 'DFD-002']
    },
    {
      id: '2',
      tipoDFD: 'Materiais Permanentes',
      dataContratacao: '2024-04-20',
      dataSugeridaAbertura: '2024-03-20',
      prioridade: 'Média',
      secretariasNomes: ['Secretaria de Administração'],
      valorTotal: 'R$ 125.000,00',
      dfdIds: ['DFD-003', 'DFD-004']
    }
  ];

  const handleOriginSelection = (origin: 'cronograma' | 'dfds-livres' | 'itens-especificos') => {
    setSelectedOrigin(origin);
    
    if (origin === 'dfds-livres') {
      setShowDFDsLivresModal(true);
    } else if (origin === 'itens-especificos') {
      setShowItensEspecificosModal(true);
    }
  };

  const handleLicitacaoSelection = (licitacao: any) => {
    setSelectedLicitacao(licitacao);
  };

  const handleConfirmCronograma = () => {
    if (selectedLicitacao) {
      onOriginSelected('cronograma', selectedLicitacao);
    }
  };

  const handleDFDsLivresSelected = (selectedDFDs: any[]) => {
    setShowDFDsLivresModal(false);
    onOriginSelected('dfds-livres', selectedDFDs);
  };

  const handleItensEspecificosSelected = (selectedItems: any[]) => {
    setShowItensEspecificosModal(false);
    onOriginSelected('itens-especificos', selectedItems);
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baixa':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Escolha a origem do Termo de Referência</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {!selectedOrigin && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className="cursor-pointer hover:bg-orange-50 border-2 hover:border-orange-200 transition-colors"
                  onClick={() => handleOriginSelection('cronograma')}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="text-orange-600" size={20} />
                      <CardTitle className="text-lg">Cronograma de Licitações</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      Crie um TR baseado em uma licitação sugerida pelo sistema no cronograma.
                    </p>
                    <div className="text-xs text-gray-500">
                      ✓ Itens já consolidados<br />
                      ✓ Datas sugeridas<br />
                      ✓ Prioridades definidas
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:bg-blue-50 border-2 hover:border-blue-200 transition-colors"
                  onClick={() => handleOriginSelection('dfds-livres')}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="text-blue-600" size={20} />
                      <CardTitle className="text-lg">DFDs Livres</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      Selecione DFDs completos livremente para criar o TR.
                    </p>
                    <div className="text-xs text-gray-500">
                      ✓ Flexibilidade total<br />
                      ✓ Múltiplos DFDs<br />
                      ✓ Diferentes secretarias
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:bg-green-50 border-2 hover:border-green-200 transition-colors"
                  onClick={() => handleOriginSelection('itens-especificos')}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Package className="text-green-600" size={20} />
                      <CardTitle className="text-lg">Itens Específicos</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">
                      Selecione itens específicos de um ou mais DFDs.
                    </p>
                    <div className="text-xs text-gray-500">
                      ✓ Controle granular<br />
                      ✓ Itens individuais<br />
                      ✓ Customização total
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedOrigin === 'cronograma' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Selecione uma licitação do cronograma</h3>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedOrigin(null)}
                  >
                    Voltar
                  </Button>
                </div>

                <div className="space-y-3">
                  {mockLicitacoes.map((licitacao) => (
                    <Card 
                      key={licitacao.id} 
                      className={`cursor-pointer transition-all ${
                        selectedLicitacao?.id === licitacao.id 
                          ? 'border-2 border-orange-500 bg-orange-50' 
                          : 'border hover:bg-gray-50'
                      }`}
                      onClick={() => handleLicitacaoSelection(licitacao)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{licitacao.tipoDFD}</h4>
                              <Badge className={getPriorityColor(licitacao.prioridade)}>
                                {licitacao.prioridade}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar size={14} />
                                <span>{new Date(licitacao.dataContratacao).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Building size={14} />
                                <span>{licitacao.secretariasNomes.length} secretarias</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FileText size={14} />
                                <span>{licitacao.dfdIds.length} DFDs</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign size={14} />
                                <span className="font-semibold text-green-600">{licitacao.valorTotal}</span>
                              </div>
                            </div>
                          </div>
                          {selectedLicitacao?.id === licitacao.id && (
                            <div className="ml-4">
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedLicitacao && (
                  <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleConfirmCronograma} className="bg-orange-500 hover:bg-orange-600">
                      Continuar com esta licitação
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modais dos novos fluxos */}
      <DFDsLivresModal
        open={showDFDsLivresModal}
        onClose={() => {
          setShowDFDsLivresModal(false);
          setSelectedOrigin(null);
        }}
        onContinuar={handleDFDsLivresSelected}
      />

      <ItensEspecificosModal
        open={showItensEspecificosModal}
        onClose={() => {
          setShowItensEspecificosModal(false);
          setSelectedOrigin(null);
        }}
        onContinuar={handleItensEspecificosSelected}
      />
    </>
  );
};

export default TRSelectionModal;
