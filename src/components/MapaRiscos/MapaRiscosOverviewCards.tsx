
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Edit,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
interface MapaRiscosOverview {
  concluidos: number;
  elaboracao: number;
  total: number;
  totalRiscosConcluidos?: number;
  riscosAltoConcluidos?: number;
  totalRiscosElaboracao?: number;
  riscosAltoElaboracao?: number;
}

interface MapaRiscosOverviewCardsProps {
  onViewConcluidos: () => void;
  onViewElaboracao: () => void;
  counts: MapaRiscosOverview;
}

const MapaRiscosOverviewCards = ({ onViewConcluidos, onViewElaboracao, counts }: MapaRiscosOverviewCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Card Mapas Concluídos */}
      <Card
        className="cursor-pointer hover:bg-gray-50 transition-colors border-2 hover:border-green-200"
        onClick={onViewConcluidos}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-green-600" />
              <span className="text-lg">Mapas Concluídos</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {counts.concluidos}
              </div>
              <p className="text-sm text-gray-600">
                {counts.concluidos === 1 ? 'mapa concluído' : 'mapas concluídos'}
              </p>
            </div>

            {(counts.totalRiscosConcluidos || 0) > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total de Riscos:</span>
                  <Badge variant="outline">
                    {counts.totalRiscosConcluidos}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Riscos Alto:</span>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle size={14} className="text-red-500" />
                    <Badge variant="destructive">
                      {counts.riscosAltoConcluidos}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500 text-center">
                Clique para ver todos os mapas concluídos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Mapas em Elaboração */}
      <Card
        className="cursor-pointer hover:bg-gray-50 transition-colors border-2 hover:border-orange-200"
        onClick={onViewElaboracao}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Edit className="w-6 h-6 text-orange-600" />
              <span className="text-lg">Mapas em Elaboração</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">
                {counts.elaboracao}
              </div>
              <p className="text-sm text-gray-600">
                {counts.elaboracao === 1 ? 'mapa em elaboração' : 'mapas em elaboração'}
              </p>
            </div>

            {(counts.totalRiscosElaboracao || 0) > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total de Riscos:</span>
                  <Badge variant="outline">
                    {counts.totalRiscosElaboracao}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Riscos Alto:</span>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle size={14} className="text-red-500" />
                    <Badge variant="destructive">
                      {counts.riscosAltoElaboracao}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500 text-center">
                Clique para ver todos os mapas em elaboração
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapaRiscosOverviewCards;
