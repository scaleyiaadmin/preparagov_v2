
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

interface CancellationRequestsModalProps {
  open: boolean;
  onClose: () => void;
  cancellationRequests: any[];
  onView: (dfd: any) => void;
  onApprove: (dfd: any) => void;
  onDeny: (dfd: any, justification: string) => void;
}

const CancellationRequestsModal = ({
  open,
  onClose,
  cancellationRequests,
  onView,
  onApprove,
  onDeny
}: CancellationRequestsModalProps) => {
  const [denyingDFD, setDenyingDFD] = useState<any>(null);
  const [justification, setJustification] = useState('');
  const { toast } = useToast();

  const handleDeny = () => {
    if (!justification.trim()) {
      toast({
        title: "Erro",
        description: "A justificativa é obrigatória para negar o cancelamento.",
        variant: "destructive",
      });
      return;
    }

    onDeny(denyingDFD, justification);
    setDenyingDFD(null);
    setJustification('');
  };

  const cancelDeny = () => {
    setDenyingDFD(null);
    setJustification('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitações de Cancelamento</DialogTitle>
        </DialogHeader>

        {denyingDFD ? (
          <div className="space-y-4">
            <h3 className="font-semibold">Negar Cancelamento: {denyingDFD.objeto}</h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm"><strong>Justificativa da Solicitação:</strong></p>
              <p className="text-sm text-gray-700">{denyingDFD.justificativaCancelamento}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Justificativa da Negativa *
              </label>
              <Textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Digite o motivo da negativa do cancelamento..."
                rows={4}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleDeny} variant="destructive">
                Confirmar Negativa
              </Button>
              <Button onClick={cancelDeny} variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {cancellationRequests.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Não há solicitações de cancelamento pendentes.
              </p>
            ) : (
              cancellationRequests.map((dfd) => (
                <div key={dfd.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{dfd.objeto}</h3>
                    <Badge className="bg-red-100 text-red-800">
                      Solicitação de Cancelamento
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>Tipo: {dfd.tipoDFD}</div>
                    <div>Valor: {dfd.valorEstimado}</div>
                    <div>Solicitado por: {dfd.solicitadoPor}</div>
                    <div>Data: {new Date(dfd.dataSolicitacao).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg mb-3">
                    <p className="text-sm"><strong>Justificativa:</strong></p>
                    <p className="text-sm text-gray-700">{dfd.justificativaCancelamento}</p>
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
                      Aprovar Cancelamento
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDenyingDFD(dfd)}
                    >
                      <X size={16} className="mr-1" />
                      Negar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!denyingDFD && (
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

export default CancellationRequestsModal;
