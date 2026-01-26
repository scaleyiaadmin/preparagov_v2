import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Eye, 
  Download,
  Edit,
  Calendar,
  Building,
  DollarSign,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { allMapasRiscos, type MapaRisco } from '@/utils/mapaRiscosData';

interface MapaRiscosCardsProps {
  statusFilter?: 'concluido' | 'elaboracao';
  onViewPreview: (mapa: MapaRisco) => void;
  onContinueEditing: (mapa: MapaRisco) => void;
  onExportPDF: (mapa: MapaRisco) => void;
}

const MapaRiscosCards = ({ statusFilter, onViewPreview, onContinueEditing, onExportPDF }: MapaRiscosCardsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrar mapas por status usando os dados centralizados
  const filteredMapas = statusFilter 
    ? allMapasRiscos.filter(mapa => mapa.status === statusFilter)
    : allMapasRiscos;

  // Paginação
  const totalPages = Math.ceil(filteredMapas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMapas = filteredMapas.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const MapaCard = ({ mapa }: { mapa: MapaRisco }) => (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">{mapa.titulo}</h3>
            <Badge variant={mapa.status === 'concluido' ? 'default' : 'secondary'}>
              {mapa.status === 'concluido' ? 'Concluído' : 'Em Elaboração'}
            </Badge>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-blue-600">{mapa.etpNumero}</span>
              <span>-</span>
              <span>{mapa.etpTitulo}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Building size={14} />
                <span>{mapa.secretaria}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>
                  {mapa.status === 'concluido' ? 'Concluído' : 'Criado'}: {formatDate(mapa.dataCriacao)}
                </span>
              </div>
              {mapa.dataUltimaEdicao && mapa.status === 'elaboracao' && (
                <div className="flex items-center space-x-1">
                  <Edit size={14} />
                  <span>Editado: {formatDate(mapa.dataUltimaEdicao)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <span className="font-medium">Total de Riscos:</span>
              <span className="bg-gray-100 px-2 py-1 rounded">{mapa.totalRiscos}</span>
            </div>
            {mapa.riscosAlto > 0 && (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertTriangle size={14} />
                <span className="font-medium">{mapa.riscosAlto} Alto(s)</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {mapa.status === 'concluido' ? (
            <>
              <Button variant="outline" size="sm" onClick={() => onViewPreview(mapa)}>
                <Eye size={16} className="mr-1" />
                Visualizar
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExportPDF(mapa)}>
                <Download size={16} className="mr-1" />
                PDF
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => onContinueEditing(mapa)}>
              <Edit size={16} className="mr-1" />
              Continuar
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
        </Button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    );
  };

  const getTitle = () => {
    if (!statusFilter) return 'Mapas de Riscos';
    return statusFilter === 'concluido' ? 'Mapas Concluídos' : 'Mapas em Elaboração';
  };

  const getIcon = () => {
    if (!statusFilter) return <FileText className="w-5 h-5 text-blue-600" />;
    return statusFilter === 'concluido' 
      ? <FileText className="w-5 h-5 text-green-600" />
      : <Edit className="w-5 h-5 text-orange-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getIcon()}
            <span>{getTitle()} ({filteredMapas.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentMapas.length > 0 ? (
            <>
              <div className="space-y-4">
                {currentMapas.map((mapa) => (
                  <MapaCard key={mapa.id} mapa={mapa} />
                ))}
              </div>
              <Pagination />
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {statusFilter === 'concluido' ? (
                <>
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum Mapa de Riscos concluído encontrado.</p>
                </>
              ) : statusFilter === 'elaboracao' ? (
                <>
                  <Edit className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum Mapa de Riscos em elaboração encontrado.</p>
                </>
              ) : (
                <>
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum Mapa de Riscos encontrado.</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MapaRiscosCards;
