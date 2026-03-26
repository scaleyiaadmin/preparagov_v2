
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Download, Printer, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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
  camposExtras?: Record<string, string>;
}

interface ETPPreviewProps {
  formData: ETPFormData;
  onGeneratePDF: () => void;
  user?: any;
}

const ETPPreview = ({ formData, onGeneratePDF, user }: ETPPreviewProps) => {
  const { user: currentUser } = useAuth();
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [prefeituraNome, setPrefeituraNome] = React.useState<string>('Prefeitura Municipal');

  React.useEffect(() => {
    const fetchPrefeituraData = async () => {
      const prefeituraId = currentUser?.prefeituraId;
      if (!prefeituraId) return;
      try {
        const { data } = await supabase
          .from('prefeituras')
          .select('nome, logo_url')
          .eq('id', prefeituraId)
          .single();
        if (data) {
          setPrefeituraNome(data.nome || 'Prefeitura Municipal');
          setLogoUrl(data.logo_url);
        }
      } catch (error) {
        console.error('Erro ao buscar dados da prefeitura:', error);
      }
    };
    fetchPrefeituraData();
  }, [currentUser?.prefeituraId]);


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 text-red-800';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800';
      case 'Baixa':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: string) => {
    return value; // Já vem formatado dos DFDs
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const generateETPId = () => {
    return `ETP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  };

  const etpId = generateETPId();

  return (
    <div className="space-y-6" id="etp-preview">
      {/* Header */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-20 mx-auto mb-4 object-contain" />
            ) : (
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-50 rounded-full border border-gray-100">
                  <Building2 size={32} className="text-gray-300" />
                </div>
              </div>
            )}
            <div className="text-2xl font-bold text-gray-900">
              ESTUDO TÉCNICO PRELIMINAR - ETP
            </div>
            <div className="text-lg font-semibold text-orange-600">
              {prefeituraNome}
            </div>
            <div className="text-lg text-gray-700">
              {etpId}
            </div>
            <div className="text-sm text-gray-600">
              Gerado em: {getCurrentDate()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seções do ETP */}
      <Card>
        <CardHeader>
          <CardTitle>Documento Técnico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* 0. Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              Informações Básicas
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-800">Nome do ETP:</span>
                <p className="text-gray-700">{formData.objeto}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Descrição Sucinta:</span>
                <p className="text-gray-700">{formData.descricaoSucinta || 'Não informada'}</p>
              </div>
              
              {formData.camposExtras && Object.entries(formData.camposExtras as Record<string, string>).map(
                ([key, value]) =>
                  value && value.trim() !== '' && (
                    <div key={key}>
                      <span className="font-semibold text-gray-800">{key}:</span>
                      <p className="text-gray-700">{value}</p>
                    </div>
                  )
              )}
            </div>
          </div>

          <Separator />

          {/* 1. Descrição da Demanda */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              1. Descrição da Demanda
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{formData.descricaoDemanda}</p>
            </div>
          </div>

          <Separator />

          {/* 2. Requisitos da Contratação */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              2. Requisitos da Contratação
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{formData.requisitosContratacao}</p>
            </div>
          </div>

          <Separator />

          {/* 3. Alternativas Possíveis */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              3. Alternativas Possíveis para Atender à Demanda
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {formData.alternativasExistem
                  ? formData.alternativasDescricao
                  : 'Não há alternativas identificadas'}
              </p>
            </div>
          </div>

          <Separator />

          {/* 4. Descrição da Solução */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              4. Descrição da Solução
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{formData.descricaoSolucao}</p>
            </div>
          </div>

          <Separator />

          {/* 5. Justificativa do Parcelamento */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              5. Justificativa do Parcelamento (ou Não)
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{formData.justificativaParcelamento}</p>
            </div>
          </div>

          <Separator />

          {/* 6. Resultados Pretendidos */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              6. Resultados Pretendidos
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{formData.resultadosPretendidos}</p>
            </div>
          </div>

          <Separator />

          {/* 7. Providências Prévias */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              7. Providências a Serem Tomadas Antes da Contratação
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {formData.providenciasExistem
                  ? formData.providenciasDescricao
                  : 'Não há providências prévias necessárias'}
              </p>
            </div>
          </div>

          <Separator />

          {/* 8. Contratações Correlatas */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              8. Contratações Correlatas ou Interdependentes
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {formData.contratacoesCorrelatas
                  ? formData.contratacoesDescricao
                  : 'Não há contratações correlatas'}
              </p>
            </div>
          </div>

          <Separator />

          {/* 9. Impactos Ambientais */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              9. Possíveis Impactos Ambientais
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {formData.impactosAmbientais
                  ? formData.impactosDescricao
                  : 'Não há impactos ambientais significativos'}
              </p>
            </div>
          </div>

          <Separator />

          {/* 10. Observações Gerais */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              10. Observações Gerais
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{formData.observacoesGerais}</p>
            </div>
          </div>

          <Separator />

          {/* 11. Conclusão Técnica */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              11. Conclusão Técnica
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{formData.conclusaoTecnica}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DFDs Vinculados - Anexo Técnico */}
      <Card>
        <CardHeader>
          <CardTitle>Anexo I - DFDs Vinculados</CardTitle>
          <p className="text-sm text-gray-600">
            Detalhamento dos Documentos de Formalização de Demanda vinculados a este ETP
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Secretaria</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor Estimado</TableHead>
                <TableHead>Prioridade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.selectedDFDs.map((dfd) => (
                <TableRow key={dfd.id}>
                  <TableCell className="font-medium">
                    {dfd.secretaria || 'Não informado'}
                  </TableCell>
                  <TableCell>{dfd.objeto}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{dfd.tipoDFD}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(dfd.valorEstimado)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(dfd.prioridade)}>
                      {dfd.prioridade}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rodapé */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-600">
              Responsável pela Elaboração:
            </div>
            <div className="font-medium text-gray-900">
              {user?.nome || '[Nome do Responsável]'}
            </div>
            <div className="text-sm text-gray-600">
              {user?.cargo_funcional || user?.tipo_perfil || '[Cargo/Função]'}
            </div>
            <div className="text-sm text-gray-500 mt-4">
              Documento gerado automaticamente pelo Sistema em {getCurrentDate()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-center space-x-4 print:hidden" data-html2canvas-ignore="true">
        <Button
          variant="outline"
          onClick={() => window.print()}
          size="lg"
        >
          <Printer size={20} className="mr-2" />
          Imprimir
        </Button>
        <Button
          onClick={onGeneratePDF}
          className="bg-orange-500 hover:bg-orange-600"
          size="lg"
        >
          <Download size={20} className="mr-2" />
          Gerar PDF
        </Button>
      </div>
    </div>
  );
};

export default ETPPreview;
