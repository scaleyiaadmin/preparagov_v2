import React, { useState } from 'react';
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

interface Risco {
  id: number;
  categoria: string;
  descricao: string;
  causaProvavel?: string;
  consequencia?: string;
  probabilidade: string;
  impacto: string;
  nivel: string;
  mitigacao: string;
  planoContingencia?: string;
  responsavel?: string;
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

interface MapaRisco {
  id: string;
  titulo: string;
  etpNumero: string;
  etpTitulo: string;
  secretaria: string;
  dataCriacao: string;
  dataUltimaEdicao?: string;
  totalRiscos: number;
  riscosAlto: number;
  status: 'concluido' | 'elaboracao';
}

const MapaRiscos = () => {
  const [step, setStep] = useState<'overview' | 'list-concluidos' | 'list-elaboracao' | 'select-etp' | 'create-risks'>('overview');
  const [selectedETP, setSelectedETP] = useState<ETP | null>(null);
  const [etpSelectionOpen, setEtpSelectionOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [aiSuggestionsOpen, setAiSuggestionsOpen] = useState(false);
  const [currentMapaId, setCurrentMapaId] = useState<string | null>(null);
  
  // Mock DFDs vinculados ao ETP selecionado
  const [etpDFDs, setEtpDFDs] = useState<DFD[]>([]);
  
  const [riscos, setRiscos] = useState<Risco[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risco | null>(null);
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

  const { toast } = useToast();

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

  const handleViewConcluidos = () => {
    setStep('list-concluidos');
  };

  const handleViewElaboracao = () => {
    setStep('list-elaboracao');
  };

  const handleBackToOverview = () => {
    setStep('overview');
    setSelectedETP(null);
    setCurrentMapaId(null);
    setRiscos([]);
    setEtpDFDs([]);
  };

  const handleSelectETP = (etp: ETP) => {
    setSelectedETP(etp);
    
    // Mock: buscar DFDs vinculados ao ETP
    const mockDFDs: DFD[] = [
      {
        id: '1',
        numero: 'DFD-2024-001',
        nome: 'Aquisição de equipamentos de informática',
        valor: 'R$ 450.000,00',
        tipo: 'Material'
      },
      {
        id: '2',
        numero: 'DFD-2024-002',
        nome: 'Serviços de implementação e treinamento',
        valor: 'R$ 120.000,00',
        tipo: 'Serviço'
      }
    ];
    setEtpDFDs(mockDFDs);
    
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

  const handleViewPreview = (mapa: MapaRisco) => {
    setPreviewOpen(true);
    toast({
      title: "Visualizando Mapa",
      description: `Abrindo preview do ${mapa.titulo}`,
    });
  };

  const handleContinueEditing = (mapa: MapaRisco) => {
    setCurrentMapaId(mapa.id);
    setStep('create-risks');
    toast({
      title: "Carregando Mapa",
      description: `Continuando edição do ${mapa.titulo}`,
    });
  };

  const handleExportPDF = (mapa?: MapaRisco) => {
    toast({
      title: "Exportando PDF",
      description: "Gerando arquivo PDF do mapa de riscos...",
    });
  };

  const handleSaveDraft = () => {
    toast({
      title: "Rascunho Salvo",
      description: "Mapa de riscos salvo como rascunho.",
    });
  };

  const handleFinalizeMapa = () => {
    toast({
      title: "Mapa Finalizado",
      description: "Mapa de riscos finalizado com sucesso!",
    });
    setStep('overview');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    const nivel = calcularNivel(formData.probabilidade, formData.impacto);
    
    if (editingRisk) {
      setRiscos(prev => prev.map(risk => 
        risk.id === editingRisk.id
          ? { ...editingRisk, ...formData, nivel }
          : risk
      ));
      toast({
        title: "Risco Atualizado",
        description: "Risco atualizado com sucesso.",
      });
    } else {
      const newRisk: Risco = {
        id: Date.now(),
        ...formData,
        nivel
      };
      setRiscos(prev => [...prev, newRisk]);
      toast({
        title: "Risco Adicionado",
        description: "Novo risco adicionado ao mapa.",
      });
    }

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
    setShowForm(false);
    setEditingRisk(null);
  };

  const handleEdit = (risk: Risco) => {
    setEditingRisk(risk);
    setFormData({
      categoria: risk.categoria,
      descricao: risk.descricao,
      causaProvavel: risk.causaProvavel || '',
      consequencia: risk.consequencia || '',
      probabilidade: risk.probabilidade,
      impacto: risk.impacto,
      mitigacao: risk.mitigacao,
      planoContingencia: risk.planoContingencia || '',
      responsavel: risk.responsavel || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setRiscos(prev => prev.filter(risk => risk.id !== id));
    toast({
      title: "Risco Removido",
      description: "Risco removido do mapa.",
    });
  };

  const handleAcceptAIRisk = (aiRisk: Omit<Risco, 'id'>) => {
    const newRisk: Risco = {
      id: Date.now(),
      ...aiRisk
    };
    setRiscos(prev => [...prev, newRisk]);
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

  if (step === 'list-concluidos') {
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
            <h1 className="text-2xl font-bold text-gray-900">Mapas Concluídos</h1>
            <p className="text-gray-600">Visualize e gerencie mapas de riscos finalizados</p>
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
          statusFilter="concluido"
          onViewPreview={handleViewPreview}
          onContinueEditing={handleContinueEditing}
          onExportPDF={handleExportPDF}
        />

        <ETPSelectionModal
          isOpen={etpSelectionOpen}
          onClose={() => setEtpSelectionOpen(false)}
          onSelectETP={handleSelectETP}
          selectedETP={selectedETP}
        />

        <MapaRiscosPreview
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          etp={selectedETP || {
            id: '1',
            titulo: 'ETP Exemplo',
            numeroETP: 'ETP-2024-001',
            secretaria: 'Secretaria Exemplo',
            dataCriacao: '2024-01-01',
            valorTotal: 'R$ 1.000.000,00',
            descricaoDemanda: 'Descrição de exemplo',
            status: 'Concluído'
          }}
          riscos={riscos}
          onExportPDF={() => handleExportPDF()}
        />
      </div>
    );
  }

  if (step === 'list-elaboracao') {
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
            <h1 className="text-2xl font-bold text-gray-900">Mapas em Elaboração</h1>
            <p className="text-gray-600">Continue editando mapas de riscos em desenvolvimento</p>
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
          statusFilter="elaboracao"
          onViewPreview={handleViewPreview}
          onContinueEditing={handleContinueEditing}
          onExportPDF={handleExportPDF}
        />

        <ETPSelectionModal
          isOpen={etpSelectionOpen}
          onClose={() => setEtpSelectionOpen(false)}
          onSelectETP={handleSelectETP}
          selectedETP={selectedETP}
        />

        <MapaRiscosPreview
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          etp={selectedETP || {
            id: '1',
            titulo: 'ETP Exemplo',
            numeroETP: 'ETP-2024-001',
            secretaria: 'Secretaria Exemplo',
            dataCriacao: '2024-01-01',
            valorTotal: 'R$ 1.000.000,00',
            descricaoDemanda: 'Descrição de exemplo',
            status: 'Concluído'
          }}
          riscos={riscos}
          onExportPDF={() => handleExportPDF()}
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

      {riscos.length === 0 && (
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
        <Card>
          <CardHeader>
            <CardTitle>{editingRisk ? 'Editar Risco' : 'Adicionar Risco Manualmente'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="probabilidade">Probabilidade</Label>
                <Select value={formData.probabilidade} onValueChange={(value) => handleInputChange('probabilidade', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a probabilidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {niveis.map(nivel => (
                      <SelectItem key={nivel} value={nivel}>{nivel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="impacto">Impacto</Label>
                <Select value={formData.impacto} onValueChange={(value) => handleInputChange('impacto', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o impacto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixo">Baixo</SelectItem>
                    <SelectItem value="Médio">Médio</SelectItem>
                    <SelectItem value="Alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) => handleInputChange('responsavel', e.target.value)}
                  placeholder="Responsável pelo gerenciamento"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição do Risco</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descreva o risco identificado..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="causaProvavel">Causa Provável</Label>
                <Textarea
                  id="causaProvavel"
                  value={formData.causaProvavel}
                  onChange={(e) => handleInputChange('causaProvavel', e.target.value)}
                  placeholder="Descreva a causa provável..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consequencia">Consequência</Label>
                <Textarea
                  id="consequencia"
                  value={formData.consequencia}
                  onChange={(e) => handleInputChange('consequencia', e.target.value)}
                  placeholder="Descreva as possíveis consequências..."
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mitigacao">Estratégia de Mitigação</Label>
              <Textarea
                id="mitigacao"
                value={formData.mitigacao}
                onChange={(e) => handleInputChange('mitigacao', e.target.value)}
                placeholder="Descreva as medidas para mitigar o risco..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planoContingencia">Plano de Contingência</Label>
              <Textarea
                id="planoContingencia"
                value={formData.planoContingencia}
                onChange={(e) => handleInputChange('planoContingencia', e.target.value)}
                placeholder="Descreva o plano de contingência..."
                rows={2}
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600">
                <Save size={16} className="mr-2" />
                {editingRisk ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {riscos.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Riscos Identificados</CardTitle>
              <Button onClick={handleFinalizeMapa} className="bg-green-600 hover:bg-green-700">
                <Target size={16} className="mr-2" />
                Finalizar Mapa
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riscos.map((risco) => (
                <div key={risco.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getCategoriaColor(risco.categoria)}>
                          {risco.categoria}
                        </Badge>
                        <Badge className={getNivelColor(risco.nivel)}>
                          {risco.nivel}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">{risco.descricao}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">Probabilidade:</span> {risco.probabilidade}
                        </div>
                        <div>
                          <span className="font-medium">Impacto:</span> {risco.impacto}
                        </div>
                        <div>
                          <span className="font-medium">Responsável:</span> {risco.responsavel || '-'}
                        </div>
                      </div>
                      {risco.causaProvavel && (
                        <div className="mb-2">
                          <span className="font-medium text-sm text-gray-700">Causa:</span>
                          <p className="text-sm text-gray-600">{risco.causaProvavel}</p>
                        </div>
                      )}
                      {risco.consequencia && (
                        <div className="mb-2">
                          <span className="font-medium text-sm text-gray-700">Consequência:</span>
                          <p className="text-sm text-gray-600">{risco.consequencia}</p>
                        </div>
                      )}
                      <div className="mb-2">
                        <span className="font-medium text-sm text-gray-700">Mitigação:</span>
                        <p className="text-sm text-gray-600 mt-1">{risco.mitigacao}</p>
                      </div>
                      {risco.planoContingencia && (
                        <div>
                          <span className="font-medium text-sm text-gray-700">Contingência:</span>
                          <p className="text-sm text-gray-600 mt-1">{risco.planoContingencia}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(risco)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(risco.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <MapaRiscosPreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        etp={selectedETP!}
        riscos={riscos}
        onExportPDF={() => handleExportPDF()}
      />

      {aiSuggestionsOpen && selectedETP && (
        <AIRiskSuggestions
          etp={selectedETP}
          dfds={etpDFDs}
          onAcceptRisk={handleAcceptAIRisk}
          onClose={() => setAiSuggestionsOpen(false)}
        />
      )}
    </div>
  );
};

export default MapaRiscos;
