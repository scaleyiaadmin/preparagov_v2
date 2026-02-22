import { supabase } from '@/lib/supabase';
import { DbSecretaria } from '@/types/database';

export const secretariaService = {
    async fetchSecretarias(prefeituraId?: string) {
        let query = supabase
            .from('secretarias')
            .select('*')
            .order('nome', { ascending: true });

        if (prefeituraId) {
            query = query.eq('prefeitura_id', prefeituraId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async fetchSecretaria(id: string) {
        const { data, error } = await supabase
            .from('secretarias')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createSecretaria(secretaria: Omit<DbSecretaria, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('secretarias')
            .insert({
                nome: secretaria.nome,
                prefeitura_id: secretaria.prefeitura_id,
                responsavel: secretaria.responsavel,
                cargo: secretaria.cargo,
                email: secretaria.email,
                telefone: secretaria.telefone,
                status: secretaria.status || 'ativa',
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateSecretaria(id: string, data: Partial<DbSecretaria>) {
        const { error } = await supabase
            .from('secretarias')
            .update(data)
            .eq('id', id);

        if (error) throw error;
    },

    async deleteSecretaria(id: string) {
        const { error } = await supabase
            .from('secretarias')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getCount(prefeituraId?: string) {
        let query = supabase
            .from('secretarias')
            .select('id', { count: 'exact', head: true });

        if (prefeituraId) {
            query = query.eq('prefeitura_id', prefeituraId);
        }

        const { count, error } = await query;
        if (error) throw error;
        return count || 0;
    },
};
