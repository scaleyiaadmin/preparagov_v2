
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface ActionConfirmModalProps {
  open: boolean;
  onClose: () => void;
  actionType: 'cancel' | 'delete' | 'remove-pca';
  dfd: any;
  justification: string;
  onJustificationChange: (value: string) => void;
  onConfirm: () => void;
}

const ActionConfirmModal = ({ 
  open, 
  onClose, 
  actionType, 
  dfd, 
  justification, 
  onJustificationChange, 
  onConfirm 
}: ActionConfirmModalProps) => {
  const getModalConfig = () => {
    switch (actionType) {
      case 'cancel':
        return {
          title: 'Cancelar DFD',
          icon: <X size={24} className="text-red-500" />,
          description: 'Você está prestes a cancelar este DFD. Esta ação pode ser revertida posteriormente.',
          requiresJustification: true,
          confirmText: 'Cancelar DFD',
          confirmVariant: 'destructive' as const
        };
      case 'delete':
        return {
          title: 'Excluir DFD',
          icon: <Trash2 size={24} className="text-red-500" />,
          description: 'Você está prestes a excluir permanentemente este DFD. Esta ação não pode ser desfeita.',
          requiresJustification: true,
          confirmText: 'Excluir Permanentemente',
          confirmVariant: 'destructive' as const
        };
      case 'remove-pca':
        return {
          title: 'Solicitar Retirada do PCA',
          icon: <AlertTriangle size={24} className="text-orange-500" />,
          description: 'Você está solicitando a retirada deste DFD do Programa de Contratações Anuais (PCA).',
          requiresJustification: true,
          confirmText: 'Enviar Solicitação',
          confirmVariant: 'default' as const
        };
      default:
        return {
          title: 'Confirmar Ação',
          icon: <AlertTriangle size={24} className="text-gray-500" />,
          description: 'Confirme esta ação.',
          requiresJustification: false,
          confirmText: 'Confirmar',
          confirmVariant: 'default' as const
        };
    }
  };

  const config = getModalConfig();
  const canConfirm = !config.requiresJustification || justification.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {config.icon}
            <span>{config.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {dfd && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-1">{dfd.objeto}</h4>
              <p className="text-sm text-gray-600">Tipo: {dfd.tipoDFD}</p>
              <p className="text-sm text-gray-600">Status: {dfd.status}</p>
              <p className="text-sm text-gray-600">Valor: {dfd.valor}</p>
            </div>
          )}
          
          <p className="text-gray-700">{config.description}</p>
          
          {config.requiresJustification && (
            <div className="space-y-2">
              <Label htmlFor="justification">
                Justificativa *
              </Label>
              <Textarea
                id="justification"
                value={justification}
                onChange={(e) => onJustificationChange(e.target.value)}
                placeholder="Descreva o motivo desta ação..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                A justificativa é obrigatória e será registrada no histórico do DFD.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant={config.confirmVariant}
            onClick={onConfirm}
            disabled={!canConfirm}
          >
            {config.confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActionConfirmModal;
