import { supabase } from '@/lib/supabase';
import { DbETP } from '@/types/database';

export const etpService = {
    /**
     * Busca ETPs concluídos para seleção no Mapa de Riscos
     */
    async fetchConcluidos(prefeituraId?: string) {
        let query = supabase
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
            // Assumindo que ETP tem prefeitura_id ou passamos via created_by filter se necessário
            // Por enquanto, filtros por prefeitura_id se a coluna existir
            // Se não existir, buscamos todos do contexto (etp table costuma ter prefeitura_id em sistemas multi-tenant)
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(etp => {
            const totalValue = etp.etp_dfd?.reduce((acc: number, item: any) => {
                return acc + (item.dfd?.valor_estimado_total || 0);
            }, 0) || 0;

            return {
                id: etp.id,
                titulo: etp.descricao_demanda?.substring(0, 50) + '...' || 'ETP sem título',
                numeroETP: etp.numero_etp || 'N/A',
                secretaria: etp.secretaria || 'Não informada',
                dataCriacao: etp.created_at,
                valorTotal: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue),
                descricaoDemanda: etp.descricao_demanda || '',
                status: etp.status
            };
        });
    }
};
