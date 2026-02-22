import { supabase } from '@/lib/supabase';
import { DbEdital } from '@/types/database';

export const editalService = {
    async fetchEditais(prefeituraId?: string) {
        let query = supabase
            .from('editais')
            .select('*')
            .order('created_at', { ascending: false });

        if (prefeituraId) {
            query = query.eq('prefeitura_id', prefeituraId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async fetchEdital(id: string) {
        const { data, error } = await supabase
            .from('editais')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createEdital(edital: Omit<DbEdital, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('editais')
            .insert({
                numero_edital: edital.numero_edital,
                tr_id: edital.tr_id,
                objeto: edital.objeto,
                status: edital.status || 'Rascunho',
                modalidade: edital.modalidade,
                tipo_licitacao: edital.tipo_licitacao,
                valor_estimado: edital.valor_estimado || 0,
                data_publicacao: edital.data_publicacao,
                secretaria_id: edital.secretaria_id,
                prefeitura_id: edital.prefeitura_id,
                dados_json: edital.dados_json || {},
                created_by: edital.created_by,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateEdital(id: string, data: Partial<DbEdital>) {
        const { error } = await supabase
            .from('editais')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    async deleteEdital(id: string) {
        const { error } = await supabase
            .from('editais')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async publishEdital(id: string) {
        const { error } = await supabase
            .from('editais')
            .update({
                status: 'Publicado',
                data_publicacao: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (error) throw error;
    },

    async getCount(prefeituraId?: string) {
        let query = supabase
            .from('editais')
            .select('id', { count: 'exact', head: true });

        if (prefeituraId) {
            query = query.eq('prefeitura_id', prefeituraId);
        }

        const { count, error } = await query;
        if (error) throw error;
        return count || 0;
    },

    async getCountsByStatus(prefeituraId?: string) {
        let query = supabase
            .from('editais')
            .select('status');

        if (prefeituraId) {
            query = query.eq('prefeitura_id', prefeituraId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const counts = {
            total: data.length,
            elaboracao: data.filter(e => e.status === 'Em Elaboração' || e.status === 'Rascunho').length,
            concluidos: data.filter(e => e.status === 'Concluído').length,
            publicados: data.filter(e => e.status === 'Publicado' || e.status === 'Publicado no PNCP').length,
        };

        return counts;
    },
};
