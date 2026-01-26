
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  X, 
  Save,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  Paperclip,
  Settings,
  Eye,
  Scale,
  Users,
  Clipboard,
  DollarSign,
  Clock
} from 'lucide-react';
import { TermoReferencia } from '@/utils/termoReferenciaData';
import EditalStep1 from './steps/EditalStep1';
import EditalStep2 from './steps/EditalStep2';
import EditalStep3 from './steps/EditalStep3';
import EditalStep4 from './steps/EditalStep4';
import EditalStep5 from './steps/EditalStep5';
import EditalStep6 from './steps/EditalStep6';
import EditalStep7 from './steps/EditalStep7';
import EditalStep8 from './steps/EditalStep8';

interface EditalWizardProps {
  selectedTR: TermoReferencia;
  onClose: () => void;
  onSave: (editalData: any) => void;
}

interface EditalData {
  // Step 1 - Identificação e Objeto
  numeroEdital: string;
  orgaoResponsavel: string;
  unidadeGestora: string;
  responsavelTecnico: string;
  cargoResponsavel: string;
  modalidadeLicitacao: string;
  objetoLicitacao: string;
  
  // Step 2 - Critérios e Julgamento
  criterioJulgamento: string;
  justificativaCriterio: string;
  tipoExecucao: string;
  tipoEntrega: string;
  formaFornecimento: string;
  registroPrecos: boolean;
  justificativaRegistroPrecos: string;
  
  // Step 3 - Condições de Participação
  permiteMEEPP: boolean;
  permiteConsorcios: boolean;
  permiteCooperativas: boolean;
  justificativaConsorcios: string;
  vistoriaTecnica: string;
  justificativaVistoria: string;
  criteriosDesempate: string;
  documentacaoExigida: string[];
  
  // Step 4 - Recursos e Penalidades
  procedimentosRecursos: string;
  penalidadesPrevistas: string;
  responsavelJulgamento: string;
  
  // Step 5 - Execução Contratual
  formaPagamento: string;
  prazoPagamento: string;
  prazosExecucao: string;
  vigenciaContrato: string;
  garantiaContratual: boolean;
  especificacaoGarantia: string;
  subcontratacao: boolean;
  detalhesSubcontratacao: string;
  gestores: string[];
  fiscais: string[];
  
  // Step 6 - Itens da Licitação
  itensLicitacao: any[];
  exibirValorEstimado: boolean;
  
  // Step 7 - Cronograma
  dataAbertura: string;
  prazoPropostas: string;
  prazoJulgamento: string;
  prazoImpugnacao: string;
  validadePropostas: string;
  
  // Step 8 - Anexos do Edital (Modelos)
  declaracoes: {
    impedimentos: boolean;
    independente: boolean;
    habilitacao: boolean;
  };
  minutaContrato: {
    tipo: 'upload' | 'ai';
    arquivo?: File;
    texto?: string;
  };
  propostaComercial: {
    incluir: boolean;
    tipo?: 'upload' | 'auto';
    arquivo?: File;
    texto?: string;
  };
}

const EditalWizard = ({ selectedTR, onClose, onSave }: EditalWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [editalData, setEditalData] = useState<EditalData>({
    // Auto-preenchimento inicial baseado no TR
    numeroEdital: `ED-${String(Math.floor(Math.random() * 999) + 1).padStart(4, '0')}/${new Date().getFullYear()}`,
    orgaoResponsavel: selectedTR.secretaria,
    unidadeGestora: selectedTR.secretaria,
    responsavelTecnico: selectedTR.responsavel,
    cargoResponsavel: 'Responsável Técnico',
    modalidadeLicitacao: 'pregao-eletronico',
    objetoLicitacao: selectedTR.objeto,
    
    criterioJulgamento: 'menor-preco',
    justificativaCriterio: '',
    tipoExecucao: 'direta',
    tipoEntrega: 'unica',
    formaFornecimento: 'sob-demanda',
    registroPrecos: false,
    justificativaRegistroPrecos: '',
    
    permiteMEEPP: true,
    permiteConsorcios: false,
    permiteCooperativas: true,
    justificativaConsorcios: '',
    vistoriaTecnica: 'facultativa',
    justificativaVistoria: '',
    criteriosDesempate: '',
    documentacaoExigida: [],
    
    procedimentosRecursos: '',
    penalidadesPrevistas: '',
    responsavelJulgamento: '',
    
    formaPagamento: 'a-vista',
    prazoPagamento: '30',
    prazosExecucao: '60',
    vigenciaContrato: '12',
    garantiaContratual: false,
    especificacaoGarantia: '',
    subcontratacao: false,
    detalhesSubcontratacao: '',
    gestores: [selectedTR.responsavel],
    fiscais: [],
    
    itensLicitacao: [],
    exibirValorEstimado: true,
    
    dataAbertura: '',
    prazoPropostas: '8',
    prazoJulgamento: '5',
    prazoImpugnacao: '3',
    validadePropostas: '60',
    
    declaracoes: {
      impedimentos: true,
      independente: true,
      habilitacao: true
    },
    minutaContrato: {
      tipo: 'ai'
    },
    propostaComercial: {
      incluir: false
    }
  });
  
  const { toast } = useToast();

  const steps = [
    { 
      number: 1, 
      title: 'Identificação', 
      icon: FileText, 
      description: 'Objeto e dados básicos' 
    },
    { 
      number: 2, 
      title: 'Critérios', 
      icon: Scale, 
      description: 'Julgamento e execução' 
    },
    { 
      number: 3, 
      title: 'Participação', 
      icon: Users, 
      description: 'Condições e habilitação' 
    },
    { 
      number: 4, 
      title: 'Recursos', 
      icon: Clipboard, 
      description: 'Recursos e penalidades' 
    },
    { 
      number: 5, 
      title: 'Execução', 
      icon: Settings, 
      description: 'Execução contratual' 
    },
    { 
      number: 6, 
      title: 'Itens', 
      icon: DollarSign, 
      description: 'Itens da licitação' 
    },
    { 
      number: 7, 
      title: 'Cronograma', 
      icon: Clock, 
      description: 'Prazos da licitação' 
    },
    { 
      number: 8, 
      title: 'Anexos', 
      icon: Paperclip, 
      description: 'Anexos do edital' 
    }
  ];

  const updateEditalData = (field: keyof EditalData, value: any) => {
    setEditalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(editalData.numeroEdital && editalData.objetoLicitacao && 
                 editalData.modalidadeLicitacao && editalData.orgaoResponsavel);
      case 2:
        return !!(editalData.criterioJulgamento && editalData.tipoExecucao);
      case 3:
        return !!(editalData.vistoriaTecnica);
      case 4:
        return !!(editalData.procedimentosRecursos);
      case 5:
        return !!(editalData.formaPagamento && editalData.vigenciaContrato);
      case 6:
        return true; // Items são opcionais na validação
      case 7:
        return !!(editalData.dataAbertura && editalData.validadePropostas);
      case 8:
        return !!(editalData.minutaContrato.tipo);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 8) {
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1);
      } else {
        toast({
          title: "Campos Obrigatórios",
          description: "Preencha todos os campos obrigatórios antes de continuar.",
          variant: "destructive"
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    toast({
      title: "Edital Salvo",
      description: "Rascunho do edital foi salvo com sucesso.",
    });
  };

  const handleFinalize = () => {
    const finalEdital = {
      ...editalData,
      id: Date.now().toString(),
      status: 'Em Elaboração',
      dataCriacao: new Date().toISOString(),
      trVinculado: selectedTR.numero
    };
    
    onSave(finalEdital);
    toast({
      title: "Edital Finalizado",
      description: "Edital foi finalizado e está pronto para revisão.",
    });
  };

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) {
      return validateStep(stepNumber) ? 'completed' : 'error';
    } else if (stepNumber === currentStep) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EditalStep1 
            data={editalData} 
            onUpdate={updateEditalData}
            selectedTR={selectedTR}
          />
        );
      case 2:
        return (
          <EditalStep2 
            data={editalData} 
            onUpdate={updateEditalData}
            selectedTR={selectedTR}
          />
        );
      case 3:
        return (
          <EditalStep3 
            data={editalData} 
            onUpdate={updateEditalData}
            selectedTR={selectedTR}
          />
        );
      case 4:
        return (
          <EditalStep4 
            data={editalData} 
            onUpdate={updateEditalData}
          />
        );
      case 5:
        return (
          <EditalStep5 
            data={editalData} 
            onUpdate={updateEditalData}
            selectedTR={selectedTR}
          />
        );
      case 6:
        return (
          <EditalStep6 
            data={editalData} 
            onUpdate={updateEditalData}
            selectedTR={selectedTR}
          />
        );
      case 7:
        return (
          <EditalStep7 
            data={editalData} 
            onUpdate={updateEditalData}
          />
        );
      case 8:
        return (
          <EditalStep8 
            data={editalData} 
            onUpdate={updateEditalData}
            selectedTR={selectedTR}
            onFinalize={handleFinalize}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / 8) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Criação de Edital</h2>
              <p className="text-sm text-gray-600">TR: {selectedTR.numero} - {selectedTR.etpTitulo}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </Button>
              <Button variant="ghost" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Etapa {currentStep} de 8
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progress)}% concluído
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps Navigation */}
          <div className="flex items-center justify-between">
            {steps.map((step) => {
              const status = getStepStatus(step.number);
              const Icon = step.icon;
              
              return (
                <div 
                  key={step.number}
                  className={`flex flex-col items-center cursor-pointer transition-all
                    ${status === 'current' ? 'text-blue-600' : 
                      status === 'completed' ? 'text-green-600' : 
                      status === 'error' ? 'text-red-600' : 'text-gray-400'}`}
                  onClick={() => setCurrentStep(step.number)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                    ${status === 'current' ? 'bg-blue-100 border-2 border-blue-600' : 
                      status === 'completed' ? 'bg-green-100 border-2 border-green-600' : 
                      status === 'error' ? 'bg-red-100 border-2 border-red-600' : 'bg-gray-100 border-2 border-gray-300'}`}
                  >
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : status === 'error' ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500 hidden md:block">{step.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                Etapa {currentStep}/8
              </Badge>
            </div>

            {currentStep < 8 ? (
              <Button onClick={handleNext}>
                Próximo
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={handleFinalize}
                className="bg-green-600 hover:bg-green-700"
              >
                Finalizar Edital
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditalWizard;
