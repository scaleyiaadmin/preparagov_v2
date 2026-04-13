
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
      case 'Alta': return 'background:#fee2e2;color:#991b1b';
      case 'Média': return 'background:#fef9c3;color:#854d0e';
      case 'Baixa': return 'background:#dcfce7;color:#166534';
      default: return 'background:#f3f4f6;color:#374151';
    }
  };

  const getCurrentDate = () =>
    new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const etpId = React.useRef(
    `ETP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
  ).current;

  // ─── Impressão via popup ────────────────────────────────────────────────────
  const handlePrint = () => {
    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="Logo" style="max-height:70px;display:block;margin:0 auto 12px;" />`
      : '';

    const secao = (num: string, titulo: string, conteudo: string) => `
      <div class="section">
        <h2>${num}. ${titulo}</h2>
        <div class="content-box"><p>${conteudo || '<em>Não informado</em>'}</p></div>
      </div>`;

    const camposExtrasHtml = formData.camposExtras
      ? Object.entries(formData.camposExtras)
          .filter(([_, v]) => v && v.trim() !== '')
          .map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`)
          .join('')
      : '';

    const dfdsHtml = formData.selectedDFDs.length > 0 ? `
      <div class="section">
        <h2>Anexo I — DFDs Vinculados</h2>
        <p style="color:#555;font-size:9pt;margin-bottom:8px;">
          Detalhamento dos Documentos de Formalização de Demanda vinculados a este ETP
        </p>
        <table>
          <thead>
            <tr>
              <th>Secretaria</th><th>Item</th><th>Tipo</th>
              <th class="text-right">Valor Estimado</th><th>Prioridade</th>
            </tr>
          </thead>
          <tbody>
            ${formData.selectedDFDs.map(d => `
              <tr>
                <td>${d.secretaria || 'Não informado'}</td>
                <td>${d.objeto || ''}</td>
                <td><span class="badge" style="background:#ffedd5;color:#9a3412">${d.tipoDFD || ''}</span></td>
                <td class="text-right"><strong>${d.valorEstimado || ''}</strong></td>
                <td><span class="badge" style="${getPriorityColor(d.prioridade)}">${d.prioridade || ''}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '';

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>ETP - ${etpId}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 20mm 20mm 20mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #111; margin: 0; padding: 0; background: white; }
    h1 { font-size: 16pt; text-align: center; margin: 0 0 4px; font-weight: 700; }
    h2 { font-size: 12pt; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; margin: 20px 0 10px; color: #111; font-weight: 700; }
    h3 { font-size: 11pt; margin: 10px 0 4px; }
    p { margin: 2px 0 8px; line-height: 1.6; white-space: pre-wrap; }
    em { color: #9ca3af; font-style: italic; }
    .center { text-align: center; }
    .orange { color: #ea580c; font-weight: 600; }
    .gray { color: #555; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9pt; font-weight: 600; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 8px; }
    th, td { border: 1px solid #9ca3af; padding: 5px 8px; }
    th { background: #f3f4f6; font-weight: 600; text-align: left; }
    .text-right { text-align: right; }
    .section { margin-top: 16px; page-break-inside: avoid; }
    .content-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:4px; padding:12px; }
    .signature-row { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; }
    .signature-line { border-top: 1px solid #374151; padding-top: 6px; text-align: center; }
    .footer { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 8px; text-align: center; font-size: 8pt; color: #6b7280; }
    strong { font-weight: 600; }
  </style>
</head>
<body>

  <!-- Cabeçalho -->
  <div class="center" style="border-bottom:2px solid #e5e7eb;padding-bottom:16px;margin-bottom:16px;">
    ${logoHtml}
    <h1>ESTUDO TÉCNICO PRELIMINAR — ETP</h1>
    <p class="orange" style="margin:4px 0">${prefeituraNome}</p>
    <p style="margin:2px 0">${etpId}</p>
    <p class="gray" style="font-size:9pt;margin:0">Gerado em: ${getCurrentDate()}</p>
  </div>

  <!-- Informações Básicas -->
  <div class="section">
    <h2>Informações Básicas</h2>
    <div class="info-grid">
      <div><strong>Nome do ETP:</strong><br/>${formData.objeto || 'Não informado'}</div>
      <div><strong>Descrição Sucinta:</strong><br/>${formData.descricaoSucinta || 'Não informada'}</div>
      ${camposExtrasHtml}
    </div>
  </div>

  ${secao('1', 'Descrição da Demanda', formData.descricaoDemanda)}
  ${secao('2', 'Requisitos da Contratação', formData.requisitosContratacao)}
  ${secao('3', 'Alternativas Possíveis para Atender à Demanda',
    formData.alternativasExistem ? formData.alternativasDescricao : 'Não há alternativas identificadas')}
  ${secao('4', 'Descrição da Solução', formData.descricaoSolucao)}
  ${secao('5', 'Justificativa do Parcelamento (ou Não)', formData.justificativaParcelamento)}
  ${secao('6', 'Resultados Pretendidos', formData.resultadosPretendidos)}
  ${secao('7', 'Providências a Serem Tomadas Antes da Contratação',
    formData.providenciasExistem ? formData.providenciasDescricao : 'Não há providências prévias necessárias')}
  ${secao('8', 'Contratações Correlatas ou Interdependentes',
    formData.contratacoesCorrelatas ? formData.contratacoesDescricao : 'Não há contratações correlatas')}
  ${secao('9', 'Possíveis Impactos Ambientais',
    formData.impactosAmbientais ? formData.impactosDescricao : 'Não há impactos ambientais significativos')}
  ${secao('10', 'Observações Gerais', formData.observacoesGerais)}
  ${secao('11', 'Conclusão Técnica', formData.conclusaoTecnica)}

  ${dfdsHtml}

  <!-- Rodapé / Responsável -->
  <div class="section">
    <div class="signature-row">
      <div class="signature-line">
        <strong>${user?.nome || '[Nome do Responsável]'}</strong><br/>
        ${user?.cargo_funcional || user?.tipo_perfil || '[Cargo/Função]'}<br/>
        <span style="font-size:9pt;color:#555">Data: ${getCurrentDate()}</span>
      </div>
      <div class="signature-line">
        <strong>Aprovação</strong><br/>
        Gestor Responsável<br/>
        <span style="font-size:9pt;color:#555">Data: ___/___/______</span>
      </div>
    </div>
  </div>

  <div class="footer">
    Documento gerado automaticamente pelo Sistema PreparaGov em ${getCurrentDate()} — ${etpId}
  </div>

</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 600);
  };
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6" id="etp-print-content">
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

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">1. Descrição da Demanda</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{formData.descricaoDemanda}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">2. Requisitos da Contratação</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{formData.requisitosContratacao}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">3. Alternativas Possíveis para Atender à Demanda</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {formData.alternativasExistem ? formData.alternativasDescricao : 'Não há alternativas identificadas'}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">4. Descrição da Solução</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{formData.descricaoSolucao}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">5. Justificativa do Parcelamento (ou Não)</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{formData.justificativaParcelamento}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">6. Resultados Pretendidos</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{formData.resultadosPretendidos}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">7. Providências a Serem Tomadas Antes da Contratação</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {formData.providenciasExistem ? formData.providenciasDescricao : 'Não há providências prévias necessárias'}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">8. Contratações Correlatas ou Interdependentes</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {formData.contratacoesCorrelatas ? formData.contratacoesDescricao : 'Não há contratações correlatas'}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">9. Possíveis Impactos Ambientais</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {formData.impactosAmbientais ? formData.impactosDescricao : 'Não há impactos ambientais significativos'}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">10. Observações Gerais</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{formData.observacoesGerais}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">11. Conclusão Técnica</h3>
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
                    {dfd.valorEstimado}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-gray-100 text-gray-800">{dfd.prioridade}</Badge>
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
            <div className="text-sm text-gray-600">Responsável pela Elaboração:</div>
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
          onClick={handlePrint}
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
