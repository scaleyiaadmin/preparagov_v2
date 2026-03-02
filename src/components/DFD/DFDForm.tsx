import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Save,
  Sparkles,
  Send,
  ArrowLeft,
  Plus,
  Eye,
  FileText,
  Loader2,
  Lightbulb,
  Edit
} from 'lucide-react';
import ItemDatabaseSearch from './ItemDatabaseSearch';
import DFDPreview from './DFDPreview';
import ItemsTable from './ItemsTable';
import AISuggestionsModal from './AISuggestionsModal';
import ItemEditModal from './ItemEditModal';
import ItemJustificationForm from './ItemJustificationForm';
import { dfdService } from '@/services/dfdService';
import { useAuth } from '@/contexts/AuthContext';
import { DbDFDItem } from '@/types/database';

import { DFDItem, DFDFormData, MappedDFD } from './types';

interface DFDFormProps {
  onBack: () => void;
  editingDFD?: MappedDFD | null;
}

const DFDForm = ({ onBack, editingDFD }: DFDFormProps) => {
  const [showItemModal, setShowItemModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showItemEdit, setShowItemEdit] = useState(false);
  const [editingItem, setEditingItem] = useState<DFDItem | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [isEditingAI, setIsEditingAI] = useState(false);
  const [globalQuantityJustification, setGlobalQuantityJustification] = useState(editingDFD?.justificativaQuantidade || '');
  const [formData, setFormData] = useState<DFDFormData>({
    objeto: editingDFD?.objeto || '',
    tipoDFD: editingDFD?.tipoDFD || '',
    descricaoSucinta: editingDFD?.descricaoSucinta || '',
    descricaoDemanda: editingDFD?.descricaoDemanda || '',
    justificativa: editingDFD?.justificativa || '',
    dataPrevista: editingDFD?.dataPrevista || '',
    prioridade: editingDFD?.prioridade || '',
    justificativaPrioridade: editingDFD?.justificativaPrioridade || '',
    itens: editingDFD?.itens || []
  });

  const { toast } = useToast();
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const objetoOptions = [
    'Aquisição de Gêneros Alimentícios',
    'Aquisição de Material de Limpeza',
    'Aquisição de Medicamentos',
    'Aquisição de Material Hospitalar',
    'Aquisição de Material de Expediente',
    'Aquisição de Equipamentos de Informática',
    'Aquisição de Mobiliário',
    'Aquisição de Veículos',
    'Aquisição de Uniformes e EPIs',
    'Contratação de Serviços de Manutenção Predial',
    'Contratação de Serviços de Limpeza e Conservação',
    'Contratação de Serviços de Tecnologia',
    'Contratação de Obras e Engenharia'
  ];

  const tipoDFDOptions = [
    'MATERIAIS DE CONSUMO',
    'MATERIAIS PERMANENTES',
    'SERVIÇO CONTINUADO',
    'SERVIÇO NÃO CONTINUADO',
    'SERVIÇO DE ENGENHARIA',
    'OBRAS',
    'SOLUÇÕES DE TIC',
    'TERMO ADITIVO'
  ];

  const prioridadeOptions = ['Baixo', 'Médio', 'Alto'];

  const handleInputChange = (field: keyof DFDFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isAIButtonEnabled = () => {
    return formData.descricaoSucinta && formData.prioridade && formData.dataPrevista && formData.tipoDFD;
  };

  const generateWithAI = async () => {
    setLoadingAI(true);

    setTimeout(() => {
      const nome = formData.objeto || formData.descricaoSucinta || 'Objeto da Contratação';
      const categoria = formData.descricaoSucinta;

      // Mapa de sugestões por categoria (descricaoSucinta)
      const suggestions: Record<string, { descricaoDemanda: string; justificativa: string }> = {
        'Aquisição de Gêneros Alimentícios': {
          descricaoDemanda: `A presente demanda visa a aquisição de gêneros alimentícios denominada "${nome}", destinada a garantir o fornecimento regular de alimentos para as unidades atendidas pelo município, atendendo às normas do Programa Nacional de Alimentação Escolar (PNAE) e demais legislações sanitárias vigentes.`,
          justificativa: `A aquisição de gêneros alimentícios é essencial para manter a continuidade dos serviços de alimentação prestados à população, em especial a alunos da rede pública. A ausência desses insumos causaria impacto direto na saúde e no desempenho escolar dos beneficiários.`
        },
        'Aquisição de Medicamentos': {
          descricaoDemanda: `A presente demanda refere-se à aquisição de medicamentos e insumos farmacêuticos denominada "${nome}", com vistas a suprir as necessidades da rede municipal de saúde e garantir o acesso da população aos tratamentos essenciais previstos no Componente Básico da Assistência Farmacêutica.`,
          justificativa: `O fornecimento contínuo de medicamentos é obrigação constitucional do Estado e condição indispensável para o funcionamento das Unidades Básicas de Saúde. A falta de estoque adequado compromete diretamente o tratamento de doenças crônicas e agudas, podendo causar agravamento da condição de saúde dos pacientes atendidos.`
        },
        'Aquisição de Material Hospitalar': {
          descricaoDemanda: `Esta demanda contempla a aquisição de materiais hospitalares e insumos médicos sob a denominação "${nome}", destinados ao abastecimento das unidades de saúde municipais, incluindo unidades de pronto atendimento e postos de saúde.`,
          justificativa: `Os materiais hospitalares são insumos críticos para a realização de procedimentos clínicos, curativos e assistência de enfermagem. A ausência ou insuficiência desses itens compromete a segurança dos pacientes e dos profissionais de saúde, podendo gerar riscos à vida.`
        },
        'Aquisição de Material de Limpeza': {
          descricaoDemanda: `A demanda denominada "${nome}" tem por objeto a aquisição de materiais de higienização e limpeza para uso nas instalações públicas municipais, incluindo escolas, unidades de saúde e prédios administrativos.`,
          justificativa: `A manutenção de ambientes limpos e higienizados é condição fundamental para a saúde pública e o bem-estar dos servidores e usuários dos serviços municipais. O fornecimento regular desses materiais é obrigatório para cumprimento das normas da ANVISA e do Ministério da Saúde.`
        },
        'Aquisição de Material de Expediente': {
          descricaoDemanda: `A demanda denominada "${nome}" visa o suprimento de materiais de escritório, papelaria e expediente necessários ao funcionamento regular da administração pública municipal, secretarias e unidades escolares.`,
          justificativa: `Os materiais de expediente são insumos básicos indispensáveis para a execução das atividades administrativas e pedagógicas. A falta desses itens prejudica a produtividade dos servidores, o atendimento ao público e o registro adequado das atividades institucionais.`
        },
        'Aquisição de Equipamentos de Informática': {
          descricaoDemanda: `Esta demanda tem por objeto a aquisição de equipamentos de informática identificada como "${nome}", com vistas a modernizar a infraestrutura tecnológica das secretarias e unidades escolares do município, garantindo condições adequadas de trabalho e conectividade.`,
          justificativa: `A obsolescência do parque tecnológico compromete a eficiência operacional, a segurança da informação e a capacidade de atendimento ao cidadão. A renovação dos equipamentos é necessária para conformidade com os requisitos mínimos dos sistemas governamentais federais e estaduais.`
        },
        'Aquisição de Mobiliário': {
          descricaoDemanda: `A presente demanda contempla a aquisição de mobiliário sob a denominação "${nome}", destinada ao equipamento de instalações públicas, com foco em garantir as condições mínimas de trabalho para os servidores e de atendimento para a população.`,
          justificativa: `A inadequação ou ausência de mobiliário compromete a ergonomia, a produtividade e a segurança no ambiente de trabalho, além de impactar negativamente a imagem institucional da administração pública junto à população.`
        },
        'Aquisição de Veículos': {
          descricaoDemanda: `Esta demanda, identificada como "${nome}", tem por objeto a aquisição de veículos para uso exclusivo da frota oficial municipal, visando a substituição de veículos com vida útil encerrada e a ampliação da capacidade operacional das secretarias.`,
          justificativa: `A renovação da frota é necessária para garantir a mobilidade dos agentes públicos no exercício de suas funções, especialmente nas áreas de saúde, educação e assistência social, onde o transporte é condição essencial para a prestação dos serviços.`
        },
        'Aquisição de Uniformes e EPIs': {
          descricaoDemanda: `A demanda denominada "${nome}" refere-se à aquisição de uniformes e equipamentos de proteção individual (EPIs) para os servidores municipais que atuam em áreas operacionais, conforme exigências da NR-6 e legislação trabalhista aplicável ao setor público.`,
          justificativa: `O fornecimento de EPIs adequados é obrigação legal do empregador conforme a Norma Regulamentadora NR-6 da Portaria MTE 3.214/1978, aplicável ao serviço público. A ausência desses equipamentos expõe os servidores a riscos de acidentes e adoecimento ocupacional.`
        },
        'Contratação de Serviços de Manutenção Predial': {
          descricaoDemanda: `A demanda denominada "${nome}" visa a contratação de empresa especializada em serviços de manutenção predial preventiva e corretiva, abrangendo as instalações físicas dos prédios públicos municipais.`,
          justificativa: `A conservação adequada do patrimônio público é dever da administração e essencial para garantir segurança, funcionalidade e vida útil prolongada das edificações. A ausência de manutenção regular gera custos extraordinários com reformas emergenciais e riscos à integridade física dos ocupantes.`
        },
        'Contratação de Serviços de Limpeza e Conservação': {
          descricaoDemanda: `Esta demanda, intitulada "${nome}", tem por objeto a contratação de serviços continuados de limpeza e conservação para as dependências dos órgãos municipais, incluindo varrição, lavagem, desinfecção e coleta de resíduos comuns.`,
          justificativa: `A limpeza e conservação dos espaços públicos é condição básica para a saúde dos servidores e usuários, além de requisito normativo para o funcionamento de unidades de saúde e educação. A terceirização desses serviços é prática consagrada e economicamente vantajosa para a administração.`
        },
        'Contratação de Serviços de Tecnologia': {
          descricaoDemanda: `A demanda denominada "${nome}" tem por objeto a contratação de serviços de tecnologia da informação e comunicação, incluindo suporte técnico, manutenção de sistemas, segurança da informação e infraestrutura de redes para as secretarias municipais.`,
          justificativa: `A dependência crescente de sistemas digitais na gestão pública torna essencial a contratação de suporte especializado. A ausência de manutenção adequada dos sistemas e redes expõe o município a riscos de segurança, paralisação de serviços e descumprimento de obrigações digitais perante órgãos de controle.`
        },
        'Contratação de Obras e Engenharia': {
          descricaoDemanda: `Esta demanda, denominada "${nome}", contempla a contratação de empresa de engenharia e construção civil para execução de obras e serviços de engenharia em imóveis públicos municipais, conforme projeto executivo e memória de cálculo elaborados pela equipe técnica local.`,
          justificativa: `A execução das obras previstas é necessária para ampliar ou recuperar a infraestrutura pública municipal, garantindo condições adequadas de atendimento à população e preservação do patrimônio edificado. A contratação segue os ditames da Lei 14.133/2021 e demais normas técnicas aplicáveis.`
        }
      };

      // Usar a categoria como chave principal; fallback genérico usando o nome
      const suggestion = suggestions[categoria] || {
        descricaoDemanda: `A presente demanda, denominada "${nome}", tem por objetivo suprir necessidade identificada pela administração municipal, garantindo a continuidade e qualidade dos serviços prestados à população conforme disposições da Lei 14.133/2021.`,
        justificativa: `A contratação é necessária para atender às demandas operacionais da secretaria requisitante, em conformidade com o planejamento anual de contratações e os princípios constitucionais da eficiência e economicidade na gestão dos recursos públicos.`
      };

      const justificativaPrioridade = formData.prioridade === 'Alto'
        ? `A demanda "${nome}" está classificada como prioritária pois sua não execução acarretaria interrupção imediata de serviços essenciais à população, com potencial impacto à saúde, segurança ou continuidade das atividades institucionais do município.`
        : '';

      setFormData(prev => ({
        ...prev,
        descricaoDemanda: suggestion.descricaoDemanda,
        justificativa: suggestion.justificativa,
        justificativaPrioridade
      }));

      setAiGenerated(true);
      setIsEditingAI(false);
      setLoadingAI(false);

      toast({
        title: "Conteúdo gerado por IA",
        description: `Sugestões geradas com base em "${nome}" aplicadas com sucesso.`,
      });
    }, 2000);
  };

  const handleAddItems = (newItems: DFDItem[]) => {
    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, ...newItems]
    }));
    setShowItemModal(false);
    toast({
      title: `${newItems.length} itens adicionados`,
      description: "Itens incluídos na demanda com sucesso.",
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter(item => item.id !== itemId)
    }));

    toast({
      title: "Item removido",
      description: "Item removido da demanda.",
    });
  };

  const handleEditItem = (item: DFDItem) => {
    setEditingItem(item);
    setShowItemEdit(true);
  };

  const handleSaveEditedItem = (updatedItem: DFDItem) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    }));
    toast({
      title: "Item atualizado",
      description: "Alterações salvas com sucesso.",
    });
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const dfdData = {
        objeto: formData.objeto,
        tipo_dfd: formData.tipoDFD,
        descricao_sucinta: formData.descricaoSucinta,
        descricao_demanda: formData.descricaoDemanda,
        justificativa: formData.justificativa,
        justificativa_quantidade: String(globalQuantityJustification || ''),
        data_prevista_contratacao: formData.dataPrevista,
        prioridade: formData.prioridade as 'Baixo' | 'Médio' | 'Alto',
        justificativa_prioridade: formData.justificativaPrioridade,
        status: 'Rascunho' as const,
        ano_contratacao: new Date().getFullYear(),
        valor_estimado_total: formData.itens.reduce((acc, item) => acc + (Number(item.quantidade) * Number(item.valorReferencia)), 0),
        created_by: user?.id,
        prefeitura_id: user?.prefeituraId,
        secretaria_id: user?.secretariaId
      };

      const itemsData = formData.itens.map(item => ({
        descricao_item: item.descricao,
        codigo_item: item.codigo,
        unidade: item.unidade,
        quantidade: Number(item.quantidade),
        valor_unitario: Number(item.valorReferencia),
        tabela_referencia: item.tabelaReferencia
      }));

      console.log('Tentando salvar Rascunho DFD. Payload:', { dfdData, itemsData });

      if (!dfdData.prefeitura_id) {
        console.warn('AVISO: Salvando DFD sem prefeitura_id. Isso pode falhar se o RLS exigir um ID.');
      }

      if (editingDFD?.id) {
        await dfdService.update(editingDFD.id, dfdData, itemsData);
        toast({
          title: "Rasunho Atualizado",
          description: "As alterações foram salvas como rascunho.",
        });
      } else {
        await dfdService.create(dfdData, itemsData);
        toast({
          title: "Rascunho Salvo",
          description: "Documento salvo como rascunho com sucesso.",
        });
      }
      onBack();
    } catch (error: any) {
      console.group('ERRO AO SALVAR DFD (RASCUNHO) - DETALHES');
      console.error('Mensagem:', error?.message);
      console.error('Código:', error?.code);
      console.error('Detalhes:', error?.details);
      console.error('Hint:', error?.hint);
      console.groupEnd();

      const errorMessage = error instanceof Error ? error.message : "Não foi possível salvar o rascunho. Verifique o console para detalhes.";
      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateGlobalJustification = () => {
    return formData.itens.length === 0 || globalQuantityJustification.trim() !== '';
  };

  const handleSubmit = () => {
    if (!formData.objeto || !formData.tipoDFD || !formData.descricaoDemanda || !formData.dataPrevista || formData.itens.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios, incluindo o Tipo de DFD, e adicione pelo menos um item.",
        variant: "destructive"
      });
      return;
    }

    if (!validateGlobalJustification()) {
      toast({
        title: "Justificativa obrigatória",
        description: "É necessário justificar as quantidades dos itens antes de enviar o DFD.",
        variant: "destructive"
      });
      return;
    }

    const submitDFD = async () => {
      try {
        setIsSubmitting(true);
        const dfdData = {
          objeto: formData.objeto,
          tipo_dfd: formData.tipoDFD,
          descricao_sucinta: formData.descricaoSucinta,
          descricao_demanda: formData.descricaoDemanda,
          justificativa: formData.justificativa,
          justificativa_quantidade: String(globalQuantityJustification || ''),
          data_prevista_contratacao: formData.dataPrevista,
          prioridade: formData.prioridade as 'Baixo' | 'Médio' | 'Alto',
          justificativa_prioridade: formData.justificativaPrioridade,
          status: 'Pendente' as const, // Envia como Pendente para aprovação
          ano_contratacao: new Date().getFullYear(),
          valor_estimado_total: formData.itens.reduce((acc, item) => acc + (Number(item.quantidade) * Number(item.valorReferencia)), 0),
          created_by: user?.id,
          prefeitura_id: user?.prefeituraId,
          secretaria_id: user?.secretariaId
        };

        const itemsData = formData.itens.map(item => ({
          descricao_item: item.descricao,
          codigo_item: item.codigo,
          unidade: item.unidade,
          quantidade: Number(item.quantidade),
          valor_unitario: Number(item.valorReferencia),
          tabela_referencia: item.tabelaReferencia
        }));

        console.log('Tentando enviar DFD para aprovação. Payload:', { dfdData, itemsData });

        if (!dfdData.prefeitura_id) {
          throw new Error("Você precisa estar impersonando uma prefeitura para enviar um DFD para aprovação (Super Admin) ou ter uma prefeitura vinculada.");
        }

        if (editingDFD?.id) {
          await dfdService.update(editingDFD.id, dfdData, itemsData);
          toast({
            title: "DFD Atualizado",
            description: "DFD enviado para aprovação com sucesso.",
          });
        } else {
          await dfdService.create(dfdData, itemsData);
          toast({
            title: "DFD Enviado",
            description: "Documento enviado para aprovação com sucesso.",
          });
        }
        onBack();
      } catch (error: any) {
        console.group('ERRO AO ENVIAR DFD - DETALHES');
        console.error('Mensagem:', error?.message);
        console.error('Código:', error?.code);
        console.error('Detalhes:', error?.details);
        console.error('Hint:', error?.hint);
        console.groupEnd();

        const errorMessage = error instanceof Error ? error.message : "Não foi possível enviar o DFD para aprovação. Verifique o console.";
        toast({
          title: "Erro ao enviar",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    submitDFD();
  };

  const handleGeneratePDF = () => {
    if (!formData.objeto || !formData.tipoDFD || !formData.descricaoDemanda || formData.itens.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios e adicione pelo menos um item antes de gerar o PDF.",
        variant: "destructive"
      });
      return;
    }

    if (!validateGlobalJustification()) {
      toast({
        title: "Justificativa obrigatória",
        description: "É necessário justificar as quantidades dos itens antes de gerar o PDF.",
        variant: "destructive"
      });
      return;
    }

    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{editingDFD ? 'Editar DFD' : 'Novo DFD'}</h1>
            <p className="text-gray-600">Documento de Formalização da Demanda</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye size={16} className="mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Botão Gerar com IA - Destaque no topo */}
      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Geração Inteligente</h3>
                <p className="text-sm text-gray-600">
                  Preencha os campos obrigatórios e deixe a IA completar sua demanda
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={generateWithAI}
                disabled={!isAIButtonEnabled() || loadingAI}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {loadingAI ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Sparkles size={16} className="mr-2" />
                )}
                Gerar com IA
              </Button>
              {aiGenerated && (
                <Button
                  variant="outline"
                  onClick={() => setShowAISuggestions(true)}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Lightbulb size={16} className="mr-2" />
                  Ver Sugestões de Itens
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Demanda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="objeto">Nome do DFD *</Label>
              <Input
                id="objeto"
                value={formData.objeto}
                onChange={(e) => handleInputChange('objeto', e.target.value)}
                placeholder="Ex: Aquisição de Material de Expediente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricaoSucinta">Descrição Sucinta do Objeto *</Label>
              <Select value={formData.descricaoSucinta} onValueChange={(value) => handleInputChange('descricaoSucinta', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a descrição sucinta" />
                </SelectTrigger>
                <SelectContent>
                  {objetoOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoDFD">Tipo de DFD *</Label>
              <Select value={formData.tipoDFD} onValueChange={(value) => handleInputChange('tipoDFD', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de DFD" />
                </SelectTrigger>
                <SelectContent>
                  {tipoDFDOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataPrevista">Data Prevista da Contratação *</Label>
              <Input
                id="dataPrevista"
                type="date"
                value={formData.dataPrevista}
                onChange={(e) => handleInputChange('dataPrevista', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Grau de Prioridade *</Label>
              <Select value={formData.prioridade} onValueChange={(value) => handleInputChange('prioridade', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {prioridadeOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.prioridade === 'Alto' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="justificativaPrioridade">Justificativa da Prioridade *</Label>
                <Textarea
                  id="justificativaPrioridade"
                  value={formData.justificativaPrioridade}
                  onChange={(e) => handleInputChange('justificativaPrioridade', e.target.value)}
                  placeholder="Justifique por que esta demanda tem prioridade alta..."
                  rows={2}
                />
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="descricaoDemanda">Descrição da Demanda *</Label>
                {aiGenerated && !isEditingAI && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingAI(true)}
                    className="h-6 px-2 text-xs text-orange-600 hover:text-orange-700"
                  >
                    <Edit size={12} className="mr-1" />
                    Editar Conteúdo da IA
                  </Button>
                )}
              </div>
              <div className="relative">
                <Textarea
                  id="descricaoDemanda"
                  value={formData.descricaoDemanda}
                  onChange={(e) => handleInputChange('descricaoDemanda', e.target.value)}
                  placeholder="Descreva a demanda que motiva a contratação..."
                  rows={4}
                  readOnly={aiGenerated && !isEditingAI}
                  className={aiGenerated && !isEditingAI ? "bg-orange-50/50" : ""}
                />
                {loadingAI && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificativa">Justificativa da Contratação</Label>
            <Textarea
              id="justificativa"
              value={formData.justificativa}
              onChange={(e) => handleInputChange('justificativa', e.target.value)}
              placeholder="Descreva a justificativa legal e técnica para a contratação..."
              rows={6}
              readOnly={aiGenerated && !isEditingAI}
              className={aiGenerated && !isEditingAI ? "bg-orange-50/50" : ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Itens da Demanda</CardTitle>
            <Button onClick={() => setShowItemModal(true)} className="bg-orange-500 hover:bg-orange-600">
              <Plus size={16} className="mr-2" />
              Adicionar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ItemsTable
            items={formData.itens}
            onRemoveItem={handleRemoveItem}
            onEditItem={handleEditItem}
          />
        </CardContent>
      </Card>

      {/* Global quantity justification form - appears when items are added */}
      {formData.itens.length > 0 && (
        <ItemJustificationForm
          items={formData.itens}
          globalJustification={globalQuantityJustification}
          onGlobalJustificationChange={setGlobalQuantityJustification}
        />
      )}

      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          Cancelar
        </Button>
        <Button variant="outline" onClick={handleSave}>
          <Save size={16} className="mr-2" />
          Salvar Rascunho
        </Button>
        <Button variant="outline" onClick={handleGeneratePDF}>
          <FileText size={16} className="mr-2" />
          Gerar PDF
        </Button>
        <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600">
          <Send size={16} className="mr-2" />
          {editingDFD ? 'Salvar Alterações' : 'Enviar para Aprovação'}
        </Button>
      </div>

      {showItemModal && (
        <ItemDatabaseSearch
          open={showItemModal}
          onClose={() => setShowItemModal(false)}
          onAddItems={handleAddItems}
        />
      )}

      <AISuggestionsModal
        open={showAISuggestions}
        onClose={() => setShowAISuggestions(false)}
        objeto={formData.objeto}
        descricaoDemanda={formData.descricaoDemanda}
        justificativa={formData.justificativa}
        onAddItems={(items) => {
          setFormData(prev => ({
            ...prev,
            itens: [...prev.itens, ...items.map(item => ({ ...item, id: Date.now().toString() + Math.random() }))]
          }));
          toast({
            title: "Itens adicionados",
            description: `${items.length} itens foram adicionados à demanda.`,
          });
        }}
      />

      <ItemEditModal
        open={showItemEdit}
        onClose={() => setShowItemEdit(false)}
        item={editingItem}
        onSave={handleSaveEditedItem}
      />

      <DFDPreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        formData={formData}
        globalJustification={globalQuantityJustification}
      />
    </div>
  );
};

export default DFDForm;
