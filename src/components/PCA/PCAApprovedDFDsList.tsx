
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Printer, X } from 'lucide-react';
import DFDListPagination from '../DFD/DFDListPagination';

interface PCAApprovedDFDsListProps {
  selectedYear: string;
  approvedDFDs: any[];
  onViewDFD: (dfd: any) => void;
  onRemoveFromPCA: (dfd: any) => void;
}

const PCAApprovedDFDsList = ({
  selectedYear,
  approvedDFDs,
  onViewDFD,
  onRemoveFromPCA
}: PCAApprovedDFDsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrimestreColor = (trimestre: string) => {
    const colors = {
      'Q1': 'bg-purple-100 text-purple-800',
      'Q2': 'bg-blue-100 text-blue-800',
      'Q3': 'bg-green-100 text-green-800',
      'Q4': 'bg-orange-100 text-orange-800'
    };
    return colors[trimestre as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Cálculos de paginação
  const totalPages = Math.ceil(approvedDFDs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDFDs = approvedDFDs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>DFDs Aprovados - Componentes do PCA {selectedYear}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paginatedDFDs.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.objeto}</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                  <Badge className={getTrimestreColor(item.trimestre)}>
                    {item.trimestre}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {item.tipoDFD}
                  </span>
                  <span className="text-sm text-gray-600">
                    Prioridade: {item.prioridade}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 mt-1">{item.valorEstimado}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onViewDFD(item)}>
                  <Eye size={16} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Printer size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onRemoveFromPCA(item)}>
                  <X size={16} className="text-red-600" />
                </Button>
              </div>
            </div>
          ))}

          {approvedDFDs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum DFD aprovado encontrado para o ano {selectedYear}.</p>
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="mt-6">
            <DFDListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PCAApprovedDFDsList;
