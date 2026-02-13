import React from 'react';
import DFDCard from './DFDCard';
import DFDFilters from './DFDFilters';
import DFDListPagination from './DFDListPagination';

interface DFDListProps {
  filters: {
    tipoDFD: string;
    prioridade: string;
    anoContratacao: string;
    status: string;
  };
  onFilterChange: (filters: any) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  onAction: (dfd: any, action: 'cancel' | 'delete' | 'remove-pca' | 'view' | 'edit') => void;

  currentFilter: string;
  dfds: any[];
}

const DFDList = ({
  filters,
  onFilterChange,
  currentPage,
  onPageChange,
  onAction,

  currentFilter,
  dfds
}: DFDListProps) => {
  console.log('DFDList rendering with props:', { filters, currentPage, currentFilter });

  const tipoDFDOptions = [
    'MATERIAIS DE CONSUMO',
    'MATERIAIS PERMANENTES',
    'SERVIÇO CONTINUADO',
    'SERVIÇO NÃO CONTINUADO',
    'SERVIÇO DE ENGENHARIA',
    'TERMO ADITIVO'
  ];

  const prioridadeOptions = ['Baixo', 'Médio', 'Alto'];

  const allDFDs = dfds;

  console.log('allDFDs loaded:', allDFDs.length, 'items');

  const filteredDFDs = allDFDs.filter(dfd => {
    const matchesTipo = !filters.tipoDFD || filters.tipoDFD === 'all' || dfd.tipoDFD === filters.tipoDFD;
    const matchesPrioridade = !filters.prioridade || filters.prioridade === 'all' || dfd.prioridade === filters.prioridade;
    const matchesAno = !filters.anoContratacao || filters.anoContratacao === 'all' || dfd.anoContratacao === filters.anoContratacao;
    const matchesStatus = !filters.status || filters.status === 'all' || dfd.status === filters.status;

    return matchesTipo && matchesPrioridade && matchesAno && matchesStatus;
  });

  const statusFilteredDFDs = filteredDFDs.filter(dfd => {
    switch (currentFilter) {
      case 'em-elaboracao':
        return dfd.status === 'Em Elaboração';
      case 'aprovados':
        return dfd.status === 'Aprovado';
      case 'pendentes':
        return dfd.status === 'Pendente Aprovação';
      default:
        return true;
    }
  });

  console.log('statusFilteredDFDs:', statusFilteredDFDs.length, 'items');

  const itemsPerPage = 5;
  const totalPages = Math.ceil(statusFilteredDFDs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDFDs = statusFilteredDFDs.slice(startIndex, startIndex + itemsPerPage);

  console.log('paginatedDFDs:', paginatedDFDs.length, 'items for page', currentPage);

  return (
    <div className="space-y-6">
      <DFDFilters
        filters={filters}
        onFilterChange={onFilterChange}
        tipoDFDOptions={tipoDFDOptions}
        prioridadeOptions={prioridadeOptions}
      />

      <div className="grid gap-6">
        {paginatedDFDs.length > 0 ? (
          paginatedDFDs.map((dfd) => {
            console.log('Rendering DFD card:', dfd.id, dfd.objeto);
            return (
              <DFDCard
                key={dfd.id}
                dfd={dfd}
                onAction={onAction}
              />
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {currentFilter === 'all'
                ? 'Nenhum DFD encontrado com os filtros aplicados.'
                : `Nenhum DFD ${currentFilter === 'em-elaboracao' ? 'em elaboração' :
                  currentFilter === 'aprovados' ? 'aprovado' :
                    'pendente'} encontrado.`}
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <DFDListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default DFDList;
