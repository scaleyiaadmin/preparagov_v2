
import React from 'react';
import ETPPreview from './ETPPreview';

interface ETPFormData {
  selectedDFDs: any[];
  objeto: string;
  descricaoSucinta: string;
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
  user?: any;
}

const SummaryStep = ({ formData, onGeneratePDF, user }: SummaryStepProps) => {
  return <ETPPreview formData={formData} onGeneratePDF={onGeneratePDF} user={user} />;
};

export default SummaryStep;
