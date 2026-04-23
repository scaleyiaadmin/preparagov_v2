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
            // A API do PNCP exige: dataInicial, dataFinal E codigoModalidadeContratacao obrigatórios
            const baseUrl = 'https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao';
            const hoje = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setDate(hoje.getDate() - 365); // 1 ano de histórico

            const dataInicial = sixMonthsAgo.toISOString().split('T')[0].replace(/-/g, '').slice(0, 8);
            const dataFinal = hoje.toISOString().split('T')[0].replace(/-/g, '').slice(0, 8);

            // Modalidades principais: 6=Pregão Eletrônico, 8=Dispensa de Licitação
            const modalidades = [6, 8];

            const fetchForModalidade = async (modalidade: number): Promise<{ items: ReferenciaItem[], total: number }> => {
                const params = new URLSearchParams({
                    dataInicial,
                    dataFinal,
                    pagina: page.toString(),
                    tamanhoPagina: '10',
                    codigoModalidadeContratacao: String(modalidade),
                });

                if (uf) params.append('ufSigla', uf);

                // Adiciona termo como filtro textual se possível
                // PNCP não tem "termo" livre neste endpoint, filtramos pelo objeto após

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                try {
                    const response = await fetch(`${baseUrl}?${params.toString()}`, {
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    if (!response.ok) return { items: [], total: 0 };

                    const data = await response.json();
                    const results: any[] = data.data || [];
                    const total: number = data.totalRegistros || 0;

                    // Filtra os resultados pelo termo buscado (client-side)
                    const termLower = term.toLowerCase();
                    const filtered = results.filter(item =>
                        (item.objetoCompra || '').toLowerCase().includes(termLower)
                    );

                    const mappedItems: ReferenciaItem[] = filtered.map((item: any) => ({
                        id: `pncp-api-${item.numeroControlePNCP || Math.random()}`,
                        codigo: item.numeroControlePNCP || '',
                        descricao: item.objetoCompra || item.objetoContratacao || 'Sem descrição',
                        unidade: 'Processo',
                        valor: item.valorTotalEstimado || item.valorTotalHomologado || 0,
                        fonte: 'PNCP (Portal)',
                        data: item.dataPublicacaoPncp ? new Date(item.dataPublicacaoPncp).toLocaleDateString('pt-BR') : '',
                        orgao: item.orgaoEntidade?.razaoSocial || item.unidadeOrgao?.nomeUnidade || 'Órgão não informado',
                        detalhes: item
                    }));

                    return { items: mappedItems, total };
                } catch {
                    clearTimeout(timeoutId);
                    return { items: [], total: 0 };
                }
            };

            // Busca em paralelo por todas as modalidades
            const results = await Promise.all(modalidades.map(m => fetchForModalidade(m)));

            const allItems = results.flatMap(r => r.items);
            const totalGeral = results.reduce((acc, r) => acc + r.total, 0);

            return { items: allItems, total: totalGeral };
        } catch (error) {
            console.error('Erro ao consultar API do PNCP:', error);
            return { items: [], total: 0 };
        }
    }
};
