-- ==============================================================================
-- SCRIPT DE CORREÇÃO "NUCLEAR" (PERMISSIVA) - RLS DFD
-- ==============================================================================
-- Este script libera temporariamente o acesso TOTAL às tabelas DFD para fins de debug.
-- Se funcionar após isso, saberemos que o problema é o "token" de usuário não chegando no banco.

-- 1. Habilitar RLS (para garantir que estamos controlando)
ALTER TABLE dfd ENABLE ROW LEVEL SECURITY;
ALTER TABLE dfd_items ENABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas anteriores (inclusive as que criamos antes)
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON dfd;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON dfd;
DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON dfd;
DROP POLICY IF EXISTS "RLS_DFD_Full_Access" ON dfd;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON dfd_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON dfd_items;
DROP POLICY IF EXISTS "Permitir tudo para autenticados itens" ON dfd_items;
DROP POLICY IF EXISTS "RLS_DFD_Items_Full_Access" ON dfd_items;

-- 3. Criar Política PERMISSIVA (Verdadeiro para TODOS)
-- Atenção: Isso permite que até usuários não logados (anon) insiram, se tiverem acesso à API.
-- Usar apenas para confirmar a correção do erro.

CREATE POLICY "Allow_All_Debug_DFD"
ON dfd
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow_All_Debug_DFD_Items"
ON dfd_items
FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Confirmação
SELECT 'Políticas RLS PERMISSIVAS aplicadas!' as status;
