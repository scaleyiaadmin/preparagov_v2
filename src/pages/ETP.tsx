import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  const [completedPage, setCompletedPage] = useState(1);
  const [inProgressPage, setInProgressPage] = useState(1);
  const { toast } = useToast();

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
    generatePDF
  } = useETPCreation();

  const handleCreateNew = () => {
    setViewMode('creation');
    setCurrentStep(0);
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
    setCurrentStep(etp.currentStep || 0);
    setViewMode('creation');
    
    toast({
      title: "ETP Carregado",
      description: `Continuando o preenchimento do ${etp.numeroETP} na etapa ${(etp.currentStep || 0) + 1}.`,
    });
  };

  const handleGeneratePDF = (etp: any) => {
    const fileName = `${etp.numeroETP.replace('-', '_')}.pdf`;
    
    toast({
      title: "PDF Gerado com Sucesso",
      description: `Documento ${fileName} foi gerado e está pronto para download.`,
    });
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedETP(null);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DFDSelectionStep
            availableDFDs={availableDFDs}
            selectedDFDs={formData.selectedDFDs}
            onSelectDFDs={selectDFDs}
          />
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
        return <SummaryStep formData={formData} onGeneratePDF={generatePDF} />;
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
      <ETPDashboard
        onCreateNew={handleCreateNew}
        onViewETP={handleViewETP}
        onViewCompleted={handleViewCompleted}
        onViewInProgress={handleViewInProgress}
        onContinueETP={handleContinueETP}
        onGeneratePDF={handleGeneratePDF}
      />
    );
  }

  // List views
  if (viewMode === 'completed') {
    const completedETPs = [
      {
        id: '1',
        titulo: 'ETP Modernização Tecnológica',
        numeroETP: 'ETP-2024-001',
        totalDFDs: 3,
        valorTotal: 'R$ 2.950.000,00',
      },
      {
        id: '3',
        titulo: 'ETP Equipamentos de Saúde',
        numeroETP: 'ETP-2024-003',
        totalDFDs: 4,
        valorTotal: 'R$ 3.200.000,00',
      }
    ];
    return renderListView('ETPs Concluídos', completedETPs, true);
  }

  if (viewMode === 'inProgress') {
    const inProgressETPs = [
      {
        id: '2',
        titulo: 'ETP Infraestrutura Escolar',
        numeroETP: 'ETP-2024-002',
        totalDFDs: 2,
        valorTotal: 'R$ 1.800.000,00',
        currentStep: 5
      },
      {
        id: '4',
        titulo: 'ETP Serviços Administrativos',
        numeroETP: 'ETP-2024-004',
        totalDFDs: 1,
        valorTotal: 'R$ 450.000,00',
        currentStep: 3
      }
    ];
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
                className={`p-3 text-sm rounded-lg border transition-colors ${
                  currentStep === step.id
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
          onClick={nextStep}
          disabled={currentStep === steps.length - 1 || !canProceed()}
          className="bg-orange-500 hover:bg-orange-600"
        >
          Próximo
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ETP;
