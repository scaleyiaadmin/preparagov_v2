import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ETPPreview from '@/components/ETP/ETPPreview';
import CreationNameModal from '@/components/CreationNameModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import {
  Save,
  Download,
  ArrowRight,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { useETPCreation } from '../hooks/useETPCreation';
import ETPDashboard from '../components/ETP/ETPDashboard';
import ETPViewModal from '../components/ETP/ETPViewModal';
import DFDSelectionStep from '../components/ETP/DFDSelectionStep';
import FormStep from '../components/ETP/FormStep';
import SummaryStep from '../components/ETP/SummaryStep';
import DFDListPagination from '../components/DFD/DFDListPagination';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'dashboard' | 'creation' | 'completed' | 'inProgress' | 'view';

const ETP = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedETP, setSelectedETP] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedETPForView, setSelectedETPForView] = useState<any>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [completedPage, setCompletedPage] = useState(1);
  const [inProgressPage, setInProgressPage] = useState(1);
  const { toast } = useToast();
  const { user } = useAuth();

  const [etps, setEtps] = useState<any[]>([]);

  useEffect(() => {
    const fetchETPs = async () => {
      try {
        // 1. Fetch ETPs with related DFDs
        let query = supabase
          .from('etp')
          .select(`
            *,
            etp_dfd (
              dfd (
                valor_estimado_total
              )
            )
          `);

        // Filtrar por prefeitura (exceto super_admin)
        if (user?.role !== 'super_admin' && user?.prefeituraId) {
          query = query.eq('prefeitura_id', user.prefeituraId);
        }

        const { data, error } = await query;

        if (error) throw error;

        // 2. Fetch Users for "Responsável" (filtrado pela mesma prefeitura)
        let usersQuery = supabase
          .from('usuarios_acesso')
          .select('id, nome');

        if (user?.role !== 'super_admin' && user?.prefeituraId) {
          usersQuery = usersQuery.eq('prefeitura_id', user.prefeituraId);
        }

        const { data: usersData } = await usersQuery;

        const formatted = data.map((etp: any) => {
          const totalValue = etp.etp_dfd?.reduce((acc: number, item: any) => {
            return acc + (item.dfd?.valor_estimado_total || 0);
          }, 0) || 0;

          const responsavel = usersData?.find((u: any) => u.id === etp.created_by)?.nome || 'Não identificado';

          return {
            id: etp.id,
            titulo: etp.objeto || etp.descricao_demanda?.substring(0, 50) + '...' || `ETP ${etp.numero_etp || 'Sem Número'}`,
            numeroETP: etp.numero_etp || 'Rascunho',
            status: etp.status,
            totalDFDs: etp.etp_dfd?.length || 0,
            valorTotal: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue),
            currentStep: etp.status === 'Em Elaboração' ? 12 : 12,
            responsavel: responsavel,
            dataCriacao: etp.created_at,
            dataUltimaEdicao: etp.created_at
          };
        });
        setEtps(formatted);
      } catch (error) {
        console.error('Error fetching ETPs:', error);
        toast({
          title: "Erro ao carregar ETPs",
          description: "Não foi possível carregar a lista de ETPs.",
          variant: "destructive"
        });
      }
    };
    fetchETPs();
  }, [viewMode]);

  const {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    steps,
    availableDFDs,
    selectDFDs,
    generateWithAI,
    nextStep,
    prevStep,
    canProceed,
    saveETP,
    generatePDF,
    loadETP
  } = useETPCreation();

  const handleCreateNew = (name: string) => {
    // Definimos um valor inicial para a demanda com o título fornecido
    updateFormData('objeto', name);
    setViewMode('creation');
    setCurrentStep(0);
    setShowNameModal(false);
  };

  const handleViewETP = (etp: any) => {
    setSelectedETPForView(etp);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedETPForView(null);
  };

  const handleViewCompleted = () => {
    setViewMode('completed');
  };

  const handleViewInProgress = () => {
    setViewMode('inProgress');
  };

  const handleContinueETP = (etp: any) => {
    setSelectedETP(etp);
    loadETP(etp.id); // Load data
    setViewMode('creation');

    toast({
      title: "ETP Carregado",
      description: `Continuando o preenchimento do ${etp.numeroETP}.`,
    });
  };

  const handleGeneratePDF = (etp: any) => {
    const filename = `ETP_${etp.numeroETP.replace(/\//g, '_')}.pdf`;

    if (selectedETPForView && selectedETPForView.id === etp.id) {
      generatePDF(filename);
    } else {
      handleViewETP(etp);
      // Aguarda o modal abrir e os dados carregarem para capturar o elemento
      setTimeout(() => generatePDF(filename), 1500);
    }

    toast({
      title: "Gerando PDF",
      description: `Iniciando download do ${etp.numeroETP}.`,
    });
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedETP(null);
  };

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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">1. Informações Básicas do ETP</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Nome do ETP (Objeto)</Label>
                    <Input
                      value={formData.objeto}
                      onChange={(e) => updateFormData('objeto', e.target.value)}
                      placeholder="Ex: Aquisição de Computadores..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Descrição Sucinta</Label>
                    <Select
                      value={formData.descricaoSucinta}
                      onValueChange={(value) => updateFormData('descricaoSucinta', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {objetoOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            <DFDSelectionStep
              availableDFDs={availableDFDs}
              selectedDFDs={formData.selectedDFDs}
              onSelectDFDs={selectDFDs}
            />
          </div>
        );
      case 1:
        return (
          <FormStep
            title="Descrição da Demanda"
            description="Detalhamento da necessidade identificada"
            value={formData.descricaoDemanda}
            onValueChange={(value) => updateFormData('descricaoDemanda', value)}
            onGenerateAI={() => generateWithAI('descricaoDemanda')}
            rows={8}
          />
        );
      case 2:
        return (
          <FormStep
            title="Requisitos da Contratação"
            description="Especificação dos requisitos técnicos e legais"
            value={formData.requisitosContratacao}
            onValueChange={(value) => updateFormData('requisitosContratacao', value)}
            onGenerateAI={() => generateWithAI('requisitosContratacao')}
          />
        );
      case 3:
        return (
          <FormStep
            title="Alternativas Possíveis"
            description="Análise de alternativas para atender à demanda"
            value={formData.alternativasDescricao}
            onValueChange={(value) => updateFormData('alternativasDescricao', value)}
            onGenerateAI={() => generateWithAI('alternativasDescricao')}
            hasCondition={true}
            conditionLabel="Existem outras possíveis alternativas?"
            conditionValue={formData.alternativasExistem}
            onConditionChange={(value) => updateFormData('alternativasExistem', value)}
          />
        );
      case 4:
        return (
          <FormStep
            title="Descrição da Solução"
            description="Detalhamento da solução proposta"
            value={formData.descricaoSolucao}
            onValueChange={(value) => updateFormData('descricaoSolucao', value)}
            onGenerateAI={() => generateWithAI('descricaoSolucao')}
          />
        );
      case 5:
        return (
          <FormStep
            title="Justificativa do Parcelamento"
            description="Fundamentação para parcelamento ou não da contratação"
            value={formData.justificativaParcelamento}
            onValueChange={(value) => updateFormData('justificativaParcelamento', value)}
            onGenerateAI={() => generateWithAI('justificativaParcelamento')}
          />
        );
      case 6:
        return (
          <FormStep
            title="Resultados Pretendidos"
            description="Objetivos e metas esperadas com a contratação"
            value={formData.resultadosPretendidos}
            onValueChange={(value) => updateFormData('resultadosPretendidos', value)}
            onGenerateAI={() => generateWithAI('resultadosPretendidos')}
          />
        );
      case 7:
        return (
          <FormStep
            title="Providências Prévias"
            description="Ações necessárias antes da contratação"
            value={formData.providenciasDescricao}
            onValueChange={(value) => updateFormData('providenciasDescricao', value)}
            onGenerateAI={() => generateWithAI('providenciasDescricao')}
            hasCondition={true}
            conditionLabel="Existem providências prévias necessárias?"
            conditionValue={formData.providenciasExistem}
            onConditionChange={(value) => updateFormData('providenciasExistem', value)}
          />
        );
      case 8:
        return (
          <FormStep
            title="Contratações Correlatas"
            description="Contratações relacionadas ou interdependentes"
            value={formData.contratacoesDescricao}
            onValueChange={(value) => updateFormData('contratacoesDescricao', value)}
            onGenerateAI={() => generateWithAI('contratacoesDescricao')}
            hasCondition={true}
            conditionLabel="Existem contratações correlatas ou interdependentes?"
            conditionValue={formData.contratacoesCorrelatas}
            onConditionChange={(value) => updateFormData('contratacoesCorrelatas', value)}
          />
        );
      case 9:
        return (
          <FormStep
            title="Impactos Ambientais"
            description="Análise de possíveis impactos ao meio ambiente"
            value={formData.impactosDescricao}
            onValueChange={(value) => updateFormData('impactosDescricao', value)}
            onGenerateAI={() => generateWithAI('impactosDescricao')}
            hasCondition={true}
            conditionLabel="Existem possíveis impactos ambientais?"
            conditionValue={formData.impactosAmbientais}
            onConditionChange={(value) => updateFormData('impactosAmbientais', value)}
          />
        );
      case 10:
        return (
          <FormStep
            title="Observações Gerais"
            description="Informações adicionais relevantes"
            value={formData.observacoesGerais}
            onValueChange={(value) => updateFormData('observacoesGerais', value)}
            onGenerateAI={() => generateWithAI('observacoesGerais')}
          />
        );
      case 11:
        return (
          <FormStep
            title="Conclusão Técnica"
            description="Parecer técnico final sobre a contratação"
            value={formData.conclusaoTecnica}
            onValueChange={(value) => updateFormData('conclusaoTecnica', value)}
            onGenerateAI={() => generateWithAI('conclusaoTecnica')}
          />
        );
      case 12:
        return (
          <SummaryStep
            formData={formData}
            onGeneratePDF={() => generatePDF(`ETP_${formData.selectedDFDs[0]?.numeroDFD || 'Novo'}.pdf`)}
            user={user}
          />
        );
      default:
        return null;
    }
  };

  const renderListView = (title: string, etps: any[], isCompleted: boolean) => {
    const itemsPerPage = 5;
    const currentPage = isCompleted ? completedPage : inProgressPage;
    const setCurrentPage = isCompleted ? setCompletedPage : setInProgressPage;

    const totalPages = Math.ceil(etps.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedETPs = etps.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">Lista de estudos técnicos por status</p>
          </div>
          <Button variant="outline" onClick={handleBackToDashboard}>
            Voltar ao Painel
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {paginatedETPs.map((etp) => (
                <div
                  key={etp.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <h3 className="font-medium text-gray-900">{etp.titulo}</h3>
                      <p className="text-sm text-blue-600 font-medium">{etp.numeroETP}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{etp.totalDFDs} DFD(s) vinculado(s)</span>
                        <span>•</span>
                        <span className="font-semibold">{etp.valorTotal}</span>
                      </div>
                      {!isCompleted && etp.currentStep && (
                        <div className="text-xs text-gray-500">
                          Progresso: Etapa {etp.currentStep + 1}/13
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {isCompleted ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewETP(etp)}
                          >
                            <FileText size={14} className="mr-1" />
                            Visualizar Documento
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGeneratePDF(etp)}
                          >
                            <Download size={14} className="mr-1" />
                            Gerar PDF
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleContinueETP(etp)}
                          className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                        >
                          Continuar Preenchimento
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {etps.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum ETP encontrado.</p>
                </div>
              )}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-6">
                <DFDListPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* ETP View Modal */}
        <ETPViewModal
          isOpen={viewModalOpen}
          onClose={handleCloseViewModal}
          etp={selectedETPForView}
          onGeneratePDF={handleGeneratePDF}
        />
      </div>
    );
  };

  // Dashboard view
  if (viewMode === 'dashboard') {
    return (
      <div className="space-y-6">
        <ETPDashboard
          etps={etps}
          onCreateNew={() => setShowNameModal(true)}
          onViewETP={handleViewETP}
          onViewCompleted={handleViewCompleted}
          onViewInProgress={handleViewInProgress}
          onContinueETP={handleContinueETP}
          onGeneratePDF={handleGeneratePDF}
        />

        <CreationNameModal
          isOpen={showNameModal}
          onClose={() => setShowNameModal(false)}
          onConfirm={handleCreateNew}
          title="Novo Estudo Técnico Preliminar (ETP)"
          placeholder="Dê um título para este ETP..."
          description="Este título ajudará a identificar o estudo durante a elaboração e no dashboard."
        />
      </div>
    );
  }

  if (viewMode === 'completed') {
    const completedETPs = etps.filter(e => e.status === 'Concluído');
    return renderListView('ETPs Concluídos', completedETPs, true);
  }

  if (viewMode === 'inProgress') {
    const inProgressETPs = etps.filter(e => e.status === 'Em Elaboração');
    return renderListView('ETPs em Andamento', inProgressETPs, false);
  }

  // Individual ETP view
  if (viewMode === 'view' && selectedETP) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedETP.titulo}</h1>
            <p className="text-gray-600">{selectedETP.numeroETP}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleBackToDashboard}>
              Voltar ao Painel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleGeneratePDF(selectedETP)}
            >
              <Download size={16} className="mr-2" />
              Gerar PDF
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-sm text-gray-900">{selectedETP.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Valor Total</label>
                  <p className="text-sm text-gray-900">{selectedETP.valorTotal}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">DFDs Vinculados</label>
                  <p className="text-sm text-gray-900">{selectedETP.totalDFDs}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Responsável</label>
                  <p className="text-sm text-gray-900">{selectedETP.responsavel}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Creation mode - existing ETP creation flow
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ETP - Estudo Técnico Preliminar</h1>
          <p className="text-gray-600">
            Elaboração dos estudos técnicos para fundamentar as contratações
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Progresso: {currentStep + 1} de {steps.length}
              </span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% concluído</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Steps Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`p-3 text-sm rounded-lg border transition-colors ${currentStep === step.id
                  ? 'bg-orange-500 text-white border-orange-500'
                  : step.id < currentStep
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
              >
                <div className="font-medium">{step.id + 1}</div>
                <div className="text-xs mt-1">{step.title}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      {renderCurrentStep()}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft size={16} className="mr-2" />
          Anterior
        </Button>
        <Button
          onClick={currentStep === steps.length - 1 ? async () => {
            const success = await saveETP();
            if (success) setViewMode('dashboard');
          } : nextStep}
          disabled={!canProceed()}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {currentStep === steps.length - 1 ? (
            <>
              <Save size={16} className="mr-2" />
              Concluir
            </>
          ) : (
            <>
              Próximo
              <ArrowRight size={16} className="ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ETP;
