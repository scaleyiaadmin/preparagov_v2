import { supabase } from '@/lib/supabase';
import { DbMapaRiscos, DbMapaRiscosItem } from '@/types/database';

export const mapaRiscosService = {
    async fetchMapasRiscos(prefeituraId?: string) {
        let query = supabase
            .from('mapa_riscos')
            .select('*, mapa_riscos_itens(count)')
            .order('created_at', { ascending: false });

        if (prefeituraId) {
            query = query.eq('prefeitura_id', prefeituraId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((mapa: any) => ({
            ...mapa,
            totalRiscos: mapa.mapa_riscos_itens?.[0]?.count || 0,
        }));
    },

    async fetchMapaRisco(id: string) {
        const { data, error } = await supabase
            .from('mapa_riscos')
            .select('*, mapa_riscos_itens(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createMapaRiscos(mapa: Omit<DbMapaRiscos, 'id' | 'created_at' | 'updated_at'>, itens?: Omit<DbMapaRiscosItem, 'id' | 'mapa_riscos_id'>[]) {
        const { data: mapaData, error: mapaError } = await supabase
            .from('mapa_riscos')
            .insert({
                titulo: mapa.titulo,
                etp_id: mapa.etp_id,
                etp_numero: mapa.etp_numero,
                etp_titulo: mapa.etp_titulo,
                secretaria: mapa.secretaria,
                status: mapa.status || 'elaboracao',
                created_by: mapa.created_by,
                prefeitura_id: mapa.prefeitura_id,
            })
            .select()
            .single();

        if (mapaError) throw mapaError;

        if (itens && itens.length > 0) {
            const itensWithMapaId = itens.map(item => ({
                ...item,
                mapa_riscos_id: mapaData.id,
            }));

            const { error: itensError } = await supabase
                .from('mapa_riscos_itens')
                .insert(itensWithMapaId);

            if (itensError) {
                // Rollback: delete the mapa if items failed
                await supabase.from('mapa_riscos').delete().eq('id', mapaData.id);
                throw itensError;
            }
        }

        return mapaData;
    },

    async updateMapaRiscos(id: string, data: Partial<DbMapaRiscos>) {
        const { error } = await supabase
            .from('mapa_riscos')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    async addRiscoItem(mapaId: string, item: Omit<DbMapaRiscosItem, 'id' | 'mapa_riscos_id'>) {
        const { data, error } = await supabase
            .from('mapa_riscos_itens')
            .insert({ ...item, mapa_riscos_id: mapaId })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateRiscoItem(id: string, data: Partial<DbMapaRiscosItem>) {
        const { error } = await supabase
            .from('mapa_riscos_itens')
            .update(data)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteRiscoItem(id: string) {
        const { error } = await supabase
            .from('mapa_riscos_itens')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async deleteMapaRiscos(id: string) {
        const { error } = await supabase
            .from('mapa_riscos')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async finalizeMapaRiscos(id: string) {
        const { error } = await supabase
            .from('mapa_riscos')
            .update({ status: 'concluido', updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    },

    async getCountsByStatus(prefeituraId?: string) {
        let queryConcluidos = supabase
            .from('mapa_riscos')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'concluido');

        let queryElaboracao = supabase
            .from('mapa_riscos')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'elaboracao');

        if (prefeituraId) {
            queryConcluidos = queryConcluidos.eq('prefeitura_id', prefeituraId);
            queryElaboracao = queryElaboracao.eq('prefeitura_id', prefeituraId);
        }

        const [concluidos, elaboracao] = await Promise.all([queryConcluidos, queryElaboracao]);

        return {
            concluidos: concluidos.count || 0,
            elaboracao: elaboracao.count || 0,
            total: (concluidos.count || 0) + (elaboracao.count || 0),
        };
    },
};
