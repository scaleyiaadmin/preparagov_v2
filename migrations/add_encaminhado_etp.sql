-- Adiciona a coluna encaminhado_etp na tabela dfd
ALTER TABLE dfd ADD COLUMN IF NOT EXISTS encaminhado_etp boolean DEFAULT false;
