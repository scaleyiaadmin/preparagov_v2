import { ReferenciaItem } from './referenciaService';

export interface PNCPResult {
    numeroControlePNCP: string;
    orgaoEntidade: {
        razaoSocial: string;
        cnpj: string;
    };
    unidadeOrgao: {
        nomeUnidade: string;
        codigoUnidade: string;
    };
    objetoContratacao: string;
    valorEstimado: number;
    dataPublicacaoPncp: string;
    municipio: string;
    uf: string;
    // Adicione outros campos conforme necessário
}

export const pncpApiService = {
    async search(term: string, page: number = 1, uf?: string): Promise<{ items: ReferenciaItem[], total: number }> {
        try {
            // Documentação sugere: /v1/contratacoes/publicacao
            // Parâmetros comuns: termo, pagina, tamanhoPagina
            const baseUrl = 'https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao';
            const hoje = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setDate(hoje.getDate() - 180);

            const dataInicial = sixMonthsAgo.toISOString().split('T')[0].replace(/-/g, '').slice(0, 8);
            const dataFinal = hoje.toISOString().split('T')[0].replace(/-/g, '').slice(0, 8);

            const params = new URLSearchParams({
                dataInicial,
                dataFinal,
                pagina: page.toString(),
                tamanhoPagina: '20',
                termo: term,
            });

            if (uf) {
                params.append('ufSigla', uf); // O correto na nova API é ufSigla
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            let response;
            try {
                response = await fetch(`${baseUrl}?${params.toString()}`, {
                    signal: controller.signal
                });
            } finally {
                clearTimeout(timeoutId);
            }

            if (!response.ok) {
                throw new Error(`Erro na API do PNCP: ${response.statusText}`);
            }

            const data = await response.json();

            // A estrutura da resposta da API do PNCP costuma ter 'data' para os resultados e 'totalRegistros'
            const results = data.data || [];
            const total = data.totalRegistros || 0;

            const mappedItems: ReferenciaItem[] = results.map((item: any) => ({
                id: `pncp-api-${item.numeroControlePNCP}`,
                codigo: item.numeroControlePNCP,
                descricao: item.objetoContratacao || 'Sem descrição',
                unidade: 'Global/Processo', // PNCP API de contratações retorna o processo, não o item individual
                valor: item.valorEstimado || item.valorTotalEstimado || 0,
                fonte: 'PNCP (Portal)',
                data: item.dataPublicacaoPncp ? new Date(item.dataPublicacaoPncp).toLocaleDateString('pt-BR') : '',
                orgao: item.orgaoEntidade?.razaoSocial || item.unidadeOrgao?.nomeUnidade || 'Órgão não informado',
                detalhes: item
            }));

            return { items: mappedItems, total };
        } catch (error) {
            console.error('Erro ao consultar API do PNCP:', error);
            return { items: [], total: 0 };
        }
    }
};
