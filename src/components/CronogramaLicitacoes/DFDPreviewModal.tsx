
import React from 'react';
import DFDPreview from '../DFD/DFDPreview';

interface DFDPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dfdId: string;
}

// Mock data - em produção viria do banco de dados
const getMockDFDData = (dfdId: string) => {
  return {
    objeto: `Objeto do ${dfdId}`,
    tipoDFD: 'Materiais de Consumo',
    descricaoSucinta: 'Descrição sucinta do DFD',
    descricaoDemanda: 'Descrição detalhada da demanda',
    justificativa: 'Justificativa da contratação',
    dataPrevista: '2024-03-15',
    prioridade: 'Alta',
    justificativaPrioridade: 'Justificativa da prioridade alta',
    itens: [
      {
        id: '1',
        codigo: 'ITEM001',
        descricao: 'Arroz Tipo 1 - 5kg',
        unidade: 'Pacote',
        quantidade: 50,
        valorReferencia: 10.00,
        tabelaReferencia: 'SINAPI'
      }
    ]
  };
};

const DFDPreviewModal = ({ isOpen, onClose, dfdId }: DFDPreviewModalProps) => {
  const formData = getMockDFDData(dfdId);

  return (
    <DFDPreview
      open={isOpen}
      onClose={onClose}
      formData={formData}
      globalJustification="Justificativa global para os itens"
    />
  );
};

export default DFDPreviewModal;
