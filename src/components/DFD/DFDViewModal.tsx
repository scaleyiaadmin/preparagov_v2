
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Printer } from 'lucide-react';
import { MappedDFD } from '../../pages/DFD';

type DFDData = MappedDFD;

import { DFDItem } from './types';


interface DFDViewModalProps {
  open: boolean;
  onClose: () => void;
  dfd: DFDData | null;
}

const DFDViewModal = ({ open, onClose, dfd }: DFDViewModalProps) => {
  if (!dfd) return null;

  const getTotal = () => {
    if (!dfd.itens) return 0;
    return dfd.itens.reduce((total, item) => total + (item.quantidade * item.valorReferencia), 0);
  };

  const dfdNumber = dfd.numeroDFD || `DFD-${new Date().getFullYear()}-${String(dfd.id).substring(0, 4)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col print:h-auto print:max-w-none print:p-0">
        <DialogHeader className="flex-shrink-0 print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle>Visualização do DFD - {dfdNumber}</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer size={16} className="mr-2" />
                Imprimir
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 p-1">
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              DOCUMENTO DE FORMALIZAÇÃO DA DEMANDA - DFD
            </h1>
            <p className="text-lg font-semibold text-orange-600 mt-2">{dfdNumber}</p>
            <p className="text-gray-600 mt-1">Sistema PreparaGov - Prefeitura Municipal</p>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. IDENTIFICAÇÃO DA DEMANDA</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Descrição Sucinta do Objeto:</strong></p>
                  <p className="text-gray-700">{dfd.descricaoSucinta || 'Não informada'}</p>
                </div>
                <div>
                  <p><strong>Tipo de DFD:</strong></p>
                  <Badge className="bg-orange-100 text-orange-800 text-sm font-semibold">
                    {dfd.tipoDFD}
                  </Badge>
                </div>
                <div>
                  <p><strong>Data Prevista:</strong> {
                    dfd.dataPrevista ? new Date(dfd.dataPrevista).toLocaleDateString('pt-BR') : 'Não informada'
                  }</p>
                </div>
                <div>
                  <p><strong>Status:</strong>
                    <Badge className={`ml-2 ${dfd.status === 'Pendente' ? 'bg-orange-100 text-orange-800' :
                      dfd.status === 'Em Elaboração' ? 'bg-blue-100 text-blue-800' :
                        dfd.status === 'Aprovado' ? 'bg-green-100 text-green-800' :
                          dfd.status === 'Retirado' ? 'bg-gray-100 text-gray-600 border-dashed border-gray-300' :
                            'bg-red-100 text-red-800'
                      }`}>
                      {dfd.status}
                    </Badge>
                  </p>
                </div>
                {dfd.prioridade && (
                  <div>
                    <p><strong>Prioridade:</strong>
                      <Badge className={`ml-2 ${dfd.prioridade === 'Alto' ? 'bg-red-100 text-red-800' :
                        dfd.prioridade === 'Médio' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {dfd.prioridade}
                      </Badge>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {dfd.descricaoDemanda && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Descrição da Demanda:</h3>
                <p className="text-gray-700 leading-relaxed">{dfd.descricaoDemanda}</p>
              </div>
            )}

            {dfd.justificativa && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Justificativa da Contratação:</h3>
                <p className="text-gray-700 leading-relaxed">{dfd.justificativa}</p>
              </div>
            )}

            {dfd.justificativaPrioridade && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Justificativa da Prioridade:</h3>
                <p className="text-gray-700 leading-relaxed">{dfd.justificativaPrioridade}</p>
              </div>
            )}

            {dfd.justificativaQuantidade && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Justificativa da Quantidade Estimada:</h3>
                <p className="text-gray-700 leading-relaxed">{dfd.justificativaQuantidade}</p>
              </div>
            )}
          </div>

          {dfd.itens && dfd.itens.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. ITENS DA DEMANDA</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left">Item</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Código</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Descrição</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Unidade</th>
                      <th className="border border-gray-300 px-3 py-2 text-right">Quantidade</th>
                      <th className="border border-gray-300 px-3 py-2 text-right">Valor Unit.</th>
                      <th className="border border-gray-300 px-3 py-2 text-right">Valor Total</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Fonte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dfd.itens.map((item, index) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                        <td className="border border-gray-300 px-3 py-2 font-mono text-sm">{item.codigo}</td>
                        <td className="border border-gray-300 px-3 py-2">{item.descricao}</td>
                        <td className="border border-gray-300 px-3 py-2">{item.unidade}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">{item.quantidade}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right">R$ {item.valorReferencia.toFixed(2)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                          R$ {(item.quantidade * item.valorReferencia).toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <Badge variant="outline" className="text-xs">
                            {item.tabelaReferencia}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={6} className="border border-gray-300 px-3 py-2 text-right">
                        TOTAL ESTIMADO:
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        R$ {getTotal().toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-3 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">3. DADOS DO RESPONSÁVEL</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Solicitante</h3>
                <p><strong>Nome:</strong> {dfd.requisitante?.nome || 'Não informado'}</p>
                <p><strong>Cargo:</strong> {dfd.requisitante?.cargo || 'Não informado'}</p>
                <p><strong>Secretaria:</strong> {dfd.requisitante?.secretaria || 'Não informada'}</p>
                <p><strong>Email:</strong> {dfd.requisitante?.email || 'Não informado'}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Dados da Criação</h3>
              <p><strong>Data de Criação:</strong> {new Date(dfd.data).toLocaleDateString('pt-BR')}</p>
              <p><strong>Sistema:</strong> PreparaGov v1.0</p>
              <p><strong>Número do DFD:</strong> {dfdNumber}</p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t">
          <p>Documento visualizado pelo Sistema PreparaGov</p>
          <p className="font-semibold">{dfdNumber}</p>
        </div>

        <div className="flex justify-end pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog >
  );
};

export default DFDViewModal;
