import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Printer, Building2, Package, CheckCircle, FileText, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface TRPreviewProps {
  formData: any;
  onGeneratePDF: () => void;
  onClose: () => void;
  user?: any;
}

const TRPreview = ({ formData, onGeneratePDF, onClose, user }: TRPreviewProps) => {
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

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getNaturezaLabel = (nat: string) => {
    switch (nat) {
      case 'materiais-consumo': return 'Materiais de Consumo';
      case 'materiais-permanentes': return 'Materiais Permanentes';
      case 'servico-continuado': return 'Serviço Continuado';
      case 'servico-nao-continuado': return 'Serviço Não Continuado';
      case 'servico-engenharia': return 'Serviço de Engenharia';
      case 'termo-aditivo': return 'Termo Aditivo';
      default: return nat || 'Não especificada';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10" id="tr-preview">
      {/* Botões Superiores Visuais (não aparecem na impressão/PDF) */}
      <div className="flex justify-between items-center print:hidden" data-html2canvas-ignore="true">
        <Button variant="ghost" onClick={onClose}>Voltar para a lista</Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button onClick={onGeneratePDF} className="bg-orange-600 hover:bg-orange-700">
            <Download className="mr-2 h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

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
              TERMO DE REFERÊNCIA (TR)
            </div>
            <div className="text-lg font-semibold text-orange-600">
              {prefeituraNome}
            </div>
            <div className="text-lg text-gray-700">
              Nº {formData.numero || 'S/N'}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {/* 1. Objeto e Natureza */}
        <Card>
          <CardHeader className="bg-gray-50 border-b pb-4">
            <CardTitle className="text-lg flex items-center">
              <Package className="mr-2 h-5 w-5 text-gray-500" /> 1. Objeto da Contratação
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Descrição do Objeto</h4>
              <p className="text-gray-900 whitespace-pre-wrap">{formData.objeto || 'Não informado.'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Natureza do Objeto</h4>
              <Badge variant="outline" className="text-sm">
                {formData.naturezaObjeto === 'outro' ? formData.naturezaOutra : getNaturezaLabel(formData.naturezaObjeto)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 2. Modalidade e Registro */}
        <Card>
          <CardHeader className="bg-gray-50 border-b pb-4">
            <CardTitle className="text-lg flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-gray-500" /> 2. Modalidade e Sistema de Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700">Modalidade:</h4>
                <p className="capitalize text-gray-900">{formData.modalidade || 'Não informada'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700">Artigo Legal (Lei 14.133/2021):</h4>
                <p className="text-gray-900">{formData.artigoLegal || 'N/A'}</p>
              </div>
            </div>
            
            {formData.justificativaLegal && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Justificativa Legal:</h4>
                <p className="text-gray-900 whitespace-pre-wrap">{formData.justificativaLegal}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-700 mb-2">Sistema de Registro de Preços (SRP)?</h4>
              <Badge className={formData.sistemaRegistroPrecos ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {formData.sistemaRegistroPrecos ? 'Sim, adotado' : 'Não'}
              </Badge>
              {formData.sistemaRegistroPrecos && (
                <div className="mt-3 text-gray-900">
                  <p><strong>Justificativa Principal:</strong> <span className="capitalize">{formData.justificativaRegistroPrecos?.replace(/-/g, ' ')}</span></p>
                  {formData.justificativaComplementar && (
                    <p className="mt-2 text-sm whitespace-pre-wrap">{formData.justificativaComplementar}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. Condições e Documentação */}
        <Card>
          <CardHeader className="bg-gray-50 border-b pb-4">
            <CardTitle className="text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5 text-gray-500" /> 3. Condições Formais de Participação
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Tratamento Diferenciado (ME/EPP):</h4>
              <p className="text-gray-900 capitalize">{formData.tratamentoMEEPP?.replace(/-/g, ' ') || 'Não informado'}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Participação em Consórcio:</h4>
                <p className="text-gray-900">{formData.participacaoConsorcio ? 'Permitida' : 'Vedada'}</p>
                {!formData.participacaoConsorcio && formData.justificativaConsorcio && (
                  <p className="text-sm text-gray-600 mt-1">({formData.justificativaConsorcio})</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Subcontratação:</h4>
                <p className="text-gray-900">{formData.subcontratacao ? 'Permitida' : 'Vedada'}</p>
                {formData.subcontratacao && formData.detalhesSubcontratacao && (
                  <p className="text-sm text-gray-600 mt-1">({formData.detalhesSubcontratacao})</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Execução e Pagamento */}
        <Card>
          <CardHeader className="bg-gray-50 border-b pb-4">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-gray-500" /> 4. Condições de Execução e Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Prazo de Entrega</p>
                  <p className="font-semibold text-gray-900">{formData.prazoEntrega || '-'} dias</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Vigência Inicial</p>
                  <p className="font-semibold text-gray-900">{formData.prazoVigencia || '-'} meses</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Recebimento e Aceite</p>
                  <p className="font-semibold text-gray-900">{formData.prazoRecebimento || '-'} dias</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Pagamento (após liq.)</p>
                  <p className="font-semibold text-gray-900">{formData.prazoPagamento || '-'} dias</p>
                </div>
             </div>

             {formData.enderecoEntrega && (
                <div className="pt-2">
                  <h4 className="font-semibold text-gray-700">Local de Entrega/Execução:</h4>
                  <p className="text-gray-900 whitespace-pre-wrap">{formData.enderecoEntrega}</p>
                </div>
             )}
          </CardContent>
        </Card>

        {/* 5. Fiscais do Contrato */}
        <Card>
           <CardHeader className="bg-gray-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center">
                 <CheckCircle className="mr-2 h-5 w-5 text-gray-500" /> 5. Gestão e Fiscalização
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6">
              <h4 className="font-semibold text-gray-700 mb-3 border-b pb-1">Gestores do Contrato</h4>
              {formData.gestores?.map((gst: any, i: number) => (
                <div key={i} className="mb-2 text-gray-900">
                  - <strong>{gst.nome || 'Não definido'}</strong> ({gst.cargo || 'Cargo não definido'}) - Matrícula: {gst.matricula || '-'}
                </div>
              ))}
              
              <h4 className="font-semibold text-gray-700 mt-6 mb-3 border-b pb-1">Fiscais do Contrato</h4>
              {formData.fiscais?.map((fisc: any, i: number) => (
                <div key={i} className="mb-2 text-gray-900">
                  - <strong>{fisc.nome || 'Não definido'}</strong> ({fisc.cargo || 'Cargo não definido'}) - Matrícula: {fisc.matricula || '-'}
                </div>
              ))}
           </CardContent>
        </Card>
      </div>

      <div className="text-center mt-12 pt-8 border-t text-sm text-gray-500">
        <p>Documento gerado automaticamente pelo sistema prefeitura digital.</p>
        <p>Aprovação sujeita a assinaturas e averiguação das secretarias correspondentes.</p>
        <p>Data: {getCurrentDate()}</p>
      </div>
    </div>
  );
};

export default TRPreview;
