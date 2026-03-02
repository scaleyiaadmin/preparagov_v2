import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { dfdService } from '@/services/dfdService';
import { DbDFD, DbDFDWithRelations, DbUser, DbSecretaria } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export interface ConsolidatedPCAItem {
  id: string;
  descricao: string;
  quantidade: number;
  valor: number;
  unidadeMedida: string;
  detalhamentoTecnico?: string;
  secretaria: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
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
  const { user, isSuperAdmin } = useAuth();

  const [approvedDFDs, setApprovedDFDs] = useState<DbDFDWithRelations[]>([]);
  const [pendingDFDs, setPendingDFDs] = useState<DbDFDWithRelations[]>([]);
  const [cancellationRequests, setCancellationRequests] = useState<DbDFDWithRelations[]>([]);
  const [consolidatedItems, setConsolidatedItems] = useState<ConsolidatedPCAItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch auxiliary data once
      const { data: usersData } = await supabase.from('usuarios_acesso').select('*');
      const { data: secretariasData } = await supabase.from('secretarias').select('id, nome');

      // 2. Fetch Approved/Removed DFDs (filtrado por prefeitura)
      let approvedQuery = supabase
        .from('dfd')
        .select(`
          *,
          dfd_items (*),
          secretarias ( nome )
        `)
        .in('status', ['Aprovado', 'Retirado'])
        .eq('ano_contratacao', parseInt(selectedYear));

      if (!isSuperAdmin() && user?.prefeituraId) {
        approvedQuery = approvedQuery.eq('prefeitura_id', user.prefeituraId);
      }

      const { data: approved, error: approvedError } = await approvedQuery;

      if (approvedError) throw approvedError;

      const mappedApproved = (approved || []).map(d => ({
        ...d,
        tipoDFD: d.tipo_dfd,
        valorEstimado: d.valor_estimado_total ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.valor_estimado_total) : 'R$ 0,00',
        trimestre: d.data_prevista_contratacao ? `Q${Math.floor(new Date(d.data_prevista_contratacao).getUTCMonth() / 3) + 1}` : 'N/A'
      }));

      setApprovedDFDs(mappedApproved);

      // Process consolidated items for the summary
      if (approved) {
        const allItems: ConsolidatedPCAItem[] = [];
        (approved as DbDFDWithRelations[]).forEach((dfd) => {
          if (dfd.dfd_items && Array.isArray(dfd.dfd_items)) {
            dfd.dfd_items.forEach((item) => {
              // Normalize priority
              let normalizedPriority: 'Alta' | 'Média' | 'Baixa' = 'Média';
              if (dfd.prioridade === 'Alto' || dfd.prioridade === 'Alta') normalizedPriority = 'Alta';
              else if (dfd.prioridade === 'Médio' || dfd.prioridade === 'Média') normalizedPriority = 'Média';
              else if (dfd.prioridade === 'Baixo' || dfd.prioridade === 'Baixa') normalizedPriority = 'Baixa';

              allItems.push({
                id: item.id,
                descricao: item.descricao_item,
                quantidade: Number(item.quantidade),
                valor: Number(item.valor_unitario),
                unidadeMedida: item.unidade || 'un',
                detalhamentoTecnico: item.codigo_item,
                secretaria: dfd.secretarias?.nome || 'Secretaria não informada',
                prioridade: normalizedPriority,
                dataContratacao: dfd.data_prevista_contratacao || '',
                dfdId: dfd.id,
                tipoDFD: dfd.tipo_dfd || 'Outros'
              });
            });
          }
        });
        setConsolidatedItems(allItems);
      }

      // 3. Fetch Pending DFDs (filtrado por prefeitura)
      let pendingQuery = supabase
        .from('dfd')
        .select('*')
        .eq('status', 'Pendente')
        .eq('ano_contratacao', parseInt(selectedYear));

      if (!isSuperAdmin() && user?.prefeituraId) {
        pendingQuery = pendingQuery.eq('prefeitura_id', user.prefeituraId);
      }

      const { data: pending, error: pendingError } = await pendingQuery;

      if (pendingError) throw pendingError;

      const mappedPending = (pending || []).map((dfd: DbDFD) => {
        const user = (usersData as DbUser[])?.find((u) => u.id === dfd.created_by);
        const secretaria = (secretariasData as DbSecretaria[])?.find((s) => s.id === user?.secretaria_id);

        // Normalize priority
        let normalizedPriority: 'Alta' | 'Média' | 'Baixa' = 'Média';
        if (dfd.prioridade === 'Alto' || dfd.prioridade === 'Alta') normalizedPriority = 'Alta';
        else if (dfd.prioridade === 'Médio' || dfd.prioridade === 'Média') normalizedPriority = 'Média';
        else if (dfd.prioridade === 'Baixo' || dfd.prioridade === 'Baixa') normalizedPriority = 'Baixa';

        return {
          ...dfd,
          tipoDFD: dfd.tipo_dfd,
          valorEstimado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dfd.valor_estimado_total || 0),
          anoContratacao: dfd.ano_contratacao?.toString(),
          userName: user?.nome || 'Usuário Desconhecido',
          prioridade: normalizedPriority,
          data: dfd.created_at,
          objeto: dfd.objeto,
          requisitante: {
            nome: user?.nome || 'Não informado',
            email: user?.email || 'Não informado',
            cargo: user?.cargo_funcional || 'Não informado',
            secretaria: secretaria?.nome || 'Não informada'
          }
        };
      });

      setPendingDFDs(mappedPending as any);

      // 4. Fetch Cancellation Requests (filtrado por prefeitura)
      let cancelQuery = supabase
        .from('dfd')
        .select('*, secretarias ( nome )')
        .eq('solicitacao_cancelamento', true)
        .eq('ano_contratacao', parseInt(selectedYear));

      if (!isSuperAdmin() && user?.prefeituraId) {
        cancelQuery = cancelQuery.eq('prefeitura_id', user.prefeituraId);
      }

      const { data: cancellations, error: cancellationsError } = await cancelQuery;

      if (cancellationsError) throw cancellationsError;

      const mappedCancellations = (cancellations || []).map(c => {
        const user = (usersData as DbUser[])?.find(u => u.id === c.created_by);

        // Normalize priority
        let normalizedPriority = 'Média';
        if (c.prioridade === 'Alto' || c.prioridade === 'Alta') normalizedPriority = 'Alta';
        else if (c.prioridade === 'Médio' || c.prioridade === 'Média') normalizedPriority = 'Média';
        else if (c.prioridade === 'Baixo' || c.prioridade === 'Baixa') normalizedPriority = 'Baixa';

        return {
          ...c,
          tipoDFD: c.tipo_dfd,
          valorEstimado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.valor_estimado_total || 0),
          solicitadoPor: user?.nome || 'Não informado',
          dataSolicitacao: c.updated_at || c.created_at,
          justificativaCancelamento: c.justificativa_cancelamento,
          prioridade: normalizedPriority,
          data: c.created_at,
          objeto: c.objeto,
          itens: (c as any).dfd_items?.map((i: any) => ({
            id: i.id,
            codigo: i.codigo_item,
            descricao: i.descricao_item,
            unidade: i.unidade,
            quantidade: Number(i.quantidade),
            valorReferencia: Number(i.valor_unitario),
            tabelaReferencia: i.tabela_referencia
          })) || []
        };
      });

      setCancellationRequests(mappedCancellations as any);

      // 5. Check PCA Config for current year
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
    const interval = setInterval(() => fetchData(), 10000); // 10 seconds refresh
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleViewDFD = (dfd: DbDFDWithRelations) => {
    setSelectedDFD(dfd);
    setShowDFDViewModal(true);
  };

  const handleApproveDFD = async (dfd: DbDFDWithRelations) => {
    try {
      await dfdService.approve(dfd.id);
      toast({ title: "DFD Aprovado", description: "O DFD foi incluído no PCA." });
      setShowPendingModal(false);
      fetchData();
    } catch (error) {
      toast({ title: "Erro ao aprovar", variant: "destructive" });
    }
  };

  const handleRejectDFD = async (dfd: DbDFDWithRelations, justification: string) => {
    try {
      await dfdService.update(dfd.id, { status: 'Reprovado', justificativa: justification });
      toast({ title: "DFD Recusado", description: "O DFD foi devolvido para ajuste." });
      setShowPendingModal(false);
      fetchData();
    } catch (error) {
      toast({ title: "Erro ao reprovar", variant: "destructive" });
    }
  };

  const handleApproveCancellation = async (dfd: DbDFDWithRelations) => {
    try {
      await dfdService.cancel(dfd.id, dfd.justificativa_cancelamento || 'Aprovado pelo gestor');
      toast({ title: "Cancelamento Aprovado", description: "O DFD foi retirado do PCA." });
      setShowCancellationModal(false);
      fetchData();
    } catch (error) {
      toast({ title: "Erro ao aprovar cancelamento", variant: "destructive" });
    }
  };

  const handleDenyCancellation = async (dfd: DbDFDWithRelations, justification: string) => {
    try {
      await dfdService.update(dfd.id, { solicitacao_cancelamento: false, justificativa: justification });
      toast({ title: "Cancelamento Negado", description: "A solicitação foi recusada." });
      setShowCancellationModal(false);
      fetchData();
    } catch (error) {
      toast({ title: "Erro ao negar cancelamento", variant: "destructive" });
    }
  };

  const handleRemoveFromPCA = (dfd: DbDFDWithRelations) => {
    setDFDToRemove(dfd);
    setShowRemoveModal(true);
  };

  const handleConfirmRemoval = async (dfd: DbDFDWithRelations, justification: string) => {
    try {
      await dfdService.requestPcaRemoval(dfd.id, justification);
      toast({ title: "DFD Retirado", description: "O DFD foi marcado como Retirado. Responsável notificado." });
      setShowRemoveModal(false);
      fetchData();
    } catch (error) {
      toast({ title: "Erro ao retirar", variant: "destructive" });
    }
  };

  const handleGenerateSchedule = (filters: any) => {
    setScheduleFilters(filters);
    toast({ title: "Cronograma Gerado" });
  };

  const handlePrintSchedule = () => window.print();

  const handlePrintDFD = (dfd: DbDFDWithRelations) => {
    // Ensure data is mapped for DFDViewModal
    const normalizedDFD = {
      ...dfd,
      objeto: dfd.objeto,
      tipoDFD: dfd.tipo_dfd,
      status: dfd.status,
      data: dfd.created_at,
      prioridade: (dfd.prioridade === 'Alto' || dfd.prioridade === 'Alta') ? 'Alto' :
        (dfd.prioridade === 'Baixo' || dfd.prioridade === 'Baixa') ? 'Baixo' : 'Médio',
      anoContratacao: dfd.ano_contratacao?.toString(),
      descricaoDemanda: dfd.descricao_demanda,
      justificativa: dfd.justificativa,
      dataPrevista: dfd.data_prevista_contratacao,
      numeroDFD: dfd.numero_dfd,
      justificativaPrioridade: dfd.justificativa_prioridade,
      justificativaQuantidade: dfd.justificativa_quantidade,
      descricaoSucinta: dfd.descricao_sucinta,
      itens: dfd.dfd_items?.map((i) => ({
        id: i.id,
        codigo: i.codigo_item,
        descricao: i.descricao_item,
        unidade: i.unidade,
        quantidade: Number(i.quantidade),
        valorReferencia: Number(i.valor_unitario),
        tabelaReferencia: i.tabela_referencia
      })) || [],
      requisitante: dfd.secretarias ? {
        nome: 'Equipe de Planejamento',
        email: '-',
        cargo: '-',
        secretaria: dfd.secretarias.nome
      } : undefined
    };

    setSelectedDFD(normalizedDFD as any);
    setShowDFDViewModal(true);
  };

  const handlePublishPNCP = async () => {
    try {
      await supabase.from('pca_config').upsert({
        ano: parseInt(selectedYear),
        status: 'Publicado',
        data_publicacao: new Date().toISOString()
      }, { onConflict: 'ano' });
      toast({ title: "PCA Publicado", description: "Publicação no PNCP realizada." });
      setPcaPublished(true);
    } catch (error) {
      toast({ title: "Erro ao publicar", variant: "destructive" });
    }
  };

  const totalItens = approvedDFDs.length;
  const valorTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    approvedDFDs.reduce((acc, dfd) => {
      const itemsVal = (dfd.dfd_items || []).reduce((sum, i) => sum + (Number(i.quantidade) * Number(i.valor_unitario)), 0);
      return acc + itemsVal;
    }, 0)
  );

  return {
    selectedYear, setSelectedYear,
    showPendingModal, setShowPendingModal,
    showCancellationModal, setShowCancellationModal,
    showPCAModal, setShowPCAModal,
    showDFDViewModal, setShowDFDViewModal,
    showScheduleModal, setShowScheduleModal,
    showRemoveModal, setShowRemoveModal,
    showExportModal, setShowExportModal,
    selectedDFD, setSelectedDFD,
    dfdToRemove, setDFDToRemove,
    pcaPublished, setPcaPublished,
    approvedDFDs, pendingDFDs,
    cancellationRequests, consolidatedItems,
    totalItens, valorTotal,
    handleViewDFD, handleApproveDFD, handleRejectDFD,
    handleApproveCancellation, handleDenyCancellation,
    handleRemoveFromPCA, handleConfirmRemoval,
    handleGenerateSchedule, handlePrintSchedule,
    handlePrintDFD, handlePublishPNCP
  };
};
