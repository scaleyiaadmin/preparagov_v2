// Tipos de autenticação e RBAC

export type UserRole = 'super_admin' | 'admin' | 'operator';

export interface ModulePermissions {
  dashboard: boolean;
  dfd: boolean;
  pca: boolean;
  etp: boolean;
  mapaRiscos: boolean;
  cronograma: boolean;
  termoReferencia: boolean;
  edital: boolean;
  perfil: boolean;
  integracoes: boolean;
  gerenciarUsuarios: boolean;
  gestaoPrefeiturasAcesso: boolean;
}

export interface Prefeitura {
  id: string;
  nome: string;
  cnpj: string;
  uf: string;
  municipio: string;
  logoUrl?: string;
  gestorPrincipal?: string;
  email?: string;
  telefone?: string;
  cargo?: string;
  dataCadastro: string;
  status: 'ativa' | 'inativa';
}

export interface User {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  prefeituraId: string | null; // null para super_admin
  secretariaId: string | null; // null para super_admin
  permissions: ModulePermissions;
  createdAt: string;
  status: 'ativo' | 'inativo';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  impersonating: User | null; // Quando Super Admin está impersonando
}

// Permissões padrão por role
export const defaultPermissionsByRole: Record<UserRole, ModulePermissions> = {
  super_admin: {
    dashboard: true,
    dfd: true,
    pca: true,
    etp: true,
    mapaRiscos: true,
    cronograma: true,
    termoReferencia: true,
    edital: true,
    perfil: true,
    integracoes: true,
    gerenciarUsuarios: true,
    gestaoPrefeiturasAcesso: true,
  },
  admin: {
    dashboard: true,
    dfd: true,
    pca: true,
    etp: true,
    mapaRiscos: true,
    cronograma: true,
    termoReferencia: true,
    edital: true,
    perfil: true,
    integracoes: true,
    gerenciarUsuarios: true,
    gestaoPrefeiturasAcesso: false,
  },
  operator: {
    dashboard: true,
    dfd: false,
    pca: false,
    etp: false,
    mapaRiscos: false,
    cronograma: false,
    termoReferencia: false,
    edital: false,
    perfil: true,
    integracoes: false,
    gerenciarUsuarios: false,
    gestaoPrefeiturasAcesso: false,
  },
};

export const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  operator: 'Operador',
};

export const moduleLabels: Record<keyof ModulePermissions, string> = {
  dashboard: 'Dashboard',
  dfd: 'DFD',
  pca: 'PCA',
  etp: 'ETP',
  mapaRiscos: 'Mapa de Riscos',
  cronograma: 'Cronograma de Licitações',
  termoReferencia: 'Termo de Referência',
  edital: 'Edital',
  perfil: 'Perfil',
  integracoes: 'Integrações',
  gerenciarUsuarios: 'Gerenciar Usuários',
  gestaoPrefeiturasAcesso: 'Gestão de Prefeituras',
};
