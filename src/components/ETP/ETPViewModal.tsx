import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ETPPreview from './ETPPreview';
import { supabase } from '@/lib/supabase';

interface ETP {
  id: string;
  titulo: string;
  numeroETP: string;
  status: 'Concluído' | 'Em elaboração';
  dataCriacao: string;
  dataUltimaEdicao: string;
  totalDFDs: number;
  valorTotal: string;
  responsavel: string;
}

interface ETPViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  etp: ETP | null;
  onGeneratePDF: (etp: ETP) => void;
}

const ETPViewModal = ({ isOpen, onClose, etp, onGeneratePDF }: ETPViewModalProps) => {
  const [loading, setLoading] = useState(false);
  const [fullData, setFullData] = useState<any>(null);
  const [responsibleUser, setResponsibleUser] = useState<any>(null);

  useEffect(() => {
    const fetchFullData = async () => {
      if (!etp || !isOpen) return;

      setLoading(true);
      try {
        // 1. Buscar dados completos do ETP e DFDs vinculados
        const { data, error } = await supabase
          .from('etp')
          .select(`
            *,
            etp_dfd (
              dfd (*)
            )
          `)
          .eq('id', etp.id)
          .single();

        if (error) throw error;

        // 2. Buscar dados do responsável pela criação
        if (data.created_by) {
          const { data: userData } = await supabase
            .from('usuarios_acesso')
            .select('nome, tipo_perfil, cargo_funcional')
            .eq('id', data.created_by)
            .single();

          if (userData) setResponsibleUser(userData);
        }

        // 3. Formatar para o ETPPreview
        const formattedDFDs = data.etp_dfd.map((item: any) => ({
          id: item.dfd.id,
          objeto: item.dfd.objeto,
          tipoDFD: item.dfd.tipo_dfd,
          valorEstimado: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.dfd.valor_estimado_total || 0),
          prioridade: item.dfd.prioridade || 'Média',
          secretaria: 'Carregando...'
        }));

        const mappedFormData = {
          selectedDFDs: formattedDFDs,
          objeto: data.objeto || '',
          descricaoSucinta: data.descricao_sucinta || '',
          descricaoDemanda: data.descricao_demanda || '',
          requisitosContratacao: data.requisitos_contratacao || '',
          alternativasExistem: data.alternativas_existem || false,
          alternativasDescricao: data.alternativas_descricao || '',
          descricaoSolucao: data.descricao_solucao || '',
          justificativaParcelamento: data.justificativa_parcelamento || '',
          resultadosPretendidos: data.resultados_pretendidos || '',
          providenciasExistem: data.providencias_existem || false,
          providenciasDescricao: data.providencias_descricao || '',
          contratacoesCorrelatas: data.contratacoes_correlatas || false,
          contratacoesDescricao: data.contratacoes_descricao || '',
          impactosAmbientais: data.impactos_ambientais || false,
          impactosDescricao: data.impactos_descricao || '',
          observacoesGerais: data.observacoes_gerais || '',
          conclusaoTecnica: data.conclusao_tecnica || ''
        };

        setFullData(mappedFormData);
      } catch (err) {
        console.error('Erro ao carregar detalhes do ETP:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullData();
  }, [etp, isOpen]);

  if (!etp) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold">Visualização do Documento</span>
              <p className="text-sm text-gray-600 font-normal">{etp.numeroETP}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Carregando dados do documento...</div>
          ) : fullData ? (
            <ETPPreview
              formData={fullData}
              onGeneratePDF={() => onGeneratePDF(etp)}
              user={responsibleUser}
            />
          ) : (
            <div className="py-12 text-center text-red-500">Erro ao carregar os dados.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ETPViewModal;
