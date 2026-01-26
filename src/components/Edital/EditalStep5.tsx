
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  Download, 
  Upload, 
  Printer,
  FileText,
  Calendar,
  Building,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { TermoReferencia } from '@/utils/termoReferenciaData';

interface EditalStep5Props {
  data: any;
  selectedTR: TermoReferencia;
  onClose: () => void;
}

const EditalStep5 = ({ data, selectedTR, onClose }: EditalStep5Props) => {
  const { toast } = useToast();

  const handleExport = (format: string) => {
    toast({
      title: `Exportação ${format.toUpperCase()}`,
      description: `Edital exportado em formato ${format.toUpperCase()} com sucesso.`,
    });
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Impressão Iniciada",
      description: "Preview do edital foi enviado para impressão.",
    });
  };

  const handlePublishPNCP = () => {
    toast({
      title: "Publicação no PNCP",
      description: "Edital foi enviado para publicação no Portal Nacional de Contratações Públicas.",
    });
  };

  const modalidadeLabel = {
    'pregao-eletronico': 'Pregão Eletrônico',
    'concorrencia': 'Concorrência',
    'tomada-precos': 'Tomada de Preços',
    'convite': 'Convite',
    'leilao': 'Leilão'
  }[data.modalidadeLicitacao] || data.modalidadeLicitacao;

  const tipoLabel = {
    'menor-preco': 'Menor Preço',
    'melhor-tecnica': 'Melhor Técnica',
    'tecnica-preco': 'Técnica e Preço',
    'maior-lance': 'Maior Lance'
  }[data.tipoLicitacao] || data.tipoLicitacao;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Eye className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Finalização e Publicação</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ações de Exportação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handlePrint}
                variant="outline" 
                className="w-full justify-start"
              >
                <Printer className="h-4 w-4 mr-2" />
                Visualizar/Imprimir
              </Button>
              
              <Button 
                onClick={() => handleExport('pdf')}
                variant="outline" 
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              
              <Button 
                onClick={() => handleExport('excel')}
                variant="outline" 
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-base text-green-900">Publicação</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handlePublishPNCP}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Publicar no PNCP
              </Button>
              <p className="text-xs text-green-700 mt-2">
                Publicação direta no Portal Nacional de Contratações Públicas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Columns - Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview do Edital</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto text-sm print:max-h-none print:overflow-visible">
                <div className="text-center mb-6">
                  <h2 className="text-lg font-bold">EDITAL DE LICITAÇÃO</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {modalidadeLabel} nº {data.numeroEdital}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">1. IDENTIFICAÇÃO</h3>
                    <div className="pl-4 space-y-1 text-sm">
                      <p><strong>Modalidade:</strong> {modalidadeLabel}</p>
                      <p><strong>Tipo:</strong> {tipoLabel}</p>
                      <p><strong>Regime:</strong> {data.regimeExecucao}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">2. OBJETO</h3>
                    <p className="pl-4 text-sm">{data.objetoLicitacao}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">3. PRAZOS</h3>
                    <div className="pl-4 space-y-1 text-sm">
                      {data.dataPublicacao && (
                        <p><strong>Data de Publicação:</strong> {new Date(data.dataPublicacao).toLocaleDateString('pt-BR')}</p>
                      )}
                      {data.dataAbertura && (
                        <p><strong>Data de Abertura:</strong> {new Date(data.dataAbertura).toLocaleDateString('pt-BR')}</p>
                      )}
                      <p><strong>Prazo de Vigência:</strong> {data.prazoVigencia} meses</p>
                    </div>
                  </div>

                  {data.condicoesParticipacao && (
                    <div>
                      <h3 className="font-semibold mb-2">4. CONDIÇÕES DE PARTICIPAÇÃO</h3>
                      <div className="pl-4 text-sm whitespace-pre-line">
                        {data.condicoesParticipacao.substring(0, 300)}
                        {data.condicoesParticipacao.length > 300 && '...'}
                      </div>
                    </div>
                  )}

                  {data.criteriosJulgamento && (
                    <div>
                      <h3 className="font-semibold mb-2">5. CRITÉRIOS DE JULGAMENTO</h3>
                      <div className="pl-4 text-sm whitespace-pre-line">
                        {data.criteriosJulgamento.substring(0, 300)}
                        {data.criteriosJulgamento.length > 300 && '...'}
                      </div>
                    </div>
                  )}

                  {data.anexosAdicionais && data.anexosAdicionais.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">6. ANEXOS</h3>
                      <div className="pl-4">
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Termo de Referência {selectedTR.numero}</li>
                          <li>ETP {selectedTR.etpNumero}</li>
                          <li>Mapa de Riscos</li>
                          {data.anexosAdicionais.map((anexo: string, index: number) => (
                            <li key={index}>{anexo}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-600 text-center">
                      Este é um preview resumido. O documento completo será gerado na exportação.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">TR Vinculado</p>
                <p className="text-xs text-blue-600">{selectedTR.numero}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Modalidade</p>
                <p className="text-xs text-green-600">{modalidadeLabel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">Secretaria</p>
                <p className="text-xs text-purple-600">{selectedTR.secretaria}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h4 className="font-medium text-green-900">Edital Pronto para Publicação</h4>
        </div>
        <p className="text-sm text-green-800">
          Todos os campos obrigatórios foram preenchidos. O edital está pronto para ser 
          exportado ou publicado diretamente no PNCP. Após a publicação, não será possível 
          fazer alterações sem justificativa.
        </p>
      </div>
    </div>
  );
};

export default EditalStep5;
