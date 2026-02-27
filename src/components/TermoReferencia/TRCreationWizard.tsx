
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import {
  X,
  Save,
  Sparkles,
  FileText,
  Building,
  DollarSign,
  Calendar,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Package,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Info,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { termoReferenciaService } from '@/services/termoReferenciaService';
import { DbTermoReferencia } from '@/types/database';

interface TRCreationWizardProps {
  origin: 'cronograma' | 'dfds-livres' | 'itens-especificos';
  selectedData: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

interface GestorFiscal {
  nome: string;
  cargo: string;
  matricula: string;
}

interface FormData {
  // Etapa 1 - Identificação
  numero: string;
  origem: string;
  etpsSelecionados: string[];

  // Etapa 2 - Objeto e Natureza
  objeto: string;
  naturezaObjeto: string;
  naturezaOutra: string;

  // Etapa 3 - Modalidade e Registro de Preços
  modalidade: string;
  justificativaLegal: string;
  artigoLegal: string;
  sistemaRegistroPrecos: boolean;
  justificativaRegistroPrecos: string;
  justificativaComplementar: string;

  // Etapa 4 - Tratamento Diferenciado
  tratamentoMEEPP: string;
  participacaoConsorcio: boolean;
  justificativaConsorcio: string;
  participacaoCooperativas: boolean;
  subcontratacao: boolean;
  detalhesSubcontratacao: string;

  // Etapa 5 - Vistoria e Amostras
  vistoriaTecnica: string;
  justificativaVistoria: string;
  unidadeResponsavelVistoria: string;
  contatoVistoria: string;
  amostrasExigidas: boolean;
  prazoAmostras: string;
  unidadeTecnicaAmostras: string;
  localAmostras: string;

  // Etapa 6 - Documentação
  habilitacaoJuridica: string[];
  habilitacaoFiscal: string[];
  qualificacaoEconomica: string[];
  qualificacaoTecnica: string[];
  documentosAdicionais: string;

  // Etapa 7 - Condições de Execução
  prazoEntrega: string;
  ordemFornecimento: string;
  enderecoEntrega: string;
  garantiaProduto: boolean;
  condicoesGarantia: string;
  fornecimentoContinuo: boolean;
  justificativaFornecimento: string;

  // Etapa 8 - Vigência e Pagamento
  prazoVigencia: string;
  prazoSubstituicao: string;
  prazoRecebimento: string;
  prazoLiquidacao: string;
  prazoPagamento: string;

  // Etapa 9 - Gestão e Fiscalização
  gestores: GestorFiscal[];
  fiscais: GestorFiscal[];

  // Etapa 10 - Itens e Valor
  mostrarValores: boolean;
  observacoes: string;
}

const generateTRNumber = () => {
  const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TR-${sequence}`;
};

const mapDFDTypeToNatureza = (tipo: string): string => {
  if (!tipo) return 'materiais-consumo';

  const tipoLower = tipo.toLowerCase();

  if (tipoLower.includes('consumo')) return 'materiais-consumo';
  if (tipoLower.includes('permanente') || tipoLower.includes('equipamento')) return 'materiais-permanentes';
  if (tipoLower.includes('continuado') && !tipoLower.includes('não')) return 'servico-continuado';
  if (tipoLower.includes('não continuado')) return 'servico-nao-continuado';
  if (tipoLower.includes('engenharia') || tipoLower.includes('obra')) return 'servico-engenharia';
  if (tipoLower.includes('aditivo')) return 'termo-aditivo';

  return 'materiais-consumo';
};

const TRCreationWizard = ({ origin, selectedData, onClose, onSave }: TRCreationWizardProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    // Etapa 1
    numero: generateTRNumber(),
    origem: origin,
    etpsSelecionados: [],

    // Etapa 2
    objeto: '',
    naturezaObjeto: '',
    naturezaOutra: '',

    // Etapa 3
    modalidade: '',
    justificativaLegal: '',
    artigoLegal: '',
    sistemaRegistroPrecos: false,
    justificativaRegistroPrecos: '',
    justificativaComplementar: '',

    // Etapa 4
    tratamentoMEEPP: '',
    participacaoConsorcio: false,
    justificativaConsorcio: '',
    participacaoCooperativas: false,
    subcontratacao: false,
    detalhesSubcontratacao: '',

    // Etapa 5
    vistoriaTecnica: 'nao',
    justificativaVistoria: '',
    unidadeResponsavelVistoria: '',
    contatoVistoria: '',
    amostrasExigidas: false,
    prazoAmostras: '',
    unidadeTecnicaAmostras: '',
    localAmostras: '',

    // Etapa 6
    habilitacaoJuridica: [],
    habilitacaoFiscal: [],
    qualificacaoEconomica: [],
    qualificacaoTecnica: [],
    documentosAdicionais: '',

    // Etapa 7
    prazoEntrega: '30',
    ordemFornecimento: 'unica',
    enderecoEntrega: '',
    garantiaProduto: false,
    condicoesGarantia: '',
    fornecimentoContinuo: false,
    justificativaFornecimento: '',

    // Etapa 8
    prazoVigencia: '12',
    prazoSubstituicao: '5',
    prazoRecebimento: '5',
    prazoLiquidacao: '5',
    prazoPagamento: '30',

    // Etapa 9
    gestores: [{ nome: '', cargo: '', matricula: '' }],
    fiscais: [{ nome: '', cargo: '', matricula: '' }],

    // Etapa 10
    mostrarValores: true,
    observacoes: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    const natureza = mapDFDTypeToNatureza(getOriginDescription());
    if (natureza && !formData.naturezaObjeto) {
      setFormData(prev => ({ ...prev, naturezaObjeto: natureza }));
    }
  }, [selectedData, origin]);

  const steps = [
    { title: 'Identificação e Origem', icon: <FileText size={16} /> },
    { title: 'Objeto e Natureza', icon: <Package size={16} /> },
    { title: 'Modalidade e Registro', icon: <Building size={16} /> },
    { title: 'Tratamento Diferenciado', icon: <CheckCircle size={16} /> },
    { title: 'Vistoria e Amostras', icon: <Eye size={16} /> },
    { title: 'Documentação Exigida', icon: <FileText size={16} /> },
    { title: 'Condições de Execução', icon: <Calendar size={16} /> },
    { title: 'Vigência e Pagamento', icon: <DollarSign size={16} /> },
    { title: 'Gestão e Fiscalização', icon: <Building size={16} /> },
    { title: 'Itens e Valor Estimado', icon: <Package size={16} /> }
  ];

  const documentationData = {
    habilitacaoJuridica: [
      { id: 'pessoa-fisica', label: 'Pessoa física', tooltip: 'Cédula de identidade (RG) ou equivalente válido nacionalmente.' },
      { id: 'empresario-individual', label: 'Empresário individual', tooltip: 'Inscrição no Registro Público de Empresas Mercantis (Junta Comercial).' },
      { id: 'mei', label: 'Microempreendedor Individual (MEI)', tooltip: 'Certificado de Condição de Microempreendedor Individual (CCMEI).' },
      { id: 'sociedade-empresaria', label: 'Sociedade empresária / SLU / EIRELI', tooltip: 'Contrato social ou estatuto registrado na Junta Comercial + comprovação dos administradores.' },
      { id: 'sociedade-estrangeira', label: 'Sociedade empresária estrangeira', tooltip: 'Portaria de autorização de funcionamento no Brasil, publicada no DOU.' },
      { id: 'sociedade-simples', label: 'Sociedade simples', tooltip: 'Ato constitutivo registrado no Registro Civil das Pessoas Jurídicas + administradores.' },
      { id: 'filial-sucursal', label: 'Filial / sucursal / agência', tooltip: 'Ato constitutivo da matriz e da filial com averbações nos respectivos registros.' },
      { id: 'sociedade-cooperativa', label: 'Sociedade cooperativa', tooltip: 'Estatuto social + ata de fundação + registro na Junta Comercial e no órgão competente.' },
      { id: 'agricultor-familiar', label: 'Agricultor familiar', tooltip: 'DAP válida ou outro documento reconhecido pela Secretaria de Agricultura Familiar.' },
      { id: 'produtor-rural', label: 'Produtor rural', tooltip: 'Matrícula no Cadastro Específico do INSS – CEI.' }
    ],
    habilitacaoFiscal: [
      { id: 'cnpj-cpf', label: 'CNPJ ou CPF', tooltip: 'Prova de inscrição no Cadastro Nacional de Pessoas Jurídicas ou Físicas.' },
      { id: 'regularidade-fiscal-federal', label: 'Regularidade fiscal federal', tooltip: 'Certidão conjunta da Receita Federal e da PGFN.' },
      { id: 'regularidade-fgts', label: 'Regularidade com o FGTS', tooltip: 'Certidão de regularidade do FGTS emitida pela Caixa.' },
      { id: 'regularidade-trabalhista', label: 'Regularidade trabalhista', tooltip: 'Certidão de débitos trabalhistas (CNDT).' },
      { id: 'cadastro-contribuintes', label: 'Cadastro de contribuintes municipal/estadual', tooltip: 'Prova de inscrição no cadastro do domicílio da empresa.' },
      { id: 'regularidade-fiscal-local', label: 'Regularidade fiscal municipal/estadual', tooltip: 'Certidão de regularidade fiscal com a Fazenda local.' }
    ],
    qualificacaoEconomica: [
      { id: 'certidao-insolvencia', label: 'Certidão negativa de insolvência civil (pessoa física/sociedade simples)', tooltip: 'Emitida pelo distribuidor da comarca do domicílio ou sede do licitante.' },
      { id: 'certidao-falencia', label: 'Certidão negativa de falência', tooltip: 'Emitida pelo distribuidor da sede da empresa.' },
      { id: 'indices-financeiros', label: 'Índices financeiros (LG, SG, LC)', tooltip: 'Demonstrações contábeis dos 2 últimos exercícios com índices superiores a 1.' }
    ],
    qualificacaoTecnica: [
      { id: 'registro-profissional', label: 'Registro na entidade profissional competente', tooltip: 'Comprovação de regularidade no conselho ou ordem da atividade fim.' },
      { id: 'atestado-capacidade', label: 'Atestado(s) de capacidade técnica', tooltip: 'Comprovação de experiência anterior compatível com o objeto da licitação.' },
      { id: 'relacao-cooperados', label: 'Relação de cooperados (quando aplicável)', tooltip: 'Lista dos cooperados que executarão o contrato, com comprovação de domicílio local.' },
      { id: 'declaracao-cooperados', label: 'Declaração de regularidade dos cooperados (DRSCI)', tooltip: 'Uma para cada cooperado indicado.' },
      { id: 'capital-social-cooperativa', label: 'Comprovação do capital social proporcional (cooperativas)', tooltip: 'Com base na quantidade de cooperados necessários ao serviço.' },
      { id: 'documentacao-cooperativa', label: 'Documentação jurídica da cooperativa', tooltip: 'Ata de fundação, estatuto, assembleias, fundos e registros de presença.' },
      { id: 'auditoria-cooperativa', label: 'Última auditoria contábil-financeira (ou declaração de isenção)', tooltip: 'Conforme art. 112 da Lei 5.764/1971.' }
    ]
  };

  const artigosLegais = [
    { value: 'art-74-i', label: 'Art. 74, inciso I - Situação de emergência ou calamidade pública' },
    { value: 'art-74-ii', label: 'Art. 74, inciso II - Para atender a situação de urgência' },
    { value: 'art-74-iii', label: 'Art. 74, inciso III - Quando não acudirem interessados à licitação anterior' },
    { value: 'art-75-i', label: 'Art. 75, inciso I - Compras até R$ 50.000,00' },
    { value: 'art-75-ii', label: 'Art. 75, inciso II - Serviços e obras de engenharia até R$ 100.000,00' },
    { value: 'art-25-i', label: 'Art. 25, inciso I - Fornecedor exclusivo' },
    { value: 'art-25-ii', label: 'Art. 25, inciso II - Serviços técnicos especializados' }
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof FormData, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleGestorFiscalChange = (type: 'gestores' | 'fiscais', index: number, field: keyof GestorFiscal, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addGestorFiscal = (type: 'gestores' | 'fiscais') => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { nome: '', cargo: '', matricula: '' }]
    }));
  };

  const removeGestorFiscal = (type: 'gestores' | 'fiscais', index: number) => {
    if (formData[type].length > 1) {
      setFormData(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }));
    }
  };

  const generateWithAI = (field: keyof FormData) => {
    const aiContent: Record<string, string> = {
      objeto: `Contratação de empresa especializada para fornecimento de ${getOriginDescription()}, conforme especificações técnicas estabelecidas.`,
      justificativaVistoria: 'Vistoria técnica necessária para verificação das condições locais e adequação técnica.',
      justificativaFornecimento: 'Fornecimento contínuo justificado pela natureza do objeto e necessidade de continuidade dos serviços.',
      justificativaComplementar: 'Sistema de Registro de Preços justificado pela natureza do objeto e necessidade de contratações múltiplas ao longo do período.',
      justificativaConsorcio: 'A participação em consórcio não é recomendada tendo em vista a natureza e complexidade do objeto, que pode ser executado por uma única empresa.',
      detalhesSubcontratacao: 'A subcontratação será permitida até o limite de 30% do valor total do contrato, mediante prévia autorização da Administração.',
      condicoesGarantia: 'Garantia mínima de 12 meses contra defeitos de fabricação e funcionamento.',
      enderecoEntrega: 'Endereço da secretaria solicitante conforme especificado.',
      documentosAdicionais: 'Documentos complementares conforme natureza específica do objeto.',
      observacoes: 'Observações adicionais sobre a execução do contrato.'
    };

    if (aiContent[field]) {
      handleInputChange(field, aiContent[field]);
      toast({
        title: "Campo preenchido com IA",
        description: "Conteúdo gerado automaticamente.",
      });
    }
  };

  const getOriginDescription = () => {
    if (origin === 'cronograma' && selectedData) {
      return (selectedData.tipo_dfd || selectedData.tipoDFD || 'materiais').toLowerCase();
    } else if (origin === 'dfds-livres' && Array.isArray(selectedData)) {
      const tipos = [...new Set(selectedData.map(dfd => dfd.tipo_dfd || dfd.tipoDFD))].filter(Boolean);
      return tipos.length > 0 ? tipos.join(', ').toLowerCase() : 'materiais';
    } else if (origin === 'itens-especificos' && Array.isArray(selectedData)) {
      return 'itens específicos selecionados';
    }
    return 'materiais';
  };

  const calculateTotalValue = () => {
    if (origin === 'cronograma' && selectedData) {
      const val = selectedData.valor_estimado_total || selectedData.valorTotal;
      if (typeof val === 'number') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
      return val || 'R$ 0,00';
    } else if (origin === 'dfds-livres' && Array.isArray(selectedData)) {
      const total = selectedData.reduce((sum, dfd) => {
        const val = dfd.valor_estimado_total || dfd.valorTotal;
        if (typeof val === 'number') return sum + val;
        const stringVal = (val || '0').toString().replace(/[^\d,]/g, '').replace(',', '.');
        const numericVal = parseFloat(stringVal) || 0;
        return sum + numericVal;
      }, 0);
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);
    } else if (origin === 'itens-especificos' && Array.isArray(selectedData)) {
      const total = selectedData.reduce((sum, item) => {
        const val = item.valor_total || item.valorEstimado;
        if (typeof val === 'number') return sum + val;
        const stringVal = (val || '0').toString().replace(/[^\d,]/g, '').replace(',', '.');
        const numericVal = parseFloat(stringVal) || 0;
        return sum + numericVal;
      }, 0);
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);
    }
    return 'R$ 0,00';
  };

  const getSelectedItems = () => {
    if (origin === 'itens-especificos' && Array.isArray(selectedData)) {
      return selectedData;
    }
    return [];
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const valorEstimado = parseFloat(calculateTotalValue().replace(/[^\d,]/g, '').replace(',', '.')) || 0;

      const trData: Omit<DbTermoReferencia, 'id' | 'created_at' | 'updated_at'> = {
        numero_tr: formData.numero,
        etp_id: null, // Pode ser preenchido se vier de um ETP
        objeto: formData.objeto,
        status: 'Em Elaboração',
        tipo: formData.naturezaObjeto,
        valor_estimado: valorEstimado,
        secretaria_id: user?.secretaria_id || null,
        prefeitura_id: user?.prefeituraId || null,
        dados_json: formData,
        created_by: user?.id || null,
      };

      const result = await termoReferenciaService.createTermoReferencia(trData);
      onSave(result);
    } catch (error) {
      console.error('Erro ao salvar TR:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o rascunho do TR.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    try {
      setLoading(true);
      const valorEstimado = parseFloat(calculateTotalValue().replace(/[^\d,]/g, '').replace(',', '.')) || 0;

      const trData: Omit<DbTermoReferencia, 'id' | 'created_at' | 'updated_at'> = {
        numero_tr: formData.numero,
        etp_id: null,
        objeto: formData.objeto,
        status: 'Concluído',
        tipo: formData.naturezaObjeto,
        valor_estimado: valorEstimado,
        secretaria_id: user?.secretaria_id || null,
        prefeitura_id: user?.prefeituraId || null,
        dados_json: formData,
        created_by: user?.id || null,
      };

      const result = await termoReferenciaService.createTermoReferencia(trData);
      onSave(result);
    } catch (error) {
      console.error('Erro ao finalizar TR:', error);
      toast({
        title: "Erro ao finalizar",
        description: "Não foi possível finalizar o TR.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSecretariaInfo = () => {
    if (origin === 'cronograma' && selectedData?.secretariasNomes) {
      return selectedData.secretariasNomes[0];
    } else if (origin === 'dfds-livres' && Array.isArray(selectedData)) {
      const secretarias = [...new Set(selectedData.map(dfd => dfd.area_requisitante || dfd.secretaria))].filter(Boolean);
      return secretarias.join(', ') || 'Não informada';
    } else if (origin === 'itens-especificos' && Array.isArray(selectedData)) {
      const secretarias = [...new Set(selectedData.map(item => item.dfdSecretaria))].filter(Boolean);
      return secretarias.join(', ') || 'Não informada';
    }
    return 'Secretaria';
  };

  const getDFDCount = () => {
    if (origin === 'cronograma' && selectedData?.dfdIds) {
      return selectedData.dfdIds.length;
    } else if (origin === 'dfds-livres' && Array.isArray(selectedData)) {
      return selectedData.length;
    } else if (origin === 'itens-especificos' && Array.isArray(selectedData)) {
      return [...new Set(selectedData.map(item => item.dfdNumero))].length;
    }
    return 0;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Etapa 1: Identificação e Origem
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número do TR</Label>
                <Input
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Origem</Label>
                <Input
                  value={origin === 'cronograma' ? 'Cronograma de Licitações' :
                    origin === 'dfds-livres' ? 'DFDs Livres' : 'Itens Específicos'}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Dados da Origem Selecionada</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {origin === 'cronograma' && selectedData && (
                  <>
                    <div><strong>Tipo:</strong> {selectedData.tipoDFD}</div>
                    <div><strong>Secretarias:</strong> {selectedData.secretariasNomes?.join(', ')}</div>
                    <div><strong>Valor Total:</strong> {selectedData.valorTotal}</div>
                    <div><strong>DFDs Vinculados:</strong> {selectedData.dfdIds?.length || 0}</div>
                  </>
                )}
                {origin === 'dfds-livres' && Array.isArray(selectedData) && (
                  <>
                    <div><strong>DFDs Selecionados:</strong> {selectedData.length}</div>
                    <div><strong>Secretarias:</strong> {[...new Set(selectedData.map(dfd => dfd.secretaria))].join(', ')}</div>
                    <div><strong>Valor Total:</strong> {calculateTotalValue()}</div>
                  </>
                )}
                {origin === 'itens-especificos' && Array.isArray(selectedData) && (
                  <>
                    <div><strong>Itens Selecionados:</strong> {selectedData.length}</div>
                    <div><strong>DFDs Envolvidos:</strong> {[...new Set(selectedData.map(item => item.dfdNumero))].length}</div>
                    <div><strong>Valor Total:</strong> {calculateTotalValue()}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 1: // Etapa 2: Objeto e Natureza
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Objeto da Contratação *</Label>
                <Button size="sm" variant="outline" onClick={() => generateWithAI('objeto')}>
                  <Sparkles size={14} className="mr-1" />
                  IA
                </Button>
              </div>
              <Textarea
                value={formData.objeto}
                onChange={(e) => handleInputChange('objeto', e.target.value)}
                rows={4}
                placeholder="Descreva o objeto da contratação de forma precisa, suficiente e clara..."
              />
            </div>

            <div className="space-y-2">
              <Label>Natureza do Objeto *</Label>
              <Select value={formData.naturezaObjeto} onValueChange={(value) => handleInputChange('naturezaObjeto', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a natureza do objeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="materiais-consumo">Materiais de Consumo</SelectItem>
                  <SelectItem value="materiais-permanentes">Materiais Permanentes</SelectItem>
                  <SelectItem value="servico-continuado">Serviço Continuado</SelectItem>
                  <SelectItem value="servico-nao-continuado">Serviço Não Continuado</SelectItem>
                  <SelectItem value="servico-engenharia">Serviço de Engenharia</SelectItem>
                  <SelectItem value="termo-aditivo">Termo Aditivo</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.naturezaObjeto === 'outro' && (
              <div className="space-y-2">
                <Label>Especifique a Natureza *</Label>
                <Input
                  value={formData.naturezaOutra}
                  onChange={(e) => handleInputChange('naturezaOutra', e.target.value)}
                  placeholder="Descreva a natureza do objeto..."
                />
              </div>
            )}
          </div>
        );

      case 2: // Etapa 3: Modalidade e Registro de Preços
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Modalidade de Licitação *</Label>
              <Select value={formData.modalidade} onValueChange={(value) => handleInputChange('modalidade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dispensa">Dispensa</SelectItem>
                  <SelectItem value="inexigibilidade">Inexigibilidade</SelectItem>
                  <SelectItem value="pregao">Pregão</SelectItem>
                  <SelectItem value="concorrencia">Concorrência</SelectItem>
                  <SelectItem value="concurso">Concurso</SelectItem>
                  <SelectItem value="leilao">Leilão</SelectItem>
                  <SelectItem value="dialogo-competitivo">Diálogo Competitivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.modalidade === 'dispensa' || formData.modalidade === 'inexigibilidade') && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Artigo Legal da Lei 14.133/2021 *</Label>
                  <Select value={formData.artigoLegal} onValueChange={(value) => handleInputChange('artigoLegal', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o artigo legal aplicável" />
                    </SelectTrigger>
                    <SelectContent>
                      {artigosLegais.map((artigo) => (
                        <SelectItem key={artigo.value} value={artigo.value}>
                          {artigo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Justificativa Legal *</Label>
                    <Button size="sm" variant="outline" onClick={() => generateWithAI('justificativaLegal')}>
                      <Sparkles size={14} className="mr-1" />
                      IA
                    </Button>
                  </div>
                  <Textarea
                    value={formData.justificativaLegal}
                    onChange={(e) => handleInputChange('justificativaLegal', e.target.value)}
                    rows={4}
                    placeholder="Justifique a aplicação do artigo legal selecionado..."
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="registro-precos"
                  checked={formData.sistemaRegistroPrecos}
                  onCheckedChange={(checked) => handleInputChange('sistemaRegistroPrecos', checked)}
                />
                <Label htmlFor="registro-precos">Adotará Sistema de Registro de Preços (SRP)?</Label>
              </div>

              {formData.sistemaRegistroPrecos && (
                <div className="space-y-4 ml-6">
                  <div className="space-y-2">
                    <Label>Justificativa para SRP *</Label>
                    <Select value={formData.justificativaRegistroPrecos} onValueChange={(value) => handleInputChange('justificativaRegistroPrecos', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a justificativa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contratacoes-frequentes">Contratações frequentes</SelectItem>
                        <SelectItem value="multiplos-orgaos">Atende múltiplos órgãos</SelectItem>
                        <SelectItem value="quantidade-indeterminada">Não é possível prever quantidade exata</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Justificativa Complementar</Label>
                      <Button size="sm" variant="outline" onClick={() => generateWithAI('justificativaComplementar')}>
                        <Sparkles size={14} className="mr-1" />
                        IA
                      </Button>
                    </div>
                    <Textarea
                      value={formData.justificativaComplementar}
                      onChange={(e) => handleInputChange('justificativaComplementar', e.target.value)}
                      rows={3}
                      placeholder="Justificativa adicional para o Sistema de Registro de Preços..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3: // Etapa 4: Tratamento Diferenciado e Participação
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Tratamento Diferenciado ME/EPP *</Label>
              <Select value={formData.tratamentoMEEPP} onValueChange={(value) => handleInputChange('tratamentoMEEPP', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tratamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exclusiva">Participação exclusiva para ME/EPP</SelectItem>
                  <SelectItem value="cota-reservada">Cota reservada para ME/EPP</SelectItem>
                  <SelectItem value="nao-aplicado">Não será aplicado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="participacao-consorcio"
                  checked={formData.participacaoConsorcio}
                  onCheckedChange={(checked) => handleInputChange('participacaoConsorcio', checked)}
                />
                <Label htmlFor="participacao-consorcio">Participação em consórcio permitida?</Label>
              </div>

              {!formData.participacaoConsorcio && (
                <div className="space-y-2 ml-6">
                  <div className="flex items-center justify-between">
                    <Label>Justificativa para não permitir consórcio</Label>
                    <Button size="sm" variant="outline" onClick={() => generateWithAI('justificativaConsorcio')}>
                      <Sparkles size={14} className="mr-1" />
                      IA
                    </Button>
                  </div>
                  <Textarea
                    value={formData.justificativaConsorcio}
                    onChange={(e) => handleInputChange('justificativaConsorcio', e.target.value)}
                    rows={2}
                    placeholder="Justifique por que não será permitida a participação em consórcio..."
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="participacao-cooperativas"
                checked={formData.participacaoCooperativas}
                onCheckedChange={(checked) => handleInputChange('participacaoCooperativas', checked)}
              />
              <Label htmlFor="participacao-cooperativas">Participação de cooperativas permitida?</Label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subcontratacao"
                  checked={formData.subcontratacao}
                  onCheckedChange={(checked) => handleInputChange('subcontratacao', checked)}
                />
                <Label htmlFor="subcontratacao">Subcontratação permitida?</Label>
              </div>

              {formData.subcontratacao && (
                <div className="space-y-2 ml-6">
                  <div className="flex items-center justify-between">
                    <Label>Detalhes da subcontratação</Label>
                    <Button size="sm" variant="outline" onClick={() => generateWithAI('detalhesSubcontratacao')}>
                      <Sparkles size={14} className="mr-1" />
                      IA
                    </Button>
                  </div>
                  <Textarea
                    value={formData.detalhesSubcontratacao}
                    onChange={(e) => handleInputChange('detalhesSubcontratacao', e.target.value)}
                    rows={2}
                    placeholder="Detalhe as condições para subcontratação..."
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 4: // Etapa 5: Vistoria Técnica e Amostras
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Vistoria Técnica</Label>
              <Select value={formData.vistoriaTecnica} onValueChange={(value) => handleInputChange('vistoriaTecnica', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de vistoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao">Não</SelectItem>
                  <SelectItem value="facultativa">Facultativa</SelectItem>
                  <SelectItem value="obrigatoria">Obrigatória</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.vistoriaTecnica !== 'nao' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Justificativa para vistoria</Label>
                    <Button size="sm" variant="outline" onClick={() => generateWithAI('justificativaVistoria')}>
                      <Sparkles size={14} className="mr-1" />
                      IA
                    </Button>
                  </div>
                  <Textarea
                    value={formData.justificativaVistoria}
                    onChange={(e) => handleInputChange('justificativaVistoria', e.target.value)}
                    rows={3}
                    placeholder="Justifique a necessidade da vistoria técnica..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Unidade Responsável</Label>
                    <Input
                      value={formData.unidadeResponsavelVistoria}
                      onChange={(e) => handleInputChange('unidadeResponsavelVistoria', e.target.value)}
                      placeholder="Nome da unidade responsável"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone/E-mail para Agendamento</Label>
                    <Input
                      value={formData.contatoVistoria}
                      onChange={(e) => handleInputChange('contatoVistoria', e.target.value)}
                      placeholder="Contato para agendamento"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="amostras-exigidas"
                  checked={formData.amostrasExigidas}
                  onCheckedChange={(checked) => handleInputChange('amostrasExigidas', checked)}
                />
                <Label htmlFor="amostras-exigidas">Amostras ou provas de conceito serão exigidas?</Label>
              </div>

              {formData.amostrasExigidas && (
                <div className="space-y-4 ml-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prazo para apresentação</Label>
                      <Input
                        value={formData.prazoAmostras}
                        onChange={(e) => handleInputChange('prazoAmostras', e.target.value)}
                        placeholder="Ex: 5 dias úteis"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unidade técnica responsável</Label>
                      <Input
                        value={formData.unidadeTecnicaAmostras}
                        onChange={(e) => handleInputChange('unidadeTecnicaAmostras', e.target.value)}
                        placeholder="Unidade técnica"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Local de entrega/demonstração</Label>
                    <Input
                      value={formData.localAmostras}
                      onChange={(e) => handleInputChange('localAmostras', e.target.value)}
                      placeholder="Endereço para entrega das amostras"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 5: // Etapa 6: Documentação Exigida
        return (
          <TooltipProvider>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">📁 Habilitação Jurídica</h4>
                  <div className="space-y-3">
                    {documentationData.habilitacaoJuridica.map((doc) => (
                      <div key={doc.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={doc.id}
                          checked={formData.habilitacaoJuridica.includes(doc.id)}
                          onCheckedChange={(checked) => handleArrayChange('habilitacaoJuridica', doc.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex items-center space-x-1 flex-1">
                          <Label htmlFor={doc.id} className="text-sm leading-normal cursor-pointer">{doc.label}</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={14} className="text-gray-400 hover:text-gray-600 cursor-help flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">{doc.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-lg">📁 Habilitação Fiscal, Social e Trabalhista</h4>
                  <div className="space-y-3">
                    {documentationData.habilitacaoFiscal.map((doc) => (
                      <div key={doc.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={doc.id}
                          checked={formData.habilitacaoFiscal.includes(doc.id)}
                          onCheckedChange={(checked) => handleArrayChange('habilitacaoFiscal', doc.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex items-center space-x-1 flex-1">
                          <Label htmlFor={doc.id} className="text-sm leading-normal cursor-pointer">{doc.label}</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={14} className="text-gray-400 hover:text-gray-600 cursor-help flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">{doc.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-lg">📁 Qualificação Econômico-Financeira</h4>
                  <div className="space-y-3">
                    {documentationData.qualificacaoEconomica.map((doc) => (
                      <div key={doc.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={doc.id}
                          checked={formData.qualificacaoEconomica.includes(doc.id)}
                          onCheckedChange={(checked) => handleArrayChange('qualificacaoEconomica', doc.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex items-center space-x-1 flex-1">
                          <Label htmlFor={doc.id} className="text-sm leading-normal cursor-pointer">{doc.label}</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={14} className="text-gray-400 hover:text-gray-600 cursor-help flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">{doc.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-lg">📁 Qualificação Técnica</h4>
                  <div className="space-y-3">
                    {documentationData.qualificacaoTecnica.map((doc) => (
                      <div key={doc.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={doc.id}
                          checked={formData.qualificacaoTecnica.includes(doc.id)}
                          onCheckedChange={(checked) => handleArrayChange('qualificacaoTecnica', doc.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex items-center space-x-1 flex-1">
                          <Label htmlFor={doc.id} className="text-sm leading-normal cursor-pointer">{doc.label}</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info size={14} className="text-gray-400 hover:text-gray-600 cursor-help flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">{doc.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center space-x-1">
                  <Label className="font-medium">➕ Adicionar documentos complementares</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={14} className="text-gray-400 hover:text-gray-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">Caso a Administração queira exigir documentos adicionais.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  value={formData.documentosAdicionais}
                  onChange={(e) => handleInputChange('documentosAdicionais', e.target.value)}
                  rows={3}
                  placeholder="Descreva documentos adicionais específicos para este certame..."
                />
              </div>
            </div>
          </TooltipProvider>
        );

      case 6: // Etapa 7: Condições de Execução
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prazo de Entrega</Label>
                <Select value={formData.prazoEntrega} onValueChange={(value) => handleInputChange('prazoEntrega', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 dias</SelectItem>
                    <SelectItem value="10">10 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="20">20 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ordem de Fornecimento</Label>
                <Select value={formData.ordemFornecimento} onValueChange={(value) => handleInputChange('ordemFornecimento', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a ordem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unica">Remessa única</SelectItem>
                    <SelectItem value="demanda">Conforme demanda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Endereço de Entrega</Label>
                <Button size="sm" variant="outline" onClick={() => generateWithAI('enderecoEntrega')}>
                  <Sparkles size={14} className="mr-1" />
                  IA
                </Button>
              </div>
              <Textarea
                value={formData.enderecoEntrega}
                onChange={(e) => handleInputChange('enderecoEntrega', e.target.value)}
                rows={3}
                placeholder="Endereço completo de entrega..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="garantia-produto"
                  checked={formData.garantiaProduto}
                  onCheckedChange={(checked) => handleInputChange('garantiaProduto', checked)}
                />
                <Label htmlFor="garantia-produto">Garantia de produto/serviço exigida?</Label>
              </div>

              {formData.garantiaProduto && (
                <div className="space-y-2 ml-6">
                  <div className="flex items-center justify-between">
                    <Label>Condições de Garantia</Label>
                    <Button size="sm" variant="outline" onClick={() => generateWithAI('condicoesGarantia')}>
                      <Sparkles size={14} className="mr-1" />
                      IA
                    </Button>
                  </div>
                  <Textarea
                    value={formData.condicoesGarantia}
                    onChange={(e) => handleInputChange('condicoesGarantia', e.target.value)}
                    rows={3}
                    placeholder="Descreva as condições de garantia..."
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fornecimento-continuo"
                  checked={formData.fornecimentoContinuo}
                  onCheckedChange={(checked) => handleInputChange('fornecimentoContinuo', checked)}
                />
                <Label htmlFor="fornecimento-continuo">Fornecimento contínuo?</Label>
              </div>

              {formData.fornecimentoContinuo && (
                <div className="space-y-2 ml-6">
                  <div className="flex items-center justify-between">
                    <Label>Justificativa para fornecimento contínuo</Label>
                    <Button size="sm" variant="outline" onClick={() => generateWithAI('justificativaFornecimento')}>
                      <Sparkles size={14} className="mr-1" />
                      IA
                    </Button>
                  </div>
                  <Textarea
                    value={formData.justificativaFornecimento}
                    onChange={(e) => handleInputChange('justificativaFornecimento', e.target.value)}
                    rows={3}
                    placeholder="Justifique a necessidade de fornecimento contínuo..."
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 7: // Etapa 8: Vigência e Pagamento
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prazo de Vigência do Contrato</Label>
                <Select value={formData.prazoVigencia} onValueChange={(value) => handleInputChange('prazoVigencia', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 mês</SelectItem>
                    <SelectItem value="3">3 meses</SelectItem>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                    <SelectItem value="24">24 meses</SelectItem>
                    <SelectItem value="36">36 meses</SelectItem>
                    <SelectItem value="48">48 meses</SelectItem>
                    <SelectItem value="60">60 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prazo de Substituição de Itens</Label>
                <Select value={formData.prazoSubstituicao} onValueChange={(value) => handleInputChange('prazoSubstituicao', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 dias</SelectItem>
                    <SelectItem value="10">10 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="20">20 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Prazo para Recebimento Definitivo</Label>
                <Select value={formData.prazoRecebimento} onValueChange={(value) => handleInputChange('prazoRecebimento', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 dias</SelectItem>
                    <SelectItem value="10">10 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="20">20 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prazo de Liquidação</Label>
                <Select value={formData.prazoLiquidacao} onValueChange={(value) => handleInputChange('prazoLiquidacao', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 dias</SelectItem>
                    <SelectItem value="10">10 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="20">20 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prazo de Pagamento após emissão de NFe</Label>
                <Select value={formData.prazoPagamento} onValueChange={(value) => handleInputChange('prazoPagamento', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="antecipado">Pagamento antecipado</SelectItem>
                    <SelectItem value="5">5 dias</SelectItem>
                    <SelectItem value="10">10 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="20">20 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 8: // Etapa 9: Gestão e Fiscalização
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Informações dos Gestores</h4>
                <Button size="sm" variant="outline" onClick={() => addGestorFiscal('gestores')}>
                  <Plus size={16} className="mr-1" />
                  Adicionar Gestor
                </Button>
              </div>
              {formData.gestores.map((gestor, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Gestor {index + 1}</h5>
                    {formData.gestores.length > 1 && (
                      <Button size="sm" variant="outline" onClick={() => removeGestorFiscal('gestores', index)}>
                        <Minus size={16} />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={gestor.nome}
                        onChange={(e) => handleGestorFiscalChange('gestores', index, 'nome', e.target.value)}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cargo</Label>
                      <Input
                        value={gestor.cargo}
                        onChange={(e) => handleGestorFiscalChange('gestores', index, 'cargo', e.target.value)}
                        placeholder="Cargo do gestor"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Matrícula</Label>
                      <Input
                        value={gestor.matricula}
                        onChange={(e) => handleGestorFiscalChange('gestores', index, 'matricula', e.target.value)}
                        placeholder="Matrícula"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Informações dos Fiscais</h4>
                <Button size="sm" variant="outline" onClick={() => addGestorFiscal('fiscais')}>
                  <Plus size={16} className="mr-1" />
                  Adicionar Fiscal
                </Button>
              </div>
              {formData.fiscais.map((fiscal, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Fiscal {index + 1}</h5>
                    {formData.fiscais.length > 1 && (
                      <Button size="sm" variant="outline" onClick={() => removeGestorFiscal('fiscais', index)}>
                        <Minus size={16} />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        value={fiscal.nome}
                        onChange={(e) => handleGestorFiscalChange('fiscais', index, 'nome', e.target.value)}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cargo</Label>
                      <Input
                        value={fiscal.cargo}
                        onChange={(e) => handleGestorFiscalChange('fiscais', index, 'cargo', e.target.value)}
                        placeholder="Cargo do fiscal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Matrícula</Label>
                      <Input
                        value={fiscal.matricula}
                        onChange={(e) => handleGestorFiscalChange('fiscais', index, 'matricula', e.target.value)}
                        placeholder="Matrícula"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 9: // Etapa 10: Itens e Valor Estimado
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Itens Selecionados</h4>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInputChange('mostrarValores', !formData.mostrarValores)}
                >
                  {formData.mostrarValores ? <EyeOff size={16} /> : <Eye size={16} />}
                  {formData.mostrarValores ? 'Ocultar' : 'Mostrar'} Valores
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 border-b">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium">
                  <div className="col-span-4">Item</div>
                  <div className="col-span-2">Unidade</div>
                  <div className="col-span-2">Quantidade</div>
                  {formData.mostrarValores && <div className="col-span-2">Valor Unit.</div>}
                  {formData.mostrarValores && <div className="col-span-2">Valor Total</div>}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {getSelectedItems().map((item, index) => (
                  <div key={index} className="p-3 border-b grid grid-cols-12 gap-4 text-sm">
                    <div className="col-span-4">{item.nome}</div>
                    <div className="col-span-2">{item.unidade}</div>
                    <div className="col-span-2">{item.quantidade}</div>
                    {formData.mostrarValores && (
                      <div className="col-span-2">{item.valorUnitario || 'R$ 0,00'}</div>
                    )}
                    {formData.mostrarValores && (
                      <div className="col-span-2">{item.valorEstimado}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium mb-3">Resumo Final</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Quantidade de itens:</span>
                  <br />
                  {getSelectedItems().length} itens
                </div>
                <div>
                  <span className="font-medium">Secretarias envolvidas:</span>
                  <br />
                  {getSecretariaInfo()}
                </div>
                {formData.mostrarValores && (
                  <div>
                    <span className="font-medium">Valor total estimado:</span>
                    <br />
                    <span className="text-green-600 font-semibold">{calculateTotalValue()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Observações Adicionais</Label>
                <Button size="sm" variant="outline" onClick={() => generateWithAI('observacoes')}>
                  <Sparkles size={14} className="mr-1" />
                  IA
                </Button>
              </div>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                rows={4}
                placeholder="Observações adicionais sobre a execução do contrato..."
              />
            </div>
          </div>
        );

      default:
        return <div>Etapa não encontrada</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Criar Termo de Referência - {formData.numero}
              </h2>
              <p className="text-gray-600">
                Etapa {currentStep + 1} de {steps.length}: {steps[currentStep].title}
              </p>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                    {index < currentStep ? <CheckCircle size={16} /> : index + 1}
                  </div>
                  <div className={`mt-1 text-xs text-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft size={16} className="mr-2" />
                Anterior
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep}>
                  Próximo
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handleSave}>
                    <Save size={16} className="mr-2" />
                    Salvar Rascunho
                  </Button>
                  <Button onClick={handleFinalize}>
                    <CheckCircle size={16} className="mr-2" />
                    Finalizar TR
                  </Button>
                </div>
              )}
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

export default TRCreationWizard;
