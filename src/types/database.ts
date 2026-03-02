
import { ModulePermissions, UserRole } from './auth';

// Tabela: usuarios_acesso
export interface DbUser {
    id: string; // uuid
    created_at: string; // timestamp with time zone
    email: string;
    senha?: string;
    nome: string;
    tipo_perfil: UserRole;
    prefeitura_id: string | null;
    secretaria_id: string | null;
    modulos_acesso: ModulePermissions;
    status: 'ativo' | 'inativo';
    // Novos campos
    telefone?: string | null;
    cpf?: string | null;
    matricula?: string | null;
    cargo_funcional?: string | null;
    unidade?: string | null;
}

// Tabela: prefeituras
export interface DbPrefeitura {
    id: string;
    created_at: string;
    nome: string;
    cnpj: string;
    uf: string;
    municipio: string;
    logo_url?: string | null;
    gestor_principal?: string | null;
    email?: string | null;
    telefone?: string | null;
    cargo?: string | null;
    status: 'ativa' | 'inativa';
}

// Tabela: secretarias
export interface DbSecretaria {
    id: string;
    created_at?: string;
    nome: string;
    prefeitura_id: string;
    // Novos campos
    responsavel?: string | null;
    cargo?: string | null;
    email?: string | null;
    telefone?: string | null;
    status?: string | null;
}

// --- TABELAS DFD/PCA/ETP ---

// Tabela: dfd
export interface DbDFD {
    id: string;
    created_at: string;
    numero_dfd?: string;
    objeto: string;
    tipo_dfd: string;
    descricao_sucinta?: string;
    descricao_demanda?: string;
    justificativa?: string;
    justificativa_quantidade?: string;
    data_prevista_contratacao?: string;
    prioridade?: 'Baixo' | 'Médio' | 'Alto';
    justificativa_prioridade?: string;
    status: 'Rascunho' | 'Pendente' | 'Aprovado' | 'Reprovado' | 'Cancelado' | 'Retirado';
    ano_contratacao: number;
    valor_estimado_total?: number; // Opcional pois pode ser calculado via trigger/view
    created_by?: string;
    secretaria_id?: string;
    prefeitura_id?: string;
    solicitacao_cancelamento?: boolean;
    justificativa_cancelamento?: string;
}

export interface DbDFDWithRelations extends DbDFD {
    dfd_items?: DbDFDItem[];
    secretarias?: {
        nome: string;
    } | null;
}

// Tabela: dfd_items
export interface DbDFDItem {
    id: string;
    dfd_id: string;
    codigo_item?: string;
    descricao_item: string;
    unidade?: string;
    quantidade: number;
    valor_unitario?: number;
    valor_total?: number; // Opcional pois é gerado pelo banco (qty * unit)
    tabela_referencia?: string;
}

// Tabela: pca_config
export interface DbPCAConfig {
    id: string;
    ano: number;
    prefeitura_id?: string;
    status: 'Rascunho' | 'Publicado';
    data_publicacao?: string;
    publicado_por?: string;
    created_at: string;
}

// Tabela: etp
export interface DbETP {
    id: string;
    created_at: string;
    numero_etp?: string;
    objeto?: string;
    descricao_sucinta?: string;
    status: 'Em Elaboração' | 'Concluído';
    descricao_demanda?: string;
    requisitos_contratacao?: string;
    alternativas_existem?: boolean;
    alternativas_descricao?: string;
    descricao_solucao?: string;
    justificativa_parcelamento?: string;
    resultados_pretendidos?: string;
    providencias_existem?: boolean;
    providencias_descricao?: string;
    contratacoes_correlatas?: boolean;
    contratacoes_descricao?: string;
    impactos_ambientais?: boolean;
    impactos_descricao?: string;
    observacoes_gerais?: string;
    conclusao_tecnica?: string;
    created_by?: string;
    prefeitura_id?: string;
}

export interface DbETPWithDFDs extends DbETP {
    etp_dfd: {
        dfd: DbDFD;
    }[];
}

// Tabela: etp_dfd (Junção)
export interface DbETPDFD {
    etp_id: string;
    dfd_id: string;
}

// --- NOVAS TABELAS ---

// Tabela: mapa_riscos
export interface DbMapaRiscos {
    id: string;
    etp_id?: string | null;
    titulo: string;
    etp_numero?: string | null;
    etp_titulo?: string | null;
    secretaria?: string | null;
    status: 'elaboracao' | 'concluido';
    created_by?: string | null;
    prefeitura_id?: string | null;
    created_at: string;
    updated_at: string;
    // Campos computados (join)
    mapa_riscos_itens?: DbMapaRiscosItem[];
}

// Tabela: mapa_riscos_itens
export interface DbMapaRiscosItem {
    id: string;
    mapa_riscos_id: string;
    categoria: string;
    descricao: string;
    causa_provavel?: string | null;
    consequencia?: string | null;
    probabilidade: string;
    impacto: string;
    nivel: string;
    mitigacao: string;
    plano_contingencia?: string | null;
    responsavel?: string | null;
}

// Tabela: termos_referencia
export interface DbTermoReferencia {
    id: string;
    numero_tr?: string | null;
    etp_id?: string | null;
    objeto: string;
    status: 'Rascunho' | 'Em Elaboração' | 'Em Revisão' | 'Concluído' | 'Publicado';
    tipo?: string | null;
    valor_estimado: number;
    secretaria_id?: string | null;
    prefeitura_id?: string | null;
    dados_json?: any;
    created_by?: string | null;
    created_at: string;
    updated_at: string;
}

// Tabela: editais
export interface DbEdital {
    id: string;
    numero_edital?: string | null;
    tr_id?: string | null;
    objeto: string;
    status: 'Rascunho' | 'Em Elaboração' | 'Em Revisão' | 'Concluído' | 'Publicado';
    modalidade?: string | null;
    tipo_licitacao?: string | null;
    valor_estimado: number;
    data_publicacao?: string | null;
    secretaria_id?: string | null;
    prefeitura_id?: string | null;
    dados_json?: any;
    created_by?: string | null;
    created_at: string;
    updated_at: string;
}

// Tabela: system_config
export interface DbSystemConfig {
    id: string;
    chave: string;
    valor?: string | null;
    prefeitura_id?: string | null;
    updated_at: string;
}

// Helper para respostas do Supabase
export type SupabaseResponse<T> = {
    data: T | null;
    error: any | null;
};
