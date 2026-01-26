
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
  DollarSign,
  User
} from 'lucide-react';

interface ETP {
  id: string;
  titulo: string;
  numeroETP: string;
  secretaria: string;
  dataCriacao: string;
  valorTotal: string;
  descricaoDemanda: string;
  status: string;
}

interface DFD {
  id: string;
  numero: string;
  nome: string;
  secretaria: string;
  responsavel: string;
  valor: string;
}

interface Risco {
  id: number;
  categoria: string;
  descricao: string;
  causaProvavel?: string;
  consequencia?: string;
  probabilidade: string;
  impacto: string;
  nivel: string;
  mitigacao: string;
  planoContingencia?: string;
  responsavel?: string;
}

interface MapaRiscosPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  etp: ETP;
  riscos: Risco[];
  onExportPDF: () => void;
}

const MapaRiscosPreview = ({ isOpen, onClose, etp, riscos, onExportPDF }: MapaRiscosPreviewProps) => {
  // Mock DFDs relacionados ao ETP
  const dfdsRelacionados: DFD[] = [
    {
      id: '1',
      numero: 'DFD-2024-001',
      nome: 'Equipamentos de TI',
      secretaria: 'Secretaria de Tecnologia',
      responsavel: 'João Silva',
      valor: 'R$ 850.000,00'
    },
    {
      id: '2',
      numero: 'DFD-2024-015',
      nome: 'Software e Licenças',
      secretaria: 'Secretaria de Tecnologia',
      responsavel: 'Maria Santos',
      valor: 'R$ 1.200.000,00'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getNivelColor = (nivel: string) => {
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

  const getCategoriaColor = (categoria: string) => {
    const colors = {
      'Técnico': 'bg-blue-100 text-blue-800',
      'Orçamentário': 'bg-purple-100 text-purple-800',
      'Operacional': 'bg-orange-100 text-orange-800',
      'Legal': 'bg-gray-100 text-gray-800',
      'Ambiental': 'bg-green-100 text-green-800',
      'Cronograma': 'bg-pink-100 text-pink-800'
    };
    return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const resumo = {
    total: riscos.length,
    alto: riscos.filter(r => r.nivel === 'Alto').length,
    medio: riscos.filter(r => r.nivel === 'Médio').length,
    baixo: riscos.filter(r => r.nivel === 'Baixo').length,
    categorias: riscos.reduce((acc, risco) => {
      acc[risco.categoria] = (acc[risco.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
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

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]" id="mapa-riscos-content">
          {/* Cabeçalho do Documento */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              MAPA DE RISCOS
            </h1>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Prefeitura Municipal
            </h2>
            <div className="text-sm text-gray-600">
              <p>Documento gerado em: {formatDate(new Date().toISOString())}</p>
              <p>Responsável: Usuário Logado</p>
            </div>
          </div>

          {/* Informações do ETP */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Estudo Técnico Preliminar (ETP)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-blue-600" />
                    <span className="font-medium">Número:</span>
                    <span className="text-blue-600">{etp.numeroETP}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building size={16} className="text-gray-600" />
                    <span className="font-medium">Secretaria:</span>
                    <span>{etp.secretaria}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-gray-600" />
                    <span className="font-medium">Data de Criação:</span>
                    <span>{formatDate(etp.dataCriacao)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign size={16} className="text-green-600" />
                    <span className="font-medium">Valor Total:</span>
                    <span className="font-semibold text-green-600">{etp.valorTotal}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <span className="font-medium">Descrição da Demanda:</span>
                <p className="text-gray-600 mt-1">{etp.descricaoDemanda}</p>
              </div>
            </CardContent>
          </Card>

          {/* DFDs Relacionados */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Documentos de Formalização da Demanda (DFDs) Relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dfdsRelacionados.map((dfd) => (
                  <div key={dfd.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-600">{dfd.numero}</span>
                          <span>-</span>
                          <span className="font-medium">{dfd.nome}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>{dfd.secretaria}</span>
                          <span>•</span>
                          <span>Responsável: {dfd.responsavel}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">{dfd.valor}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Riscos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Matriz de Riscos Identificados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left font-semibold">Risco</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Categoria</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Causa</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Consequência</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Prob.</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Impacto</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Nível</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Mitigação</th>
                      <th className="border border-gray-300 p-3 text-left font-semibold">Responsável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riscos.map((risco) => (
                      <tr key={risco.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3">{risco.descricao}</td>
                        <td className="border border-gray-300 p-3">
                          <Badge className={getCategoriaColor(risco.categoria)} variant="secondary">
                            {risco.categoria}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 p-3">{risco.causaProvavel || '-'}</td>
                        <td className="border border-gray-300 p-3">{risco.consequencia || '-'}</td>
                        <td className="border border-gray-300 p-3">{risco.probabilidade}</td>
                        <td className="border border-gray-300 p-3">{risco.impacto}</td>
                        <td className="border border-gray-300 p-3">
                          <Badge className={getNivelColor(risco.nivel)} variant="secondary">
                            {risco.nivel}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 p-3">{risco.mitigacao}</td>
                        <td className="border border-gray-300 p-3">{risco.responsavel || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Resumo Executivo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo Executivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Distribuição por Nível de Risco</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Total de Riscos:</span>
                      <span className="font-semibold">{resumo.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-red-600">Risco Alto:</span>
                      <span className="font-semibold text-red-600">{resumo.alto}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-600">Risco Médio:</span>
                      <span className="font-semibold text-yellow-600">{resumo.medio}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-600">Risco Baixo:</span>
                      <span className="font-semibold text-green-600">{resumo.baixo}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Distribuição por Categoria</h4>
                  <div className="space-y-2">
                    {Object.entries(resumo.categorias).map(([categoria, quantidade]) => (
                      <div key={categoria} className="flex items-center justify-between">
                        <span>{categoria}:</span>
                        <span className="font-semibold">{quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-semibold mb-2">Observações Gerais</h4>
                <p className="text-gray-600 text-sm">
                  Este mapa de riscos foi elaborado com base no ETP {etp.numeroETP} e nos DFDs relacionados. 
                  É recomendado o monitoramento contínuo dos riscos identificados e a atualização periódica 
                  desta matriz conforme o andamento do projeto.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MapaRiscosPreview;
