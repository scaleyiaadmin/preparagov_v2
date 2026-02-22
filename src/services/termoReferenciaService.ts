import { supabase } from '@/lib/supabase';
import { DbTermoReferencia } from '@/types/database';

export const termoReferenciaService = {
    async fetchTermosReferencia(prefeituraId?: string) {
        let query = supabase
            .from('termos_referencia')
            .select('*')
            .order('created_at', { ascending: false });

        if (prefeituraId) {
            query = query.eq('prefeitura_id', prefeituraId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async fetchTermoReferencia(id: string) {
        const { data, error } = await supabase
            .from('termos_referencia')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createTermoReferencia(tr: Omit<DbTermoReferencia, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('termos_referencia')
            .insert({
                numero_tr: tr.numero_tr,
                etp_id: tr.etp_id,
                objeto: tr.objeto,
                status: tr.status || 'Rascunho',
                tipo: tr.tipo,
                valor_estimado: tr.valor_estimado || 0,
                secretaria_id: tr.secretaria_id,
                prefeitura_id: tr.prefeitura_id,
                dados_json: tr.dados_json || {},
                created_by: tr.created_by,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateTermoReferencia(id: string, data: Partial<DbTermoReferencia>) {
        const { error } = await supabase
            .from('termos_referencia')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    async deleteTermoReferencia(id: string) {
        const { error } = await supabase
            .from('termos_referencia')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getTRsConcluidos(prefeituraId?: string) {
        let query = supabase
            .from('termos_referencia')
            .select('*')
            .eq('status', 'Concluído')
            .order('created_at', { ascending: false });

        if (prefeituraId) {
            query = query.eq('prefeitura_id', prefeituraId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async getCount(prefeituraId?: string) {
        let query = supabase
            .from('termos_referencia')
            .select('id', { count: 'exact', head: true });

        if (prefeituraId) {
            query = query.eq('prefeitura_id', prefeituraId);
        }

        const { count, error } = await query;
        if (error) throw error;
        return count || 0;
    },

    async fetchCompletedTermosReferencia(prefeituraId?: string) {
        let query = supabase
            .from('termos_referencia')
            .select('*')
            .eq('status', 'Concluído')
            .order('created_at', { ascending: false });

        if (prefeituraId) {
            query = query.eq('prefeitura_id', prefeituraId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async getCountsByStatus(prefeituraId?: string) {
        let query = supabase
            .from('termos_referencia')
            .select('status');

        if (prefeituraId) {
            query = query.eq('prefeitura_id', prefeituraId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const counts = {
            total: data.length,
            elaboracao: data.filter(tr => tr.status === 'Em Elaboração' || tr.status === 'Rascunho').length,
            prontos: data.filter(tr => tr.status === 'Pronto' || tr.status === 'Concluído').length,
        };

        return counts;
    },
};
