import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

import { DFDItem, DFDFormData } from './types';

interface DFDPreviewProps {
  open: boolean;
  onClose: () => void;
  formData: DFDFormData;
  globalJustification?: string;
}

const DFDPreview = ({ open, onClose, formData, globalJustification = '' }: DFDPreviewProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const getTotal = () => {
    return formData.itens.reduce((total, item) => total + (item.quantidade * item.valorReferencia), 0);
  };

  // Generate automatic DFD number
  const generateDFDNumber = () => {
    const year = new Date().getFullYear();
    const number = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    return `DFD-${year}-${number}`;
  };

  const dfdNumber = useRef(generateDFDNumber()).current;

  const handleGeneratePDF = async () => {
    if (!contentRef.current) return;

    setIsGenerating(true);

    try {
      const element = contentRef.current;
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `${dfdNumber}_${formData.objeto.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Preview do DFD - {dfdNumber}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto space-y-6 p-1">
          {/* Container for PDF Generation */}
          <div ref={contentRef} className="bg-white p-8">
            {/* Cabeçalho do documento */}
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                DOCUMENTO DE FORMALIZAÇÃO DA DEMANDA - DFD
              </h1>
              <p className="text-lg font-semibold text-orange-600 mt-2">{dfdNumber}</p>
              <p className="text-gray-600 mt-1">Sistema PreparaGov - Prefeitura Municipal</p>
            </div>

            {/* Informações básicas */}
            <div className="space-y-4 pt-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">1. IDENTIFICAÇÃO DA DEMANDA</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p><strong>Nome do DFD (Objeto):</strong></p>
                    <p className="text-gray-700">{formData.objeto}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p><strong>Descrição Sucinta:</strong></p>
                    <p className="text-gray-700">{formData.descricaoSucinta || 'Não informada'}</p>
                  </div>
                  <div>
                    <p><strong>Tipo de DFD:</strong></p>
                    <Badge className="bg-orange-100 text-orange-800 text-sm font-semibold">
                      {formData.tipoDFD}
                    </Badge>
                  </div>
                  <div>
                    <p><strong>Data Prevista:</strong> {
                      formData.dataPrevista ? new Date(formData.dataPrevista).toLocaleDateString('pt-BR') : 'Não informada'
                    }</p>
                  </div>
                  {formData.prioridade && (
                    <div>
                      <p><strong>Prioridade:</strong>
                        <Badge className={`ml-2 ${formData.prioridade === 'Alto' ? 'bg-red-100 text-red-800' :
                          formData.prioridade === 'Médio' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                          {formData.prioridade}
                        </Badge>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Descrição da Demanda:</h3>
                <p className="text-gray-700 leading-relaxed max-w-none">{formData.descricaoDemanda || 'Não informada'}</p>
              </div>

              {formData.justificativa && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Justificativa da Contratação:</h3>
                  <p className="text-gray-700 leading-relaxed max-w-none">{formData.justificativa}</p>
                </div>
              )}

              {formData.prioridade === 'Alto' && formData.justificativaPrioridade && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Justificativa da Prioridade Alta:</h3>
                  <p className="text-gray-700 leading-relaxed max-w-none">{formData.justificativaPrioridade}</p>
                </div>
              )}
            </div>

            {/* Itens da demanda */}
            {formData.itens.length > 0 && (
              <div className="pt-4 mt-4 border-t-2 border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">2. ITENS DA DEMANDA</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2 text-left">Item</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Código</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Descrição</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Unidade</th>
                        <th className="border border-gray-300 px-3 py-2 text-right">Qtd.</th>
                        <th className="border border-gray-300 px-3 py-2 text-right">Valor Unit.</th>
                        <th className="border border-gray-300 px-3 py-2 text-right">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.itens.map((item, index) => (
                        <tr key={item.id}>
                          <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                          <td className="border border-gray-300 px-3 py-2 font-mono text-xs">{item.codigo}</td>
                          <td className="border border-gray-300 px-3 py-2 text-sm">{item.descricao}</td>
                          <td className="border border-gray-300 px-3 py-2 text-sm">{item.unidade}</td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-sm">{item.quantidade}</td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-sm">R$ {item.valorReferencia.toFixed(2)}</td>
                          <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-sm">
                            R$ {(item.quantidade * item.valorReferencia).toFixed(2)}
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
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Justificativa Global */}
            {globalJustification && (
              <div className="pt-4 mt-4 border-t-2 border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">3. JUSTIFICATIVA DE QUANTIDADE</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line max-w-none">{globalJustification}</p>
                </div>
              </div>
            )}

            {/* Dados do Responsável e Data de Criação */}
            <div className="pt-4 mt-4 border-t-2 border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">4. DADOS DO RESPONSÁVEL</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Solicitante</h3>
                  <p className="text-sm"><strong>Nome:</strong> João Silva</p>
                  <p className="text-sm"><strong>Cargo:</strong> Coordenador de Compras</p>
                  <p className="text-sm"><strong>Secretaria:</strong> Secretaria de Administração</p>
                  <p className="text-sm"><strong>Email:</strong> joao.silva@prefeitura.gov.br</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Dados da Criação</h3>
                  <p className="text-sm"><strong>Data de Criação:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                  <p className="text-sm"><strong>Hora:</strong> {new Date().toLocaleTimeString('pt-BR')}</p>
                  <p className="text-sm"><strong>Sistema:</strong> PreparaGov v1.0</p>
                  <p className="text-sm"><strong>Número do DFD:</strong> {dfdNumber}</p>
                </div>
              </div>
            </div>

            {/* Assinaturas */}
            <div className="pt-4 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-8">5. APROVAÇÕES</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div className="text-center">
                  <div className="border-b border-gray-800 mb-2 mx-8"></div>
                  <p className="font-semibold">João Silva</p>
                  <p className="text-sm text-gray-600">Solicitante</p>
                  <p className="text-sm text-gray-600">Secretaria de Administração</p>
                  <p className="text-sm text-gray-600 mt-2">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-800 mb-2 mx-8"></div>
                  <p className="font-semibold">Aprovação</p>
                  <p className="text-sm text-gray-600">Gestor Responsável</p>
                  <p className="text-sm text-gray-600 mt-2">Data: ___/___/______</p>
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="text-center text-xs text-gray-500 mt-12 pt-4 border-t-2 border-gray-100" style={{ pageBreakInside: 'avoid' }}>
              <p>Documento gerado pelo Sistema PreparaGov em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
              <p className="font-semibold">{dfdNumber}</p>
              <p className="mt-1">Este documento contém: Descrição Sucinta, Tipo de DFD, Lista Completa de Itens, Justificativa Global, Dados do Responsável e Data de Criação</p>
            </div>
          </div>
        </div>

        {/* Botões fixos */}
        <div className="flex justify-end space-x-2 pt-4 border-t flex-shrink-0 bg-white">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Fechar
          </Button>
          <Button onClick={handleGeneratePDF} className="bg-orange-500 hover:bg-orange-600" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <FileText size={16} className="mr-2" />
                Gerar PDF Final
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DFDPreview;
