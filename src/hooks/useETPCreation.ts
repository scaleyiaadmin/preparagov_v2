import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SelectedDFD {
  id: number;
  objeto: string;
  valorEstimado: string;
  tipoDFD: string;
  secretaria?: string;
  prioridade: string;
  dataContratacao?: string;
  numeroDFD?: string;
  status?: string;
  usedInETP?: boolean;
  secretario?: string;
  responsavelDemanda?: string;
}

interface ETPFormData {
  selectedDFDs: SelectedDFD[];
  descricaoDemanda: string;
  requisitosContratacao: string;
  alternativasExistem: boolean;
  alternativasDescricao: string;
  descricaoSolucao: string;
  justificativaParcelamento: string;
  resultadosPretendidos: string;
  providenciasExistem: boolean;
  providenciasDescricao: string;
  contratacoesCorrelatas: boolean;
  contratacoesDescricao: string;
  impactosAmbientais: boolean;
  impactosDescricao: string;
  observacoesGerais: string;
  conclusaoTecnica: string;
}

export const useETPCreation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ETPFormData>({
    selectedDFDs: [],
    descricaoDemanda: '',
    requisitosContratacao: '',
    alternativasExistem: false,
    alternativasDescricao: '',
    descricaoSolucao: '',
    justificativaParcelamento: '',
    resultadosPretendidos: '',
    providenciasExistem: false,
    providenciasDescricao: '',
    contratacoesCorrelatas: false,
    contratacoesDescricao: '',
    impactosAmbientais: false,
    impactosDescricao: '',
    observacoesGerais: '',
    conclusaoTecnica: ''
  });
  const { toast } = useToast();

  // Enhanced mock DFDs with additional fields for filtering
  const availableDFDs = [
    {
      id: 1,
      objeto: 'Aquisição de Computadores',
      valorEstimado: 'R$ 150.000,00',
      tipoDFD: 'Materiais Permanentes',
      secretaria: 'Secretaria de Educação',
      prioridade: 'Alta',
      dataContratacao: '2024-03-15',
      numeroDFD: 'DFD-001/2024',
      status: 'Aprovado',
      usedInETP: false,
      secretario: 'João Silva',
      responsavelDemanda: 'Maria Oliveira'
    },
    {
      id: 2,
      objeto: 'Contratação de Consultoria TI',
      valorEstimado: 'R$ 300.000,00',
      tipoDFD: 'Serviço Não Continuado',
      secretaria: 'Secretaria de Administração',
      prioridade: 'Média',
      dataContratacao: '2024-04-20',
      numeroDFD: 'DFD-002/2024',
      status: 'Aprovado',
      usedInETP: false,
      secretario: 'Fernanda Souza',
      responsavelDemanda: 'Rodrigo Lima'
    },
    {
      id: 3,
      objeto: 'Reforma do Prédio',
      valorEstimado: 'R$ 2.500.000,00',
      tipoDFD: 'Serviço de Engenharia',
      secretaria: 'Secretaria de Obras',
      prioridade: 'Alta',
      dataContratacao: '2024-02-10',
      numeroDFD: 'DFD-003/2024',
      status: 'Aprovado',
      usedInETP: false,
      secretario: 'Carlos Pereira',
      responsavelDemanda: 'Luciana Costa'
    },
    {
      id: 4,
      objeto: 'Aquisição de Veículos',
      valorEstimado: 'R$ 800.000,00',
      tipoDFD: 'Materiais Permanentes',
      secretaria: 'Secretaria de Saúde',
      prioridade: 'Alta',
      dataContratacao: '2024-05-30',
      numeroDFD: 'DFD-004/2024',
      status: 'Aprovado',
      usedInETP: true,
      secretario: 'Ana Paula Santos',
      responsavelDemanda: 'José Roberto'
    },
    {
      id: 5,
      objeto: 'Contratação de Limpeza',
      valorEstimado: 'R$ 120.000,00',
      tipoDFD: 'Serviço Continuado',
      secretaria: 'Secretaria de Administração',
      prioridade: 'Baixa',
      dataContratacao: '2024-06-15',
      numeroDFD: 'DFD-005/2024',
      status: 'Aprovado',
      usedInETP: false,
      secretario: 'Fernanda Souza',
      responsavelDemanda: 'Pedro Henrique'
    },
    {
      id: 6,
      objeto: 'Sistema de Gestão Escolar',
      valorEstimado: 'R$ 450.000,00',
      tipoDFD: 'Serviço Não Continuado',
      secretaria: 'Secretaria de Educação',
      prioridade: 'Média',
      dataContratacao: '2024-07-10',
      numeroDFD: 'DFD-006/2024',
      status: 'Aprovado',
      usedInETP: false,
      secretario: 'João Silva',
      responsavelDemanda: 'Carolina Ferreira'
    },
    {
      id: 7,
      objeto: 'Equipamentos Médicos',
      valorEstimado: 'R$ 1.200.000,00',
      tipoDFD: 'Materiais Permanentes',
      secretaria: 'Secretaria de Saúde',
      prioridade: 'Alta',
      dataContratacao: '2024-01-25',
      numeroDFD: 'DFD-007/2024',
      status: 'Aprovado',
      usedInETP: false,
      secretario: 'Ana Paula Santos',
      responsavelDemanda: 'Dr. Ricardo Moura'
    },
    {
      id: 8,
      objeto: 'Pavimentação de Ruas',
      valorEstimado: 'R$ 3.200.000,00',
      tipoDFD: 'Serviço de Engenharia',
      secretaria: 'Secretaria de Obras',
      prioridade: 'Média',
      dataContratacao: '2024-08-05',
      numeroDFD: 'DFD-008/2024',
      status: 'Aprovado',
      usedInETP: true,
      secretario: 'Carlos Pereira',
      responsavelDemanda: 'Eng. Marcos Silva'
    }
  ];

  const steps = [
    { id: 0, title: 'Seleção de DFDs', description: 'Selecione os DFDs vinculados' },
    { id: 1, title: 'Descrição da Demanda', description: 'Detalhe a demanda' },
    { id: 2, title: 'Requisitos', description: 'Requisitos da contratação' },
    { id: 3, title: 'Alternativas', description: 'Alternativas possíveis' },
    { id: 4, title: 'Solução', description: 'Descrição da solução' },
    { id: 5, title: 'Parcelamento', description: 'Justificativa do parcelamento' },
    { id: 6, title: 'Resultados', description: 'Resultados pretendidos' },
    { id: 7, title: 'Providências', description: 'Providências prévias' },
    { id: 8, title: 'Contratações', description: 'Contratações correlatas' },
    { id: 9, title: 'Impactos', description: 'Impactos ambientais' },
    { id: 10, title: 'Observações', description: 'Observações gerais' },
    { id: 11, title: 'Conclusão', description: 'Conclusão técnica' },
    { id: 12, title: 'Resumo', description: 'Resumo final' }
  ];

  // Salvar progresso no localStorage
  useEffect(() => {
    localStorage.setItem('etp-creation-progress', JSON.stringify({ currentStep, formData }));
  }, [currentStep, formData]);

  // Carregar progresso do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('etp-creation-progress');
    if (saved) {
      const { currentStep: savedStep, formData: savedData } = JSON.parse(saved);
      setCurrentStep(savedStep);
      setFormData(savedData);
    }
  }, []);

  const updateFormData = (field: keyof ETPFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateDemandDescription = (dfds: SelectedDFD[]) => {
    if (dfds.length === 0) return '';

    // Calculate total value
    const totalValue = dfds.reduce((sum, dfd) => {
      const value = parseFloat(dfd.valorEstimado.replace(/[R$.,\s]/g, '').replace(',', '.')) || 0;
      return sum + value;
    }, 0);

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    const dfdDescriptions = dfds.map(dfd => 
      `DFD nº ${dfd.numeroDFD} – ${dfd.objeto} (${dfd.tipoDFD})
Secretário: ${dfd.secretario || 'Não informado'} | Responsável pela Demanda: ${dfd.responsavelDemanda || 'Não informado'}
Valor estimado: ${dfd.valorEstimado}`
    ).join('\n\n');

    return `Demanda consolidada baseada nos seguintes DFDs aprovados:

${dfdDescriptions}

---

**Valor Total da Demanda: ${formatCurrency(totalValue)}**`;
  };

  const selectDFDs = (dfds: SelectedDFD[]) => {
    updateFormData('selectedDFDs', dfds);
    
    // Auto-generate enhanced demand description
    const description = generateDemandDescription(dfds);
    updateFormData('descricaoDemanda', description);
  };

  const generateWithAI = async (field: keyof ETPFormData) => {
    const aiContent: Record<string, string> = {
      descricaoDemanda: 'A administração pública necessita modernizar sua infraestrutura e otimizar seus serviços para melhor atender aos cidadãos. Esta demanda surge da necessidade de adequação tecnológica e melhoria dos processos administrativos.',
      requisitosContratacao: 'A contratação deve atender aos seguintes requisitos: conformidade com a legislação vigente, adequação técnica às necessidades da administração, sustentabilidade ambiental, economicidade e eficiência na execução.',
      alternativasDescricao: 'Foram analisadas as seguintes alternativas: contratação direta com fornecedor especializado, terceirização completa dos serviços, aquisição gradual dos itens, parcerias público-privadas e utilização de recursos próprios.',
      descricaoSolucao: 'A solução proposta consiste na implementação de um conjunto integrado de ações que contempla a aquisição de equipamentos, contratação de serviços especializados e adequação da infraestrutura necessária para atender plenamente às demandas identificadas.',
      justificativaParcelamento: 'O parcelamento da contratação se justifica pela necessidade de distribuir os recursos orçamentários ao longo do exercício, permitir melhor controle da execução e possibilitar a participação de um maior número de fornecedores.',
      resultadosPretendidos: 'Espera-se como resultados: melhoria na qualidade dos serviços prestados, aumento da eficiência operacional, redução de custos, modernização tecnológica e maior satisfação dos usuários dos serviços públicos.',
      providenciasDescricao: 'Deverão ser tomadas as seguintes providências: aprovação orçamentária, elaboração do termo de referência, definição da equipe técnica responsável, adequação do espaço físico e treinamento dos usuários.',
      contratacoesDescricao: 'Existem contratações correlatas relacionadas à infraestrutura de rede, suporte técnico especializado e treinamento de usuários que deverão ser coordenadas para garantir a efetividade da solução proposta.',
      impactosDescricao: 'Os impactos ambientais são mínimos, limitando-se ao descarte adequado de equipamentos obsoletos. Serão adotadas medidas de destinação ambientalmente correta e preferência por fornecedores com certificação ambiental.',
      observacoesGerais: 'É importante observar que a execução desta contratação deve ser coordenada com outras ações da administração para garantir sinergia e otimização dos recursos públicos disponíveis.',
      conclusaoTecnica: 'Tecnicamente, a contratação é viável e necessária para atender às demandas identificadas. Os benefícios esperados justificam o investimento, e os riscos são controláveis mediante adoção das medidas preventivas adequadas.'
    };

    const content = aiContent[field] || '';
    updateFormData(field, content);
    
    toast({
      title: "Conteúdo Gerado por IA",
      description: "Campo preenchido automaticamente com base em melhores práticas.",
    });
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

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.selectedDFDs.length > 0;
      case 1:
        return formData.descricaoDemanda.trim() !== '';
      case 2:
        return formData.requisitosContratacao.trim() !== '';
      case 3:
        return !formData.alternativasExistem || formData.alternativasDescricao.trim() !== '';
      case 4:
        return formData.descricaoSolucao.trim() !== '';
      case 5:
        return formData.justificativaParcelamento.trim() !== '';
      case 6:
        return formData.resultadosPretendidos.trim() !== '';
      case 7:
        return !formData.providenciasExistem || formData.providenciasDescricao.trim() !== '';
      case 8:
        return !formData.contratacoesCorrelatas || formData.contratacoesDescricao.trim() !== '';
      case 9:
        return !formData.impactosAmbientais || formData.impactosDescricao.trim() !== '';
      case 10:
        return formData.observacoesGerais.trim() !== '';
      case 11:
        return formData.conclusaoTecnica.trim() !== '';
      default:
        return true;
    }
  };

  const saveETP = () => {
    toast({
      title: "ETP Salvo",
      description: "Estudo Técnico Preliminar salvo com sucesso no sistema.",
    });
    localStorage.removeItem('etp-creation-progress');
  };

  const generatePDF = () => {
    const generateETPId = () => {
      return `ETP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    };

    const etpId = generateETPId();
    const fileName = `${etpId.replace('-', '_')}.pdf`;

    // Simulate PDF generation
    toast({
      title: "PDF Gerado com Sucesso",
      description: `Documento ${fileName} foi gerado e está pronto para download.`,
    });

    // In a real implementation, you would use a library like jsPDF or html2pdf
    // to generate the actual PDF from the preview content
    console.log(`Generating PDF: ${fileName}`);
    console.log('ETP Data:', formData);
  };

  return {
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
  };
};
