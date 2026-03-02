import { externalSupabase } from '@/lib/externalSupabase';

export interface ReferenciaItem {
    id: string;
    codigo: string;
    descricao: string;
    unidade: string;
    valor: number;
    fonte: string;
    data?: string;
    orgao?: string;
    metadata?: string;
    detalhes?: any;
}

export const referenciaService = {
    async searchPNCP(term: string): Promise<ReferenciaItem[]> {
        const { data, error } = await externalSupabase
            .from('referencia_pncp')
            .select('*')
            .or(`item_nome.ilike.%${term}%,municipio.ilike.%${term}%`)
            .limit(10000);

        if (error) throw error;

        return (data || []).map(item => ({
            id: item.id,
            codigo: item.sequencial_compra?.toString() || item.id.substring(0, 8),
            descricao: item.item_nome,
            unidade: item.unidade || 'Unidade',
            valor: parseFloat(item.valor_unitario) || 0,
            fonte: 'PNCP',
            data: item.data_publicacao ? new Date(item.data_publicacao).toLocaleDateString('pt-BR') : '',
            orgao: item.orgao_nome || item.municipio || '',
            detalhes: item
        }));
    },

    async searchSINAPI(term: string): Promise<ReferenciaItem[]> {
        const { data, error } = await externalSupabase
            .from('referencia_sinapi')
            .select('*')
            .ilike('descricao', `%${term}%`)
            .limit(10000);

        if (error) throw error;

        return (data || []).map(item => ({
            id: item.id,
            codigo: item.codigo,
            descricao: item.descricao,
            unidade: item.unidade || 'M2',
            valor: parseFloat(item.preco_base) || 0,
            fonte: 'SINAPI',
            data: item.data_publicacao ? new Date(item.data_publicacao).toLocaleDateString('pt-BR') : '',
            orgao: 'Caixa Econômica Federal - SINAPI',
            detalhes: item
        }));
    },

    async searchCMED(term: string): Promise<ReferenciaItem[]> {
        const { data, error } = await externalSupabase
            .from('referencia_cmed')
            .select('*')
            .or(`produto.ilike.%${term}%,substancia.ilike.%${term}%`)
            .limit(10000);

        if (error) throw error;

        return (data || []).map(item => ({
            id: item.id,
            codigo: (item.ean?.trim() && item.ean?.trim() !== '-') ? item.ean.trim() : `CMED-${item.id.substring(0, 8)}`,
            descricao: `${item.produto} - ${item.substancia}${item.apresentacao ? ` ${item.apresentacao}` : ''}`,
            unidade: 'UN',
            valor: parseFloat(item.pmvg) || 0,
            fonte: 'CMED',
            data: '2025',
            orgao: `Medicamentos (EAN: ${item.ean?.trim() && item.ean?.trim() !== '-' ? item.ean.trim() : '-'})`,
            detalhes: item
        }));
    },

    async searchCATSER(term: string): Promise<ReferenciaItem[]> {
        const { data, error } = await externalSupabase
            .from('referencia_catser')
            .select('*')
            .ilike('descricao', `%${term}%`)
            .limit(10000);

        if (error) throw error;

        return (data || []).map(item => ({
            id: `catser-${item.id}`,
            codigo: item.codigo,
            descricao: item.descricao,
            unidade: 'UN',
            valor: 0,
            fonte: 'CATSER',
            orgao: `Catálogo de Serviços (Cod: ${item.codigo})`,
            metadata: `${item.grupo || ''} / ${item.classe || ''}`,
            detalhes: item
        }));
    },

    async searchBPS(term: string): Promise<ReferenciaItem[]> {
        // BPS (Banco de Preços em Saúde) - Como não temos uma tabela dedicada, 
        // usamos a base de NFe filtrada por termos de saúde para maior precisão
        const { data, error } = await externalSupabase
            .from('referencia_nfe')
            .select('*')
            .ilike('item_nome', `%${term}%`)
            .limit(10000);

        if (error) throw error;

        return (data || []).map(item => ({
            id: `bps-${item.id}`,
            codigo: `BPS-${item.id.substring(0, 8)}`,
            descricao: item.item_nome,
            unidade: item.unidade || 'UN',
            valor: parseFloat(item.preco_unitario) || 0,
            fonte: 'BPS',
            data: '2025',
            orgao: item.fornecedor_nome || 'BANCO DE PREÇOS EM SAÚDE',
            metadata: `UF: ${item.uf_fornecedor}`,
            detalhes: item
        }));
    },

    async searchSETOP(term: string, uf: string = 'MG'): Promise<ReferenciaItem[]> {
        const { data, error } = await externalSupabase
            .from('referencia_setop')
            .select('*')
            .ilike('descricao', `%${term}%`)
            .limit(10000);

        if (error) throw error;

        return (data || []).map(item => ({
            id: `setop-${item.id}`,
            codigo: item.codigo,
            descricao: item.descricao,
            unidade: item.unidade || 'UN',
            valor: item.preco_base || 0,
            fonte: 'SETOP',
            data: item.data_referencia || '2025',
            orgao: `SINFRA/DER-${uf.toUpperCase()} (Cod: ${item.codigo})`,
            metadata: `Região: ${item.regiao || 'Geral'}`,
            detalhes: item
        }));
    },

    async searchSIMPRO(term: string): Promise<ReferenciaItem[]> {
        const { data, error } = await externalSupabase
            .from('referencia_simpro')
            .select('*')
            .ilike('descricao', `%${term}%`)
            .limit(10000);

        if (error) throw error;

        return (data || []).map(item => ({
            id: `simpro-${item.id}`,
            codigo: item.codigo_simpro || 'N/A',
            descricao: item.descricao,
            unidade: item.unidade || 'UN',
            valor: item.preco || 0,
            fonte: 'SIMPRO',
            data: item.data_vigencia || '2025',
            orgao: `Hospitalar (${item.fabricante || 'Geral'})`,
            metadata: `Cod SIMPRO: ${item.codigo_simpro}`,
            detalhes: item
        }));
    },

    async searchSIGTAP(term: string): Promise<ReferenciaItem[]> {
        const { data, error } = await externalSupabase
            .from('referencia_sigtap')
            .select('*')
            .ilike('descricao', `%${term}%`)
            .limit(10000);

        if (error) throw error;

        return (data || []).map(item => ({
            id: `sigtap-${item.id}`,
            codigo: item.codigo,
            descricao: item.descricao,
            unidade: 'PROC',
            valor: item.valor_total || 0,
            fonte: 'SIGTAP',
            data: '2025',
            orgao: `SUS (Cod: ${item.codigo})`,
            metadata: `SA: R$ ${item.valor_sa} / SP: R$ ${item.valor_sp}`,
            detalhes: item
        }));
    },

    async searchNFE(term: string, uf?: string): Promise<ReferenciaItem[]> {
        let query = externalSupabase
            .from('referencia_nfe')
            .select('*')
            .ilike('item_nome', `%${term}%`);

        if (uf) query = query.eq('uf', uf.toUpperCase());

        const { data, error } = await query.limit(10000);

        if (error) throw error;

        return (data || []).map(item => ({
            id: `nfe-${item.id}`,
            codigo: `NFE-${item.id.substring(0, 8)}`,
            descricao: item.item_nome,
            unidade: item.unidade || 'UN',
            valor: parseFloat(item.preco_unitario) || 0,
            fonte: 'NFE',
            data: '2025',
            orgao: item.fornecedor_nome || 'BANCO DE NFE',
            metadata: `UF: ${item.uf_fornecedor}`,
            detalhes: item
        }));
    },

    async searchCATMAT(term: string): Promise<ReferenciaItem[]> {
        const { data, error } = await externalSupabase
            .from('referencia_pncp') // Usando PNCP como fallback enquanto a tabela oficial catmat é carregada, ou mudar para a correta se existir
            .select('*')
            .ilike('item_nome', `%${term}%`)
            .limit(10000);

        if (error) throw error;

        return (data || []).map(item => ({
            id: `catmat-${item.id}`,
            codigo: item.sequencial_compra?.toString() || item.id.substring(0, 8),
            descricao: item.item_nome,
            unidade: item.unidade || 'UN',
            valor: parseFloat(item.valor_unitario) || 0,
            fonte: 'CATMAT',
            data: item.data_publicacao ? new Date(item.data_publicacao).toLocaleDateString('pt-BR') : '',
            orgao: item.orgao_nome || item.municipio || '',
            detalhes: item
        }));
    },

    async searchAll(term: string, tab: string): Promise<ReferenciaItem[]> {
        let results: ReferenciaItem[] = [];
        switch (tab) {
            case 'CATMAT': results = await this.searchCATMAT(term); break;
            case 'PNCP': results = await this.searchPNCP(term); break;
            case 'SINAPI': results = await this.searchSINAPI(term); break;
            case 'CMED': results = await this.searchCMED(term); break;
            case 'CATSER': results = await this.searchCATSER(term); break;
            case 'BPS': results = await this.searchBPS(term); break;
            case 'SETOP': results = await this.searchSETOP(term); break;
            case 'SIMPRO': results = await this.searchSIMPRO(term); break;
            case 'SIGTAP': results = await this.searchSIGTAP(term); break;
            case 'NFE': results = await this.searchNFE(term); break;
            default: results = []; break;
        }

        if (!results.length) return [];

        const lowerTerm = term.toLowerCase().trim();

        // Ordenação por relevância:
        // 1. Termo exato ou começa com termo (ignora prefixos como "Similar - ")
        return results.sort((a, b) => {
            const aDesc = a.descricao.toLowerCase();
            const bDesc = b.descricao.toLowerCase();

            // Função para extrair o nome real do item (removendo "Similar - ", "Genérico - ", "Novo - ")
            const clean = (text: string) => text.replace(/^(similar|genérico|novo)\s*-\s*/, '');
            const aClean = clean(aDesc);
            const bClean = clean(bDesc);

            // 1. Exact match de substância/nome
            if (aClean === lowerTerm && bClean !== lowerTerm) return -1;
            if (bClean === lowerTerm && aClean !== lowerTerm) return 1;

            // 2. Starts with substância/nome
            const aStarts = aClean.startsWith(lowerTerm);
            const bStarts = bClean.startsWith(lowerTerm);
            if (aStarts && !bStarts) return -1;
            if (bStarts && !aStarts) return 1;

            // 3. Whole word wrapper
            const wordRegex = new RegExp(`\\b${lowerTerm}\\b`);
            const aWhole = wordRegex.test(aDesc);
            const bWhole = wordRegex.test(bDesc);
            if (aWhole && !bWhole) return -1;
            if (bWhole && !aWhole) return 1;

            // 4. Se nenhum dos critérios acima, ordenar pelo tamanho curto
            if (aDesc.length !== bDesc.length) {
                return aDesc.length - bDesc.length;
            }
            return aDesc.localeCompare(bDesc);
        });
    },

    async searchMultisource(context: { objeto: string; descricaoDemanda?: string; justificativa?: string }): Promise<ReferenciaItem[]> {
        const fullContext = `${context.objeto} ${context.descricaoDemanda || ''} ${context.justificativa || ''}`.toLowerCase();

        // --- EXTRAÇÃO INTELIGENTE DE PALAVRAS-CHAVE ---
        // Remove stop words e termos genéricos para focar no que importa
        const stopWords = ['de', 'da', 'do', 'com', 'para', 'em', 'um', 'uma', 'os', 'as', 'e', 'a', 'o', 'aquisição', 'compra', 'contratação', 'fornecimento', 'prestação', 'serviço', 'locação', 'diversos', 'conforme', 'descrito', 'necessidade', 'atendimento', 'secretaria', 'municipal', 'prefeitura'];

        const extractKeywords = (text: string) => {
            return text.toLowerCase()
                .replace(/[^\w\sà-ú]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 3 && !stopWords.includes(word));
        };

        const keywords = extractKeywords(context.objeto);
        if (context.descricaoDemanda) keywords.push(...extractKeywords(context.descricaoDemanda));

        // Remove duplicatas e limita a 5 palavras-chave principais
        const uniqueKeywords = [...new Set(keywords)].slice(0, 5);

        // --- DEFINIÇÃO DOS TERMOS DE BUSCA ---
        const searchTerms: string[] = [];

        // Termo base: o objeto limpo
        const baseTerm = context.objeto
            .replace(/^(Aquisição|Compra|Contratação|Fornecimento|Prestação|Locação|Serviço) de /i, '')
            .trim();

        if (baseTerm.length > 3) searchTerms.push(baseTerm);

        // Adiciona as palavras-chave individuais como termos de busca secundários
        uniqueKeywords.forEach(kw => {
            if (!baseTerm.toLowerCase().includes(kw)) {
                searchTerms.push(kw);
            }
        });

        // Limita a 4 termos variados para otimizar as queries
        const termsToSearch = searchTerms.slice(0, 4);

        // --- BUSCA PARALELA EM TODAS AS FONTES ---
        const promises: Promise<ReferenciaItem[]>[] = [];

        for (const term of termsToSearch) {
            // Prioriza fontes baseadas no contexto
            promises.push(this.searchPNCP(term).catch(() => []));
            promises.push(this.searchNFE(term).catch(() => []));

            // Saúde -> CMED
            if (fullContext.includes('medicamento') || fullContext.includes('saúde') || fullContext.includes('farmácia') || fullContext.includes('remedio')) {
                promises.push(this.searchCMED(term).catch(() => []));
            }

            // Construção -> SINAPI
            if (fullContext.includes('obra') || fullContext.includes('construção') || fullContext.includes('reforma') || fullContext.includes('engenhari')) {
                promises.push(this.searchSINAPI(term).catch(() => []));
            }
        }

        const results = await Promise.allSettled(promises);
        const flattened: ReferenciaItem[] = [];
        const seenSignatures = new Set<string>();

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                result.value.forEach(item => {
                    if (!item.descricao) return; // ignora itens sem descrição
                    const signature = `${item.fonte}-${item.descricao.toLowerCase().trim()}`;
                    if (!seenSignatures.has(signature)) {
                        flattened.push(item);
                        seenSignatures.add(signature);
                    }
                });
            }
        });

        // Ordena priorizando itens com valor definido e os mais recentes
        flattened.sort((a, b) => {
            if (a.valor > 0 && b.valor === 0) return -1;
            if (a.valor === 0 && b.valor > 0) return 1;
            return 0;
        });

        // Retorna até 100 itens no total
        return flattened.slice(0, 100);
    }
};

