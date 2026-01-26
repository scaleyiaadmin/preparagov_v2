
import React from 'react';

interface EditalStep2Props {
  data: any;
  onUpdate: (field: string, value: any) => void;
}

const EditalStep2 = ({ data, onUpdate }: EditalStep2Props) => {
  return (
    <div className="p-6">
      <div className="text-center py-20">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prazos - Etapa 2</h3>
        <p className="text-gray-600">Componente em construção</p>
      </div>
    </div>
  );
};

export default EditalStep2;
