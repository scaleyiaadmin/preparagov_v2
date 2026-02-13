-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Tabela DFD (Documento de Formalização da Demanda)
create table if not exists dfd (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  numero_dfd text, -- Ex: 001/2024 (pode ser gerado via trigger ou app)
  objeto text not null,
  tipo_dfd text not null, -- 'MATERIAIS DE CONSUMO', etc.
  descricao_sucinta text,
  descricao_demanda text,
  justificativa text,
  justificativa_quantidade text,
  data_prevista_contratacao date,
  prioridade text check (prioridade in ('Baixo', 'Médio', 'Alto')),
  justificativa_prioridade text,
  status text default 'Rascunho' check (status in ('Rascunho', 'Pendente', 'Aprovado', 'Reprovado', 'Cancelado')),
  ano_contratacao integer not null,
  valor_estimado_total numeric default 0,
  created_by uuid references auth.users(id), -- ou usuarios_acesso(id) dependendo da auth
  secretaria_id uuid references secretarias(id),
  prefeitura_id uuid references prefeituras(id) -- Importante para multi-tenancy
);

-- Tabela Itens do DFD
create table if not exists dfd_items (
  id uuid default uuid_generate_v4() primary key,
  dfd_id uuid references dfd(id) on delete cascade,
  codigo_item text,
  descricao_item text not null,
  unidade text,
  quantidade numeric not null,
  valor_unitario numeric,
  valor_total numeric generated always as (quantidade * valor_unitario) stored,
  tabela_referencia text -- 'SINAPI', 'ORSE', etc.
);

-- Tabela Configuração do PCA (Plano de Contratação Anual)
create table if not exists pca_config (
  id uuid default uuid_generate_v4() primary key,
  ano integer not null,
  prefeitura_id uuid references prefeituras(id),
  status text default 'Rascunho' check (status in ('Rascunho', 'Publicado')),
  data_publicacao timestamp with time zone,
  publicado_por uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(ano, prefeitura_id)
);

-- Tabela ETP (Estudo Técnico Preliminar)
create table if not exists etp (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  numero_etp text,
  status text default 'Em Elaboração' check (status in ('Em Elaboração', 'Concluído')),
  
  -- Campos do ETP
  descricao_demanda text,
  requisitos_contratacao text,
  alternativas_existem boolean default false,
  alternativas_descricao text,
  descricao_solucao text,
  justificativa_parcelamento text,
  resultados_pretendidos text,
  providencias_existem boolean default false,
  providencias_descricao text,
  contratacoes_correlatas boolean default false,
  contratacoes_descricao text,
  impactos_ambientais boolean default false,
  impactos_descricao text,
  observacoes_gerais text,
  conclusao_tecnica text,
  
  created_by uuid references auth.users(id),
  prefeitura_id uuid references prefeituras(id)
);

-- Tabela de Configuração Many-to-Many entre ETP e DFDs
create table if not exists etp_dfd (
  etp_id uuid references etp(id) on delete cascade,
  dfd_id uuid references dfd(id) on delete cascade,
  primary key (etp_id, dfd_id)
);

-- Políticas RLS (Row Level Security) - Exemplo Básico
alter table dfd enable row level security;
alter table dfd_items enable row level security;
alter table pca_config enable row level security;
alter table etp enable row level security;
alter table etp_dfd enable row level security;

-- Política de leitura: Usuários veem dados da sua prefeitura (assumindo que o user metadata tem prefeitura_id ou similar, ou tabela publica para dev)
-- Por enquanto, para facilitar o dev local, vamos criar policies permissivas ou baseadas no prefeitura_id se estiver no JWT.
-- Ajuste conforme sua auth real.

create policy "Enable all access for authenticated users" on dfd for all using (auth.role() = 'authenticated');
create policy "Enable insert for authenticated users" on dfd for insert with check (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users" on dfd_items for all using (auth.role() = 'authenticated');
create policy "Enable insert for authenticated users" on dfd_items for insert with check (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on pca_config for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on etp for all using (auth.role() = 'authenticated');
create policy "Enable all access for authenticated users" on etp_dfd for all using (auth.role() = 'authenticated');
