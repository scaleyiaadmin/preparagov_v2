-- ==============================================================================
-- SCRIPT DE CORREÇÃO DE POLÍTICAS DE SEGURANÇA (RLS) - DFD
-- ==============================================================================
-- Copie TODO este conteúdo e execute no SQL Editor do Supabase.

-- 1. Habilitar RLS nas tabelas (caso não esteja)
ALTER TABLE dfd ENABLE ROW LEVEL SECURITY;
ALTER TABLE dfd_items ENABLE ROW LEVEL SECURITY;

-- 2. Limpar todas as políticas antigas para evitar conflitos
-- (Ignorar erros se a política não existir)
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON dfd;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON dfd;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON dfd_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON dfd_items;
DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON dfd;
DROP POLICY IF EXISTS "Permitir tudo para autenticados itens" ON dfd_items;

-- 3. Criar Políticas Definitivas para a Tabela DFD
-- Permite que usuários logados façam TUDO (Select, Insert, Update, Delete)
CREATE POLICY "RLS_DFD_Full_Access"
ON dfd
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4. Criar Políticas Definitivas para a Tabela DFD_ITEMS
-- Permite que usuários logados façam TUDO (Select, Insert, Update, Delete)
CREATE POLICY "RLS_DFD_Items_Full_Access"
ON dfd_items
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 5. Confirmação (Opcional, apenas para ver se rodou)
SELECT 'Políticas RLS atualizadas com sucesso!' as status;
