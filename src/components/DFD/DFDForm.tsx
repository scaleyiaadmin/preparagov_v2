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
import ItemSearchModal from './ItemSearchModal';
import DFDPreview from './DFDPreview';
import ItemsTable from './ItemsTable';
import AISuggestionsModal from './AISuggestionsModal';
import ItemEditModal from './ItemEditModal';
import ItemJustificationForm from './ItemJustificationForm';
import { dfdService } from '@/services/dfdService';
import { useAuth } from '@/contexts/AuthContext';
import { DbDFDItem } from '@/types/database';

interface DFDItem {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorReferencia: number;
  tabelaReferencia: string;
}

interface DFDFormData {
  objeto: string;
  tipoDFD: string;
  descricaoSucinta: string;
  descricaoDemanda: string;
  justificativa: string;
  dataPrevista: string;
  prioridade: string;
  justificativaPrioridade: string;
  itens: DFDItem[];
}

interface DFDFormProps {
  onBack: () => void;
  editingDFD?: any;
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
  const [globalQuantityJustification, setGlobalQuantityJustification] = useState('');
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
  const { user } = useAuth();
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
    return formData.objeto && formData.prioridade && formData.dataPrevista && formData.tipoDFD;
  };

  const generateWithAI = async () => {
    setLoadingAI(true);

    // Simular delay da IA
    setTimeout(() => {
      const suggestions: Record<string, any> = {
        'Aquisição de Gêneros Alimentícios': {
          descricaoDemanda: 'Atender às necessidades nutricionais dos alunos da rede escolar municipal, fornecendo alimentação balanceada e de qualidade conforme diretrizes do PNAE (Programa Nacional de Alimentação Escolar), garantindo o desenvolvimento adequado dos estudantes e o cumprimento das metas educacionais.',
          justificativa: 'A aquisição de gêneros alimentícios é fundamental para garantir a alimentação escolar adequada, conforme estabelecido na Lei nº 11.947/2009 e nas diretrizes do PNAE. A contratação visa assegurar a continuidade do fornecimento de merenda escolar, contribuindo para a permanência dos alunos na escola e seu desenvolvimento nutricional. A demanda foi calculada com base no número de estudantes matriculados e no cardápio nutricional aprovado por nutricionista responsável técnico.'
        },
        'Aquisição de Material de Limpeza': {
          descricaoDemanda: 'Manter as instalações públicas municipais em condições adequadas de higiene e limpeza, garantindo um ambiente saudável e seguro para servidores, munícipes e visitantes, em conformidade com as normas sanitárias vigentes.',
          justificativa: 'A aquisição de material de limpeza é essencial para manter as condições de higiene e salubridade das instalações públicas, atendendo às normas da ANVISA e demais órgãos reguladores. A contratação visa garantir a continuidade dos serviços de limpeza e conservação, prevenindo riscos à saúde pública e mantendo a qualidade do ambiente de trabalho. A estimativa de consumo foi baseada no histórico de utilização e na área total das instalações.'
        },
        'Aquisição de Medicamentos': {
          descricaoDemanda: 'Garantir o fornecimento contínuo de medicamentos essenciais para atendimento básico da população através da farmácia municipal, complementando as ações de atenção primária à saúde e assegurando o acesso universal aos medicamentos.',
          justificativa: 'A aquisição de medicamentos é fundamental para garantir o direito constitucional à saúde, conforme Art. 196 da CF/88 e Lei nº 8.080/90 (SUS). A contratação visa manter o estoque adequado da farmácia municipal para atendimento à população carente, seguindo a Relação Nacional de Medicamentos Essenciais (RENAME) e o Componente Básico da Assistência Farmacêutica. A demanda foi calculada com base no perfil epidemiológico local e consumo histórico.'
        },
        'Aquisição de Material Hospitalar': {
          descricaoDemanda: 'Garantir o funcionamento adequado das unidades de saúde municipais com materiais hospitalares de qualidade, assegurando a continuidade dos serviços de saúde e o atendimento digno à população usuária do Sistema Único de Saúde.',
          justificativa: 'A aquisição de material hospitalar é indispensável para o funcionamento das unidades de saúde, garantindo a qualidade e segurança dos procedimentos médicos realizados. A contratação visa manter o estoque adequado conforme padrões técnicos da ANVISA e Ministério da Saúde, assegurando a continuidade dos serviços de saúde pública. A demanda foi estimada com base no histórico de consumo e na capacidade de atendimento das unidades.'
        },
        'Aquisição de Material de Expediente': {
          descricaoDemanda: 'Suprir as necessidades administrativas das secretarias e demais órgãos municipais com materiais de expediente adequados, garantindo o fluxo normal dos trabalhos burocráticos e o atendimento ao cidadão.',
          justificativa: 'A aquisição de material de expediente é essencial para a manutenção das atividades administrativas do município. A falta destes itens pode comprometer a eficiência do serviço público e o atendimento à população. A estimativa quantitativa baseou-se no consumo médio dos últimos exercícios.'
        },
        'Aquisição de Equipamentos de Informática': {
          descricaoDemanda: 'Modernizar o parque tecnológico da administração municipal através da aquisição de equipamentos de informática, visando aumentar a produtividade dos servidores e a qualidade dos serviços digitais oferecidos aos cidadãos.',
          justificativa: 'A atualização dos equipamentos de informática é necessária devido à obsolescência natural dos dispositivos atuais e à necessidade de suportar sistemas mais modernos. A contratação trará ganhos de eficiência e agilidade nos processos administrativos.'
        },
        'Aquisição de Mobiliário': {
          descricaoDemanda: 'Prover as repartições públicas de mobiliário adequado e ergonômico, proporcionando condições dignas de trabalho aos servidores e conforto ao atendimento do público externo.',
          justificativa: 'A aquisição de mobiliário visa substituir itens danificados e mobiliar novos espaços, atendendo às normas de ergonomia (NR-17) e garantindo um ambiente de trabalho adequado. A demanda foi levantada através de inventário físico realizado nas unidades.'
        },
        'Aquisição de Veículos': {
          descricaoDemanda: 'Renovar e ampliar a frota municipal para atender às demandas de transporte de servidores, materiais e fiscalização, reduzindo custos com manutenção e garantindo a eficiência logística.',
          justificativa: 'A aquisição de novos veículos justifica-se pelo alto custo de manutenção da frota antiga e pela necessidade de expansão dos serviços. A compra de veículos próprios demonstra-se economicamente vantajosa em comparação à locação a longo prazo para este perfil de utilização.'
        },
        'Aquisição de Uniformes e EPIs': {
          descricaoDemanda: 'Fornecer uniformes e Equipamentos de Proteção Individual (EPIs) aos servidores, garantindo sua identificação, segurança e conformidade com as normas regulamentadoras de segurança do trabalho.',
          justificativa: 'A aquisição é obrigatória conforme legislação trabalhista e normas de segurança. Visa proteger a integridade física dos servidores no exercício de suas funções, bem como padronizar a identificação visual das equipes municipais.'
        },
        'Contratação de Serviços de Manutenção Predial': {
          descricaoDemanda: 'Garantir a conservação e o funcionamento adequado dos prédios públicos municipais através de serviços de manutenção preventiva e corretiva, preservando o patrimônio público e a segurança dos usuários.',
          justificativa: 'A contratação de serviços de manutenção é imprescindível para evitar a deterioração dos imóveis públicos, garantindo sua vida útil e a segurança de servidores e cidadãos. A terceirização destes serviços permite maior agilidade e especialização técnica nas intervenções necessárias.'
        },
        'Contratação de Serviços de Limpeza e Conservação': {
          descricaoDemanda: 'Assegurar a limpeza, conservação e higienização das áreas internas e externas das unidades municipais, proporcionando um ambiente salubre e agradável para o desenvolvimento das atividades públicas.',
          justificativa: 'A terceirização dos serviços de limpeza visa garantir a continuidade e qualidade da higienização dos espaços públicos, atividade meio essencial para o funcionamento da administração. A demanda foi dimensionada com base na área física e frequência de utilização dos espaços.'
        },
        'Contratação de Serviços de Tecnologia': {
          descricaoDemanda: 'Contratar serviços especializados em Tecnologia da Informação para suporte, desenvolvimento e manutenção de sistemas, garantindo a disponibilidade e segurança das informações municipais.',
          justificativa: 'A contratação justifica-se pela necessidade de conhecimento técnico especializado e pela criticidade dos sistemas de governo. Visa assegurar a continuidade dos serviços digitais, a segurança de dados e a modernização administrativa.'
        },
        'Contratação de Obras e Engenharia': {
          descricaoDemanda: 'Executar obras de construção, reforma ou ampliação de infraestrutura pública, visando atender às demandas da população por melhores equipamentos urbanos e sociais.',
          justificativa: 'A realização da obra é necessária para atender ao interesse público, melhorando a infraestrutura municipal. O projeto básico e o orçamento estimativo demonstram a viabilidade técnica e econômica da intervenção, que trará benefícios diretos à comunidade.'
        }
      };

      const suggestion = suggestions[formData.objeto];

      setFormData(prev => ({
        ...prev,
        descricaoDemanda: suggestion?.descricaoDemanda || '',
        justificativa: suggestion?.justificativa || '',
        justificativaPrioridade: formData.prioridade === 'Alto' ?
          'Esta demanda possui caráter urgente devido à natureza essencial do serviço público prestado, podendo causar descontinuidade nas atividades caso não seja atendida tempestivamente. O não atendimento pode comprometer a qualidade dos serviços oferecidos à população.' : ''
      }));

      setAiGenerated(true);
      setIsEditingAI(false); // Reseta para modo de visualização caso já tenha gerado antes
      setLoadingAI(false);

      toast({
        title: "Conteúdo gerado por IA",
        description: "Os campos foram preenchidos automaticamente com sugestões inteligentes.",
      });
    }, 3000);
  };

  const handleAddItem = (item: DFDItem) => {
    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { ...item, id: Date.now().toString() }]
    }));
    setShowItemModal(false);
    toast({
      title: "Item adicionado",
      description: "Item incluído na demanda com sucesso.",
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
        justificativa_quantidade: globalQuantityJustification,
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
        // valor_total é gerado automaticamente no banco
        tabela_referencia: item.tabelaReferencia
      }));

      if (editingDFD) {
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
      console.error(error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o DFD. Tente novamente.",
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
          justificativa_quantidade: globalQuantityJustification,
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
          // valor_total é coluna gerada automaticamente no banco
          tabela_referencia: item.tabelaReferencia
        }));

        if (editingDFD) {
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
        console.error(error);
        toast({
          title: "Erro ao enviar",
          description: error.message || "Não foi possível enviar o DFD. Tente novamente.",
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

    toast({
      title: "PDF Gerado",
      description: "Documento PDF foi gerado com sucesso.",
    });
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
              <Label htmlFor="objeto">Descrição Sucinta do Objeto *</Label>
              <Select value={formData.objeto} onValueChange={(value) => handleInputChange('objeto', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de objeto" />
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

      <ItemSearchModal
        open={showItemModal}
        onClose={() => setShowItemModal(false)}
        onAddItem={handleAddItem}
      />

      <AISuggestionsModal
        open={showAISuggestions}
        onClose={() => setShowAISuggestions(false)}
        objeto={formData.objeto}
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
