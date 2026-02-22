import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Printer,
  Building,
  Calendar,
  DollarSign
} from 'lucide-react';
import { DbMapaRiscosItem } from '@/types/database';

interface ETP {
  id: string;
  titulo: string;
  numeroETP: string;
  secretaria: string;
  dataCriacao?: string;
  valorTotal?: string;
  descricaoDemanda?: string;
  status?: string;
}

interface MapaRiscosPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  etp: ETP;
  riscos: DbMapaRiscosItem[];
  onExportPDF: () => void;
}

const MapaRiscosPreview = ({ isOpen, onClose, etp, riscos, onExportPDF }: MapaRiscosPreviewProps) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getNivelColor = (nivel: string | null) => {
    switch (nivel) {
      case 'Alto':
        return 'bg-red-100 text-red-800';
      case 'Médio':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baixo':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoriaColor = (categoria: string | null) => {
    const colors: Record<string, string> = {
      'Técnico': 'bg-blue-100 text-blue-800',
      'Orçamentário': 'bg-purple-100 text-purple-800',
      'Operacional': 'bg-orange-100 text-orange-800',
      'Legal': 'bg-gray-100 text-gray-800',
      'Ambiental': 'bg-green-100 text-green-800',
      'Cronograma': 'bg-pink-100 text-pink-800'
    };
    return colors[categoria || ''] || 'bg-gray-100 text-gray-800';
  };

  const resumo = {
    total: riscos.length,
    alto: riscos.filter(r => r.nivel === 'Alto').length,
    medio: riscos.filter(r => r.nivel === 'Médio').length,
    baixo: riscos.filter(r => r.nivel === 'Baixo').length,
    categorias: riscos.reduce((acc, risco) => {
      if (risco.categoria) {
        acc[risco.categoria] = (acc[risco.categoria] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b no-print">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Mapa de Riscos - Preview</h2>
              <p className="text-gray-600">{etp.numeroETP} - {etp.titulo}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onExportPDF}>
                <Download size={16} className="mr-2" />
                Exportar PDF
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer size={16} className="mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] print:max-h-none print:p-0" id="mapa-riscos-content">
          {/* Cabeçalho do Documento */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              MAPA DE RISCOS
            </h1>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              PreparaGov - Gestão de Contratações
            </h2>
            <div className="text-xs text-gray-500">
              <p>Documento gerado em: {new Date().toLocaleString('pt-BR')}</p>
            </div>
          </div>

          {/* Informações do ETP */}
          <Card className="mb-6">
            <CardHeader className="py-3">
              <CardTitle className="text-md">Estudo Técnico Preliminar (ETP)</CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <FileText size={14} className="text-blue-600" />
                    <span className="font-medium">Número:</span>
                    <span className="text-blue-600">{etp.numeroETP}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Building size={14} className="text-gray-600" />
                    <span className="font-medium">Secretaria:</span>
                    <span>{etp.secretaria}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar size={14} className="text-gray-600" />
                    <span className="font-medium">Data Ref:</span>
                    <span>{formatDate(etp.dataCriacao)}</span>
                  </div>
                  {etp.valorTotal && (
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign size={14} className="text-green-600" />
                      <span className="font-medium">Valor Estimado:</span>
                      <span className="font-semibold text-green-600">{etp.valorTotal}</span>
                    </div>
                  )}
                </div>
              </div>
              {etp.descricaoDemanda && (
                <div className="mt-3 text-sm">
                  <span className="font-medium">Objeto:</span>
                  <p className="text-gray-600 mt-1">{etp.descricaoDemanda}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabela de Riscos */}
          <Card className="mb-6">
            <CardHeader className="py-3">
              <CardTitle className="text-md">Matriz de Riscos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-xs">
                      <th className="border p-2 text-left">Risco / Descrição</th>
                      <th className="border p-2 text-left">Categoria</th>
                      <th className="border p-2 text-left">Nível</th>
                      <th className="border p-2 text-left">Causa / Consequência</th>
                      <th className="border p-2 text-left">Medidas de Mitigação</th>
                      <th className="border p-2 text-left">Responsável</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {riscos.map((risco) => (
                      <tr key={risco.id} className="hover:bg-gray-50">
                        <td className="border p-2 align-top font-medium">{risco.descricao}</td>
                        <td className="border p-2 align-top">
                          <Badge className={getCategoriaColor(risco.categoria)} variant="outline">
                            {risco.categoria}
                          </Badge>
                        </td>
                        <td className="border p-2 align-top">
                          <Badge className={getNivelColor(risco.nivel)}>
                            {risco.nivel}
                          </Badge>
                        </td>
                        <td className="border p-2 align-top">
                          <div className="mb-1">
                            <span className="font-semibold block">Causa:</span>
                            {risco.causa_provavel || '-'}
                          </div>
                          <div>
                            <span className="font-semibold block">Consequência:</span>
                            {risco.consequencia || '-'}
                          </div>
                        </td>
                        <td className="border p-2 align-top">
                          <div className="mb-1">
                            <span className="font-semibold block">Mitigação:</span>
                            {risco.mitigacao}
                          </div>
                          {risco.plano_contingencia && (
                            <div>
                              <span className="font-semibold block">Contingência:</span>
                              {risco.plano_contingencia}
                            </div>
                          )}
                        </td>
                        <td className="border p-2 align-top">{risco.responsavel || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Resumo e Assinaturas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-bold text-sm mb-3">Resumo da Matriz</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Total Riscos:</span>
                  <span className="font-bold">{resumo.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Risco Alto:</span>
                  <span className="font-bold text-red-600">{resumo.alto}</span>
                </div>
                <div className="flex justify-between">
                  <span>Risco Médio:</span>
                  <span className="font-bold text-yellow-600">{resumo.medio}</span>
                </div>
                <div className="flex justify-between">
                  <span>Risco Baixo:</span>
                  <span className="font-bold text-green-600">{resumo.baixo}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end space-y-4 pt-12">
              <div className="border-t border-black w-64 mx-auto text-center pt-2">
                <p className="text-xs font-bold uppercase">Responsável Técnico</p>
                <p className="text-[10px] text-gray-500">Matrícula / Cargo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapaRiscosPreview;
