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
}

const DFDList = ({ 
  filters, 
  onFilterChange, 
  currentPage, 
  onPageChange, 
  onAction,
  currentFilter
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

  const allDFDs = [
    {
      id: 1,
      objeto: 'Aquisição de Gêneros Alimentícios',
      tipoDFD: 'MATERIAIS DE CONSUMO',
      valor: 'R$ 150.000,00',
      status: 'Pendente Aprovação',
      data: '2024-01-10',
      prioridade: 'Alto',
      anoContratacao: '2024',
      descricaoDemanda: 'Atender às necessidades nutricionais dos alunos da rede escolar municipal, fornecendo alimentação balanceada e de qualidade.',
      justificativa: 'A aquisição de gêneros alimentícios é fundamental para garantir a alimentação escolar adequada conforme estabelecido na Lei nº 11.947/2009.',
      dataPrevista: '2024-03-15',
      justificativaPrioridade: 'Demanda urgente para manter continuidade da merenda escolar.',
      itens: [
        { id: '1', codigo: 'ALI-001', descricao: 'Arroz tipo 1', unidade: 'kg', quantidade: 500, valorReferencia: 4.50, tabelaReferencia: 'SEAPREC' },
        { id: '2', codigo: 'ALI-002', descricao: 'Feijão carioca', unidade: 'kg', quantidade: 300, valorReferencia: 6.80, tabelaReferencia: 'SEAPREC' }
      ]
    },
    {
      id: 2,
      objeto: 'Contratação de Consultoria em TI',
      tipoDFD: 'SERVIÇO NÃO CONTINUADO',
      valor: 'R$ 300.000,00',
      status: 'Em Elaboração',
      data: '2024-01-08',
      prioridade: 'Médio',
      anoContratacao: '2024',
      descricaoDemanda: 'Modernização do sistema de gestão municipal com implementação de novas funcionalidades.',
      justificativa: 'Necessário para atender às demandas de digitalização dos processos administrativos.',
      dataPrevista: '2024-04-20',
      itens: [
        { id: '3', codigo: 'SRV-001', descricao: 'Consultoria em TI', unidade: 'horas', quantidade: 200, valorReferencia: 150.00, tabelaReferencia: 'SINAPI' }
      ]
    },
    {
      id: 3,
      objeto: 'Reforma do Prédio Administrativo',
      tipoDFD: 'SERVIÇO DE ENGENHARIA',
      valor: 'R$ 2.500.000,00',
      status: 'Aprovado',
      data: '2024-01-05',
      prioridade: 'Alto',
      anoContratacao: '2024',
      descricaoDemanda: 'Reforma completa do prédio administrativo para melhorar as condições de trabalho.',
      justificativa: 'Necessário para adequar as instalações às normas de segurança e acessibilidade.',
      dataPrevista: '2024-06-01',
      justificativaPrioridade: 'Situação crítica das instalações compromete a segurança dos servidores.',
      itens: [
        { id: '4', codigo: 'ENG-001', descricao: 'Reforma de prédio público', unidade: 'm²', quantidade: 1000, valorReferencia: 2500.00, tabelaReferencia: 'SINAPI' }
      ]
    },
    {
      id: 4,
      objeto: 'Aquisição de Material de Limpeza',
      tipoDFD: 'MATERIAIS DE CONSUMO',
      valor: 'R$ 85.000,00',
      status: 'Cancelado',
      data: '2024-01-03',
      prioridade: 'Baixo',
      anoContratacao: '2024',
      descricaoDemanda: 'Aquisição de material de limpeza para manutenção das instalações públicas.',
      justificativa: 'Manter as condições de higiene e salubridade das instalações públicas.',
      dataPrevista: '2024-02-28',
      itens: [
        { id: '5', codigo: 'LMP-001', descricao: 'Detergente neutro', unidade: 'litros', quantidade: 100, valorReferencia: 8.50, tabelaReferencia: 'SEAPREC' }
      ]
    },
    {
      id: 5,
      objeto: 'Contratação de Segurança Patrimonial',
      tipoDFD: 'SERVIÇO CONTINUADO',
      valor: 'R$ 450.000,00',
      status: 'Aprovado',
      data: '2023-12-20',
      prioridade: 'Alto',
      anoContratacao: '2024',
      descricaoDemanda: 'Contratação de empresa para prestação de serviços de segurança patrimonial.',
      justificativa: 'Garantir a segurança das instalações públicas e proteção do patrimônio municipal.',
      dataPrevista: '2024-05-15',
      justificativaPrioridade: 'Necessário para proteger o patrimônio público e garantir segurança.',
      itens: [
        { id: '6', codigo: 'SEG-001', descricao: 'Vigilante patrimonial', unidade: 'horas', quantidade: 3000, valorReferencia: 15.00, tabelaReferencia: 'SINAPI' }
      ]
    },
    {
      id: 6,
      objeto: 'Aquisição de Computadores',
      tipoDFD: 'MATERIAIS PERMANENTES',
      valor: 'R$ 120.000,00',
      status: 'Em Elaboração',
      data: '2024-01-12',
      prioridade: 'Médio',
      anoContratacao: '2024',
      descricaoDemanda: 'Aquisição de computadores para renovação do parque tecnológico.',
      justificativa: 'Necessário para modernizar o ambiente de trabalho e melhorar a produtividade.',
      dataPrevista: '2024-03-30',
      itens: [
        { id: '7', codigo: 'INF-001', descricao: 'Computador desktop', unidade: 'unidade', quantidade: 20, valorReferencia: 6000.00, tabelaReferencia: 'SEAPREC' }
      ]
    }
  ];

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
