import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Loader2
} from 'lucide-react';
import DFDsLivresModal from './DFDsLivresModal';
import ItensEspecificosModal from './ItensEspecificosModal';
import { etpService } from '@/services/etpService';
import { useAuth } from '@/contexts/AuthContext';

interface TRSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onOriginSelected: (origin: 'cronograma' | 'dfds-livres' | 'itens-especificos', data: any) => void;
}

const TRSelectionModal = ({ open, onClose, onOriginSelected }: TRSelectionModalProps) => {
  const { user } = useAuth();
  const [selectedOrigin, setSelectedOrigin] = useState<'cronograma' | 'dfds-livres' | 'itens-especificos' | null>(null);
  const [selectedLicitacao, setSelectedLicitacao] = useState<any>(null);
  const [etps, setEtps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDFDsLivresModal, setShowDFDsLivresModal] = useState(false);
  const [showItensEspecificosModal, setShowItensEspecificosModal] = useState(false);

  useEffect(() => {
    if (open && selectedOrigin === 'cronograma') {
      loadETPs();
    }
  }, [open, selectedOrigin, user?.prefeituraId]);

  const loadETPs = async () => {
    try {
      setLoading(true);
      const data = await etpService.fetchConcluidos(user?.prefeituraId || undefined);
      setEtps(data || []);
    } catch (error) {
      console.error('Erro ao carregar ETPs:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getPriorityColor = (prioridade: string | null) => {
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
            <DialogTitle className="text-xl font-bold text-gray-900 border-b pb-4">
              Escolha a origem do Termo de Referência
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {!selectedOrigin && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                  className="cursor-pointer group hover:bg-orange-50 border-2 border-transparent hover:border-orange-200 transition-all duration-300 shadow-sm hover:shadow-md"
                  onClick={() => handleOriginSelection('cronograma')}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <Calendar size={20} />
                      </div>
                      <CardTitle className="text-lg">Cronograma de Licitações</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      Crie um TR baseado em um ETP concluído sugerido pelo cronograma de licitações.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2" />
                        ETPs Consolidados
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2" />
                        Dados de Planejamento
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer group hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
                  onClick={() => handleOriginSelection('dfds-livres')}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FileText size={20} />
                      </div>
                      <CardTitle className="text-lg">DFDs Livres</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      Selecione um ou mais DFDs aprovados para compor seu Termo de Referência.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                        Múltiplas Secretarias
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                        Agrupamento Flexível
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer group hover:bg-green-50 border-2 border-transparent hover:border-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
                  onClick={() => handleOriginSelection('itens-especificos')}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <Package size={20} />
                      </div>
                      <CardTitle className="text-lg">Itens Específicos</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      Escolha itens granulares de diferentes DFDs para um TR customizado.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2" />
                        Controle de Lotes
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2" />
                        Seleção de Itens Avulsos
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedOrigin === 'cronograma' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <div className="flex items-center">
                    <Calendar className="text-orange-600 mr-2" size={20} />
                    <h3 className="text-lg font-bold text-orange-900">Selecione um ETP do Cronograma</h3>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedOrigin(null)}
                    className="text-orange-700 hover:bg-orange-100"
                  >
                    Trocar Origem
                  </Button>
                </div>

                {loading ? (
                  <div className="py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-orange-500 mb-2" />
                    <p className="text-gray-500">Buscando ETPs consolidados...</p>
                  </div>
                ) : etps.length === 0 ? (
                  <div className="py-20 text-center bg-white border rounded-lg border-dashed">
                    <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500">Nenhum ETP concluído disponível no cronograma.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {etps.map((etp) => (
                      <Card
                        key={etp.id}
                        className={`cursor-pointer transition-all border-l-4 ${selectedLicitacao?.id === etp.id
                            ? 'border-orange-500 bg-orange-50 shadow-sm'
                            : 'border-transparent hover:border-orange-200 hover:bg-gray-50'
                          }`}
                        onClick={() => handleLicitacaoSelection(etp)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-bold text-gray-900">{etp.numeroETP}</h4>
                                <Badge variant="outline" className="text-[10px] bg-white">CONCLUÍDO</Badge>
                              </div>
                              <p className="text-sm text-gray-600 font-medium mb-3 line-clamp-1">{etp.titulo}</p>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-2">
                                  <Building size={14} className="text-gray-400" />
                                  <span>{etp.secretaria}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar size={14} className="text-gray-400" />
                                  <span>{new Date(etp.dataCriacao).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center space-x-2 font-bold text-green-700">
                                  <DollarSign size={14} />
                                  <span>{etp.valorTotal}</span>
                                </div>
                              </div>
                            </div>
                            {selectedLicitacao?.id === etp.id && (
                              <div className="ml-4 flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full text-white shadow-sm">
                                <ArrowRight size={18} />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!loading && etps.length > 0 && selectedLicitacao && (
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={handleConfirmCronograma}
                      className="bg-orange-500 hover:bg-orange-600 shadow-md min-w-[200px]"
                    >
                      Continuar com este ETP
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
