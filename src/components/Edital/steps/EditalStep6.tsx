
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DbTermoReferencia } from '@/types/database';

interface EditalStep6Props {
  data: any;
  onUpdate: (field: string, value: any) => void;
  selectedTR: DbTermoReferencia;
}

const EditalStep6 = ({ data, onUpdate, selectedTR }: EditalStep6Props) => {
  // Carregar itens do TR (armazenados no dados_json)
  const itemsFromTR = (selectedTR.dados_json as any)?.items || [];

  const items = itemsFromTR.length > 0 ? itemsFromTR : [
    {
      id: 1,
      descricao: 'Item não encontrado ou TR vazio',
      unidade: 'N/A',
      quantidade: 0,
      valorUnitario: 0,
      valorTotal: 0
    }
  ];

  const valorTotalGeral = items.reduce((acc: number, item: any) => acc + (parseFloat(item.valorTotal) || 0), 0);

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
                {items.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{item.descricao || item.item}</TableCell>
                    <TableCell>{item.unidade}</TableCell>
                    <TableCell className="text-right">{(parseFloat(item.quantidade) || 0).toLocaleString()}</TableCell>
                    {data.exibirValorEstimado && (
                      <>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(item.valorUnitario) || 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(item.valorTotal) || 0)}
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
          <p>• Itens importados automaticamente do TR: {selectedTR.numero_tr}</p>
          <p>• Quantidades consolidadas do planejamento</p>
          <p>• Valores baseados na pesquisa de preços do TR</p>
          <p>• Total de {items.length} itens carregados</p>
        </div>
      </div>
    </div>
  );
};

export default EditalStep6;
