import { User, Prefeitura, defaultPermissionsByRole } from '@/types/auth';

// Prefeituras mockadas
export const mockPrefeituras: Prefeitura[] = [
  {
    id: 'pref-001',
    nome: 'Prefeitura Municipal de São Paulo',
    cnpj: '46.392.150/0001-20',
    uf: 'SP',
    municipio: 'São Paulo',
    dataCadastro: '2024-01-15',
    status: 'ativa',
  },
  {
    id: 'pref-002',
    nome: 'Prefeitura Municipal do Rio de Janeiro',
    cnpj: '42.498.733/0001-48',
    uf: 'RJ',
    municipio: 'Rio de Janeiro',
    dataCadastro: '2024-02-20',
    status: 'ativa',
  },
  {
    id: 'pref-003',
    nome: 'Prefeitura Municipal de Belo Horizonte',
    cnpj: '18.715.383/0001-40',
    uf: 'MG',
    municipio: 'Belo Horizonte',
    dataCadastro: '2024-03-10',
    status: 'ativa',
  },
  {
    id: 'pref-004',
    nome: 'Prefeitura Municipal de Salvador',
    cnpj: '13.927.801/0001-49',
    uf: 'BA',
    municipio: 'Salvador',
    dataCadastro: '2024-04-05',
    status: 'inativa',
  },
];

// Usuários mockados para testes
export const mockUsers: User[] = [
  // Super Admin (CEO - Scaley IA)
  {
    id: 'user-super-001',
    email: 'ceo@scaleyia.com',
    nome: 'CEO Scaley IA',
    role: 'super_admin',
    prefeituraId: null,
    permissions: defaultPermissionsByRole.super_admin,
    createdAt: '2024-01-01',
    status: 'ativo',
  },

  // Admin da Prefeitura de São Paulo
  {
    id: 'user-admin-sp',
    email: 'admin@saopaulo.sp.gov.br',
    nome: 'Carlos Silva',
    role: 'admin',
    prefeituraId: 'pref-001',
    permissions: defaultPermissionsByRole.admin,
    createdAt: '2024-01-16',
    status: 'ativo',
  },

  // Operadores de São Paulo
  {
    id: 'user-op-sp-001',
    email: 'maria@saopaulo.sp.gov.br',
    nome: 'Maria Santos',
    role: 'operator',
    prefeituraId: 'pref-001',
    permissions: {
      ...defaultPermissionsByRole.operator,
      dfd: true,
      etp: true,
      termoReferencia: true,
    },
    createdAt: '2024-01-20',
    status: 'ativo',
  },
  {
    id: 'user-op-sp-002',
    email: 'joao@saopaulo.sp.gov.br',
    nome: 'João Oliveira',
    role: 'operator',
    prefeituraId: 'pref-001',
    permissions: {
      ...defaultPermissionsByRole.operator,
      pca: true,
      cronograma: true,
    },
    createdAt: '2024-02-01',
    status: 'ativo',
  },

  // Admin do Rio de Janeiro
  {
    id: 'user-admin-rj',
    email: 'admin@rio.rj.gov.br',
    nome: 'Ana Rodrigues',
    role: 'admin',
    prefeituraId: 'pref-002',
    permissions: defaultPermissionsByRole.admin,
    createdAt: '2024-02-21',
    status: 'ativo',
  },

  // Operador do Rio de Janeiro (sem muitas permissões)
  {
    id: 'user-op-rj-001',
    email: 'pedro@rio.rj.gov.br',
    nome: 'Pedro Lima',
    role: 'operator',
    prefeituraId: 'pref-002',
    permissions: {
      ...defaultPermissionsByRole.operator,
      dfd: true,
    },
    createdAt: '2024-02-25',
    status: 'ativo',
  },

  // Admin de Belo Horizonte
  {
    id: 'user-admin-bh',
    email: 'admin@pbh.mg.gov.br',
    nome: 'Roberto Mendes',
    role: 'admin',
    prefeituraId: 'pref-003',
    permissions: defaultPermissionsByRole.admin,
    createdAt: '2024-03-11',
    status: 'ativo',
  },
];

// Credenciais para login mockado (para testes)
export const mockCredentials = [
  { email: 'ceo@scaleyia.com', password: 'super123', userId: 'user-super-001' },
  { email: 'admin@saopaulo.sp.gov.br', password: 'admin123', userId: 'user-admin-sp' },
  { email: 'maria@saopaulo.sp.gov.br', password: 'user123', userId: 'user-op-sp-001' },
  { email: 'joao@saopaulo.sp.gov.br', password: 'user123', userId: 'user-op-sp-002' },
  { email: 'admin@rio.rj.gov.br', password: 'admin123', userId: 'user-admin-rj' },
  { email: 'pedro@rio.rj.gov.br', password: 'user123', userId: 'user-op-rj-001' },
  { email: 'admin@pbh.mg.gov.br', password: 'admin123', userId: 'user-admin-bh' },
];
