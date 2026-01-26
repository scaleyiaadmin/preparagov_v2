
import { useMemo } from 'react';
import { consolidateItemsByType, formatCurrency } from '../utils/pcaConsolidation';

// Mock data - em produção viria do PCA
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
    dfdId: 'DFD-001',
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
    dfdId: 'DFD-002',
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
    dfdId: 'DFD-003',
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
    dfdId: 'DFD-004',
    tipoDFD: 'Materiais Permanentes'
  },
  {
    id: '5',
    descricao: 'Serviços de Consultoria TI',
    quantidade: 1,
    valor: 50000,
    unidadeMedida: 'Contrato',
    detalhamentoTecnico: 'Consultoria especializada em tecnologia da informação',
    secretaria: 'Secretaria de Administração', 
    prioridade: 'Alta' as const,
    dataContratacao: '2024-05-10',
    dfdId: 'DFD-005',
    tipoDFD: 'Serviços Especializados'
  }
];

const calculateBusinessDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result.setDate(result.getDate() - 1);
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }
  
  return result;
};

export const useCronogramaData = (filters: any) => {
  const cronogramaData = useMemo(() => {
    const consolidatedByType = consolidateItemsByType(mockConsolidatedItems);
    const cronogramaItems: any[] = [];

    Object.entries(consolidatedByType).forEach(([tipoDFDPrincipal, items]) => {
      items.forEach((item) => {
        const dataContratacao = new Date(item.dataContratacaoOficial);
        const dataSugeridaAbertura = calculateBusinessDays(dataContratacao, 30);
        
        // Extrair informações das secretarias
        const secretariasNomes = Object.keys(item.secretarias);
        const secretariasSiglas = secretariasNomes.map(nome => {
          const palavras = nome.split(' ').filter(p => p !== 'de' && p !== 'da' && p !== 'do');
          if (palavras.length >= 2) {
            return palavras.slice(1, 3).map(p => p.charAt(0).toUpperCase()).join('');
          }
          return nome.substring(0, 3).toUpperCase();
        });
        
        const dfdIds = Object.values(item.secretarias).map((sec: any) => sec.dfdId);
        
        // Criar itens consolidados simples
        const itensConsolidados = [{
          descricao: item.descricao,
          unidadeMedida: item.unidadeMedida,
          quantidadeTotal: item.quantidadeTotal,
          valorTotal: item.valorTotal,
          detalhamentoTecnico: item.detalhamentoTecnico
        }];
        
        cronogramaItems.push({
          id: item.id,
          tipoDFD: tipoDFDPrincipal,
          dataContratacao: item.dataContratacaoOficial,
          dataSugeridaAbertura: dataSugeridaAbertura.toISOString().split('T')[0],
          prioridade: item.prioridadeOficial,
          secretariasNomes: secretariasNomes,
          secretariasSiglas: secretariasSiglas,
          dfdIds: dfdIds,
          valorTotal: formatCurrency(item.valorTotal),
          quantidadeTotal: item.quantidadeTotal,
          unidadeMedida: item.unidadeMedida,
          itensConsolidados: itensConsolidados,
          // Armazenar dados das secretarias sem referência circular
          secretariasData: { ...item.secretarias }
        });
      });
    });

    return cronogramaItems.sort((a, b) => 
      new Date(a.dataContratacao).getTime() - new Date(b.dataContratacao).getTime()
    );
  }, []);

  const secretarias = useMemo(() => {
    const allSecretarias = new Set<string>();
    cronogramaData.forEach(item => {
      item.secretariasNomes.forEach((sec: string) => allSecretarias.add(sec));
    });
    return Array.from(allSecretarias).sort();
  }, [cronogramaData]);

  const tiposDFD = useMemo(() => {
    const allTipos = new Set<string>();
    cronogramaData.forEach(item => allTipos.add(item.tipoDFD));
    return Array.from(allTipos).sort();
  }, [cronogramaData]);

  const filteredData = useMemo(() => {
    return cronogramaData.filter(item => {
      const anoContratacao = new Date(item.dataContratacao).getFullYear().toString();
      
      if (filters.ano && anoContratacao !== filters.ano) return false;
      if (filters.secretaria && filters.secretaria !== 'all' && !item.secretariasNomes.includes(filters.secretaria)) return false;
      if (filters.prioridade && filters.prioridade !== 'all' && item.prioridade !== filters.prioridade) return false;
      if (filters.tipoDFD && filters.tipoDFD !== 'all' && item.tipoDFD !== filters.tipoDFD) return false;
      
      return true;
    });
  }, [cronogramaData, filters]);

  return {
    cronogramaData,
    secretarias,
    tiposDFD,
    filteredData
  };
};
