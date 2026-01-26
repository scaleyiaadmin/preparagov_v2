
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { formatCurrency, formatDate, getAllSecretarias } from '@/utils/pcaConsolidation';

interface ConsolidatedItemByType {
  id: string;
  descricao: string;
  unidadeMedida: string;
  detalhamentoTecnico?: string;
  quantidadeTotal: number;
  valorTotal: number;
  dataContratacaoOficial: string;
  prioridadeOficial: 'Alta' | 'Média' | 'Baixa';
  tipoDFD: string;
  secretarias: Record<string, {
    quantidade: number;
    valor: number;
    prioridade: 'Alta' | 'Média' | 'Baixa';
    dataInformada: string;
    dfdId: string;
  }>;
}

interface PCAStructuredExportModalProps {
  open: boolean;
  onClose: () => void;
  itemsByType: Record<string, ConsolidatedItemByType[]>;
  selectedYear: string;
}

const PCAStructuredExportModal = ({ open, onClose, itemsByType, selectedYear }: PCAStructuredExportModalProps) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const allSecretarias = getAllSecretarias(itemsByType);

  const generateCSVData = () => {
    const headers = [
      'Tipo de DFD',
      'Item',
      'Quantidade Total',
      'Valor Total',
      'Data de Contratação',
      'Prioridade',
      ...allSecretarias.map(s => `${s} - Qtd`),
      ...allSecretarias.map(s => `${s} - Valor`)
    ];

    const rows: string[][] = [];
    
    Object.entries(itemsByType).forEach(([tipoDFD, items]) => {
      items.forEach(item => {
        const row = [
          tipoDFD,
          `${item.descricao} (${item.unidadeMedida})`,
          item.quantidadeTotal.toString(),
          formatCurrency(item.valorTotal),
          formatDate(item.dataContratacaoOficial),
          item.prioridadeOficial,
          ...allSecretarias.map(s => item.secretarias[s]?.quantidade?.toString() || '0'),
          ...allSecretarias.map(s => item.secretarias[s] ? formatCurrency(item.secretarias[s].valor) : 'R$ 0,00')
        ];
        rows.push(row);
      });
    });

    return [headers, ...rows];
  };

  const downloadCSV = () => {
    const csvData = generateCSVData();
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `PCA_${selectedYear}_Estruturado.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePrintView = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalItems = Object.values(itemsByType).reduce((sum, items) => sum + items.length, 0);
    const totalValue = Object.values(itemsByType).reduce((sum, items) => 
      sum + items.reduce((itemSum, item) => itemSum + item.valorTotal, 0), 0
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>PCA ${selectedYear} - Plano de Contratações Anual</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .summary {
              background-color: #f5f5f5;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 5px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              background-color: #e5e7eb;
              padding: 10px;
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 10px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 6px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .priority-alta { background-color: #fee2e2; }
            .priority-media { background-color: #fef3c7; }
            .priority-baixa { background-color: #dcfce7; }
            .secretaria-col { text-align: center; min-width: 80px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PCA - Plano de Contratações Anual ${selectedYear}</h1>
            <p>Documento Estruturado para Publicação no PNCP</p>
          </div>
          
          <div class="summary">
            <h3>Resumo Executivo</h3>
            <p><strong>Total de Itens Únicos:</strong> ${totalItems}</p>
            <p><strong>Valor Total do PCA:</strong> ${formatCurrency(totalValue)}</p>
            <p><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          ${Object.entries(itemsByType).map(([tipoDFD, items]) => `
            <div class="section">
              <div class="section-title">${tipoDFD} (${items.length} ${items.length === 1 ? 'item' : 'itens'})</div>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qtd. Total</th>
                    <th>Valor Total</th>
                    <th>Data Contratação</th>
                    <th>Prioridade</th>
                    ${allSecretarias.map(s => `<th class="secretaria-col">${s}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${items.map(item => `
                    <tr class="priority-${item.prioridadeOficial.toLowerCase()}">
                      <td>${item.descricao}<br><small>(${item.unidadeMedida})</small></td>
                      <td>${item.quantidadeTotal.toLocaleString('pt-BR')}</td>
                      <td>${formatCurrency(item.valorTotal)}</td>
                      <td>${formatDate(item.dataContratacaoOficial)}</td>
                      <td>${item.prioridadeOficial}</td>
                      ${allSecretarias.map(s => {
                        const sec = item.secretarias[s];
                        return `<td class="secretaria-col">${sec ? `Qtd: ${sec.quantidade}<br>${formatCurrency(sec.valor)}` : 'Qtd: 0<br>R$ 0,00'}</td>`;
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExport = () => {
    if (exportFormat === 'csv') {
      downloadCSV();
    } else {
      generatePrintView();
    }
    onClose();
  };

  const totalItems = Object.values(itemsByType).reduce((sum, items) => sum + items.length, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download size={20} />
            <span>Exportar PCA Estruturado</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Dados a Exportar</h4>
            <div className="text-sm text-gray-600">
              <p>• {totalItems} itens consolidados</p>
              <p>• {Object.keys(itemsByType).length} tipos de DFD</p>
              <p>• {allSecretarias.length} secretarias envolvidas</p>
              <p>• Estrutura completa por categoria</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Formato de Exportação</Label>
            <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center space-x-2">
                  <FileText size={16} />
                  <span>PDF Estruturado para PNCP</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center space-x-2">
                  <FileSpreadsheet size={16} />
                  <span>Planilha Excel (CSV)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleExport}>
            <Download size={16} className="mr-2" />
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PCAStructuredExportModal;
