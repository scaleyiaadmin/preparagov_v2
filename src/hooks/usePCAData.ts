import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { DbDFD, DbDFDWithRelations, DbUser, DbSecretaria } from '@/types/database';

export interface ConsolidatedPCAItem {
  id: string;
  descricao: string;
  quantidade: number;
  valor: number;
  unidadeMedida: string;
  detalhamentoTecnico?: string;
  secretaria: string;
  prioridade: string;
  dataContratacao: string;
  dfdId: string;
  tipoDFD: string;
}

export const usePCAData = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showPCAModal, setShowPCAModal] = useState(false);
  const [showDFDViewModal, setShowDFDViewModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedDFD, setSelectedDFD] = useState<DbDFDWithRelations | null>(null);
  const [dfdToRemove, setDFDToRemove] = useState<DbDFDWithRelations | null>(null);
  const [pcaPublished, setPcaPublished] = useState(false);
  const [scheduleFilters, setScheduleFilters] = useState<any>(null); // This can be more specific if we know the shape
  const { toast } = useToast();

  const [approvedDFDs, setApprovedDFDs] = useState<DbDFDWithRelations[]>([]);
  const [pendingDFDs, setPendingDFDs] = useState<DbDFDWithRelations[]>([]);
  const [cancellationRequests, setCancellationRequests] = useState<DbDFDWithRelations[]>([]);
  const [consolidatedItems, setConsolidatedItems] = useState<ConsolidatedPCAItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch Approved DFDs with Items and Secretaria
      const { data: approved, error: approvedError } = await supabase
        .from('dfd')
        .select(`
          *,
          dfd_items (*),
          secretarias ( nome )
        `)
        .eq('status', 'Aprovado')
        .eq('ano_contratacao', parseInt(selectedYear));

      if (approvedError) throw approvedError;

      setApprovedDFDs(approved || []);

      // Process consolidated items
      if (approved) {
        const allItems: ConsolidatedPCAItem[] = [];
        (approved as DbDFDWithRelations[]).forEach((dfd) => {
          if (dfd.dfd_items && Array.isArray(dfd.dfd_items)) {
            dfd.dfd_items.forEach((item) => {
              allItems.push({
                id: item.id,
                descricao: item.descricao_item,
                quantidade: Number(item.quantidade),
                valor: Number(item.valor_unitario),
                unidadeMedida: item.unidade,
                detalhamentoTecnico: item.codigo_item,
                secretaria: dfd.secretarias?.nome || 'Secretaria não informada',
                prioridade: dfd.prioridade || 'Média',
                dataContratacao: dfd.data_prevista_contratacao,
                dfdId: dfd.id,
                tipoDFD: dfd.tipo_dfd || 'Outros'
              });
            });
          }
        });
        setConsolidatedItems(allItems);
      }

      // Fetch Pending DFDs
      const { data: pending, error: pendingError } = await supabase
        .from('dfd')
        .select('*')
        .eq('status', 'Pendente')
        .eq('ano_contratacao', parseInt(selectedYear));

      if (pendingError) throw pendingError;

      // Fetch Users detailed info
      const { data: usersData } = await supabase
        .from('usuarios_acesso')
        .select('*'); // Select all to get cargo, secretaria_id etc

      // Fetch Secretarias
      const { data: secretariasData } = await supabase
        .from('secretarias')
        .select('id, nome');

      const mappedPending = (pending || []).map((dfd: DbDFD) => {
        const user = (usersData as DbUser[])?.find((u) => u.id === dfd.created_by);
        const secretaria = (secretariasData as DbSecretaria[])?.find((s) => s.id === user?.secretaria_id);

        return {
          ...dfd,
          tipoDFD: dfd.tipo_dfd,
          valorEstimado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dfd.valor_estimado_total || 0),
          anoContratacao: dfd.ano_contratacao,
          userName: user?.nome || 'Usuário Desconhecido',
          requisitante: {
            nome: user?.nome || 'Não informado',
            email: user?.email || 'Não informado',
            cargo: user?.cargo_funcional || 'Não informado',
            secretaria: secretaria?.nome || 'Não informada'
          }
        };
      });

      setPendingDFDs(mappedPending);
      // Fetch Cancellation Requests
      const { data: cancellations, error: cancellationsError } = await supabase
        .from('dfd')
        .select(`
          *,
          secretarias ( nome )
        `)
        .eq('solicitacao_cancelamento', true)
        .eq('ano_contratacao', parseInt(selectedYear));

      if (cancellationsError) throw cancellationsError;
      setCancellationRequests(cancellations || []);

      // Check PCA Config
      const { data: pcaConfig, error: pcaError } = await supabase
        .from('pca_config')
        .select('*')
        .eq('ano', parseInt(selectedYear))
        .maybeSingle();

      if (pcaError && pcaError.code !== 'PGRST116') throw pcaError;
      setPcaPublished(pcaConfig?.status === 'Publicado');

    } catch (error) {
      console.error('Error fetching PCA data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do PCA.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedYear, toast]);

  useEffect(() => {
    fetchData(); // Initial fetch

    const interval = setInterval(() => {
      fetchData();
    }, 3000); // 3 seconds auto-refresh

    return () => clearInterval(interval);
  }, [fetchData]);

  const handleViewDFD = (dfd: DbDFDWithRelations) => {
    setSelectedDFD(dfd);
    setShowDFDViewModal(true);
  };

  const handleApproveDFD = async (dfd: DbDFDWithRelations) => {
    try {
      const { error } = await supabase
        .from('dfd')
        .update({ status: 'Aprovado' })
        .eq('id', dfd.id);

      if (error) throw error;

      toast({
        title: "DFD Aprovado",
        description: `O DFD "${dfd.objeto}" foi aprovado e incluído no PCA.`,
      });
      setShowPendingModal(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Erro ao aprovar",
        description: "Não foi possível aprovar o DFD.",
        variant: "destructive"
      });
    }
  };

  const handleRejectDFD = async (dfd: DbDFDWithRelations, justification: string) => {
    try {
      const { error } = await supabase
        .from('dfd')
        .update({ status: 'Reprovado', justificativa: justification }) // Add justificativa rejection logic if needed field
        .eq('id', dfd.id);

      if (error) throw error;

      toast({
        title: "DFD Recusado",
        description: `O DFD "${dfd.objeto}" foi recusado e devolvido.`,
      });
      setShowPendingModal(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Erro ao reprovar",
        description: "Não foi possível reprovar o DFD.",
        variant: "destructive"
      });
    }
  };

  const handleApproveCancellation = async (dfd: DbDFDWithRelations) => {
    try {
      const { error } = await supabase
        .from('dfd')
        .update({
          status: 'Cancelado',
          solicitacao_cancelamento: false
        })
        .eq('id', dfd.id);

      if (error) throw error;

      toast({
        title: "Cancelamento Aprovado",
        description: `O DFD "${dfd.objeto}" foi retirado do PCA.`,
      });
      setShowCancellationModal(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Erro ao aprovar cancelamento",
        description: "Não foi possível processar a solicitação.",
        variant: "destructive"
      });
    }
  };

  const handleDenyCancellation = async (dfd: DbDFDWithRelations, justification: string) => {
    try {
      const { error } = await supabase
        .from('dfd')
        .update({
          solicitacao_cancelamento: false,
          justificativa: justification // Opcional: salvar por que foi negado
        })
        .eq('id', dfd.id);

      if (error) throw error;

      toast({
        title: "Cancelamento Negado",
        description: `A solicitação de cancelamento do DFD "${dfd.objeto}" foi negada.`,
      });
      setShowCancellationModal(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Erro ao negar cancelamento",
        description: "Não foi possível processar a solicitação.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFromPCA = (dfd: DbDFDWithRelations) => {
    setDFDToRemove(dfd);
    setShowRemoveModal(true);
  };

  const handleConfirmRemoval = async (dfd: DbDFDWithRelations, justification: string) => {
    try {
      const { error } = await supabase
        .from('dfd')
        .update({
          status: 'Cancelado',
          justificativa_cancelamento: justification
        })
        .eq('id', dfd.id);

      if (error) throw error;

      toast({
        title: "DFD Retirado do PCA",
        description: `O DFD "${dfd.objeto}" foi retirado do PCA com a justificativa fornecida.`,
      });
      setShowRemoveModal(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Erro ao retirar do PCA",
        description: "Não foi possível processar a solicitação.",
        variant: "destructive"
      });
    }
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

  const handlePublishPNCP = async () => {
    try {
      const { error } = await supabase
        .from('pca_config')
        .upsert({
          ano: parseInt(selectedYear),
          status: 'Publicado',
          data_publicacao: new Date().toISOString()
        }, { onConflict: 'ano' }); // Add prefeitura_id constraint if needed

      if (error) throw error;

      toast({
        title: "PCA Publicado",
        description: "O PCA foi publicado/atualizado no Portal Nacional de Contratações Públicas.",
      });
      setPcaPublished(true);
    } catch (error) {
      toast({
        title: "Erro ao publicar",
        description: "Não foi possível publicar o PCA.",
        variant: "destructive"
      });
    }
  };

  const totalItens = approvedDFDs.reduce((acc, dfd) => acc + 1, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTotalValue = () => {
    let total = 0;
    approvedDFDs.forEach((dfd: DbDFDWithRelations) => {
      if (dfd.dfd_items && Array.isArray(dfd.dfd_items)) {
        dfd.dfd_items.forEach((item) => {
          total += (Number(item.quantidade) * Number(item.valor_unitario));
        });
      }
    });
    return formatCurrency(total);
  };

  const valorTotal = calculateTotalValue();

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
    consolidatedItems,
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
