
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, X } from 'lucide-react';

import { DFDItem } from './types';

interface ItemEditModalProps {
  open: boolean;
  onClose: () => void;
  item: DFDItem | null;
  onSave: (updatedItem: DFDItem) => void;
}

const ItemEditModal = ({ open, onClose, item, onSave }: ItemEditModalProps) => {
  const [quantidade, setQuantidade] = useState(item?.quantidade || 0);

  React.useEffect(() => {
    if (item) {
      setQuantidade(item.quantidade);
    }
  }, [item]);

  const handleSave = () => {
    if (item && quantidade > 0) {
      onSave({
        ...item,
        quantidade
      });
      onClose();
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Item do DFD</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Código</Label>
            <div className="mt-1">
              <Badge variant="outline">{item.codigo}</Badge>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Descrição</Label>
            <p className="mt-1 text-sm text-gray-900">{item.descricao}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Unidade</Label>
              <p className="mt-1 text-sm text-gray-900">{item.unidade}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Fonte</Label>
              <div className="mt-1">
                <Badge className="bg-blue-100 text-blue-800">{item.tabelaReferencia}</Badge>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Valor Unitário</Label>
            <p className="mt-1 text-sm font-semibold text-green-600">
              R$ {item.valorReferencia.toFixed(2)}
            </p>
          </div>

          <div>
            <Label htmlFor="quantidade">Quantidade *</Label>
            <Input
              id="quantidade"
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valor Total:</span>
              <span className="font-semibold text-gray-900">
                R$ {(quantidade * item.valorReferencia).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            <X size={16} className="mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={quantidade <= 0}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Save size={16} className="mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemEditModal;
