import React from 'react';
import { X, Printer, Loader2, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MappedDFD } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

type DFDData = MappedDFD;

import { DFDItem } from './types';


interface DFDViewModalProps {
  open: boolean;
  onClose: () => void;
  dfd: DFDData | null;
}

const DFDViewModal = ({ open, onClose, dfd }: DFDViewModalProps) => {
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [prefeituraNome, setPrefeituraNome] = React.useState<string>('Prefeitura Municipal');
  const [loadingConfig, setLoadingConfig] = React.useState(false);

  React.useEffect(() => {
    const fetchPrefeituraData = async () => {
      if (!user?.prefeituraId) return;
      setLoadingConfig(true);
      try {
        const { data } = await supabase
          .from('prefeituras')
          .select('nome, logo_url')
          .eq('id', user.prefeituraId)
          .single();
        if (data) {
          setPrefeituraNome(data.nome || 'Prefeitura Municipal');
          setLogoUrl(data.logo_url);
        }
      } catch (error) {
        console.error('Erro ao buscar dados da prefeitura:', error);
      } finally {
        setLoadingConfig(false);
      }
    };
    if (open) fetchPrefeituraData();
  }, [open, user?.prefeituraId]);


  if (!dfd) return null;

  const getTotal = () => {
    if (!dfd.itens) return 0;
    return dfd.itens.reduce((total, item) => total + (item.quantidade * item.valorReferencia), 0);
  };

  const dfdNumber = dfd.numeroDFD || `DFD-${new Date().getFullYear()}-${String(dfd.id).substring(0, 4)}`;

  const getStatusColor = (status: string) => {
    if (status === 'Pendente') return 'background:#ffedd5;color:#9a3412';
    if (status === 'Em Elaboração') return 'background:#dbeafe;color:#1e40af';
    if (status === 'Aprovado') return 'background:#dcfce7;color:#166534';
    if (status === 'Retirado') return 'background:#f3f4f6;color:#374151;border:1px dashed #9ca3af';
    return 'background:#fee2e2;color:#991b1b';
  };

  const getPrioridadeColor = (p: string) => {
    if (p === 'Alto') return 'background:#fee2e2;color:#991b1b';
    if (p === 'Médio') return 'background:#fef9c3;color:#854d0e';
    return 'background:#dcfce7;color:#166534';
  };

  const handlePrint = () => {
    const total = dfd.itens?.reduce((acc: number, item: any) => acc + item.quantidade * item.valorReferencia, 0) || 0;

    const logoHtml = logoUrl
      ? `<img src="${logoUrl}" alt="Logo" style="max-height:70px;display:block;margin:0 auto 12px;" />`
      : '';

    const itensHtml = dfd.itens && dfd.itens.length > 0 ? `
      <div class="section">
        <h2>2. ITENS DA DEMANDA</h2>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Código</th><th>Descrição</th><th>Unidade</th>
              <th class="text-right">Qtd.</th><th class="text-right">Valor Unit.</th>
              <th class="text-right">Valor Total</th><th>Fonte</th>
            </tr>
          </thead>
          <tbody>
            ${dfd.itens.map((item: any, i: number) => `
              <tr>
                <td class="text-center">${i + 1}</td>
                <td style="font-family:monospace;font-size:9pt">${item.codigo || ''}</td>
                <td>${item.descricao || ''}</td>
                <td>${item.unidade || ''}</td>
                <td class="text-right">${item.quantidade}</td>
                <td class="text-right">R$ ${item.valorReferencia.toFixed(2)}</td>
                <td class="text-right"><strong>R$ ${(item.quantidade * item.valorReferencia).toFixed(2)}</strong></td>
                <td>${item.tabelaReferencia || ''}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="6" class="text-right">TOTAL ESTIMADO:</td>
              <td class="text-right">R$ ${total.toFixed(2)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>` : '';

    const camposExtrasHtml = dfd.camposExtras
      ? Object.entries(dfd.camposExtras)
          .filter(([_, v]) => v && (v as string).trim() !== '')
          .map(([label, value]) => `<p><strong>${label}:</strong> ${value}</p>`)
          .join('')
      : '';

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>DFD - ${dfdNumber}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 20mm 20mm 20mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #111; margin: 0; padding: 0; background: white; }
    h1 { font-size: 16pt; text-align: center; margin: 0 0 4px; }
    h2 { font-size: 13pt; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; margin: 20px 0 10px; color: #111; }
    h3 { font-size: 11pt; margin: 12px 0 4px; color: #111; }
    p { margin: 2px 0 8px; line-height: 1.5; }
    .center { text-align: center; }
    .orange { color: #ea580c; font-weight: 600; }
    .gray { color: #555; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9pt; font-weight: 600; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 8px; }
    th, td { border: 1px solid #9ca3af; padding: 5px 8px; }
    th { background: #f3f4f6; font-weight: 600; text-align: left; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .total-row { background: #f3f4f6; font-weight: 700; }
    .section { margin-top: 16px; }
    .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 12px; margin-bottom: 8px; }
    .signature-row { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 50px; }
    .signature-line { border-top: 1px solid #374151; padding-top: 6px; text-align: center; }
    .footer { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 8px; text-align: center; font-size: 8pt; color: #6b7280; }
    strong { font-weight: 600; }
  </style>
</head>
<body>
  <div class="center" style="border-bottom:2px solid #e5e7eb;padding-bottom:16px;margin-bottom:16px;">
    ${logoHtml}
    <h1>DOCUMENTO DE FORMALIZAÇÃO DA DEMANDA - DFD</h1>
    <p class="orange">${dfdNumber}</p>
    <p class="gray">Sistema PreparaGov - ${prefeituraNome}</p>
  </div>

  <div class="section">
    <h2>1. IDENTIFICAÇÃO DA DEMANDA</h2>
    <p><strong>Descrição Sucinta do Objeto:</strong> ${dfd.descricaoSucinta || 'Não informada'}</p>
    <div class="grid2">
      <p><strong>Tipo de DFD:</strong> <span class="badge" style="background:#ffedd5;color:#9a3412">${dfd.tipoDFD || ''}</span></p>
      <p><strong>Data Prevista:</strong> ${dfd.dataPrevista ? new Date(dfd.dataPrevista).toLocaleDateString('pt-BR') : 'Não informada'}</p>
      <p><strong>Status:</strong> <span class="badge" style="${getStatusColor(dfd.status)}">${dfd.status || ''}</span></p>
      ${dfd.prioridade ? `<p><strong>Prioridade:</strong> <span class="badge" style="${getPrioridadeColor(dfd.prioridade)}">${dfd.prioridade}</span></p>` : ''}
    </div>
    ${dfd.descricaoDemanda ? `<h3>Descrição da Demanda:</h3><p>${dfd.descricaoDemanda}</p>` : ''}
    ${dfd.justificativa ? `<h3>Justificativa da Contratação:</h3><p>${dfd.justificativa}</p>` : ''}
    ${camposExtrasHtml}
    ${dfd.justificativaPrioridade ? `<h3>Justificativa da Prioridade:</h3><p>${dfd.justificativaPrioridade}</p>` : ''}
    ${dfd.justificativaQuantidade ? `<h3>Justificativa da Quantidade Estimada:</h3><p>${dfd.justificativaQuantidade}</p>` : ''}
  </div>

  ${itensHtml}

  <div class="section">
    <h2>3. DADOS DO RESPONSÁVEL</h2>
    <div class="grid2">
      <div class="info-box">
        <h3>Solicitante</h3>
        <p><strong>Nome:</strong> ${dfd.requisitante?.nome || 'Não informado'}</p>
        <p><strong>Cargo:</strong> ${dfd.requisitante?.cargo || 'Não informado'}</p>
        <p><strong>Secretaria:</strong> ${dfd.requisitante?.secretaria || 'Não informada'}</p>
        <p><strong>Email:</strong> ${dfd.requisitante?.email || 'Não informado'}</p>
      </div>
      <div class="info-box">
        <h3>Dados da Criação</h3>
        <p><strong>Data de Criação:</strong> ${dfd.data || new Date().toLocaleDateString('pt-BR')}</p>
        <p><strong>Sistema:</strong> PreparaGov</p>
        <p><strong>Número do DFD:</strong> ${dfdNumber}</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>4. APROVAÇÕES</h2>
    <div class="signature-row">
      <div class="signature-line">
        <p><strong>${dfd.requisitante?.nome || 'Solicitante'}</strong></p>
        <p>Solicitante &nbsp;&nbsp; Data: ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>
      <div class="signature-line">
        <p><strong>Gestor Responsável</strong></p>
        <p>Aprovação &nbsp;&nbsp; Data: ___/___/______</p>
      </div>
    </div>
  </div>

  <div class="footer">
    Documento gerado pelo Sistema PreparaGov em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} — ${dfdNumber}
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
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 p-1">
          <div className="text-center border-b pb-6">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-20 mx-auto mb-4 object-contain" />
            ) : (
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-50 rounded-full border border-gray-100">
                  <Building2 size={32} className="text-gray-300" />
                </div>
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              DOCUMENTO DE FORMALIZAÇÃO DA DEMANDA - DFD
            </h1>
            <p className="text-lg font-semibold text-orange-600 mt-2">{dfdNumber}</p>
            <p className="text-gray-600 mt-1">Sistema PreparaGov - {prefeituraNome}</p>
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

            {/* Campos Extras da Prefeitura */}
            {dfd.camposExtras && Object.entries(dfd.camposExtras).length > 0 && (
              <div className="space-y-3">
                {Object.entries(dfd.camposExtras)
                  .filter(([_, value]) => value && (value as string).trim() !== '')
                  .map(([label, value]) => (
                    <div key={label}>
                      <h3 className="font-semibold text-gray-900 mb-1">{label}:</h3>
                      <p className="text-gray-700 leading-relaxed">{value as string}</p>
                    </div>
                  ))}
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
              <p><strong>Data de Criação:</strong> {dfd.data}</p>
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
