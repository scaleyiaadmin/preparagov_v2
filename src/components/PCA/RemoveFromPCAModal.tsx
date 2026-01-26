
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RemoveFromPCAModalProps {
  open: boolean;
  onClose: () => void;
  dfd: any;
  onConfirm: (dfd: any, justification: string) => void;
}

const RemoveFromPCAModal = ({
  open,
  onClose,
  dfd,
  onConfirm
}: RemoveFromPCAModalProps) => {
  const [justification, setJustification] = useState('');
  const { toast } = useToast();

  const handleConfirm = () => {
    if (!justification.trim()) {
      toast({
        title: "Erro",
        description: "A justificativa é obrigatória para retirar um DFD do PCA.",
        variant: "destructive",
      });
      return;
    }

    onConfirm(dfd, justification);
    setJustification('');
    onClose();
  };

  const handleClose = () => {
    setJustification('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle size={20} />
            <span>Confirmar Retirada do PCA</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {dfd && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{dfd.objeto}</h4>
              <p className="text-sm text-gray-600">{dfd.valorEstimado}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="justification">
              Justificativa da Retirada *
            </Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Digite o motivo da retirada do DFD do PCA..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Esta justificativa ficará registrada no histórico do DFD.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Confirmar Retirada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveFromPCAModal;
