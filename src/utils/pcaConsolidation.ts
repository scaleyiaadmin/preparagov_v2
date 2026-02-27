
export interface DFDItem {
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

export interface ConsolidatedItemByType {
  id: string;
  descricao: string;
  unidadeMedida: string;
  detalhamentoTecnico?: string;
  quantidadeTotal: number;
  valorTotal: number;
  dataContratacaoOficial: string;
  prioridadeOficial: 'Alta' | 'Média' | 'Baixa';
  tipoDFD: string;
  secretarias: Record<string, {
    quantidade: number;
    valor: number;
    prioridade: 'Alta' | 'Média' | 'Baixa';
    dataInformada: string;
    dfdId: string;
  }>;
}

export interface ConsolidatedItem {
  id: string;
  descricao: string;
  unidadeMedida: string;
  detalhamentoTecnico?: string;
  quantidadeTotal: number;
  valorTotal: number;
  dataContratacaoOficial: string;
  prioridadeOficial: 'Alta' | 'Média' | 'Baixa';
  secretarias: {
    nome: string;
    quantidade: number;
    valor: number;
    prioridade: 'Alta' | 'Média' | 'Baixa';
    dataInformada: string;
    dfdId: string;
  }[];
}

const PRIORIDADE_PESO = {
  'Alta': 3,
  'Média': 2,
  'Baixa': 1
};

export const consolidateItemsByType = (items: DFDItem[]): Record<string, ConsolidatedItemByType[]> => {
  const grouped = new Map<string, DFDItem[]>();

  // Agrupar itens por chave única (descrição + unidade + detalhamento + tipo)
  items.forEach(item => {
    const key = `${item.descricao.toLowerCase().trim()}_${item.unidadeMedida.toLowerCase().trim()}_${item.detalhamentoTecnico?.toLowerCase().trim() || ''}_${item.tipoDFD}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });

  // Consolidar cada grupo
  const consolidated = Array.from(grouped.entries()).map(([key, groupItems]) => {
    const firstItem = groupItems[0];

    // Calcular totais
    const quantidadeTotal = groupItems.reduce((sum, item) => sum + item.quantidade, 0);
    const valorTotal = groupItems.reduce((sum, item) => sum + item.valor, 0);

    // Encontrar data mais próxima
    const dataContratacaoOficial = groupItems
      .map(item => item.dataContratacao)
      .sort()[0]; // Primeira data cronologicamente

    // Encontrar maior prioridade
    const prioridadeOficial = groupItems
      .reduce((maxPrior, item) =>
        PRIORIDADE_PESO[item.prioridade] > PRIORIDADE_PESO[maxPrior]
          ? item.prioridade
          : maxPrior,
        'Baixa' as 'Alta' | 'Média' | 'Baixa'
      );

    // Mapear secretarias como Record
    const secretarias: Record<string, {
      quantidade: number;
      valor: number;
      prioridade: 'Alta' | 'Média' | 'Baixa';
      dataInformada: string;
      dfdId: string;
    }> = {};
    groupItems.forEach(item => {
      secretarias[item.secretaria] = {
        quantidade: item.quantidade,
        valor: item.valor,
        prioridade: item.prioridade,
        dataInformada: item.dataContratacao,
        dfdId: item.dfdId
      };
    });

    return {
      id: key,
      descricao: firstItem.descricao,
      unidadeMedida: firstItem.unidadeMedida,
      detalhamentoTecnico: firstItem.detalhamentoTecnico,
      quantidadeTotal,
      valorTotal,
      dataContratacaoOficial,
      prioridadeOficial,
      tipoDFD: firstItem.tipoDFD,
      secretarias
    };
  });

  // Agrupar por tipo de DFD
  const groupedByType: Record<string, ConsolidatedItemByType[]> = {};
  consolidated.forEach(item => {
    if (!groupedByType[item.tipoDFD]) {
      groupedByType[item.tipoDFD] = [];
    }
    groupedByType[item.tipoDFD].push(item);
  });

  return groupedByType;
};

export const consolidateItems = (items: DFDItem[]): ConsolidatedItem[] => {
  const grouped = new Map<string, DFDItem[]>();

  // Agrupar itens por chave única (descrição + unidade + detalhamento)
  items.forEach(item => {
    const key = `${item.descricao.toLowerCase().trim()}_${item.unidadeMedida.toLowerCase().trim()}_${item.detalhamentoTecnico?.toLowerCase().trim() || ''}`;

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });

  // Consolidar cada grupo
  return Array.from(grouped.entries()).map(([key, groupItems]) => {
    const firstItem = groupItems[0];

    // Calcular totais
    const quantidadeTotal = groupItems.reduce((sum, item) => sum + item.quantidade, 0);
    const valorTotal = groupItems.reduce((sum, item) => sum + item.valor, 0);

    // Encontrar data mais próxima
    const dataContratacaoOficial = groupItems
      .map(item => item.dataContratacao)
      .sort()[0]; // Primeira data cronologicamente

    // Encontrar maior prioridade
    const prioridadeOficial = groupItems
      .reduce((maxPrior, item) =>
        PRIORIDADE_PESO[item.prioridade] > PRIORIDADE_PESO[maxPrior]
          ? item.prioridade
          : maxPrior,
        'Baixa' as 'Alta' | 'Média' | 'Baixa'
      );

    // Mapear secretarias
    const secretarias = groupItems.map(item => ({
      nome: item.secretaria,
      quantidade: item.quantidade,
      valor: item.valor,
      prioridade: item.prioridade,
      dataInformada: item.dataContratacao,
      dfdId: item.dfdId
    }));

    return {
      id: key,
      descricao: firstItem.descricao,
      unidadeMedida: firstItem.unidadeMedida,
      detalhamentoTecnico: firstItem.detalhamentoTecnico,
      quantidadeTotal,
      valorTotal,
      dataContratacaoOficial,
      prioridadeOficial,
      secretarias
    };
  });
};

export const getAllSecretarias = (itemsByType: Record<string, ConsolidatedItemByType[]>): string[] => {
  const secretariasSet = new Set<string>();

  Object.values(itemsByType).forEach(items => {
    items.forEach(item => {
      Object.keys(item.secretarias).forEach(secretaria => {
        secretariasSet.add(secretaria);
      });
    });
  });

  return Array.from(secretariasSet).sort();
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'Alta':
      return 'bg-red-100 text-red-800';
    case 'Média':
      return 'bg-yellow-100 text-yellow-800';
    case 'Baixa':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
