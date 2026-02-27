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
            .limit(100);

        if (error) throw error;

        return (data || []).map(item => ({
            id: item.id,
            codigo: item.sequencial_compra?.toString() || item.id.substring(0, 8),
            descricao: item.item_nome,
            unidade: item.unidade || 'Unidade',
            valor: parseFloat(item.valor_unitario) || 0,
            fonte: 'PNCP',
            detalhes: item
        }));
    },

    async searchSINAPI(term: string): Promise<ReferenciaItem[]> {
        const { data, error } = await externalSupabase
            .from('referencia_sinapi')
            .select('*')
            .ilike('descricao', `%${term}%`)
            .limit(100);

        if (error) throw error;

        return (data || []).map(item => ({
            id: item.id,
            codigo: item.codigo,
            descricao: item.descricao,
            unidade: item.unidade || 'M2',
            valor: parseFloat(item.preco_base) || 0,
            fonte: 'SINAPI',
            detalhes: item
        }));
    },

    async searchCMED(term: string): Promise<ReferenciaItem[]> {
        const { data, error } = await externalSupabase
            .from('referencia_cmed')
            .select('*')
            .or(`produto.ilike.%${term}%,substancia.ilike.%${term}%`)
            .limit(100);

        if (error) throw error;

        return (data || []).map(item => ({
            id: item.id,
            codigo: item.ean || 'N/A',
            descricao: `${item.substancia} - ${item.produto}`,
            unidade: 'Unidade',
            valor: parseFloat(item.pmvg) || 0,
            fonte: 'CMED',
            detalhes: item
        }));
    },

    async searchCATSER(term: string): Promise<ReferenciaItem[]> {
        const { data, error } = await externalSupabase
            .from('referencia_catser')
            .select('*')
            .ilike('descricao', `%${term}%`)
            .limit(100);

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
        const { data, error } = await externalSupabase
            .from('referencia_pncp')
            .select('*')
            .ilike('item_nome', `%${term}%`)
            .limit(100);

        if (error) throw error;

        return (data || []).map(item => ({
            id: `bps-${item.id}`,
            codigo: item.sequencial_compra?.toString() || item.id.substring(0, 8),
            descricao: item.item_nome,
            unidade: item.unidade || 'UN',
            valor: parseFloat(item.valor_unitario) || 0,
            fonte: 'BPS',
            data: item.data_publicacao ? new Date(item.data_publicacao).toLocaleDateString('pt-BR') : '2025',
            orgao: item.orgao_nome || 'Banco de Preços em Saúde',
            metadata: 'Referência Saúde',
            detalhes: item
        }));
    },

    async searchSETOP(term: string, uf: string = 'MG'): Promise<ReferenciaItem[]> {
        const { data, error } = await externalSupabase
            .from('referencia_setop')
            .select('*')
            .ilike('descricao', `%${term}%`)
            .limit(100);

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
            .limit(20);

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
            .limit(20);

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

        const { data, error } = await query.limit(20);

        if (error) throw error;

        return (data || []).map(item => ({
            id: `nfe-${item.id}`,
            codigo: item.chave_acesso?.substring(0, 10) || 'N/A',
            descricao: item.item_nome,
            unidade: item.unidade || 'UN',
            valor: item.preco_unitario || 0,
            fonte: 'NFE',
            data: item.data_emissao ? new Date(item.data_emissao).toLocaleDateString('pt-BR') : '-',
            orgao: item.orgao_nome || 'Banco NFe',
            metadata: `Chave: ${item.chave_acesso?.substring(0, 20)}...`,
            detalhes: item
        }));
    },

    async searchAll(term: string, tab: string): Promise<ReferenciaItem[]> {
        switch (tab) {
            case 'PNCP': return this.searchPNCP(term);
            case 'SINAPI': return this.searchSINAPI(term);
            case 'CMED': return this.searchCMED(term);
            case 'CATSER': return this.searchCATSER(term);
            case 'BPS': return this.searchBPS(term);
            case 'SETOP': return this.searchSETOP(term);
            case 'SIMPRO': return this.searchSIMPRO(term);
            case 'SIGTAP': return this.searchSIGTAP(term);
            case 'NFE': return this.searchNFE(term);
            default: return [];
        }
    },

    async searchMultisource(term: string): Promise<ReferenciaItem[]> {
        if (!term || term.length < 3) return [];

        const promises = [
            this.searchPNCP(term),
            this.searchSINAPI(term),
            this.searchCMED(term),
            this.searchCATSER(term),
            this.searchSETOP(term),
            this.searchSIMPRO(term),
            this.searchSIGTAP(term),
            this.searchNFE(term)
        ];

        const results = await Promise.allSettled(promises);
        const flattened: ReferenciaItem[] = [];

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                flattened.push(...result.value);
            }
        });

        // Limitar a sugestões mais relevantes (até 30 no total, por exemplo)
        return flattened.slice(0, 50);
    }
};
