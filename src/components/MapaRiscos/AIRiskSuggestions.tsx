
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

interface RiskSuggestion {
  id: string;
  categoria: string;
  descricao: string;
  causaProvavel: string;
  consequencia: string;
  probabilidade: string;
  impacto: string;
  nivel: string;
  mitigacao: string;
  responsavel: string;
}

interface ETP {
  id: string;
  titulo: string;
  numeroETP: string;
  secretaria: string;
  valorTotal: string;
  descricaoDemanda: string;
}

interface DFD {
  id: string;
  numero: string;
  nome: string;
  valor: string;
  tipo: string;
}

interface AIRiskSuggestionsProps {
  etp: ETP;
  dfds: DFD[];
  onAcceptRisk: (risk: Omit<RiskSuggestion, 'id'>) => void;
  onClose: () => void;
}

const AIRiskSuggestions = ({ etp, dfds, onAcceptRisk, onClose }: AIRiskSuggestionsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<RiskSuggestion[]>([]);
  const [editingRisk, setEditingRisk] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    // Simular geração por IA baseada no ETP e DFDs
    setTimeout(() => {
      const mockSuggestions: RiskSuggestion[] = [
        {
          id: '1',
          categoria: 'Orçamentário',
          descricao: `Insuficiência de recursos para conclusão do projeto ${etp.numeroETP}`,
          causaProvavel: 'Estimativa inicial inadequada dos custos do projeto',
          consequencia: 'Paralisação ou atraso significativo na execução',
          probabilidade: 'Média',
          impacto: 'Alto',
          nivel: 'Alto',
          mitigacao: 'Elaborar cronograma detalhado de desembolso e reserva de contingência',
          responsavel: 'Setor Financeiro'
        },
        {
          id: '2',
          categoria: 'Técnico',
          descricao: `Incompatibilidade técnica dos itens do ${etp.numeroETP}`,
          causaProvavel: 'Especificações técnicas inadequadas ou obsoletas',
          consequencia: 'Necessidade de adequações custosas e atrasos',
          probabilidade: 'Baixa',
          impacto: 'Alto',
          nivel: 'Médio',
          mitigacao: 'Realizar análise técnica prévia e testes de compatibilidade',
          responsavel: 'Equipe Técnica'
        },
        {
          id: '3',
          categoria: 'Cronograma',
          descricao: `Atraso na entrega dos itens especificados nos DFDs`,
          causaProvavel: 'Problemas na cadeia de fornecimento ou logística',
          consequencia: 'Impacto direto no cronograma do projeto',
          probabilidade: 'Média',
          impacto: 'Médio',
          nivel: 'Médio',
          mitigacao: 'Estabelecer múltiplos fornecedores e prazos escalonados',
          responsavel: 'Coordenação do Projeto'
        }
      ];
      
      setSuggestions(mockSuggestions);
      setIsGenerating(false);
      
      toast({
        title: "Sugestões geradas",
        description: `${mockSuggestions.length} riscos identificados pela IA`,
      });
    }, 2000);
  };

  const handleAccept = (suggestion: RiskSuggestion) => {
    onAcceptRisk({
      categoria: suggestion.categoria,
      descricao: suggestion.descricao,
      causaProvavel: suggestion.causaProvavel,
      consequencia: suggestion.consequencia,
      probabilidade: suggestion.probabilidade,
      impacto: suggestion.impacto,
      nivel: suggestion.nivel,
      mitigacao: suggestion.mitigacao,
      responsavel: suggestion.responsavel
    });
    
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    
    toast({
      title: "Risco aceito",
      description: "Risco adicionado ao mapa com sucesso",
    });
  };

  const handleReject = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    toast({
      title: "Risco rejeitado",
      description: "Sugestão removida da lista",
    });
  };

  const getNivelColor = (nivel: string) => {
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
    generateSuggestions();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Sugestões de Riscos por IA</h2>
                <p className="text-gray-600">Baseado no {etp.numeroETP} e seus DFDs vinculados</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {isGenerating ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analisando ETP e DFDs...
                </h3>
                <p className="text-gray-600">
                  Nossa IA está identificando riscos potenciais
                </p>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{suggestion.categoria}</Badge>
                        <Badge className={getNivelColor(suggestion.nivel)}>
                          <AlertTriangle size={12} className="mr-1" />
                          {suggestion.nivel}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingRisk(suggestion.id)}
                        >
                          <Edit size={14} className="mr-1" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleAccept(suggestion)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check size={14} className="mr-1" />
                          Aceitar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReject(suggestion.id)}
                        >
                          <X size={14} className="mr-1" />
                          Recusar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Descrição do Risco</h4>
                        <p className="text-gray-700">{suggestion.descricao}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Causa Provável</h5>
                          <p className="text-sm text-gray-600">{suggestion.causaProvavel}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Consequência</h5>
                          <p className="text-sm text-gray-600">{suggestion.consequencia}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Probabilidade:</span>
                          <span className="ml-2">{suggestion.probabilidade}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Impacto:</span>
                          <span className="ml-2">{suggestion.impacto}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Responsável:</span>
                          <span className="ml-2">{suggestion.responsavel}</span>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Estratégia de Mitigação</h5>
                        <p className="text-sm text-gray-600">{suggestion.mitigacao}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Todas as sugestões foram processadas
              </h3>
              <p className="text-gray-600">
                Você pode adicionar mais riscos manualmente se necessário
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {suggestions.length > 0 
                ? `${suggestions.length} sugestão${suggestions.length !== 1 ? 'ões' : ''} pendente${suggestions.length !== 1 ? 's' : ''}`
                : 'Todas as sugestões foram processadas'
              }
            </div>
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRiskSuggestions;
