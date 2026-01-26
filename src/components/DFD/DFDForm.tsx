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
  Lightbulb
} from 'lucide-react';
import ItemSearchModal from './ItemSearchModal';
import DFDPreview from './DFDPreview';
import ItemsTable from './ItemsTable';
import AISuggestionsModal from './AISuggestionsModal';
import ItemEditModal from './ItemEditModal';
import ItemJustificationForm from './ItemJustificationForm';

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

  const objetoOptions = [
    'Aquisição de Gêneros Alimentícios',
    'Aquisição de Material de Limpeza',
    'Aquisição de Medicamentos',
    'Aquisição de Material Hospitalar'
  ];

  const tipoDFDOptions = [
    'MATERIAIS DE CONSUMO',
    'MATERIAIS PERMANENTES', 
    'SERVIÇO CONTINUADO',
    'SERVIÇO NÃO CONTINUADO',
    'SERVIÇO DE ENGENHARIA',
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
    return formData.objeto && formData.prioridade && formData.dataPrevista;
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

  const handleSave = () => {
    toast({
      title: "DFD Salvo",
      description: "Documento salvo como rascunho com sucesso.",
    });
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

    toast({
      title: editingDFD ? "DFD Atualizado" : "DFD Enviado",
      description: editingDFD ? "DFD atualizado com sucesso." : "Documento enviado para aprovação com sucesso.",
    });
    onBack();
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
              <Label htmlFor="descricaoDemanda">Descrição da Demanda *</Label>
              <div className="relative">
                <Textarea
                  id="descricaoDemanda"
                  value={formData.descricaoDemanda}
                  onChange={(e) => handleInputChange('descricaoDemanda', e.target.value)}
                  placeholder="Descreva a demanda que motiva a contratação..."
                  rows={4}
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
