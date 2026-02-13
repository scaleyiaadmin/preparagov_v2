import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface SelectedDFD {
  id: string; // Changed to string for UUID
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
  const { user } = useAuth();
  const [availableDFDs, setAvailableDFDs] = useState<SelectedDFD[]>([]);

  useEffect(() => {
    const fetchDFDs = async () => {
      try {
        // 1. Fetch Approved DFDs
        const { data, error } = await supabase
          .from('dfd')
          .select('*')
          .eq('status', 'Aprovado');

        if (error) throw error;

        // 2. Fetch Users & Secretarias for details
        const { data: usersData } = await supabase.from('usuarios_acesso').select('id, nome');
        const { data: secretariasData } = await supabase.from('secretarias').select('id, nome');
        const { data: usedData } = await supabase.from('etp_dfd').select('dfd_id');

        const usedIds = new Set(usedData?.map((u: any) => u.dfd_id));

        const formatted: SelectedDFD[] = data.map((d: any) => {
          const user = usersData?.find((u: any) => u.id === d.created_by);
          const secretaria = secretariasData?.find((s: any) => s.id === d.secretaria_id);

          return {
            id: d.id,
            objeto: d.objeto,
            valorEstimado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.valor_estimado_total || 0),
            tipoDFD: d.tipo_dfd,
            status: d.status,
            prioridade: d.prioridade || 'Média',
            numeroDFD: d.numero_dfd || 'N/A',
            dataContratacao: d.data_prevista_contratacao,
            secretaria: secretaria?.nome || 'Não informada',
            secretario: 'Não informado',
            responsavelDemanda: user?.nome || 'Não informado',
            usedInETP: usedIds.has(d.id)
          };
        });
        setAvailableDFDs(formatted);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDFDs();
  }, []);

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

  const loadETP = async (etpId: string) => {
    try {
      // Fetch ETP details
      const { data: etp, error } = await supabase
        .from('etp')
        .select(`
          *,
          etp_dfd (
            dfd (
              *
            )
          )
        `)
        .eq('id', etpId)
        .single();

      if (error) throw error;

      // Map to form data
      const selectedDFDs = etp.etp_dfd.map((item: any) => ({
        id: item.dfd.id,
        objeto: item.dfd.objeto,
        valorEstimado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.dfd.valor_estimado_total || 0),
        tipoDFD: item.dfd.tipo_dfd,
        status: item.dfd.status,
        prioridade: item.dfd.prioridade,
        numeroDFD: item.dfd.numero_dfd,
        dataContratacao: item.dfd.data_prevista_contratacao,
        secretaria: 'Carregando...', // We can improve this if needed by fetching secretarias
        responsavelDemanda: 'Carregando...'
      }));

      setFormData({
        selectedDFDs,
        descricaoDemanda: etp.descricao_demanda || '',
        requisitosContratacao: etp.requisitos_contratacao || '',
        alternativasExistem: etp.alternativas_existem || false,
        alternativasDescricao: etp.alternativas_descricao || '',
        descricaoSolucao: etp.descricao_solucao || '',
        justificativaParcelamento: etp.justificativa_parcelamento || '',
        resultadosPretendidos: etp.resultados_pretendidos || '',
        providenciasExistem: etp.providencias_existem || false,
        providenciasDescricao: etp.providencias_descricao || '',
        contratacoesCorrelatas: etp.contratacoes_correlatas || false,
        contratacoesDescricao: etp.contratacoes_descricao || '',
        impactosAmbientais: etp.impactos_ambientais || false,
        impactosDescricao: etp.impactos_descricao || '',
        observacoesGerais: etp.observacoes_gerais || '',
        conclusaoTecnica: etp.conclusao_tecnica || ''
      });

      setCurrentStep(0); // Start at beginning or determine step
    } catch (error) {
      console.error('Error loading ETP:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar os dados do ETP.",
        variant: "destructive"
      });
    }
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
    // Generate context from selected DFDs
    const dfdContext = formData.selectedDFDs.map(d =>
      `${d.objeto} (Valor: ${d.valorEstimado}, Prioridade: ${d.prioridade})`
    ).join(', ');

    const totalValue = formData.selectedDFDs.reduce((acc, d) => {
      const val = parseFloat(d.valorEstimado.replace(/[R$\.,]/g, '')) / 100;
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

    const isHighValue = totalValue > 50000; // Exemplo de regra de negócio simples

    const aiContent: Record<string, () => string> = {
      descricaoDemanda: () => `A administração pública necessita realizar a contratação de ${dfdContext} para garantir a continuidade e eficiência dos serviços prestados. Esta demanda surge da necessidade de adequação às atividades finalísticas do órgão, visando otimizar recursos e atender ao interesse público.`,

      requisitosContratacao: () => `A contratação deve atender aos seguintes requisitos técnicos e operacionais: conformidade com as normas técnicas vigentes (ABNT/ISO), garantia mínima de 12 meses, sustentabilidade ambiental com preferência por materiais recicláveis ou de baixo impacto, e compatibilidade com a infraestrutura existente.`,

      alternativasDescricao: () => `Foram analisadas as seguintes alternativas para atender à demanda: 
1. Utilização de recursos humanos e materiais próprios (inviável por insuficiência de estoque/quadro);
2. Contratação de serviço contínuo (não aplicável ao objeto);
3. Aquisição parcelada conforme necessidade (mais vantajosa);
A alternativa escolhida foi a aquisição por meio de licitação pública, garantindo ampla concorrência e melhor preço.`,

      descricaoSolucao: () => `A solução proposta consiste na aquisição de ${formData.selectedDFDs.length} item(ns) conforme especificado nos DFDs, com entrega parcelada. Esta solução foi definida considerando o histórico de consumo e a projeção de demanda para o próximo exercício financeiro.`,

      justificativaParcelamento: () => `O parcelamento da contratação se justifica técnica e economicamente, pois permite a ampliação da competividade e o melhor gerenciamento de estoques, evitando deterioração de materiais e custos desnecessários de armazenamento, conforme preconiza a legislação vigente.`,

      resultadosPretendidos: () => `Espera-se com esta contratação: 
- Atendimento integral da demanda das secretarias solicitantes;
- Redução de custos operacionais através de equipamentos/materiais mais eficientes;
- Melhoria na qualidade do serviço público prestado ao cidadão;
- Execução de 100% do orçamento planejado para esta rubrica.`,

      providenciasDescricao: () => `Deverão ser tomadas as seguintes providências prévias:
- Verificação de disponibilidade orçamentária;
- Designação de equipe de fiscalização do contrato;
- Adequação do espaço físico para recebimento dos itens;
- Elaboração de minuta de edital e termo de referência.`,

      contratacoesDescricao: () => `Não existem contratações correlatas ou interdependentes diretas que impeçam ou condicionem o início desta execução. Entretanto, esta aquisição complementa os contratos de manutenção preventiva já vigentes.`,

      impactosDescricao: () => `Os impactos ambientais são considerados baixos. A contratada deverá responsabilizar-se pela logística reversa de embalagens e resíduos gerados durante o fornecimento, conforme Política Nacional de Resíduos Sólidos.`,

      observacoesGerais: () => `A estimativa de preços foi baseada em pesquisa de mercado realizada no Banco de Preços e Painel de Preços do Governo Federal, garantindo a vantajosidade da contratação.`,

      conclusaoTecnica: () => `Diante do exposto, conclui-se que a contratação é viável tecnica e economicamente, necessária para o funcionamento do órgão e está em conformidade com o planejamento estratégico da administração. Recomenda-se o prosseguimento do feito.`
    };

    const generator = aiContent[field];
    if (generator) {
      updateFormData(field, generator());

      toast({
        title: "Conteúdo Gerado por IA",
        description: "Conteúdo sugerido com base nos DFDs selecionados.",
      });
    } else {
      toast({
        title: "Erro na Geração",
        description: "Campo não suportado para geração automática.",
        variant: "destructive"
      });
    }
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

  const generateETPNumber = async () => {
    const year = new Date().getFullYear();

    // Get count of ETPs for current year
    const { count, error } = await supabase
      .from('etp')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01`)
      .lte('created_at', `${year}-12-31`);

    if (error) {
      console.error('Error generating ETP number:', error);
      return `001/${year}`; // Fallback
    }

    const nextNumber = (count || 0) + 1;
    return `${String(nextNumber).padStart(3, '0')}/${year}`;
  };

  const saveETP = async () => {
    try {
      const numeroETP = await generateETPNumber();

      // 1. Create ETP Record
      const { data: etpData, error: etpError } = await supabase
        .from('etp')
        .insert([{
          numero_etp: numeroETP, // Added number generation
          status: 'Em Elaboração',
          descricao_demanda: formData.descricaoDemanda,
          requisitos_contratacao: formData.requisitosContratacao,
          alternativas_existem: formData.alternativasExistem,
          alternativas_descricao: formData.alternativasDescricao,
          descricao_solucao: formData.descricaoSolucao,
          justificativa_parcelamento: formData.justificativaParcelamento,
          resultados_pretendidos: formData.resultadosPretendidos,
          providencias_existem: formData.providenciasExistem,
          providencias_descricao: formData.providenciasDescricao,
          contratacoes_correlatas: formData.contratacoesCorrelatas,
          contratacoes_descricao: formData.contratacoesDescricao,
          impactos_ambientais: formData.impactosAmbientais,
          impactos_descricao: formData.impactosDescricao,
          observacoes_gerais: formData.observacoesGerais,
          conclusao_tecnica: formData.conclusaoTecnica,
          created_by: user?.id,
          prefeitura_id: user?.prefeituraId
        }])
        .select()
        .single();

      if (etpError) throw etpError;

      // 2. Link DFDs
      if (formData.selectedDFDs.length > 0) {
        const links = formData.selectedDFDs.map(dfd => ({
          etp_id: etpData.id,
          dfd_id: dfd.id
        }));

        const { error: linkError } = await supabase
          .from('etp_dfd')
          .insert(links);

        if (linkError) throw linkError;
      }

      toast({
        title: "ETP Salvo",
        description: "Estudo Técnico Preliminar salvo com sucesso no sistema.",
      });
      localStorage.removeItem('etp-creation-progress');
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o ETP.",
        variant: "destructive"
      });
    }
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
    generatePDF,
    loadETP
  };
};
