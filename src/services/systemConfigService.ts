import { supabase } from '@/lib/supabase';

export const systemConfigService = {
    async getConfig(chave: string, prefeituraId?: string) {
        let query = supabase
            .from('system_config')
            .select('*')
            .eq('chave', chave);

        if (prefeituraId) {
            query = query.eq('prefeitura_id', prefeituraId);
        } else {
            query = query.is('prefeitura_id', null);
        }

        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        return data?.valor || null;
    },

    async setConfig(chave: string, valor: string, prefeituraId?: string | null) {
        const { error } = await supabase
            .from('system_config')
            .upsert(
                {
                    chave,
                    valor,
                    prefeitura_id: prefeituraId || null,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'chave,prefeitura_id' }
            );

        if (error) throw error;
    },

    async getAllConfigs(prefeituraId?: string) {
        let query = supabase
            .from('system_config')
            .select('*');

        if (prefeituraId) {
            query = query.eq('prefeitura_id', prefeituraId);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Convert to key-value map
        const configs: Record<string, string> = {};
        (data || []).forEach((item: any) => {
            configs[item.chave] = item.valor;
        });
        return configs;
    },

    async deleteConfig(chave: string, prefeituraId?: string) {
        let query = supabase
            .from('system_config')
            .delete()
            .eq('chave', chave);

        if (prefeituraId) {
            query = query.eq('prefeitura_id', prefeituraId);
        }

        const { error } = await query;
        if (error) throw error;
    },
};
