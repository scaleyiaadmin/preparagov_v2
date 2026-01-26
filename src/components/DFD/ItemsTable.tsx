
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit } from 'lucide-react';

interface DFDItem {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorReferencia: number;
  tabelaReferencia: string;
}

interface ItemsTableProps {
  items: DFDItem[];
  onRemoveItem: (itemId: string) => void;
  onEditItem: (item: DFDItem) => void;
}

const ItemsTable = ({ items, onRemoveItem, onEditItem }: ItemsTableProps) => {
  const getTotal = () => {
    return items.reduce((total, item) => total + (item.quantidade * item.valorReferencia), 0);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum item adicionado ainda.</p>
        <p className="text-sm">Clique em "Adicionar Item" para incluir itens na demanda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Valor Unit.</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Tabela</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-sm">{item.codigo}</TableCell>
              <TableCell>{item.descricao}</TableCell>
              <TableCell>{item.unidade}</TableCell>
              <TableCell>{item.quantidade}</TableCell>
              <TableCell>R$ {item.valorReferencia.toFixed(2)}</TableCell>
              <TableCell className="font-semibold">
                R$ {(item.quantidade * item.valorReferencia).toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {item.tabelaReferencia}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    title="Editar"
                    onClick={() => onEditItem(item)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    title="Remover"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex justify-end">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-lg font-semibold">
            Total Estimado: R$ {getTotal().toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            {items.length} {items.length === 1 ? 'item' : 'itens'} adicionado{items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ItemsTable;
