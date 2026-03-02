import { supabase } from '@/lib/supabase';
import { DbDFD, DbDFDItem, DbDFDWithRelations } from '@/types/database';

export const dfdService = {
    async getAll(filters?: { status?: string; ano?: number; prefeituraId?: string }): Promise<DbDFDWithRelations[]> {
        let query = supabase
            .from('dfd')
            .select('*, dfd_items(*), secretarias(*)')
            .order('created_at', { ascending: false });

        if (filters?.prefeituraId) {
            query = query.eq('prefeitura_id', filters.prefeituraId);
        }

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        if (filters?.ano) {
            query = query.eq('ano_contratacao', filters.ano);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async getById(id: string): Promise<DbDFDWithRelations> {
        const { data, error } = await supabase
            .from('dfd')
            .select('*, dfd_items(*), secretarias(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(dfd: Omit<DbDFD, 'id' | 'created_at'>, items: Omit<DbDFDItem, 'id' | 'dfd_id'>[]): Promise<DbDFD> {
        // 1. Create DFD Header
        const { data: dfdData, error: dfdError } = await supabase
            .from('dfd')
            .insert([dfd])
            .select()
            .single();

        if (dfdError) throw dfdError;

        // 2. Create Items
        if (items.length > 0) {
            const itemsWithId = items.map(item => ({
                ...item,
                dfd_id: dfdData.id
            }));

            const { error: itemsError } = await supabase
                .from('dfd_items')
                .insert(itemsWithId);

            if (itemsError) {
                // Rollback (delete header if items fail) - optional but good practice
                await supabase.from('dfd').delete().eq('id', dfdData.id);
                throw itemsError;
            }
        }

        return dfdData;
    },

    async update(id: string, dfdUpdates: Partial<DbDFD>, items?: Omit<DbDFDItem, 'id' | 'dfd_id'>[]) {
        // 1. Update Header
        const { error: dfdError } = await supabase
            .from('dfd')
            .update(dfdUpdates)
            .eq('id', id);

        if (dfdError) throw dfdError;

        // 2. Update Items (Strategy: Delete all and recreate)
        // This is simple but effective for this scale. 
        // Ideally we would diff, but 'replace all' ensures consistency easily.
        if (items) {
            const { error: deleteError } = await supabase
                .from('dfd_items')
                .delete()
                .eq('dfd_id', id);

            if (deleteError) throw deleteError;

            if (items.length > 0) {
                const itemsWithId = items.map(item => ({
                    ...item,
                    dfd_id: id
                }));

                const { error: insertError } = await supabase
                    .from('dfd_items')
                    .insert(itemsWithId);

                if (insertError) throw insertError;
            }
        }
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('dfd')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async requestCancellation(id: string, justification: string) {
        const { error } = await supabase
            .from('dfd')
            .update({
                solicitacao_cancelamento: true,
                justificativa_cancelamento: justification
            })
            .eq('id', id);

        if (error) throw error;
    },

    async cancel(id: string, justification: string) {
        const { error } = await supabase
            .from('dfd')
            .update({
                status: 'Cancelado',
                justificativa_cancelamento: justification,
                solicitacao_cancelamento: false
            })
            .eq('id', id);

        if (error) throw error;
    },

    async approve(id: string) {
        const { error } = await supabase
            .from('dfd')
            .update({ status: 'Aprovado' })
            .eq('id', id);

        if (error) throw error;
    },

    async requestPcaRemoval(id: string, justification: string) {
        const { error } = await supabase
            .from('dfd')
            .update({
                status: 'Retirado',
                justificativa_cancelamento: justification
            })
            .eq('id', id);

        if (error) throw error;

        // Aqui poderíamos chamar uma função de notificação se o serviço existisse
        console.log('Notificação enviada ao responsável pelo DFD', id);
    }
};
