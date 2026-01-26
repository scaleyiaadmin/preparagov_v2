
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Zap, 
  Scale,
  Shield,
  Users,
  AlertTriangle
} from 'lucide-react';

interface EditalStep4Props {
  data: any;
  onUpdate: (field: string, value: any) => void;
}

const EditalStep4 = ({ data, onUpdate }: EditalStep4Props) => {
  const { toast } = useToast();

  const handleGenerateWithAI = (field: string) => {
    const aiSuggestions: { [key: string]: string } = {
      condicoesParticipacao: `CONDIÇÕES DE PARTICIPAÇÃO

1. REQUISITOS GERAIS:
- Pessoa jurídica regularmente constituída
- Inscrição no CNPJ ativa
- Regularidade fiscal (União, Estado, Município e FGTS)
- Certidão negativa de débitos trabalhistas
- Prova de inexistência de débitos inadimplidos perante a Justiça do Trabalho

2. QUALIFICAÇÃO TÉCNICA:
- Registro no CREA/CAU (quando aplicável)
- Atestado de capacidade técnica
- Responsável técnico com experiência comprovada

3. QUALIFICAÇÃO ECONÔMICO-FINANCEIRA:
- Balanço patrimonial do último exercício
- Certidão negativa de falência e concordata
- Capital social ou patrimônio líquido mínimo

4. OUTRAS EXIGÊNCIAS:
- Visita técnica (quando obrigatória)
- Apresentação de amostras (quando aplicável)`,

      criteriosJulgamento: `CRITÉRIOS DE JULGAMENTO

O julgamento das propostas obedecerá ao critério de MENOR PREÇO, considerando:

1. ANÁLISE DAS PROPOSTAS:
- Conformidade com as especificações técnicas
- Adequação aos prazos estabelecidos
- Compatibilidade dos preços com os praticados no mercado

2. CRITÉRIOS DE ACEITABILIDADE:
- Preços unitários e global não superiores aos estimados
- Proposta técnica em conformidade com o Termo de Referência
- Cronograma físico-financeiro compatível

3. ORDEM DE CLASSIFICAÇÃO:
- 1º lugar: menor preço global
- Empates serão definidos pelos critérios de desempate previstos`,

      exigenciasEspecificas: `EXIGÊNCIAS ESPECÍFICAS

1. VISTORIA:
- Vistoria facultativa para conhecimento das condições locais
- Agendamento: segunda a sexta, das 8h às 17h
- Prazo: até 2 dias antes da abertura das propostas

2. AMOSTRAS:
- Não serão exigidas amostras para este objeto

3. GARANTIA:
- Garantia mínima de 12 meses para os serviços executados
- Garantia contratual: 5% do valor do contrato

4. OUTRAS EXIGÊNCIAS:
- Equipe técnica permanente durante a execução
- Relatórios periódicos de acompanhamento`,

      criteriosDesempate: `CRITÉRIOS DE DESEMPATE

Em caso de empate, será aplicada a seguinte ordem de preferência:

1. MICRO E PEQUENAS EMPRESAS:
- Conforme Lei Complementar 123/2006
- Direito de preferência até 5% do menor preço

2. BENS E SERVIÇOS PRODUZIDOS NO BRASIL:
- Conforme Lei 8.666/93, art. 3º, § 2º

3. EMPRESAS BRASILEIRAS:
- De capital nacional

4. MAIOR CONTEÚDO TECNOLÓGICO E INOVAÇÃO:
- Desenvolvimento no País

5. CRITÉRIOS DE SUSTENTABILIDADE:
- Menor impacto ambiental
- Responsabilidade social`,

      sancoesPenalidades: `SANÇÕES E PENALIDADES

1. PELA INEXECUÇÃO TOTAL OU PARCIAL:
- Advertência
- Multa de 0,1% a 20% sobre o valor do contrato
- Suspensão temporária de licitar
- Declaração de inidoneidade

2. MULTAS ESPECÍFICAS:
- Atraso na execução: 0,1% por dia sobre o valor em atraso
- Inexecução parcial: 5% sobre o valor não executado
- Inexecução total: 10% sobre o valor total do contrato

3. OUTRAS PENALIDADES:
- Desconto no pagamento por defeitos/inadequações
- Retenção de garantias
- Rescisão contratual por justa causa

As penalidades são independentes e podem ser aplicadas cumulativamente.`
    };

    onUpdate(field, aiSuggestions[field] || '');
    
    toast({
      title: "Conteúdo Gerado com IA",
      description: "Texto gerado com base na Lei 14.133/2021. Revise e ajuste conforme necessário.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Requisitos e Condições</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Condições de Participação</span>
                </div>
                <Button
                  onClick={() => handleGenerateWithAI('condicoesParticipacao')}
                  variant="outline"
                  size="sm"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Gerar com IA
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.condicoesParticipacao}
                onChange={(e) => onUpdate('condicoesParticipacao', e.target.value)}
                placeholder="Defina os requisitos para participação na licitação..."
                rows={8}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Scale className="h-4 w-4" />
                  <span>Critérios de Julgamento</span>
                </div>
                <Button
                  onClick={() => handleGenerateWithAI('criteriosJulgamento')}
                  variant="outline"
                  size="sm"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Gerar com IA
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.criteriosJulgamento}
                onChange={(e) => onUpdate('criteriosJulgamento', e.target.value)}
                placeholder="Defina como as propostas serão julgadas..."
                rows={8}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Exigências Específicas</span>
                </div>
                <Button
                  onClick={() => handleGenerateWithAI('exigenciasEspecificas')}
                  variant="outline"
                  size="sm"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Gerar com IA
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.exigenciasEspecificas}
                onChange={(e) => onUpdate('exigenciasEspecificas', e.target.value)}
                placeholder="Vistorias, amostras, garantias e outras exigências..."
                rows={8}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações Especiais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consorcios"
                    checked={data.participacaoConsorcios}
                    onCheckedChange={(checked) => onUpdate('participacaoConsorcios', checked)}
                  />
                  <label htmlFor="consorcios" className="text-sm font-medium">
                    Permitir participação de consórcios
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cooperativas"
                    checked={data.participacaoCooperativas}
                    onCheckedChange={(checked) => onUpdate('participacaoCooperativas', checked)}
                  />
                  <label htmlFor="cooperativas" className="text-sm font-medium">
                    Permitir participação de cooperativas
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="srp"
                    checked={data.sistemaRegistroPrecos}
                    onCheckedChange={(checked) => onUpdate('sistemaRegistroPrecos', checked)}
                  />
                  <label htmlFor="srp" className="text-sm font-medium">
                    Sistema de Registro de Preços (SRP)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="me-epp"
                    checked={data.tratamentoDiferenciadoME}
                    onCheckedChange={(checked) => onUpdate('tratamentoDiferenciadoME', checked)}
                  />
                  <label htmlFor="me-epp" className="text-sm font-medium">
                    Tratamento diferenciado a ME/EPP
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Vistoria</label>
                <Select 
                  value={data.tipoVistoria} 
                  onValueChange={(value) => onUpdate('tipoVistoria', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="obrigatoria">Obrigatória</SelectItem>
                    <SelectItem value="facultativa">Facultativa</SelectItem>
                    <SelectItem value="nao-aplicavel">Não Aplicável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Scale className="h-4 w-4" />
                  <span>Critérios de Desempate</span>
                </div>
                <Button
                  onClick={() => handleGenerateWithAI('criteriosDesempate')}
                  variant="outline"
                  size="sm"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Gerar com IA
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.criteriosDesempate}
                onChange={(e) => onUpdate('criteriosDesempate', e.target.value)}
                placeholder="Critérios para desempate entre propostas..."
                rows={8}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Sanções e Penalidades</span>
                </div>
                <Button
                  onClick={() => handleGenerateWithAI('sancoesPenalidades')}
                  variant="outline"
                  size="sm"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Gerar com IA
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.sancoesPenalidades}
                onChange={(e) => onUpdate('sancoesPenalidades', e.target.value)}
                placeholder="Penalidades por descumprimento contratual..."
                rows={8}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-2">Geração Inteligente com IA</h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Todos os campos podem ser preenchidos automaticamente com base na Lei 14.133/2021</li>
          <li>• Use os botões "Gerar com IA" para criar conteúdo padrão e depois personalize</li>
          <li>• As configurações especiais definem regras importantes para a licitação</li>
          <li>• Revise sempre o conteúdo gerado para adequá-lo ao objeto específico</li>
          <li>• Campos obrigatórios: Condições de Participação e Critérios de Julgamento</li>
        </ul>
      </div>
    </div>
  );
};

export default EditalStep4;
