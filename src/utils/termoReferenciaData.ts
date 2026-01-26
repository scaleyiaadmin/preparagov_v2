
// Minimal types and data for components that still reference TR data
export interface TermoReferencia {
  id: string;
  numero: string;
  objeto: string;
  secretaria: string;
  responsavel: string;
  etpNumero: string;
  etpTitulo: string;
  status: string;
  dataCriacao: string;
  dataConclusao?: string;
  modalidade?: string;
  criterioJulgamento?: string;
  tipoExecucao?: string;
  registroPrecos?: boolean;
  valorEstimado?: number;
  tipoDFD?: string;
  ano?: string;
}

export interface DFDVinculado {
  id: string;
  numero: string;
  nome: string;
  tipo: string;
  valor: string;
}

export interface ETPFinalizado {
  id: string;
  numero: string;
  titulo: string;
  secretaria: string;
  objeto: string;
  status: string;
  dataConclusao: string;
  valor: string;
  descricaoDemanda: string;
  dfdsVinculados: DFDVinculado[];
}

// Mock data for Termos de Referência
export const getTermosReferencia = (): TermoReferencia[] => {
  return [
    {
      id: '1',
      numero: 'TR-001/2024',
      objeto: 'Contratação de Serviços de Consultoria em TI',
      secretaria: 'Secretaria de Tecnologia',
      responsavel: 'João Silva',
      etpNumero: 'ETP-001/2024',
      etpTitulo: 'Estudo Técnico Preliminar - TI',
      status: 'Em Elaboração',
      dataCriacao: '2024-01-15',
      valorEstimado: 150000,
      tipoDFD: 'SERVIÇO NÃO CONTINUADO',
      ano: '2024'
    },
    {
      id: '2',
      numero: 'TR-002/2024',
      objeto: 'Aquisição de Gêneros Alimentícios',
      secretaria: 'Secretaria de Educação',
      responsavel: 'Maria Santos',
      etpNumero: 'ETP-002/2024',
      etpTitulo: 'Estudo Técnico Preliminar - Alimentação',
      status: 'Pronto',
      dataCriacao: '2024-01-10',
      valorEstimado: 300000,
      tipoDFD: 'MATERIAIS DE CONSUMO',
      ano: '2024'
    },
    {
      id: '3',
      numero: 'TR-003/2024',
      objeto: 'Contratação de Serviços de Limpeza',
      secretaria: 'Secretaria de Obras',
      responsavel: 'Pedro Costa',
      etpNumero: 'ETP-003/2024',
      etpTitulo: 'Estudo Técnico Preliminar - Limpeza',
      status: 'Em Elaboração',
      dataCriacao: '2024-01-08',
      valorEstimado: 200000,
      tipoDFD: 'SERVIÇO CONTINUADO',
      ano: '2024'
    },
    {
      id: '4',
      numero: 'TR-004/2024',
      objeto: 'Reforma do Centro de Saúde',
      secretaria: 'Secretaria de Saúde',
      responsavel: 'Ana Lima',
      etpNumero: 'ETP-004/2024',
      etpTitulo: 'Estudo Técnico Preliminar - Reforma',
      status: 'Pronto',
      dataCriacao: '2024-01-05',
      valorEstimado: 800000,
      tipoDFD: 'SERVIÇO DE ENGENHARIA',
      ano: '2024'
    },
    {
      id: '5',
      numero: 'TR-005/2024',
      objeto: 'Aquisição de Equipamentos Médicos',
      secretaria: 'Secretaria de Saúde',
      responsavel: 'Carlos Mendes',
      etpNumero: 'ETP-005/2024',
      etpTitulo: 'Estudo Técnico Preliminar - Equipamentos',
      status: 'Em Elaboração',
      dataCriacao: '2024-01-03',
      valorEstimado: 500000,
      tipoDFD: 'MATERIAIS PERMANENTES',
      ano: '2024'
    }
  ];
};

// Utility functions
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Em Elaboração':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Pronto':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Aprovado':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Cancelado':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Mock data - empty arrays since pages are under construction
export const getTRsConcluidos = (): TermoReferencia[] => {
  return [];
};

export const getETPs = (): ETPFinalizado[] => {
  return [];
};

export const generateTRNumber = (): string => {
  const currentYear = new Date().getFullYear();
  const randomNumber = Math.floor(Math.random() * 9000) + 1000;
  return `TR-${currentYear}-${randomNumber}`;
};
