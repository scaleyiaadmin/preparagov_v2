
import React from 'react';
import { TermoReferencia } from '@/utils/termoReferenciaData';

interface EditalStep3Props {
  data: any;
  onUpdate: (field: string, value: any) => void;
  selectedTR: TermoReferencia;
}

const EditalStep3 = ({ data, onUpdate, selectedTR }: EditalStep3Props) => {
  return (
    <div className="p-6">
      <div className="text-center py-20">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos - Etapa 3</h3>
        <p className="text-gray-600">Componente em construção</p>
      </div>
    </div>
  );
};

export default EditalStep3;
