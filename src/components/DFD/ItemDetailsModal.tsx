
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

import { DFDItem } from './types';

export interface ItemDetailsModalProps {
  open: boolean;
  onClose: () => void;
  item: {
    codigo: string;
    descricao: string;
    unidade: string;
    valor: number;
    tabelaReferencia: string;
  } | null;
  onAddItem: (item: DFDItem) => void;
}

const ItemDetailsModal = ({ open, onClose, item, onAddItem }: ItemDetailsModalProps) => {
  const [quantidade, setQuantidade] = useState('');

  if (!item) return null;

  const handleAddItem = () => {
    if (!quantidade || parseInt(quantidade) <= 0) {
      return;
    }

    const newItem: DFDItem = {
      id: Date.now().toString(),
      codigo: item.codigo,
      descricao: item.descricao,
      unidade: item.unidade,
      quantidade: parseInt(quantidade),
      valorReferencia: item.valor,
      tabelaReferencia: item.tabelaReferencia
    };

    onAddItem(newItem);
    setQuantidade('');
  };

  const getTotalValue = () => {
    if (!quantidade) return 0;
    return parseInt(quantidade) * item.valor;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Item</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do item */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Código</Label>
                <p className="font-mono text-lg font-semibold">{item.codigo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Fonte</Label>
                <Badge className="bg-blue-100 text-blue-800 mt-1">
                  {item.tabelaReferencia}
                </Badge>
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-600">Descrição Completa</Label>
              <p className="text-gray-900 mt-1 leading-relaxed">{item.descricao}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Unidade de Medida</Label>
                <p className="text-gray-900 font-medium">{item.unidade}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Valor de Referência</Label>
                <p className="text-green-600 font-bold text-lg">
                  R$ {item.valor.toFixed(2)} <span className="text-sm font-normal">/ {item.unidade}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Input de quantidade */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantidade" className="text-base font-medium">
                Quantidade Necessária *
              </Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                placeholder="Digite a quantidade desejada"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="mt-2"
              />
            </div>

            {quantidade && parseInt(quantidade) > 0 && (
              <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Cálculo do Valor Total</p>
                    <p className="text-green-800">
                      {quantidade} {item.unidade} × R$ {item.valor.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-700">Total Estimado</p>
                    <p className="text-2xl font-bold text-green-800">
                      R$ {getTotalValue().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X size={16} className="mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleAddItem}
            disabled={!quantidade || parseInt(quantidade) <= 0}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Plus size={16} className="mr-2" />
            Inserir Item no DFD
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsModal;
