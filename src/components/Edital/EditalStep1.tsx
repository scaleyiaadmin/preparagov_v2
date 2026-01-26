
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, Zap } from 'lucide-react';
import { TermoReferencia } from '@/utils/termoReferenciaData';

interface EditalStep1Props {
  data: any;
  onUpdate: (field: string, value: any) => void;
  selectedTR: TermoReferencia;
}

const EditalStep1 = ({ data, onUpdate, selectedTR }: EditalStep1Props) => {
  const { toast } = useToast();

  const modalidades = [
    { value: 'pregao-eletronico', label: 'Pregão Eletrônico' },
    { value: 'concorrencia', label: 'Concorrência' },
    { value: 'tomada-precos', label: 'Tomada de Preços' },
    { value: 'convite', label: 'Convite' },
    { value: 'leilao', label: 'Leilão' }
  ];

  const tiposLicitacao = [
    { value: 'menor-preco', label: 'Menor Preço' },
    { value: 'melhor-tecnica', label: 'Melhor Técnica' },
    { value: 'tecnica-preco', label: 'Técnica e Preço' },
    { value: 'maior-lance', label: 'Maior Lance' }
  ];

  const regimesExecucao = [
    { value: 'empreitada-global', label: 'Empreitada por Preço Global' },
    { value: 'empreitada-unitario', label: 'Empreitada por Preço Unitário' },
    { value: 'tarefa', label: 'Execução por Tarefa' },
    { value: 'administracao-direta', label: 'Administração Direta' }
  ];

  const naturezaObjeto = [
    { value: 'servicos', label: 'Serviços' },
    { value: 'obras', label: 'Obras' },
    { value: 'bens', label: 'Bens' },
    { value: 'servicos-engenharia', label: 'Serviços de Engenharia' }
  ];

  const handleAutoFillFromTR = () => {
    onUpdate('orgaoResponsavel', selectedTR.secretaria);
    onUpdate('objetoLicitacao', selectedTR.objeto);
    
    // Sugerir modalidade baseada no tipo de objeto/valor
    if (selectedTR.objeto.toLowerCase().includes('obra')) {
      onUpdate('modalidadeLicitacao', 'concorrencia');
      onUpdate('naturezaObjeto', 'obras');
    } else if (selectedTR.objeto.toLowerCase().includes('serviço')) {
      onUpdate('modalidadeLicitacao', 'pregao-eletronico');
      onUpdate('naturezaObjeto', 'servicos');
    } else {
      onUpdate('modalidadeLicitacao', 'pregao-eletronico');
      onUpdate('naturezaObjeto', 'bens');
    }

    toast({
      title: "Preenchimento Automático",
      description: "Dados preenchidos com base no TR selecionado.",
    });
  };

  const handleGenerateWithAI = () => {
    // Simular geração por IA
    const aiSuggestions = {
      objetoLicitacao: `${selectedTR.objeto}\n\nEspecificações detalhadas:\n- Prazo de execução: conforme cronograma anexo\n- Local de execução: ${selectedTR.secretaria}\n- Garantia mínima: 12 meses\n- Forma de pagamento: conforme medição mensal`,
    };

    onUpdate('objetoLicitacao', aiSuggestions.objetoLicitacao);

    toast({
      title: "IA Ativada",
      description: "Objeto da licitação expandido com sugestões da IA.",
    });
  };

  // Auto-preencher ao carregar se os campos estão vazios
  React.useEffect(() => {
    if (!data.orgaoResponsavel && selectedTR) {
      handleAutoFillFromTR();
    }
  }, [selectedTR]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Identificação e Objeto</h3>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={handleAutoFillFromTR}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Zap className="h-4 w-4" />
            <span>Auto-preencher do TR</span>
          </Button>
          
          <Button 
            onClick={handleGenerateWithAI}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Zap className="h-4 w-4" />
            <span>Expandir com IA</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados Básicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="numeroEdital">Número do Edital *</Label>
                <Input
                  id="numeroEdital"
                  value={data.numeroEdital}
                  onChange={(e) => onUpdate('numeroEdital', e.target.value)}
                  placeholder="001/2024"
                />
                <p className="text-xs text-gray-500">Gerado automaticamente pelo sistema</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgaoResponsavel">Órgão/Entidade Responsável *</Label>
                <Input
                  id="orgaoResponsavel"
                  value={data.orgaoResponsavel}
                  onChange={(e) => onUpdate('orgaoResponsavel', e.target.value)}
                  placeholder="Secretaria responsável"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modalidadeLicitacao">Modalidade da Licitação *</Label>
                <Select 
                  value={data.modalidadeLicitacao} 
                  onValueChange={(value) => onUpdate('modalidadeLicitacao', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {modalidades.map(modalidade => (
                      <SelectItem key={modalidade.value} value={modalidade.value}>
                        {modalidade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="naturezaObjeto">Natureza do Objeto *</Label>
                <Select 
                  value={data.naturezaObjeto} 
                  onValueChange={(value) => onUpdate('naturezaObjeto', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a natureza" />
                  </SelectTrigger>
                  <SelectContent>
                    {naturezaObjeto.map(natureza => (
                      <SelectItem key={natureza.value} value={natureza.value}>
                        {natureza.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoLicitacao">Tipo de Licitação *</Label>
                <Select 
                  value={data.tipoLicitacao} 
                  onValueChange={(value) => onUpdate('tipoLicitacao', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposLicitacao.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regimeExecucao">Regime de Execução *</Label>
                <Select 
                  value={data.regimeExecucao} 
                  onValueChange={(value) => onUpdate('regimeExecucao', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o regime" />
                  </SelectTrigger>
                  <SelectContent>
                    {regimesExecucao.map(regime => (
                      <SelectItem key={regime.value} value={regime.value}>
                        {regime.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Objeto da Licitação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="objetoLicitacao">Descrição do Objeto *</Label>
                <Textarea
                  id="objetoLicitacao"
                  value={data.objetoLicitacao}
                  onChange={(e) => onUpdate('objetoLicitacao', e.target.value)}
                  placeholder="Descreva detalhadamente o objeto da licitação..."
                  rows={12}
                />
                <p className="text-xs text-gray-500">
                  Texto pré-preenchido com base no TR selecionado. Use a IA para expandir e detalhar.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base text-blue-900">Informações do TR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-blue-700">TR Vinculado:</span>
                  <p className="text-blue-900">{selectedTR.numero}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-700">ETP:</span>
                  <p className="text-blue-900">{selectedTR.etpNumero}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Secretaria:</span>
                  <p className="text-blue-900">{selectedTR.secretaria}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Responsável:</span>
                  <p className="text-blue-900">{selectedTR.responsavel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Autopreenchimento Inteligente</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Dados preenchidos automaticamente com base no TR selecionado</li>
          <li>• Use "Auto-preencher do TR" para atualizar campos com dados do Termo de Referência</li>
          <li>• Use "Expandir com IA" para gerar descrições mais detalhadas do objeto</li>
          <li>• Todos os campos podem ser editados manualmente após o preenchimento automático</li>
        </ul>
      </div>
    </div>
  );
};

export default EditalStep1;
