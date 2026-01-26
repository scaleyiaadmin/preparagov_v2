
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ETPPreview from './ETPPreview';

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
  if (!etp) return null;

  // Mock form data for preview - in a real scenario, this would come from the ETP data
  const mockFormData = {
    selectedDFDs: [
      {
        id: '1',
        objeto: 'Aquisição de Computadores',
        tipoDFD: 'Materiais Permanentes',
        valorEstimado: 'R$ 450.000,00',
        prioridade: 'Alta',
        secretaria: 'Secretaria de Educação'
      },
      {
        id: '2',
        objeto: 'Reforma do Prédio Escolar',
        tipoDFD: 'Serviço de Engenharia',
        valorEstimado: 'R$ 2.200.000,00',
        prioridade: 'Média',
        secretaria: 'Secretaria de Infraestrutura'
      }
    ],
    descricaoDemanda: `Demanda consolidada baseada nos seguintes DFDs aprovados:

DFD nº 023/2024 – Aquisição de Computadores (Materiais Permanentes)
Secretário: João Silva | Responsável pela Demanda: Maria Oliveira
Valor estimado: R$ 450.000,00

DFD nº 041/2024 – Reforma do Prédio (Serviço de Engenharia)
Secretário: Carlos Pereira | Responsável pela Demanda: Luciana Costa
Valor estimado: R$ 2.200.000,00

---

**Valor Total da Demanda: ${etp.valorTotal}**`,
    requisitosContratacao: 'Especificação dos requisitos técnicos necessários para atender às demandas identificadas nos DFDs vinculados, considerando aspectos legais, técnicos e orçamentários.',
    alternativasExistem: true,
    alternativasDescricao: 'Foram analisadas diferentes alternativas para atender às demandas, incluindo parcelamento das contratações e diferentes modalidades licitatórias.',
    descricaoSolucao: 'A solução proposta contempla a contratação integrada dos itens identificados nos DFDs, proporcionando economia de escala e melhor eficiência na execução.',
    justificativaParcelamento: 'O parcelamento é recomendado considerando a natureza distinta dos objetos (materiais permanentes e serviços de engenharia), permitindo especialização técnica e melhor gestão contratual.',
    resultadosPretendidos: 'Modernização da infraestrutura educacional, melhoria da qualidade do ensino e otimização dos recursos públicos disponíveis.',
    providenciasExistem: true,
    providenciasDescricao: 'Necessário levantamento detalhado das especificações técnicas, elaboração de projeto básico para os serviços de engenharia e definição das condições de entrega.',
    contratacoesCorrelatas: false,
    contratacoesDescricao: '',
    impactosAmbientais: true,
    impactosDescricao: 'Os serviços de reforma podem gerar resíduos da construção civil, sendo necessário plano de gerenciamento de resíduos e medidas de mitigação ambiental.',
    observacoesGerais: 'Esta contratação está alinhada com o planejamento estratégico da secretaria e possui dotação orçamentária assegurada para o exercício corrente.',
    conclusaoTecnica: 'Diante do exposto, considera-se tecnicamente viável e recomendável a contratação dos objetos descritos nos DFDs vinculados, observadas as providências prévias mencionadas.'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold">{etp.titulo}</span>
              <p className="text-sm text-gray-600 font-normal">{etp.numeroETP}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <ETPPreview 
            formData={mockFormData} 
            onGeneratePDF={() => onGeneratePDF(etp)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ETPViewModal;
