import { supabase } from '@/lib/supabase';

export const perfilService = {
    async updateProfile(userId: string, data: {
        nome?: string;
        email?: string;
        telefone?: string;
        cpf?: string;
        matricula?: string;
        cargo_funcional?: string;
        unidade?: string;
    }) {
        const { error } = await supabase
            .from('usuarios_acesso')
            .update(data)
            .eq('id', userId);

        if (error) throw error;
    },

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        // Verify current password
        const { data: user, error: fetchError } = await supabase
            .from('usuarios_acesso')
            .select('senha')
            .eq('id', userId)
            .single();

        if (fetchError) throw fetchError;

        if (user?.senha !== currentPassword) {
            throw new Error('Senha atual incorreta');
        }

        // Update password
        const { error: updateError } = await supabase
            .from('usuarios_acesso')
            .update({ senha: newPassword })
            .eq('id', userId);

        if (updateError) throw updateError;
    },

    async getUserStats(userId: string) {
        const [dfdResult, etpResult, editalResult] = await Promise.all([
            supabase
                .from('dfd')
                .select('id', { count: 'exact', head: true })
                .eq('created_by', userId),
            supabase
                .from('etp')
                .select('id', { count: 'exact', head: true })
                .eq('created_by', userId),
            supabase
                .from('editais')
                .select('id', { count: 'exact', head: true })
                .eq('created_by', userId),
        ]);

        return {
            dfds: dfdResult.count || 0,
            etps: etpResult.count || 0,
            editais: editalResult.count || 0,
        };
    },

    async getUserProfile(userId: string) {
        const { data, error } = await supabase
            .from('usuarios_acesso')
            .select('nome, email, telefone, cpf, matricula, cargo_funcional, unidade')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    },
};
