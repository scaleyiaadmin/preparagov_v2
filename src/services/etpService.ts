import { supabase } from '@/lib/supabase';
import { DbETP } from '@/types/database';

export const etpService = {
    /**
     * Busca ETPs concluídos para seleção no Mapa de Riscos
     */
    async fetchConcluidos(prefeituraId?: string) {
        const query = supabase
            .from('etp')
            .select(`
        *,
        etp_dfd (
          dfd (
            valor_estimado_total
          )
        )
      `)
            .eq('status', 'Concluído');

        if (prefeituraId) {
            query.eq('prefeitura_id', prefeituraId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(etp => {
            const totalValue = etp.etp_dfd?.reduce((acc: number, item: any) => {
                return acc + (item.dfd?.valor_estimado_total || 0);
            }, 0) || 0;

            return {
                id: etp.id,
                titulo: etp.objeto || etp.descricao_demanda?.substring(0, 50) + '...' || 'ETP sem título',
                numeroETP: etp.numero_etp || 'N/A',
                secretaria: etp.secretaria || 'Não informada',
                dataCriacao: etp.created_at,
                valorTotal: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue),
                descricaoDemanda: etp.descricao_demanda || '',
                status: etp.status
            };
        });
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('etp')
            .select(`
                *,
                etp_dfd (
                    dfd (*)
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(etpData: Partial<DbETP>, dfdIds: string[]) {
        // 1. Inserir o ETP
        // Usamos select('id') para tentar pegar o ID. Se o RLS bloquear, tratamos o erro.
        const { data: insertedData, error: etpError } = await supabase
            .from('etp')
            .insert([etpData])
            .select('id');

        if (etpError) throw etpError;

        const etp = insertedData?.[0];

        if (!etp) {
            throw new Error('O ETP foi inserido mas não pôde ser recuperado. Verifique as permissões de acesso (RLS).');
        }

        // 2. Vincular os DFDs
        if (dfdIds.length > 0) {
            const links = dfdIds.map(dfd_id => ({
                etp_id: etp.id,
                dfd_id
            }));

            const { error: linkError } = await supabase
                .from('etp_dfd')
                .insert(links);

            if (linkError) throw linkError;
        }

        return etp;
    },

    async update(id: string, etpData: Partial<DbETP>, dfdIds?: string[]) {
        // 1. Atualizar o ETP
        // Removemos campos que não devem ser alterados na atualização para evitar erros de RLS ou constraints
        const { numero_etp, created_by, prefeitura_id, id: _, created_at: __, ...dataToUpdate } = etpData as any;

        console.log('Update ETP Payload:', dataToUpdate);

        const { error: etpError } = await supabase
            .from('etp')
            .update(dataToUpdate)
            .eq('id', id);

        if (etpError) {
            console.error('Erro ao atualizar ETP no Supabase:', etpError);
            throw etpError;
        }

        // 2. Atualizar vínculos de DFD se fornecido
        if (dfdIds) {
            try {
                // Remove anteriores
                const { error: deleteError } = await supabase
                    .from('etp_dfd')
                    .delete()
                    .eq('etp_id', id);

                if (deleteError) {
                    console.warn('Erro ao remover vínculos antigos (pode ser ignorado se for apenas RLS):', deleteError);
                }

                // Insere novos
                if (dfdIds.length > 0) {
                    const links = dfdIds.map(dfd_id => ({
                        etp_id: id,
                        dfd_id
                    }));
                    const { error: insertError } = await supabase
                        .from('etp_dfd')
                        .insert(links);

                    if (insertError) {
                        console.error('Erro ao inserir novos vínculos de DFD:', insertError);
                        throw insertError;
                    }
                }
            } catch (linkError) {
                console.error('Erro na transação de vínculos de DFD:', linkError);
                throw linkError;
            }
        }
    }
};
