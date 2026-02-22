import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Check,
  Edit,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DbMapaRiscosItem } from '@/types/database';

interface SuggestionItem extends Omit<DbMapaRiscosItem, 'id' | 'mapa_riscos_id'> {
  tempId: string;
}

interface ETP {
  id: string;
  titulo: string;
  numeroETP: string;
  secretaria: string;
  valorTotal?: string;
  descricaoDemanda?: string;
}

interface AIRiskSuggestionsProps {
  isOpen: boolean;
  onClose: () => void;
  etp: ETP | null;
  onAcceptRisk: (risk: Omit<DbMapaRiscosItem, 'id' | 'mapa_riscos_id'>) => Promise<void>;
}

const AIRiskSuggestions = ({ isOpen, onClose, etp, onAcceptRisk }: AIRiskSuggestionsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const { toast } = useToast();

  const generateSuggestions = async () => {
    if (!etp) return;
    setIsGenerating(true);

    // Simular geração por IA baseada no ETP
    setTimeout(() => {
      const mockSuggestions: SuggestionItem[] = [
        {
          tempId: '1',
          categoria: 'Orçamentário',
          descricao: `Insuficiência de recursos para conclusão do projeto ${etp.numeroETP}`,
          causa_provavel: 'Estimativa inicial inadequada dos custos do projeto',
          consequencia: 'Paralisação ou atraso significativo na execução',
          probabilidade: 'Média',
          impacto: 'Alto',
          nivel: 'Alto',
          mitigacao: 'Elaborar cronograma detalhado de desembolso e reserva de contingência',
          responsavel: 'Setor Financeiro',
          plano_contingencia: 'Remanejamento de dotação orçamentária'
        },
        {
          tempId: '2',
          categoria: 'Técnico',
          descricao: `Incompatibilidade técnica dos itens do ${etp.numeroETP}`,
          causa_provavel: 'Especificações técnicas inadequadas ou obsoletas',
          consequencia: 'Necessidade de adequações custosas e atrasos',
          probabilidade: 'Baixa',
          impacto: 'Alto',
          nivel: 'Médio',
          mitigacao: 'Realizar análise técnica prévia e testes de compatibilidade',
          responsavel: 'Equipe Técnica',
          plano_contingencia: 'Substituição por itens equivalentes de nova geração'
        }
      ];

      setSuggestions(mockSuggestions);
      setIsGenerating(false);

      toast({
        title: "Sugestões geradas",
        description: `${mockSuggestions.length} riscos identificados pela IA`,
      });
    }, 1500);
  };

  const handleAccept = async (suggestion: SuggestionItem) => {
    const { tempId, ...riskData } = suggestion;
    await onAcceptRisk(riskData);
    setSuggestions(prev => prev.filter(s => s.tempId !== tempId));
  };

  const handleReject = (tempId: string) => {
    setSuggestions(prev => prev.filter(s => s.tempId !== tempId));
  };

  const getNivelColor = (nivel: string | null) => {
    switch (nivel) {
      case 'Alto':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Médio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixo':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  React.useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      generateSuggestions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Sugestões de Riscos por IA</h2>
                <p className="text-gray-600">Baseado no {etp?.numeroETP || 'ETP'}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto bg-gray-50">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analisando ETP...
                </h3>
                <p className="text-gray-600">
                  Nossa IA está identificando riscos potenciais
                </p>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.tempId} className="border-l-4 border-l-purple-500 overflow-hidden">
                  <CardHeader className="pb-3 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">{suggestion.categoria}</Badge>
                        <Badge className={getNivelColor(suggestion.nivel)}>
                          <AlertTriangle size={12} className="mr-1" />
                          {suggestion.nivel}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(suggestion)}
                          className="bg-green-600 hover:bg-green-700 text-xs"
                        >
                          <Check size={14} className="mr-1" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(suggestion.tempId)}
                          className="text-gray-500 hover:text-red-600 text-xs"
                        >
                          <X size={14} className="mr-1" />
                          Dispensar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 bg-white">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Descrição</h4>
                        <p className="text-sm text-gray-700">{suggestion.descricao}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-md">
                          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Causa Provável</h5>
                          <p className="text-sm text-gray-600">{suggestion.causa_provavel}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Consequência</h5>
                          <p className="text-sm text-gray-600">{suggestion.consequencia}</p>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Medidas de Controle</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 block">Mitigação</span>
                            <p className="text-sm text-gray-600">{suggestion.mitigacao}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 block">Responsável</span>
                            <p className="text-sm text-gray-600">{suggestion.responsavel}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma sugestão nova
              </h3>
              <p className="text-gray-600 max-w-xs mx-auto">
                Todas as sugestões foram processadas ou não há mais riscos a identificar.
              </p>
              <Button variant="outline" className="mt-6" onClick={onClose}>
                Voltar ao Mapa
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-white flex-shrink-0">
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
            <div className="text-xs text-gray-500 italic">
              * Verifique sempre as sugestões da IA antes de aceitá-las.
            </div>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRiskSuggestions;
