
import React from 'react';
import ETPPreview from './ETPPreview';

interface ETPFormData {
  selectedDFDs: any[];
  descricaoDemanda: string;
  requisitosContratacao: string;
  alternativasExistem: boolean;
  alternativasDescricao: string;
  descricaoSolucao: string;
  justificativaParcelamento: string;
  resultadosPretendidos: string;
  providenciasExistem: boolean;
  providenciasDescricao: string;
  contratacoesCorrelatas: boolean;
  contratacoesDescricao: string;
  impactosAmbientais: boolean;
  impactosDescricao: string;
  observacoesGerais: string;
  conclusaoTecnica: string;
}

interface SummaryStepProps {
  formData: ETPFormData;
  onGeneratePDF: () => void;
}

const SummaryStep = ({ formData, onGeneratePDF }: SummaryStepProps) => {
  return <ETPPreview formData={formData} onGeneratePDF={onGeneratePDF} />;
};

export default SummaryStep;
