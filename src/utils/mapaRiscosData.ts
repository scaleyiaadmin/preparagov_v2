
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

export const allMapasRiscos: MapaRisco[] = [];

export const getMapasConcluidos = () => allMapasRiscos.filter(mapa => mapa.status === 'concluido');
export const getMapasElaboracao = () => allMapasRiscos.filter(mapa => mapa.status === 'elaboracao');
