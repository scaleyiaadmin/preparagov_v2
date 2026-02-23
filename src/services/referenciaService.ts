import { externalSupabase } from '@/lib/externalSupabase';

export interface ReferenciaItem {
    id: string;
    codigo: string;
    descricao: string;
    unidade: string;
    valor: number;
    fonte: string;
    detalhes?: any;
}

export const referenciaService = {
    async searchPNCP(term: string): Promise<ReferenciaItem[]> {
        const { data, error } = await externalSupabase
            .from('referencia_pncp')
            .select('*')
            .or(`item_nome.ilike.%${term}%,municipio.ilike.%${term}%`)
            .limit(20);

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
            .limit(20);

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
            .limit(20);

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
            .limit(20);

        if (error) throw error;

        return (data || []).map(item => ({
            id: item.id,
            codigo: item.codigo,
            descricao: item.descricao,
            unidade: 'N/A',
            valor: 0,
            fonte: 'CATSER',
            detalhes: item
        }));
    },

    async searchAll(term: string, tab: string): Promise<ReferenciaItem[]> {
        switch (tab) {
            case 'PNCP': return this.searchPNCP(term);
            case 'SINAPI': return this.searchSINAPI(term);
            case 'CMED': return this.searchCMED(term);
            case 'CATSER': return this.searchCATSER(term);
            case 'BPS': return this.searchCATSER(term); // Usando CATSER como fallback se BPS não tiver tabela específica
            default: return [];
        }
    }
};
