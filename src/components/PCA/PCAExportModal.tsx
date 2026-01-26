
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
import { formatCurrency, formatDate } from '@/utils/pcaConsolidation';

interface ConsolidatedItem {
  id: string;
  descricao: string;
  unidadeMedida: string;
  detalhamentoTecnico?: string;
  quantidadeTotal: number;
  valorTotal: number;
  dataContratacaoOficial: string;
  prioridadeOficial: 'Alta' | 'Média' | 'Baixa';
  secretarias: {
    nome: string;
    quantidade: number;
    valor: number;
    prioridade: 'Alta' | 'Média' | 'Baixa';
    dataInformada: string;
    dfdId: string;
  }[];
}

interface PCAExportModalProps {
  open: boolean;
  onClose: () => void;
  items: ConsolidatedItem[];
  selectedYear: string;
}

const PCAExportModal = ({ open, onClose, items, selectedYear }: PCAExportModalProps) => {
  const [exportFormat, setExportFormat] = useState('pdf');

  const generateCSVData = () => {
    const headers = [
      'Item',
      'Quantidade Total',
      'Valor Total',
      'Data de Contratação',
      'Secretarias Envolvidas',
      'Quantidade por Secretaria',
      'Valor por Secretaria',
      'Prioridade'
    ];

    const rows = items.map(item => {
      const secretariasNomes = item.secretarias.map(s => s.nome).join(', ');
      const quantidadesPorSecretaria = item.secretarias
        .map(s => `${s.nome}: ${s.quantidade}`)
        .join(', ');
      const valoresPorSecretaria = item.secretarias
        .map(s => `${s.nome}: ${formatCurrency(s.valor)}`)
        .join(', ');

      return [
        `${item.descricao} (${item.unidadeMedida})`,
        item.quantidadeTotal.toString(),
        formatCurrency(item.valorTotal),
        formatDate(item.dataContratacaoOficial),
        secretariasNomes,
        quantidadesPorSecretaria,
        valoresPorSecretaria,
        item.prioridadeOficial
      ];
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
    link.setAttribute('download', `PCA_${selectedYear}_Consolidado.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePrintView = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalValue = items.reduce((sum, item) => sum + item.valorTotal, 0);
    const totalItems = items.length;

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
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .priority-alta { background-color: #fee2e2; }
            .priority-media { background-color: #fef3c7; }
            .priority-baixa { background-color: #dcfce7; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PCA - Plano de Contratações Anual ${selectedYear}</h1>
            <p>Documento Consolidado para Publicação no PNCP</p>
          </div>
          
          <div class="summary">
            <h3>Resumo Executivo</h3>
            <p><strong>Total de Itens Únicos:</strong> ${totalItems}</p>
            <p><strong>Valor Total do PCA:</strong> ${formatCurrency(totalValue)}</p>
            <p><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qtd. Total</th>
                <th>Valor Total</th>
                <th>Data Contratação</th>
                <th>Secretarias</th>
                <th>Qtd. por Secretaria</th>
                <th>Valor por Secretaria</th>
                <th>Prioridade</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr class="priority-${item.prioridadeOficial.toLowerCase()}">
                  <td>${item.descricao}<br><small>(${item.unidadeMedida})</small></td>
                  <td>${item.quantidadeTotal.toLocaleString('pt-BR')}</td>
                  <td>${formatCurrency(item.valorTotal)}</td>
                  <td>${formatDate(item.dataContratacaoOficial)}</td>
                  <td>${item.secretarias.map(s => s.nome).join(', ')}</td>
                  <td>${item.secretarias.map(s => `${s.nome}: ${s.quantidade}`).join('<br>')}</td>
                  <td>${item.secretarias.map(s => `${s.nome}: ${formatCurrency(s.valor)}`).join('<br>')}</td>
                  <td>${item.prioridadeOficial}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download size={20} />
            <span>Exportar PCA Consolidado</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Dados a Exportar</h4>
            <div className="text-sm text-gray-600">
              <p>• {items.length} itens consolidados</p>
              <p>• Detalhamento por secretaria</p>
              <p>• Valores e quantidades totais</p>
              <p>• Datas e prioridades oficiais</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Formato de Exportação</Label>
            <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center space-x-2">
                  <FileText size={16} />
                  <span>PDF para Impressão/PNCP</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center space-x-2">
                  <FileSpreadsheet size={16} />
                  <span>Planilha CSV (Excel)</span>
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

export default PCAExportModal;
