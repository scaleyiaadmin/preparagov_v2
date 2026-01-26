
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const usePCAData = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showPCAModal, setShowPCAModal] = useState(false);
  const [showDFDViewModal, setShowDFDViewModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedDFD, setSelectedDFD] = useState<any>(null);
  const [dfdToRemove, setDFDToRemove] = useState<any>(null);
  const [pcaPublished, setPcaPublished] = useState(false);
  const [scheduleFilters, setScheduleFilters] = useState<any>(null);
  const { toast } = useToast();

  // Mock data - em produção viria de uma API
  const approvedDFDs = [
    {
      id: 1,
      objeto: 'Aquisição de Computadores',
      valorEstimado: 'R$ 150.000,00',
      tipoDFD: 'Materiais Permanentes',
      trimestre: 'Q1',
      status: 'Aprovado',
      prioridade: 'Alta',
      anoContratacao: '2024',
      previsao: '2024-03-15'
    },
    {
      id: 2,
      objeto: 'Contratação de Consultoria TI',
      valorEstimado: 'R$ 300.000,00',
      tipoDFD: 'Serviço Não Continuado',
      trimestre: 'Q2',
      status: 'Aprovado',
      prioridade: 'Média',
      anoContratacao: '2024',
      previsao: '2024-06-20'
    },
    {
      id: 3,
      objeto: 'Reforma do Prédio',
      valorEstimado: 'R$ 2.500.000,00',
      tipoDFD: 'Serviço de Engenharia',
      trimestre: 'Q3',
      status: 'Aprovado',
      prioridade: 'Alta',
      anoContratacao: '2024',
      previsao: '2024-09-10'
    }
  ];

  const pendingDFDs = [
    {
      id: 4,
      objeto: 'Serviços de Limpeza',
      valorEstimado: 'R$ 180.000,00',
      tipoDFD: 'Serviço Continuado',
      status: 'Pendente Aprovação',
      prioridade: 'Média',
      anoContratacao: '2024'
    }
  ];

  const cancellationRequests = [
    {
      id: 5,
      objeto: 'Aquisição de Veículos',
      valorEstimado: 'R$ 200.000,00',
      tipoDFD: 'Materiais Permanentes',
      status: 'Aprovado',
      justificativaCancelamento: 'Mudança de prioridades orçamentárias',
      solicitadoPor: 'João Silva',
      dataSolicitacao: '2024-01-15'
    }
  ];

  const mockConsolidatedItems = [
    {
      id: '1',
      descricao: 'Arroz Tipo 1 - 5kg',
      quantidade: 50,
      valor: 500,
      unidadeMedida: 'Pacote',
      detalhamentoTecnico: 'Arroz branco, tipo 1, pacote de 5kg',
      secretaria: 'Secretaria de Educação',
      prioridade: 'Alta' as const,
      dataContratacao: '2024-03-15',
      dfdId: 'dfd-1',
      tipoDFD: 'Materiais de Consumo'
    },
    {
      id: '2',
      descricao: 'Arroz Tipo 1 - 5kg',
      quantidade: 30,
      valor: 300,
      unidadeMedida: 'Pacote',
      detalhamentoTecnico: 'Arroz branco, tipo 1, pacote de 5kg',
      secretaria: 'Secretaria de Assistência Social',
      prioridade: 'Média' as const,
      dataContratacao: '2024-04-20',
      dfdId: 'dfd-2',
      tipoDFD: 'Materiais de Consumo'
    },
    {
      id: '3',
      descricao: 'Papel A4 - 75g',
      quantidade: 100,
      valor: 1500,
      unidadeMedida: 'Resma',
      detalhamentoTecnico: 'Papel sulfite A4, 75g/m², 500 folhas por resma',
      secretaria: 'Secretaria de Educação',
      prioridade: 'Baixa' as const,
      dataContratacao: '2024-02-10',
      dfdId: 'dfd-1',
      tipoDFD: 'Materiais de Consumo'
    },
    {
      id: '4',
      descricao: 'Computador Desktop',
      quantidade: 10,
      valor: 25000,
      unidadeMedida: 'Unidade',
      detalhamentoTecnico: 'Computador desktop completo com monitor',
      secretaria: 'Secretaria de Educação', 
      prioridade: 'Alta' as const,
      dataContratacao: '2024-03-15',
      dfdId: 'dfd-3',
      tipoDFD: 'Materiais Permanentes'
    }
  ];

  const handleViewDFD = (dfd: any) => {
    setSelectedDFD(dfd);
    setShowDFDViewModal(true);
  };

  const handleApproveDFD = (dfd: any) => {
    toast({
      title: "DFD Aprovado",
      description: `O DFD "${dfd.objeto}" foi aprovado e incluído no PCA.`,
    });
    setShowPendingModal(false);
  };

  const handleRejectDFD = (dfd: any, justification: string) => {
    toast({
      title: "DFD Recusado",
      description: `O DFD "${dfd.objeto}" foi recusado e devolvido para correção.`,
    });
    setShowPendingModal(false);
  };

  const handleApproveCancellation = (dfd: any) => {
    toast({
      title: "Cancelamento Aprovado",
      description: `O DFD "${dfd.objeto}" foi retirado do PCA.`,
    });
    setShowCancellationModal(false);
  };

  const handleDenyCancellation = (dfd: any, justification: string) => {
    toast({
      title: "Cancelamento Negado",
      description: `A solicitação de cancelamento do DFD "${dfd.objeto}" foi negada.`,
    });
    setShowCancellationModal(false);
  };

  const handleRemoveFromPCA = (dfd: any) => {
    setDFDToRemove(dfd);
    setShowRemoveModal(true);
  };

  const handleConfirmRemoval = (dfd: any, justification: string) => {
    toast({
      title: "DFD Retirado do PCA",
      description: `O DFD "${dfd.objeto}" foi retirado do PCA com a justificativa fornecida.`,
    });
    console.log('Removing DFD:', dfd, 'Justification:', justification);
  };

  const handleGenerateSchedule = (filters: any) => {
    setScheduleFilters(filters);
    toast({
      title: "Cronograma Gerado",
      description: `Cronograma ${filters.periodicity} gerado com sucesso para o ano ${filters.year}.`,
    });
    console.log('Generated schedule with filters:', filters);
  };

  const handlePrintSchedule = () => {
    window.print();
    toast({
      title: "Imprimindo Cronograma",
      description: "O cronograma está sendo preparado para impressão.",
    });
  };

  const handlePublishPNCP = () => {
    if (pcaPublished) {
      toast({
        title: "PCA Atualizado",
        description: "O PCA foi atualizado no Portal Nacional de Contratações Públicas.",
      });
    } else {
      toast({
        title: "PCA Publicado",
        description: "O PCA foi publicado no Portal Nacional de Contratações Públicas.",
      });
      setPcaPublished(true);
    }
  };

  const totalItens = approvedDFDs.reduce((acc, dfd) => acc + 1, 0);
  const valorTotal = 'R$ 2.950.000,00';

  return {
    selectedYear,
    setSelectedYear,
    showPendingModal,
    setShowPendingModal,
    showCancellationModal,
    setShowCancellationModal,
    showPCAModal,
    setShowPCAModal,
    showDFDViewModal,
    setShowDFDViewModal,
    showScheduleModal,
    setShowScheduleModal,
    showRemoveModal,
    setShowRemoveModal,
    showExportModal,
    setShowExportModal,
    selectedDFD,
    setSelectedDFD,
    dfdToRemove,
    setDFDToRemove,
    pcaPublished,
    setPcaPublished,
    scheduleFilters,
    setScheduleFilters,
    approvedDFDs,
    pendingDFDs,
    cancellationRequests,
    mockConsolidatedItems,
    totalItens,
    valorTotal,
    handleViewDFD,
    handleApproveDFD,
    handleRejectDFD,
    handleApproveCancellation,
    handleDenyCancellation,
    handleRemoveFromPCA,
    handleConfirmRemoval,
    handleGenerateSchedule,
    handlePrintSchedule,
    handlePublishPNCP
  };
};
