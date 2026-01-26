
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TermoReferencia } from '@/utils/termoReferenciaData';

interface EditalStep6Props {
  data: any;
  onUpdate: (field: string, value: any) => void;
  selectedTR: TermoReferencia;
}

const EditalStep6 = ({ data, onUpdate, selectedTR }: EditalStep6Props) => {
  // Mock data dos itens baseados no TR/DFD
  const mockItens = [
    {
      id: 1,
      item: 'Papel A4 75g',
      unidade: 'Resma',
      quantidade: 500,
      valorUnitario: 12.50,
      valorTotal: 6250.00
    },
    {
      id: 2,
      item: 'Caneta Esferográfica Azul',
      unidade: 'Unidade',
      quantidade: 1000,
      valorUnitario: 1.20,
      valorTotal: 1200.00
    },
    {
      id: 3,
      item: 'Lápis HB nº 2',
      unidade: 'Unidade',
      quantidade: 800,
      valorUnitario: 0.85,
      valorTotal: 680.00
    }
  ];

  const valorTotalGeral = mockItens.reduce((acc, item) => acc + item.valorTotal, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <span className="text-blue-600 font-bold">6</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Itens da Licitação</h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-800 flex items-center justify-between">
            Configurações de Exibição
            <Badge variant="outline" className="bg-blue-50">
              Baseado no TR/DFD/PCA
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="exibirValorEstimado"
              checked={data.exibirValorEstimado}
              onCheckedChange={(checked) => onUpdate('exibirValorEstimado', checked)}
            />
            <Label htmlFor="exibirValorEstimado">Exibir Valor Estimado no Edital</Label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {data.exibirValorEstimado 
              ? 'Os valores estimados serão visíveis aos licitantes'
              : 'Os valores serão mantidos em sigilo (envelope lacrado)'
            }
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-gray-800">Lista de Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  {data.exibirValorEstimado && (
                    <>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockItens.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.item}</TableCell>
                    <TableCell>{item.unidade}</TableCell>
                    <TableCell className="text-right">{item.quantidade.toLocaleString()}</TableCell>
                    {data.exibirValorEstimado && (
                      <>
                        <TableCell className="text-right">
                          R$ {item.valorUnitario.toFixed(2).replace('.', ',')}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {item.valorTotal.toFixed(2).replace('.', ',')}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data.exibirValorEstimado && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Valor Total Estimado:</span>
                <span className="font-bold text-lg text-green-600">
                  R$ {valorTotalGeral.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Valores baseados na mediana dos preços de referência
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📋 Origem dos Itens</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Itens importados automaticamente do TR: {selectedTR.numero}</p>
          <p>• Quantidades consolidadas do PCA</p>
          <p>• Valores baseados na pesquisa de preços do DFD</p>
          <p>• Total de {mockItens.length} itens carregados</p>
        </div>
      </div>
    </div>
  );
};

export default EditalStep6;
