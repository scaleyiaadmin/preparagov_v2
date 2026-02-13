
import { ModulePermissions, UserRole } from './auth';

// Tabela: usuarios_acesso
export interface DbUser {
    id: string; // uuid
    created_at: string; // timestamp with time zone
    email: string;
    senha?: string; // Tabela pode ter senha, mas nem sempre retornamos
    nome: string;
    tipo_perfil: UserRole; // 'super_admin' | 'admin' | 'operator'
    prefeitura_id: string | null; // uuid
    secretaria_id: string | null; // uuid
    modulos_acesso: ModulePermissions; // jsonb
    status: 'ativo' | 'inativo';
}

// Tabela: prefeituras
export interface DbPrefeitura {
    id: string; // uuid
    created_at: string;
    nome: string;
    cnpj: string;
    uf: string;
    municipio: string;
    logo_url?: string | null;
    // Campos legados (podem existir no banco mas não usamos mais)
    gestor_principal?: string | null;
    email?: string | null;
    telefone?: string | null;
    cargo?: string | null;
    status: 'ativa' | 'inativa';
}

// Tabela: secretarias
export interface DbSecretaria {
    id: string; // uuid
    created_at?: string;
    nome: string;
    prefeitura_id: string; // uuid
}

// --- NOVAS TABELAS ---

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
    status: 'Rascunho' | 'Pendente' | 'Aprovado' | 'Reprovado' | 'Cancelado';
    ano_contratacao: number;
    valor_estimado_total: number;
    created_by?: string;
    secretaria_id?: string;
    prefeitura_id?: string;
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
    valor_total: number;
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

// Tabela: etp_dfd (Junção)
export interface DbETPDFD {
    etp_id: string;
    dfd_id: string;
}

// Helper para respostas do Supabase
export type SupabaseResponse<T> = {
    data: T | null;
    error: any | null;
};
