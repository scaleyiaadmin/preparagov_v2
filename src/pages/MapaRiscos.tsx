import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Sparkles,
  Save,
  Trash2,
  Edit,
  AlertTriangle,
  Shield,
  Target,
  FileText,
  ArrowLeft,
  Eye,
  Download
} from 'lucide-react';
import ETPSelectionModal from '../components/MapaRiscos/ETPSelectionModal';
import MapaRiscosCards from '../components/MapaRiscos/MapaRiscosCards';
import MapaRiscosOverviewCards from '../components/MapaRiscos/MapaRiscosOverviewCards';
import MapaRiscosPreview from '../components/MapaRiscos/MapaRiscosPreview';
import AIRiskSuggestions from '../components/MapaRiscos/AIRiskSuggestions';
import ETPSummaryCard from '../components/MapaRiscos/ETPSummaryCard';
import { mapaRiscosService } from '@/services/mapaRiscosService';
import { useAuth } from '@/contexts/AuthContext';
import { DbMapaRiscos, DbMapaRiscosItem } from '@/types/database';

// Tipos auxiliares corrigidos
interface Risco extends DbMapaRiscosItem { }
interface MapaRisco extends DbMapaRiscos {
  totalRiscos?: number;
}

interface ETP {
  id: string;
  titulo: string;
  numeroETP: string;
  secretaria: string;
  dataCriacao: string;
  valorTotal: string;
  descricaoDemanda: string;
  status: string;
}

interface DFD {
  id: string;
  numero: string;
  nome: string;
  valor: string;
  tipo: string;
}

const MapaRiscos = () => {
  const [step, setStep] = useState<'overview' | 'list-concluidos' | 'list-elaboracao' | 'select-etp' | 'create-risks'>('overview');
  const [selectedETP, setSelectedETP] = useState<ETP | null>(null);
  const [etpSelectionOpen, setEtpSelectionOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [aiSuggestionsOpen, setAiSuggestionsOpen] = useState(false);
  const [currentMapaId, setCurrentMapaId] = useState<string | null>(null);

  const [etpDFDs, setEtpDFDs] = useState<DFD[]>([]);
  const [riscos, setRiscos] = useState<Risco[]>([]);
  const [mapas, setMapas] = useState<MapaRisco[]>([]);
  const [counts, setCounts] = useState({ concluidos: 0, elaboracao: 0, total: 0 });

  const [showForm, setShowForm] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risco | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    categoria: '',
    descricao: '',
    causaProvavel: '',
    consequencia: '',
    probabilidade: '',
    impacto: '',
    mitigacao: '',
    planoContingencia: '',
    responsavel: ''
  });

  const categorias = ['Técnico', 'Orçamentário', 'Operacional', 'Legal', 'Ambiental', 'Cronograma', 'Jurídico', 'Logístico'];
  const niveis = ['Baixa', 'Média', 'Alta'];

  const calcularNivel = (probabilidade: string, impacto: string) => {
    const matriz = {
      'Baixa': { 'Baixo': 'Baixo', 'Médio': 'Baixo', 'Alto': 'Médio' },
      'Média': { 'Baixo': 'Baixo', 'Médio': 'Médio', 'Alto': 'Alto' },
      'Alta': { 'Baixo': 'Médio', 'Médio': 'Alto', 'Alto': 'Alto' }
    };
    return matriz[probabilidade as keyof typeof matriz]?.[impacto as keyof typeof matriz['Baixa']] || 'Baixo';
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Alto':
        return 'bg-red-100 text-red-800';
      case 'Médio':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baixo':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      'Técnico': 'bg-blue-100 text-blue-800',
      'Orçamentário': 'bg-purple-100 text-purple-800',
      'Operacional': 'bg-orange-100 text-orange-800',
      'Legal': 'bg-gray-100 text-gray-800',
      'Ambiental': 'bg-green-100 text-green-800',
      'Cronograma': 'bg-pink-100 text-pink-800',
      'Jurídico': 'bg-indigo-100 text-indigo-800',
      'Logístico': 'bg-cyan-100 text-cyan-800'
    };
    return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    loadOverviewData();
  }, [user?.prefeituraId]);

  const loadOverviewData = async () => {
    try {
      const countsData = await mapaRiscosService.getCountsByStatus(user?.prefeituraId || undefined);
      setCounts(countsData);
    } catch (error) {
      console.error('Erro ao carregar dashboard de riscos:', error);
    }
  };

  const loadMapas = async (status?: 'concluido' | 'elaboracao') => {
    try {
      setLoading(true);
      const data = await mapaRiscosService.fetchMapasRiscos(user?.prefeituraId || undefined);
      if (status) {
        setMapas(data.filter(m => m.status === status));
      } else {
        setMapas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar mapas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMapaFull = async (id: string) => {
    try {
      setLoading(true);
      const data = await mapaRiscosService.fetchMapaRisco(id);
      setCurrentMapaId(data.id);
      setRiscos(data.mapa_riscos_itens || []);
      if (data.etp_id) {
        setSelectedETP({
          id: data.etp_id,
          titulo: data.etp_titulo || '',
          numeroETP: data.etp_numero || '',
          secretaria: data.secretaria || '',
          dataCriacao: '',
          valorTotal: '',
          descricaoDemanda: '',
          status: 'concluido'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do mapa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewConcluidos = () => {
    loadMapas('concluido');
    setStep('list-concluidos');
  };

  const handleViewElaboracao = () => {
    loadMapas('elaboracao');
    setStep('list-elaboracao');
  };

  const handleBackToOverview = () => {
    loadOverviewData();
    setStep('overview');
    setSelectedETP(null);
    setCurrentMapaId(null);
    setRiscos([]);
    setEtpDFDs([]);
  };

  const handleSelectETP = (etp: ETP) => {
    setSelectedETP(etp);
    setStep('create-risks');
    setEtpSelectionOpen(false);
    toast({
      title: "ETP Selecionado",
      description: `Mapa de Riscos será criado para o ${etp.numeroETP}.`,
    });
  };

  const handleStartNewMap = () => {
    setStep('select-etp');
    setEtpSelectionOpen(true);
  };

  const handleViewPreview = async (mapa: MapaRisco) => {
    await loadMapaFull(mapa.id!);
    setPreviewOpen(true);
  };

  const handleContinueEditing = (mapa: MapaRisco) => {
    loadMapaFull(mapa.id!);
    setStep('create-risks');
    toast({
      title: "Carregando Mapa",
      description: `Continuando edição do ${mapa.titulo}`,
    });
  };

  const handleExportPDF = (mapa?: MapaRisco) => {
    window.print();
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      if (currentMapaId) {
        await mapaRiscosService.updateMapaRiscos(currentMapaId, {
          titulo: selectedETP ? `Mapa de Riscos - ${selectedETP.numeroETP}` : 'Novo Mapa de Riscos',
          updated_at: new Date().toISOString()
        });
      } else {
        const newMapa = await mapaRiscosService.createMapaRiscos({
          titulo: selectedETP ? `Mapa de Riscos - ${selectedETP.numeroETP}` : 'Novo Mapa de Riscos',
          etp_id: selectedETP?.id,
          etp_numero: selectedETP?.numeroETP,
          etp_titulo: selectedETP?.titulo,
          secretaria: selectedETP?.secretaria,
          status: 'elaboracao',
          prefeitura_id: user?.prefeituraId || '',
          created_by: user?.id || ''
        });
        setCurrentMapaId(newMapa.id);
      }

      toast({
        title: "Rascunho Salvo",
        description: "Mapa de riscos salvo como rascunho com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o rascunho.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeMapa = async () => {
    try {
      setLoading(true);
      if (!currentMapaId) {
        await handleSaveDraft();
      }

      if (currentMapaId) {
        await mapaRiscosService.finalizeMapaRiscos(currentMapaId);
        toast({
          title: "Mapa Finalizado",
          description: "Mapa de riscos finalizado com sucesso!",
        });
        handleBackToOverview();
      }
    } catch (error) {
      console.error('Erro ao finalizar mapa:', error);
      toast({
        title: "Erro ao finalizar",
        description: "Não foi possível finalizar o mapa.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const nivel = calcularNivel(formData.probabilidade, formData.impacto);

      if (!currentMapaId) {
        await handleSaveDraft();
      }

      if (editingRisk) {
        await mapaRiscosService.updateRiscoItem(editingRisk.id!, {
          categoria: formData.categoria,
          descricao: formData.descricao,
          causa_provavel: formData.causaProvavel,
          consequencia: formData.consequencia,
          probabilidade: formData.probabilidade,
          impacto: formData.impacto,
          nivel,
          mitigacao: formData.mitigacao,
          plano_contingencia: formData.planoContingencia,
          responsavel: formData.responsavel
        });
        toast({
          title: "Risco Atualizado",
          description: "Risco atualizado com sucesso.",
        });
      } else if (currentMapaId) {
        await mapaRiscosService.addRiscoItem(currentMapaId, {
          categoria: formData.categoria,
          descricao: formData.descricao,
          causa_provavel: formData.causaProvavel,
          consequencia: formData.consequencia,
          probabilidade: formData.probabilidade,
          impacto: formData.impacto,
          nivel,
          mitigacao: formData.mitigacao,
          plano_contingencia: formData.planoContingencia,
          responsavel: formData.responsavel
        });
        toast({
          title: "Risco Adicionado",
          description: "Novo risco adicionado ao mapa.",
        });
      }

      if (currentMapaId) {
        const mapaData = await mapaRiscosService.fetchMapaRisco(currentMapaId);
        setRiscos(mapaData.mapa_riscos_itens || []);
      }

      setShowForm(false);
      setEditingRisk(null);
      setFormData({
        categoria: '',
        descricao: '',
        causaProvavel: '',
        consequencia: '',
        probabilidade: '',
        impacto: '',
        mitigacao: '',
        planoContingencia: '',
        responsavel: ''
      });
    } catch (error) {
      console.error('Erro ao salvar risco:', error);
      toast({
        title: "Erro ao salvar risco",
        description: "Ocorreu um erro ao salvar os dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (risk: Risco) => {
    setEditingRisk(risk);
    setFormData({
      categoria: risk.categoria,
      descricao: risk.descricao,
      causaProvavel: risk.causa_provavel || '',
      consequencia: risk.consequencia || '',
      probabilidade: risk.probabilidade,
      impacto: risk.impacto,
      mitigacao: risk.mitigacao,
      planoContingencia: risk.plano_contingencia || '',
      responsavel: risk.responsavel || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await mapaRiscosService.deleteRiscoItem(id);
      setRiscos(prev => prev.filter(risk => risk.id !== id));
      toast({
        title: "Risco Removido",
        description: "Risco removido do mapa.",
      });
    } catch (error) {
      console.error('Erro ao remover risco:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o risco.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAIRisk = async (aiRisk: Omit<DbMapaRiscosItem, 'id' | 'mapa_riscos_id'>) => {
    try {
      setLoading(true);
      if (!currentMapaId) {
        await handleSaveDraft();
      }

      if (currentMapaId) {
        await mapaRiscosService.addRiscoItem(currentMapaId, aiRisk);
        const mapaData = await mapaRiscosService.fetchMapaRisco(currentMapaId);
        setRiscos(mapaData.mapa_riscos_itens || []);
        toast({
          title: "Sugestão Aceita",
          description: "O risco sugerido pela IA foi adicionado ao mapa.",
        });
      }
    } catch (error) {
      console.error('Erro ao aceitar risco IA:', error);
    } finally {
      setLoading(false);
    }
  };

  const summary = {
    total: riscos.length,
    alto: riscos.filter(r => r.nivel === 'Alto').length,
    medio: riscos.filter(r => r.nivel === 'Médio').length,
    baixo: riscos.filter(r => r.nivel === 'Baixo').length
  };

  if (step === 'overview') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mapa de Riscos</h1>
            <p className="text-gray-600">
              Identificação e análise de riscos associados às contratações
            </p>
          </div>
        </div>

        <MapaRiscosOverviewCards
          onViewConcluidos={handleViewConcluidos}
          onViewElaboracao={handleViewElaboracao}
        />

        <ETPSelectionModal
          isOpen={etpSelectionOpen}
          onClose={() => setEtpSelectionOpen(false)}
          onSelectETP={handleSelectETP}
          selectedETP={selectedETP}
        />
      </div>
    );
  }

  if (step === 'list-concluidos' || step === 'list-elaboracao') {
    const isConcluido = step === 'list-concluidos';
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mb-2 p-0 h-auto text-orange-600 hover:text-orange-700"
            >
              <ArrowLeft size={16} className="mr-1" />
              Voltar ao painel inicial
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isConcluido ? 'Mapas Concluídos' : 'Mapas em Elaboração'}
            </h1>
            <p className="text-gray-600">
              {isConcluido
                ? 'Visualize e gerencie mapas de riscos finalizados'
                : 'Continue editando mapas de riscos em desenvolvimento'}
            </p>
          </div>
          <Button
            onClick={handleStartNewMap}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Plus size={16} className="mr-2" />
            Novo Mapa de Riscos
          </Button>
        </div>

        <MapaRiscosCards
          statusFilter={isConcluido ? 'concluido' : 'elaboracao'}
          onViewPreview={handleViewPreview}
          onContinueEditing={handleContinueEditing}
          onExportPDF={handleExportPDF}
        />

        <MapaRiscosPreview
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          etp={selectedETP || {
            id: '',
            titulo: '',
            numeroETP: '',
            secretaria: '',
            dataCriacao: '',
            valorTotal: '',
            descricaoDemanda: '',
            status: ''
          }}
          riscos={riscos}
          onExportPDF={() => handleExportPDF()}
        />

        <ETPSelectionModal
          isOpen={etpSelectionOpen}
          onClose={() => setEtpSelectionOpen(false)}
          onSelectETP={handleSelectETP}
          selectedETP={selectedETP}
        />
      </div>
    );
  }

  if (step === 'select-etp') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={handleBackToOverview}
              className="mb-2 p-0 h-auto text-orange-600 hover:text-orange-700"
            >
              <ArrowLeft size={16} className="mr-1" />
              Voltar ao painel inicial
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Mapa de Riscos</h1>
            <p className="text-gray-600">Selecione um ETP para criar o mapa de riscos</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Criar Novo Mapa de Riscos
                </h2>
                <p className="text-gray-600 mb-6">
                  Para criar um mapa de riscos, você precisa primeiro selecionar um ETP concluído.
                  O mapa será baseado nas informações e características do ETP escolhido.
                </p>
                <Button
                  onClick={() => setEtpSelectionOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus size={16} className="mr-2" />
                  Selecionar ETP e Começar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <ETPSelectionModal
          isOpen={etpSelectionOpen}
          onClose={() => setEtpSelectionOpen(false)}
          onSelectETP={handleSelectETP}
          selectedETP={selectedETP}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={handleBackToOverview}
            className="mb-2 p-0 h-auto text-orange-600 hover:text-orange-700"
          >
            <ArrowLeft size={16} className="mr-1" />
            Voltar ao painel inicial
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentMapaId ? 'Editando Mapa de Riscos' : 'Novo Mapa de Riscos'}
          </h1>
          <p className="text-gray-600">
            ETP: <span className="font-medium text-blue-600">{selectedETP?.numeroETP}</span> - {selectedETP?.titulo}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye size={16} className="mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save size={16} className="mr-2" />
            Salvar Rascunho
          </Button>
          <Button variant="outline" onClick={() => setAiSuggestionsOpen(true)}>
            <Sparkles size={16} className="mr-2" />
            Sugerir Riscos com IA
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-600">
            <Plus size={16} className="mr-2" />
            Adicionar Risco Manualmente
          </Button>
          {riscos.length > 0 && (
            <Button onClick={handleFinalizeMapa} className="bg-green-600 hover:bg-green-700">
              <Shield size={16} className="mr-2" />
              Finalizar Mapa
            </Button>
          )}
        </div>
      </div>

      {selectedETP && (
        <ETPSummaryCard etp={selectedETP} dfds={etpDFDs} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
            <p className="text-sm text-gray-600">Total de Riscos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-red-600">{summary.alto}</div>
            <p className="text-sm text-gray-600">Risco Alto</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.medio}</div>
            <p className="text-sm text-gray-600">Risco Médio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{summary.baixo}</div>
            <p className="text-sm text-gray-600">Risco Baixo</p>
          </CardContent>
        </Card>
      </div>

      {riscos.length === 0 && !showForm && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum risco identificado
                </h2>
                <p className="text-gray-600 mb-6">
                  Comece adicionando riscos manualmente ou use nossa IA para sugerir riscos baseados no ETP selecionado.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus size={16} className="mr-2" />
                    Adicionar Risco Manualmente
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAiSuggestionsOpen(true)}
                  >
                    <Sparkles size={16} className="mr-2" />
                    Sugerir Riscos com IA
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card className="border-orange-200 shadow-md">
          <CardHeader className="bg-orange-50/50">
            <CardTitle className="text-orange-800 flex items-center">
              <Edit className="w-5 h-5 mr-2" />
              {editingRisk ? 'Editar Risco' : 'Novo Risco Manual'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={formData.categoria} onValueChange={(v) => handleInputChange('categoria', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Probabilidade</Label>
                  <Select value={formData.probabilidade} onValueChange={(v) => handleInputChange('probabilidade', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {niveis.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Impacto</Label>
                  <Select value={formData.impacto} onValueChange={(v) => handleInputChange('impacto', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Baixo', 'Médio', 'Alto'].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição do Risco</Label>
              <Textarea
                placeholder="Descreva o evento de risco..."
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Causa Provável</Label>
                <Textarea
                  value={formData.causaProvavel}
                  onChange={(e) => handleInputChange('causaProvavel', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Consequência</Label>
                <Textarea
                  value={formData.consequencia}
                  onChange={(e) => handleInputChange('consequencia', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-600" />
                Medidas de Controle
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Ação de Mitigação</Label>
                  <Textarea
                    value={formData.mitigacao}
                    onChange={(e) => handleInputChange('mitigacao', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plano de Contingência</Label>
                  <Textarea
                    value={formData.planoContingencia}
                    onChange={(e) => handleInputChange('planoContingencia', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Input
                  value={formData.responsavel}
                  onChange={(e) => handleInputChange('responsavel', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingRisk(null); }}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600">
                {editingRisk ? 'Salvar Alterações' : 'Adicionar Risco'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {riscos.length > 0 && !showForm && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Riscos Identificados</h2>
            <Badge variant="outline">{riscos.length} riscos</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {riscos.map(risk => (
              <Card key={risk.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getCategoriaColor(risk.categoria)}>{risk.categoria}</Badge>
                      <Badge className={getNivelColor(risk.nivel)}>{risk.nivel}</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(risk)}>
                        <Edit className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(risk.id!)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{risk.descricao}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-semibold">Mitigação:</span> {risk.mitigacao}
                    </div>
                    <div>
                      <span className="font-semibold">Responsável:</span> {risk.responsavel}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <AIRiskSuggestions
        isOpen={aiSuggestionsOpen}
        onClose={() => setAiSuggestionsOpen(false)}
        etp={selectedETP}
        onAcceptRisk={handleAcceptAIRisk}
      />

      <MapaRiscosPreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        etp={selectedETP || {
          id: '',
          titulo: '',
          numeroETP: '',
          secretaria: '',
          dataCriacao: '',
          valorTotal: '',
          descricaoDemanda: '',
          status: ''
        }}
        riscos={riscos}
        onExportPDF={() => handleExportPDF()}
      />
    </div>
  );
};

export default MapaRiscos;
