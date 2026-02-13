-- ==============================================================================
-- SCRIPT DE CORREÇÃO URGENTE - REMOÇÃO DE FOREIGN KEY
-- ==============================================================================
-- O erro ocorre porque o usuário logado está na tabela 'usuarios_acesso' 
-- mas o banco espera que ele esteja na tabela interna 'auth.users'.
-- Para corrigir, vamos remover a restrição de chave estrangeira.

-- 1. Remover a restrição que liga created_by a auth.users
ALTER TABLE dfd DROP CONSTRAINT IF EXISTS dfd_created_by_fkey;

-- 2. (Opcional) Se houver restrição similar em outras tabelas, removemos também
ALTER TABLE etp DROP CONSTRAINT IF EXISTS etp_created_by_fkey;
ALTER TABLE pca_config DROP CONSTRAINT IF EXISTS pca_config_publicado_por_fkey;

-- 3. Confirmação
SELECT 'Restrições de chave estrangeira removidas. Inserção liberada!' as status;
