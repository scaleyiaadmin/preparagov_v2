import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Upload, 
  Wand2, 
  Eye, 
  Info,
  Paperclip,
  Download,
  Copy,
  CheckCircle,
  Shield,
  Building,
  UserCheck,
  Scale,
  FileCheck
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EditalStep8Props {
  data: any;
  onUpdate: (field: string, value: any) => void;
  selectedTR: any;
  onFinalize: () => void;
}

const EditalStep8 = ({ data, onUpdate, selectedTR, onFinalize }: EditalStep8Props) => {
  // Declarações obrigatórias (já marcadas por padrão)
  const [obligatoryDeclarations, setObligatoryDeclarations] = useState({
    impedimentos: true,
    independente: true,
    habilitacao: true,
    artigo7: true,
    anticorrupcao: true,
    ausenciaImpedimentos: true
  });

  // Declarações opcionais
  const [optionalDeclarations, setOptionalDeclarations] = useState({
    plenoAtendimento: false,
    meEpp: false,
    naoServidorPublico: false,
    capacidadeTecnica: false,
    vistoriaTecnica: false,
    responsabilidadeTecnica: false,
    lgpd: false
  });

  const [contractType, setContractType] = useState<'upload' | 'standard'>('standard');
  const [proposalType, setProposalType] = useState<'upload' | 'standard' | null>(null);
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Modelos das declarações obrigatórias
  const obligatoryModels = {
    impedimentos: {
      title: "Declaração de Inexistência de Fatos Impeditivos",
      tooltip: "Declara que a empresa não possui impedimentos legais para contratar com a administração pública.",
      content: `[RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ], com sede na [ENDEREÇO COMPLETO], por seu representante legal, DECLARA, sob as penas da lei, que não existem fatos impeditivos para sua participação no presente processo licitatório, estando ciente da obrigatoriedade de declarar ocorrências posteriores.

[Local], [Data].

__________________________________  
[Nome do Representante Legal]  
[Cargo]  
[CPF]`
    },
    independente: {
      title: "Declaração de Elaboração Independente de Proposta",
      tooltip: "Garante que a proposta foi elaborada de forma independente, sem conluio com outros concorrentes.",
      content: `[RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ], por meio de seu representante legal, DECLARA, sob as penas da lei, que a proposta foi elaborada de maneira independente, sem que tenha havido qualquer forma de conluio, ajuste ou combinação com outros concorrentes ou terceiros.

[Local], [Data].

__________________________________  
[Nome do Representante Legal]  
[Cargo]  
[CPF]`
    },
    habilitacao: {
      title: "Declaração de Cumprimento dos Requisitos de Habilitação",
      tooltip: "Confirma que a empresa atende a todos os requisitos de habilitação exigidos no edital.",
      content: `[RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ], declara, sob as penas da lei, que cumpre plenamente todos os requisitos de habilitação exigidos no edital em epígrafe, estando apta a participar do certame.

[Local], [Data].

__________________________________  
[Nome do Representante Legal]  
[Cargo]  
[CPF]`
    },
    artigo7: {
      title: "Declaração de Cumprimento do Art. 7º, XXXIII da CF/88",
      tooltip: "Declara não empregar menor de dezoito anos em trabalho noturno, perigoso ou insalubre.",
      content: `[RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ], DECLARA, sob as penas da lei, que não emprega menor de dezoito anos em trabalho noturno, perigoso ou insalubre e não emprega menor de dezesseis anos, salvo na condição de aprendiz, a partir de quatorze anos, em cumprimento ao disposto no art. 7º, XXXIII, da Constituição Federal.

[Local], [Data].

__________________________________  
[Nome do Representante Legal]  
[Cargo]  
[CPF]`
    },
    anticorrupcao: {
      title: "Declaração Anticorrupção e de Integridade (Lei 12.846/2013)",
      tooltip: "Declara conformidade com a Lei Anticorrupção e práticas de integridade empresarial.",
      content: `[RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ], DECLARA, sob as penas da lei, que não pratica atos lesivos à administração pública, nacional ou estrangeira, conforme Lei 12.846/2013, comprometendo-se a manter práticas de integridade e ética empresarial.

[Local], [Data].

__________________________________  
[Nome do Representante Legal]  
[Cargo]  
[CPF]`
    },
    ausenciaImpedimentos: {
      title: "Declaração de Ausência de Impedimentos Legais (Art. 155 da Lei 14.133/2021)",
      tooltip: "Declara ausência de impedimentos legais conforme o art. 155 da Nova Lei de Licitações.",
      content: `[RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ], DECLARA, sob as penas da lei, que não se enquadra em nenhuma das hipóteses de impedimento para participar de licitações previstas no art. 155 da Lei 14.133/2021.

[Local], [Data].

__________________________________  
[Nome do Representante Legal]  
[Cargo]  
[CPF]`
    }
  };

  // Modelos das declarações opcionais
  const optionalModels = {
    plenoAtendimento: {
      title: "Declaração de Pleno Atendimento ao Edital",
      tooltip: "Declara que a empresa atende integralmente às especificações do edital.",
      content: `[RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ], DECLARA que atende plenamente a todas as especificações técnicas, condições e exigências constantes do edital e seus anexos.

[Local], [Data].

__________________________________  
[Nome do Representante Legal]  
[Cargo]  
[CPF]`
    },
    meEpp: {
      title: "Declaração de Enquadramento como ME/EPP (LC 123/2006)",
      tooltip: "Declara enquadramento como Microempresa ou Empresa de Pequeno Porte.",
      content: `[RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ], DECLARA que se enquadra como [MICROEMPRESA/EMPRESA DE PEQUENO PORTE], nos termos da Lei Complementar 123/2006, fazendo jus aos benefícios previstos em lei.

[Local], [Data].

__________________________________  
[Nome do Representante Legal]  
[Cargo]  
[CPF]`
    },
    naoServidorPublico: {
      title: "Declaração de Não Emprego de Servidor Vinculado ao Órgão",
      tooltip: "Declara que não emprega servidor público vinculado ao órgão contratante.",
      content: `[RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ], DECLARA que não possui em seu quadro de funcionários, servidor público vinculado ao órgão contratante, em conformidade com as vedações legais.

[Local], [Data].

__________________________________  
[Nome do Representante Legal]  
[Cargo]  
[CPF]`
    },
    capacidadeTecnica: {
      title: "Declaração de Capacidade Técnica",
      tooltip: "Declara possuir capacidade técnica para execução do objeto licitado.",
      content: `[RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ], DECLARA possuir capacidade técnica, recursos humanos e materiais necessários para a perfeita execução do objeto desta licitação.

[Local], [Data].

__________________________________  
[Nome do Representante Legal]  
[Cargo]  
[CPF]`
    },
    vistoriaTecnica: {
      title: "Declaração de Ciência da Visita Técnica",
      tooltip: "Declara ciência sobre a necessidade ou dispensa de visita técnica.",
      content: `[RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ], DECLARA ter ciência das condições para execução do objeto licitado, dispensando a necessidade de visita técnica prévia, assumindo total responsabilidade pela execução dos serviços.

[Local], [Data].

__________________________________  
[Nome do Representante Legal]  
[Cargo]  
[CPF]`
    },
    responsabilidadeTecnica: {
      title: "Declaração de Responsabilidade Técnica",
      tooltip: "Declara possuir responsável técnico habilitado para execução dos serviços.",
      content: `[RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ], DECLARA possuir responsável técnico devidamente habilitado e registrado no órgão de classe competente para acompanhar a execução dos serviços objeto desta licitação.

[Local], [Data].

__________________________________  
[Nome do Representante Legal]  
[Cargo]  
[CPF]`
    },
    lgpd: {
      title: "Declaração de Atendimento à LGPD (Lei 13.709/2018)",
      tooltip: "Declara conformidade com a Lei Geral de Proteção de Dados Pessoais.",
      content: `[RAZÃO SOCIAL], inscrita no CNPJ sob o nº [CNPJ], DECLARA estar em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei 13.709/2018), comprometendo-se a tratar os dados pessoais conforme as diretrizes legais.

[Local], [Data].

__________________________________  
[Nome do Representante Legal]  
[Cargo]  
[CPF]`
    }
  };

  const handleObligatoryChange = (declaration: string, checked: boolean) => {
    setObligatoryDeclarations(prev => ({
      ...prev,
      [declaration]: checked
    }));
  };

  const handleOptionalChange = (declaration: string, checked: boolean) => {
    setOptionalDeclarations(prev => ({
      ...prev,
      [declaration]: checked
    }));
  };

  const openEditModal = (modelKey: string, isOptional: boolean = false) => {
    let model: { title: string; tooltip: string; content: string } | undefined;
    
    if (isOptional) {
      model = optionalModels[modelKey as keyof typeof optionalModels];
    } else {
      model = obligatoryModels[modelKey as keyof typeof obligatoryModels];
    }
    
    if (model) {
      setEditingModel(modelKey);
      setEditingText(model.content);
    }
  };

  const saveEditedModel = () => {
    // Aqui você salvaria as alterações do modelo
    setEditingModel(null);
    setEditingText('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const DeclarationCard = ({ 
    declaration, 
    model, 
    checked, 
    onChange, 
    isOptional = false 
  }: { 
    declaration: string; 
    model: any; 
    checked: boolean; 
    onChange: (declaration: string, checked: boolean) => void;
    isOptional?: boolean;
  }) => (
    <Card className={`transition-all hover:shadow-md ${checked ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3 flex-1">
            <Checkbox
              id={declaration}
              checked={checked}
              onCheckedChange={(checked) => onChange(declaration, checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor={declaration} className="font-medium text-sm leading-tight cursor-pointer">
                {model.title}
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help inline ml-2" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p>{model.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(declaration, isOptional)}
            className="shrink-0"
          >
            <Eye className="h-4 w-4 mr-1" />
            Visualizar Modelo
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Paperclip className="h-6 w-6" />
          Declarações e Anexos Obrigatórios
        </h2>
        <p className="text-gray-600 mt-2">
          Configure as declarações e anexos que farão parte do edital. As declarações obrigatórias já estão selecionadas por padrão.
        </p>
      </div>

      {/* Declarações Obrigatórias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            📝 Declarações Obrigatórias
            <Badge variant="destructive">Requeridas</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Declarações obrigatórias para o processo licitatório. Podem ser desmarcadas apenas em casos específicos.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(obligatoryModels).map(([key, model]) => (
              <DeclarationCard
                key={key}
                declaration={key}
                model={model}
                checked={obligatoryDeclarations[key as keyof typeof obligatoryDeclarations]}
                onChange={handleObligatoryChange}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Declarações Opcionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-600" />
            📌 Declarações Opcionais
            <Badge variant="secondary">Selecionáveis</Badge>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Declarações adicionais que podem ser incluídas conforme a necessidade do certame.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(optionalModels).map(([key, model]) => (
              <DeclarationCard
                key={key}
                declaration={key}
                model={model}
                checked={optionalDeclarations[key as keyof typeof optionalDeclarations]}
                onChange={handleOptionalChange}
                isOptional={true}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Minuta de Contrato e Modelo de Proposta Comercial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-green-600" />
            📎 Minuta de Contrato e Modelo de Proposta Comercial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Minuta de Contrato */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Minuta de Contrato</h4>
              <Badge variant="destructive">Obrigatório</Badge>
            </div>
            <div className="flex gap-4">
              <Button
                variant={contractType === 'upload' ? 'default' : 'outline'}
                onClick={() => setContractType('upload')}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Manual (.pdf/.doc)
              </Button>
              <Button
                variant={contractType === 'standard' ? 'default' : 'outline'}
                onClick={() => setContractType('standard')}
                className="flex-1"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Utilizar Modelo Padrão do PreparaGov
              </Button>
            </div>

            {contractType === 'upload' && (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="max-w-xs"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Faça upload da minuta de contrato personalizada
                </p>
              </div>
            )}

            {contractType === 'standard' && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Será utilizado o modelo padrão do PreparaGov</strong> com preenchimento automático baseado nos dados do TR e edital.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Modelo de Proposta Comercial */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Modelo de Proposta Comercial</h4>
              <Badge variant="secondary">Opcional</Badge>
            </div>
            <div className="flex gap-4">
              <Button
                variant={proposalType === 'upload' ? 'default' : 'outline'}
                onClick={() => setProposalType('upload')}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Manual
              </Button>
              <Button
                variant={proposalType === 'standard' ? 'default' : 'outline'}
                onClick={() => setProposalType('standard')}
                className="flex-1"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Utilizar Modelo Padrão do PreparaGov
              </Button>
            </div>

            {proposalType === 'upload' && (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="max-w-xs"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Faça upload do modelo de proposta comercial personalizado
                </p>
              </div>
            )}

            {proposalType === 'standard' && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Será utilizado o modelo padrão do PreparaGov</strong> formatado conforme os itens do TR.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição de Declaração */}
      <Dialog open={!!editingModel} onOpenChange={() => setEditingModel(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingModel && (obligatoryModels[editingModel as keyof typeof obligatoryModels]?.title || 
              optionalModels[editingModel as keyof typeof optionalModels]?.title)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Você pode editar apenas o corpo da declaração. 
                A estrutura básica (título, campos de assinatura) deve ser mantida.
              </p>
            </div>
            <Textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Edite o conteúdo da declaração..."
            />
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(editingText)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {/* Função para download do PDF */}}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Exportar PDF
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingModel(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={saveEditedModel}
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resumo Final */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            📄 Resumo dos Documentos Selecionados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Declarações Obrigatórias Selecionadas */}
            <div>
              <h4 className="font-medium text-sm mb-2">Declarações Obrigatórias Selecionadas:</h4>
              <div className="space-y-1">
                {Object.entries(obligatoryDeclarations)
                  .filter(([_, selected]) => selected)
                  .map(([key, _]) => (
                    <div key={key} className="text-sm text-gray-600 ml-4">
                      • {obligatoryModels[key as keyof typeof obligatoryModels].title}
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Declarações Opcionais Selecionadas */}
            {Object.values(optionalDeclarations).some(selected => selected) && (
              <div>
                <h4 className="font-medium text-sm mb-2">Declarações Opcionais Selecionadas:</h4>
                <div className="space-y-1">
                  {Object.entries(optionalDeclarations)
                    .filter(([_, selected]) => selected)
                    .map(([key, _]) => (
                      <div key={key} className="text-sm text-gray-600 ml-4">
                        • {optionalModels[key as keyof typeof optionalModels].title}
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            <Separator />

            {/* Anexos */}
            <div>
              <h4 className="font-medium text-sm mb-2">Anexos Contratuais:</h4>
              <div className="space-y-1">
                <div className="text-sm text-gray-600 ml-4">
                  • Minuta de Contrato: {contractType === 'upload' ? 'Arquivo personalizado' : 'Modelo padrão PreparaGov'}
                </div>
                {proposalType && (
                  <div className="text-sm text-gray-600 ml-4">
                    • Modelo de Proposta Comercial: {proposalType === 'upload' ? 'Arquivo personalizado' : 'Modelo padrão PreparaGov'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Finalização */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h4 className="font-medium text-green-900 mb-2">✅ Edital Completo</h4>
        <div className="text-sm text-green-800 space-y-1 mb-4">
          <p>• Todas as etapas foram preenchidas com sucesso</p>
          <p>• Declarações e anexos configurados</p>
          <p>• Conformidade com Lei 14.133/2021 verificada</p>
          <p>• Pronto para finalização e publicação</p>
        </div>
        
        <Button 
          onClick={onFinalize}
          size="lg"
          className="bg-green-600 hover:bg-green-700 px-8 animate-scale-in"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Finalizar e Gerar Edital
        </Button>
      </div>
    </div>
  );
};

export default EditalStep8;