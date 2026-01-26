
export interface MapaRisco {
  id: string;
  titulo: string;
  etpNumero: string;
  etpTitulo: string;
  secretaria: string;
  dataCriacao: string;
  dataUltimaEdicao?: string;
  totalRiscos: number;
  riscosAlto: number;
  status: 'concluido' | 'elaboracao';
}

export const allMapasRiscos: MapaRisco[] = [
  {
    id: '1',
    titulo: 'Mapa de Riscos - Modernização TI',
    etpNumero: 'ETP-2024-001',
    etpTitulo: 'ETP Modernização Tecnológica',
    secretaria: 'Secretaria de Tecnologia',
    dataCriacao: '2024-06-15',
    totalRiscos: 8,
    riscosAlto: 2,
    status: 'concluido'
  },
  {
    id: '2',
    titulo: 'Mapa de Riscos - Equipamentos Saúde',
    etpNumero: 'ETP-2024-003',
    etpTitulo: 'ETP Equipamentos de Saúde',
    secretaria: 'Secretaria de Saúde',
    dataCriacao: '2024-05-20',
    totalRiscos: 12,
    riscosAlto: 3,
    status: 'concluido'
  },
  {
    id: '5',
    titulo: 'Mapa de Riscos - Sistema Gestão',
    etpNumero: 'ETP-2024-009',
    etpTitulo: 'ETP Sistema de Gestão',
    secretaria: 'Secretaria de Planejamento',
    dataCriacao: '2024-04-10',
    totalRiscos: 15,
    riscosAlto: 4,
    status: 'concluido'
  },
  {
    id: '3',
    titulo: 'Mapa de Riscos - Infraestrutura',
    etpNumero: 'ETP-2024-005',
    etpTitulo: 'ETP Infraestrutura Urbana',
    secretaria: 'Secretaria de Obras',
    dataCriacao: '2024-06-28',
    dataUltimaEdicao: '2024-07-02',
    totalRiscos: 5,
    riscosAlto: 1,
    status: 'elaboracao'
  },
  {
    id: '4',
    titulo: 'Mapa de Riscos - Aquisição Veículos',
    etpNumero: 'ETP-2024-007',
    etpTitulo: 'ETP Aquisição de Veículos',
    secretaria: 'Secretaria de Administração',
    dataCriacao: '2024-07-01',
    dataUltimaEdicao: '2024-07-03',
    totalRiscos: 7,
    riscosAlto: 2,
    status: 'elaboracao'
  }
];

export const getMapasConcluidos = () => allMapasRiscos.filter(mapa => mapa.status === 'concluido');
export const getMapasElaboracao = () => allMapasRiscos.filter(mapa => mapa.status === 'elaboracao');
