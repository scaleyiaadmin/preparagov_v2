
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Pencil, X, Trash2, AlertTriangle } from 'lucide-react';

interface DFDCardProps {
  dfd: {
    id: number;
    objeto: string;
    tipoDFD: string;
    valor: string;
    status: string;
    data: string;
    prioridade: string;
    anoContratacao: string;
  };
  onAction: (dfd: any, action: 'cancel' | 'delete' | 'remove-pca' | 'view' | 'edit') => void;
}

const DFDCard = ({ dfd, onAction }: DFDCardProps) => {
  console.log('DFDCard rendering for:', dfd.id, dfd.objeto);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente Aprovação':
        return 'bg-orange-100 text-orange-800';
      case 'Em Elaboração':
        return 'bg-blue-100 text-blue-800';
      case 'Aprovado':
        return 'bg-green-100 text-green-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoDFDColor = (tipo: string) => {
    const colors: Record<string, string> = {
      'MATERIAIS DE CONSUMO': 'bg-purple-100 text-purple-800',
      'MATERIAIS PERMANENTES': 'bg-indigo-100 text-indigo-800',
      'SERVIÇO CONTINUADO': 'bg-cyan-100 text-cyan-800',
      'SERVIÇO NÃO CONTINUADO': 'bg-teal-100 text-teal-800',
      'SERVIÇO DE ENGENHARIA': 'bg-amber-100 text-amber-800',
      'TERMO ADITIVO': 'bg-pink-100 text-pink-800'
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getActionsForStatus = (status: string) => {
    switch (status) {
      case 'Pendente Aprovação':
        return ['view', 'edit', 'cancel'];
      case 'Em Elaboração':
        return ['view', 'edit', 'delete'];
      case 'Aprovado':
        return ['view', 'remove-pca'];
      case 'Cancelado':
        return ['view', 'edit', 'delete'];
      default:
        return ['view'];
    }
  };

  const actions = getActionsForStatus(dfd.status);
  console.log('Available actions for DFD', dfd.id, ':', actions);

  try {
    return (
      <TooltipProvider>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{dfd.objeto}</h3>
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <Badge className={getTipoDFDColor(dfd.tipoDFD)}>{dfd.tipoDFD}</Badge>
                  <Badge className={getStatusColor(dfd.status)}>{dfd.status}</Badge>
                  <Badge variant="outline">Prioridade {dfd.prioridade}</Badge>
                  <span className="text-sm text-gray-500">
                    Criado em {new Date(dfd.data).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-gray-600">Valor: {dfd.valor}</p>
              </div>
              <div className="flex items-center space-x-2">
                {actions.includes('view') && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          console.log('View action clicked for DFD:', dfd.id);
                          onAction(dfd, 'view');
                        }}
                      >
                        <Eye size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visualizar DFD</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {actions.includes('edit') && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          console.log('Edit action clicked for DFD:', dfd.id);
                          onAction(dfd, 'edit');
                        }}
                      >
                        <Pencil size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar DFD</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {actions.includes('cancel') && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          console.log('Cancel action clicked for DFD:', dfd.id);
                          onAction(dfd, 'cancel');
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cancelar DFD</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {actions.includes('delete') && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          console.log('Delete action clicked for DFD:', dfd.id);
                          onAction(dfd, 'delete');
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Excluir DFD</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {actions.includes('remove-pca') && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          console.log('Remove PCA action clicked for DFD:', dfd.id);
                          onAction(dfd, 'remove-pca');
                        }}
                      >
                        <AlertTriangle size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Solicitar Retirada do PCA</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    );
  } catch (error) {
    console.error('Error rendering DFDCard:', error);
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <p className="text-red-500">Erro ao renderizar DFD: {dfd.objeto}</p>
        </CardContent>
      </Card>
    );
  }
};

export default DFDCard;
