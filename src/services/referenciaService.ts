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

async function fetchPaginated(
    table: string,
    queryBuilder: (query: any) => any,
    maxLimit: number = 10000
): Promise<any[]> {
    const allData: any[] = [];
    let page = 0;
    const pageSize = 1000;

    while (allData.length < maxLimit) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        let query = externalSupabase.from(table).select('*');
        query = queryBuilder(query).range(from, to);

        const { data, error } = await query;
        if (error) throw error;
        if (!data || data.length === 0) break;

        allData.push(...data);
        page++;

        if (data.length < pageSize) break;
    }

    return allData.slice(0, maxLimit);
}

export const referenciaService = {
    async searchPNCP(term: string): Promise<ReferenciaItem[]> {
        const processedTerm = term.trim().toLowerCase();
        const data = await fetchPaginated('referencia_pncp', q => q.or(`item_nome.ilike.%${processedTerm}%,municipio.ilike.%${processedTerm}%`));

        return data.map(item => ({
            id: item.id,
            codigo: item.id, 
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
        const data = await fetchPaginated('referencia_sinapi', q => q.or(`produto.ilike.%${term}%,substancia.ilike.%${term}%`));

        return data.map(item => ({
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
        const data = await fetchPaginated('referencia_catser', q => q.ilike('descricao', `%${term}%`));

        return data.map(item => ({
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
        const data = await fetchPaginated('referencia_nfe', q => q.ilike('item_nome', `%${term}%`));

        return data.map(item => ({
            id: `bps-${item.id}`,
            codigo: item.id,
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
        const data = await fetchPaginated('referencia_setop', q => q.ilike('descricao', `%${term}%`));

        return data.map(item => ({
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
        const data = await fetchPaginated('referencia_simpro', q => q.ilike('descricao', `%${term}%`));

        return data.map(item => ({
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
        const data = await fetchPaginated('referencia_sigtap', q => q.ilike('descricao', `%${term}%`));

        return data.map(item => ({
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

        const { data, error } = await query.limit(1000); 

        if (error) throw error;

        return data.map(item => ({
            id: `nfe-${item.id}`,
            codigo: item.id,
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

    async searchCEASA(term: string): Promise<ReferenciaItem[]> {
        const data = await fetchPaginated('referencia_ceasa', q => q.ilike('item_nome', `%${term}%`));

        return data.map(item => ({
            id: `ceasa-${item.id}`,
            codigo: item.id.toString(),
            descricao: item.item_nome,
            unidade: item.unidade || 'KG',
            valor: parseFloat(item.preco_unitario) || 0,
            fonte: 'CEASA',
            data: item.data_referencia || '2025',
            orgao: item.ceasa || 'CEASA',
            detalhes: item
        }));
    },

    async searchCATMAT(term: string): Promise<ReferenciaItem[]> {
        const data = await fetchPaginated('referencia_pncp', q => q.ilike('item_nome', `%${term}%`));

        return data.map(item => ({
            id: `catmat-${item.id}`,
            codigo: item.id,
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
            case 'CEASA': results = await this.searchCEASA(term); break;
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

    async searchMultisource(context: { objeto: string; descricaoDemanda?: string; justificativa?: string; tipoDFD?: string; descricaoSucinta?: string }): Promise<ReferenciaItem[]> {
        const fullContext = `${context.objeto} ${context.descricaoDemanda || ''} ${context.justificativa || ''} ${context.tipoDFD || ''} ${context.descricaoSucinta || ''}`.toLowerCase();

        // --- 1. Extração do Termo Principal ---
        // Limpar prefixos genéricos de DFDs
        const cleanContext = context.objeto
            .replace(/^(aquisi[çc][ãa]o|compra|contrata[çc][ãa]o|fornecimento|presta[çc][ãa]o|loca[çc][ãa]o|servi[çc]o)( de | para )?/i, '')
            .trim();
        
        // Extrair palavras com mais de 3 letras
        const words = cleanContext.split(/[\s,.;]+/).filter(w => w.length > 3);
        if (words.length === 0) return []; // Fallback se o objeto for vazio ou muito curto

        const genericWords = ['materiais', 'equipamentos', 'serviços', 'itens', 'diversos', 'peças', 'kit', 'sistema', 'projeto'];
        let primaryTerm = words[0];
        let secondaryTerms = words.slice(1);

        // Se a primeira palavra for muito genérica e houver mais palavras, usar a próxima como termo principal
        if (genericWords.includes(primaryTerm.toLowerCase()) && words.length > 1) {
             primaryTerm = words[1];
             secondaryTerms = words.slice(2);
        }

        // --- 2. Busca Paralela Direcionada ---
        const promises: Promise<ReferenciaItem[]>[] = [];
        const tipo = (context.tipoDFD || '').toUpperCase();

        const searchMaterial = tipo.includes('MATERIAL') || !tipo || tipo === 'TERMO ADITIVO';
        const searchServico = tipo.includes('SERVIÇO') && !tipo.includes('ENGENHARIA');
        const searchEngenharia = tipo.includes('ENGENHARIA');
        const searchSaude = fullContext.includes('medicamento') || fullContext.includes('saúde') || fullContext.includes('hospital') || fullContext.includes('fármaco') || fullContext.includes('clínic');

        if (searchMaterial) {
            promises.push(this.searchPNCP(primaryTerm).catch(() => []));
            promises.push(this.searchNFE(primaryTerm).catch(() => []));
            promises.push(this.searchCATMAT(primaryTerm).catch(() => []));
        }

        if (searchServico) {
            promises.push(this.searchPNCP(primaryTerm).catch(() => []));
            promises.push(this.searchCATSER(primaryTerm).catch(() => []));
            // Muitas vezes serviços usam NFE ou estão listados misturados
            promises.push(this.searchNFE(primaryTerm).catch(() => []));
        }

        if (searchEngenharia) {
            promises.push(this.searchSINAPI(primaryTerm).catch(() => []));
            promises.push(this.searchSETOP(primaryTerm).catch(() => []));
            promises.push(this.searchPNCP(primaryTerm).catch(() => [])); 
        }

        if (searchSaude) {
            promises.push(this.searchCMED(primaryTerm).catch(() => []));
            promises.push(this.searchBPS(primaryTerm).catch(() => []));
            promises.push(this.searchSIMPRO(primaryTerm).catch(() => []));
            promises.push(this.searchSIGTAP(primaryTerm).catch(() => []));
            promises.push(this.searchPNCP(primaryTerm).catch(() => [])); 
        }

        const results = await Promise.allSettled(promises);
        let flattened: ReferenciaItem[] = [];
        
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                flattened.push(...result.value);
            }
        });

        // --- 3. Filtragem Inteligente (Scoring Dinâmico) ---
        const scoredItems = flattened.map(item => {
            let score = 0;
            const desc = item.descricao.toLowerCase();
            
            // A. Exact match do contexto limpo original (bônus muito alto)
            if (desc.includes(cleanContext.toLowerCase())) score += 50;

            // B. Para cada termo secundário presente na descrição (bônus cumulativo)
            secondaryTerms.forEach(term => {
                 if (desc.includes(term.toLowerCase())) score += 10;
            });

            // C. Se a descrição do item cruzar com partes da demanda ou justificativa
            if (context.descricaoDemanda && desc.includes((context.descricaoDemanda.split(' ')[0] || '').toLowerCase())) score += 5;
            if (context.descricaoSucinta && desc.includes((context.descricaoSucinta.split(' ')[0] || '').toLowerCase())) score += 5;

            // D. Bônus por ter valor preenchido (itens sem preço têm menos peso)
            if (item.valor > 0) score += 2;

            return { item, score };
        });

        const maxScore = scoredItems.length > 0 ? Math.max(...scoredItems.map(s => s.score)) : 0;
        let filtered = scoredItems;
        
        // Se encontramos itens super relevantes (score alto), cortamos o lixo genérico que pontuou baixo
        if (maxScore >= 10) {
             filtered = scoredItems.filter(s => s.score >= 10);
        } else if (maxScore > 0) {
             filtered = scoredItems.filter(s => s.score > 0);
        }

        // Ordenar por score (descendente)
        filtered.sort((a, b) => {
            if (a.score !== b.score) return b.score - a.score;
            if (a.item.valor > 0 && b.item.valor === 0) return -1;
            if (a.item.valor === 0 && b.item.valor > 0) return 1;
            return 0;
        });

        // Remover duplicatas exatas pela descrição
        const finalItems: ReferenciaItem[] = [];
        const seenDesc = new Set<string>();

        for (const { item } of filtered) {
             const lowerDesc = item.descricao.toLowerCase().trim();
             if (!seenDesc.has(lowerDesc)) {
                 seenDesc.add(lowerDesc);
                 finalItems.push(item);
             }
        }

        return finalItems.slice(0, 50); // Múltiplas opções limitadas por qualidade
    }
};

