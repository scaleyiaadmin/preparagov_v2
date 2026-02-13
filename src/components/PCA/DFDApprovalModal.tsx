
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DFDApprovalModalProps {
  open: boolean;
  onClose: () => void;
  pendingDFDs: any[];
  onView: (dfd: any) => void;
  onApprove: (dfd: any) => void;
  onReject: (dfd: any, justification: string) => void;
}

const DFDApprovalModal = ({
  open,
  onClose,
  pendingDFDs,
  onView,
  onApprove,
  onReject
}: DFDApprovalModalProps) => {
  const [rejectingDFD, setRejectingDFD] = useState<any>(null);
  const [justification, setJustification] = useState('');
  const { toast } = useToast();

  const handleReject = () => {
    if (!justification.trim()) {
      toast({
        title: "Erro",
        description: "A justificativa é obrigatória para recusar um DFD.",
        variant: "destructive",
      });
      return;
    }

    onReject(rejectingDFD, justification);
    setRejectingDFD(null);
    setJustification('');
  };

  const cancelReject = () => {
    setRejectingDFD(null);
    setJustification('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>DFDs Pendentes de Aprovação</DialogTitle>
        </DialogHeader>

        {rejectingDFD ? (
          <div className="space-y-4">
            <h3 className="font-semibold">Recusar DFD: {rejectingDFD.objeto}</h3>
            <div>
              <label className="block text-sm font-medium mb-2">
                Justificativa da Recusa *
              </label>
              <Textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Digite o motivo da recusa..."
                rows={4}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleReject} variant="destructive">
                Confirmar Recusa
              </Button>
              <Button onClick={cancelReject} variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingDFDs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Não há DFDs pendentes de aprovação.
              </p>
            ) : (
              pendingDFDs.map((dfd) => (
                <div key={dfd.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{dfd.objeto}</h3>
                    <Badge className="bg-orange-100 text-orange-800">
                      Pendente Aprovação
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>Tipo: {dfd.tipoDFD}</div>
                    <div>Prioridade: {dfd.prioridade}</div>
                    <div>Valor: {dfd.valorEstimado}</div>
                    <div>Ano: {dfd.anoContratacao}</div>
                    <div className="col-span-2 mt-1 font-medium text-gray-800">
                      Requisitante: {dfd.userName}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(dfd)}
                    >
                      <Eye size={16} className="mr-1" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => onApprove(dfd)}
                    >
                      <Check size={16} className="mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setRejectingDFD(dfd)}
                    >
                      <X size={16} className="mr-1" />
                      Recusar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!rejectingDFD && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DFDApprovalModal;
