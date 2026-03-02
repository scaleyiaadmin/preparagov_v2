
export interface DFDItem {
    id: string;
    codigo: string;
    descricao: string;
    unidade: string;
    quantidade: number;
    valorReferencia: number;
    tabelaReferencia?: string;
}

export interface DFDFormData {
    objeto: string;
    tipoDFD: string;
    descricaoSucinta: string;
    descricaoDemanda: string;
    justificativa: string;
    dataPrevista: string;
    prioridade: string;
    justificativaPrioridade: string;
    itens: DFDItem[];
}

export interface MappedDFD {
    id: string;
    objeto: string;
    tipoDFD: string;
    valor: string;
    status: string;
    data: string;
    prioridade: string;
    anoContratacao: string;
    descricaoDemanda: string;
    justificativa: string;
    dataPrevista?: string;
    numeroDFD?: string;
    justificativaPrioridade?: string;
    justificativaQuantidade?: string;
    descricaoSucinta?: string;
    itens: DFDItem[];
    requisitante?: {
        nome: string;
        email: string;
        cargo: string;
        secretaria: string;
    };
}
