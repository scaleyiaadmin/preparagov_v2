
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download } from 'lucide-react';

interface DFDItem {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorReferencia: number;
  tabelaReferencia: string;
}

interface DFDFormData {
  objeto: string;
  tipoDFD: string;
  descricaoSucinta: string;
  descricaoDemanda: string;
  justificativa: string;
  dataPrevista: string;
  prioridade: string;
  justificativaPrioridade: string;
  itens: DFDItem[];
}

interface DFDPreviewProps {
  open: boolean;
  onClose: () => void;
  formData: DFDFormData;
  globalJustification?: string;
}

const DFDPreview = ({ open, onClose, formData, globalJustification = '' }: DFDPreviewProps) => {
  const getTotal = () => {
    return formData.itens.reduce((total, item) => total + (item.quantidade * item.valorReferencia), 0);
  };

  // Generate automatic DFD number
  const generateDFDNumber = () => {
    const year = new Date().getFullYear();
    const number = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    return `DFD-${year}-${number}`;
  };

  const dfdNumber = generateDFDNumber();

  const handleDownload = () => {
    // Simular download do PDF
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${dfdNumber}_${formData.objeto.replace(/\s+/g, '_')}.pdf`;
    link.click();
  };

  const handleGeneratePDF = () => {
    // Implementar geração real do PDF aqui
    console.log('Gerando PDF com dados:', {
      dfdNumber,
      objeto: formData.objeto,
      tipoDFD: formData.tipoDFD,
      itens: formData.itens,
      globalJustification,
      responsavel: 'João Silva',
      dataGeracao: new Date().toLocaleDateString('pt-BR')
    });
    
    // Simular download
    handleDownload();
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
          {/* Cabeçalho do documento */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              DOCUMENTO DE FORMALIZAÇÃO DA DEMANDA - DFD
            </h1>
            <p className="text-lg font-semibold text-orange-600 mt-2">{dfdNumber}</p>
            <p className="text-gray-600 mt-1">Sistema PreparaGov - Prefeitura Municipal</p>
          </div>

          {/* Informações básicas */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. IDENTIFICAÇÃO DA DEMANDA</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Descrição Sucinta do Objeto:</strong></p>
                  <p className="text-gray-700">{formData.objeto}</p>
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
                      <Badge className={`ml-2 ${
                        formData.prioridade === 'Alto' ? 'bg-red-100 text-red-800' :
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
              <p className="text-gray-700 leading-relaxed">{formData.descricaoDemanda || 'Não informada'}</p>
            </div>

            {formData.justificativa && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Justificativa da Contratação:</h3>
                <p className="text-gray-700 leading-relaxed">{formData.justificativa}</p>
              </div>
            )}

            {formData.prioridade === 'Alto' && formData.justificativaPrioridade && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Justificativa da Prioridade Alta:</h3>
                <p className="text-gray-700 leading-relaxed">{formData.justificativaPrioridade}</p>
              </div>
            )}
          </div>

          {/* Itens da demanda */}
          {formData.itens.length > 0 && (
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
                    {formData.itens.map((item, index) => (
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

          {/* Justificativa Global */}
          {globalJustification && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. JUSTIFICATIVA DE QUANTIDADE</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{globalJustification}</p>
              </div>
            </div>
          )}

          {/* Dados do Responsável e Data de Criação */}
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">4. DADOS DO RESPONSÁVEL</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Solicitante</h3>
                <p><strong>Nome:</strong> João Silva</p>
                <p><strong>Cargo:</strong> Coordenador de Compras</p>
                <p><strong>Secretaria:</strong> Secretaria de Administração</p>
                <p><strong>Email:</strong> joao.silva@prefeitura.gov.br</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Dados da Criação</h3>
                <p><strong>Data de Criação:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                <p><strong>Hora:</strong> {new Date().toLocaleTimeString('pt-BR')}</p>
                <p><strong>Sistema:</strong> PreparaGov v1.0</p>
                <p><strong>Número do DFD:</strong> {dfdNumber}</p>
              </div>
            </div>
          </div>

          {/* Assinaturas */}
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">5. APROVAÇÕES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="border-b border-gray-400 mb-2 pb-12"></div>
                <p className="font-semibold">João Silva</p>
                <p className="text-sm text-gray-600">Solicitante</p>
                <p className="text-sm text-gray-600">Secretaria de Administração</p>
                <p className="text-sm text-gray-600">Data: {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="text-center">
                <div className="border-b border-gray-400 mb-2 pb-12"></div>
                <p className="font-semibold">Aprovação</p>
                <p className="text-sm text-gray-600">Gestor Responsável</p>
                <p className="text-sm text-gray-600">Data: ___/___/______</p>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t">
            <p>Documento gerado pelo Sistema PreparaGov em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            <p className="font-semibold">{dfdNumber}</p>
            <p className="text-xs mt-2">Este documento contém: Descrição Sucinta, Tipo de DFD, Lista Completa de Itens, Justificativa Global, Dados do Responsável e Data de Criação</p>
          </div>
        </div>

        {/* Botões fixos */}
        <div className="flex justify-end space-x-2 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={handleGeneratePDF} className="bg-orange-500 hover:bg-orange-600">
            <FileText size={16} className="mr-2" />
            Gerar PDF Final
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DFDPreview;
