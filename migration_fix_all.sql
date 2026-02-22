-- ============================================================
-- PreparaGov - Migration: Correção Geral do Sistema
-- Execute este SQL no SQL Editor do Supabase
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ALTERAR TABELAS EXISTENTES
-- ============================================================

-- Adicionar campos ao usuarios_acesso
ALTER TABLE usuarios_acesso 
  ADD COLUMN IF NOT EXISTS telefone text,
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS matricula text,
  ADD COLUMN IF NOT EXISTS cargo_funcional text,
  ADD COLUMN IF NOT EXISTS unidade text;

-- Adicionar campos de cancelamento ao dfd
ALTER TABLE dfd
  ADD COLUMN IF NOT EXISTS solicitacao_cancelamento boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS justificativa_cancelamento text;

-- Expandir tabela secretarias com campos extras
ALTER TABLE secretarias 
  ADD COLUMN IF NOT EXISTS responsavel text,
  ADD COLUMN IF NOT EXISTS cargo text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS telefone text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'ativa';

-- ============================================================
-- 2. NOVAS TABELAS
-- ============================================================

-- Tabela: mapa_riscos
CREATE TABLE IF NOT EXISTS mapa_riscos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  etp_id uuid REFERENCES etp(id),
  titulo text NOT NULL,
  etp_numero text,
  etp_titulo text,
  secretaria text,
  status text DEFAULT 'elaboracao' CHECK (status IN ('elaboracao', 'concluido')),
  created_by uuid,
  prefeitura_id uuid REFERENCES prefeituras(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: mapa_riscos_itens
CREATE TABLE IF NOT EXISTS mapa_riscos_itens (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  mapa_riscos_id uuid REFERENCES mapa_riscos(id) ON DELETE CASCADE,
  categoria text NOT NULL,
  descricao text NOT NULL,
  causa_provavel text,
  consequencia text,
  probabilidade text NOT NULL,
  impacto text NOT NULL,
  nivel text NOT NULL,
  mitigacao text NOT NULL,
  plano_contingencia text,
  responsavel text
);

-- Tabela: termos_referencia
CREATE TABLE IF NOT EXISTS termos_referencia (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero_tr text,
  etp_id uuid REFERENCES etp(id),
  objeto text NOT NULL,
  status text DEFAULT 'Rascunho' CHECK (status IN ('Rascunho', 'Em Elaboração', 'Em Revisão', 'Concluído', 'Publicado')),
  tipo text,
  valor_estimado numeric DEFAULT 0,
  secretaria_id uuid REFERENCES secretarias(id),
  prefeitura_id uuid REFERENCES prefeituras(id),
  dados_json jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: editais
CREATE TABLE IF NOT EXISTS editais (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero_edital text,
  tr_id uuid REFERENCES termos_referencia(id),
  objeto text NOT NULL,
  status text DEFAULT 'Rascunho' CHECK (status IN ('Rascunho', 'Em Elaboração', 'Em Revisão', 'Concluído', 'Publicado')),
  modalidade text,
  tipo_licitacao text,
  valor_estimado numeric DEFAULT 0,
  data_publicacao timestamp with time zone,
  prefeitura_id uuid REFERENCES prefeituras(id),
  dados_json jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: system_config
CREATE TABLE IF NOT EXISTS system_config (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  chave text NOT NULL,
  valor text,
  prefeitura_id uuid REFERENCES prefeituras(id),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(chave, prefeitura_id)
);

-- ============================================================
-- 3. ROW LEVEL SECURITY (Permissiva para dev)
-- ============================================================

ALTER TABLE mapa_riscos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapa_riscos_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE termos_referencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE editais ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Policies permissivas (ajustar para produção)
CREATE POLICY "Enable all for authenticated" ON mapa_riscos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON mapa_riscos_itens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON termos_referencia FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON editais FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON system_config FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MIGRATION COMPLETA!
-- ============================================================
