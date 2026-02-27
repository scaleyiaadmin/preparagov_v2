
import { useState, useEffect, useMemo } from 'react';
import { consolidateItemsByType, formatCurrency, ConsolidatedItemByType, DFDItem } from '../utils/pcaConsolidation';
import { supabase } from '@/lib/supabase';

// Mock data - em produção viria do PCA


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

export interface CronogramaItem {
  id: string;
  tipoDFD: string;
  dataContratacao: string;
  dataSugeridaAbertura: string;
  prioridade: string;
  secretariasNomes: string[];
  secretariasSiglas: string[];
  dfdIds: string[];
  valorTotal: string;
  quantidadeTotal: number;
  unidadeMedida: string;
  itensConsolidados: {
    descricao: string;
    unidadeMedida: string;
    quantidadeTotal: number;
    valorTotal: number;
    detalhamentoTecnico?: string;
  }[];
  secretariasData: Record<string, {
    quantidade: number;
    valor: number;
    prioridade: string;
    dataInformada: string;
    dfdId: string;
  }>;
  status: 'Em Elaboração' | 'Concluído' | 'Publicado'; // Adicionado status ao tipo
}

export const useCronogramaData = (filters: any) => {
  const [consolidatedItems, setConsolidatedItems] = useState<DFDItem[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      const { data: approved } = await supabase
        .from('dfd')
        .select(`
          *,
          dfd_items (*),
          secretarias ( nome )
        `)
        .eq('status', 'Aprovado');

      if (approved) {
        const allItems: any[] = [];
        approved.forEach((dfd: any) => {
          if (dfd.dfd_items && Array.isArray(dfd.dfd_items)) {
            dfd.dfd_items.forEach((item: any) => {
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
    };

    fetchItems();
  }, [filters.ano]); // Re-fetch if year changes if implemented logic used year filter in query


  const cronogramaData = useMemo(() => {
    const consolidatedByType = consolidateItemsByType(consolidatedItems);
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
          secretariasData: { ...item.secretarias },
          status: 'Em Elaboração' // Valor padrão por enquanto
        });
      });
    });

    return cronogramaItems.sort((a, b) =>
      new Date(a.dataContratacao).getTime() - new Date(b.dataContratacao).getTime()
    );
  }, [consolidatedItems]);

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
