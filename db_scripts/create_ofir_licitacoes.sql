-- Script para criação da Entidade Ofir Licitações e seu Usuário Principal
-- Execute este script no SQL Editor do seu console Supabase

-- Gerar UUIDs para os novos registros
DO $$
DECLARE
    new_prefeitura_id UUID := gen_random_uuid();
    new_user_id UUID := gen_random_uuid(); 
    -- Se o sistema usa Supabase Auth, você precisará criar o usuário no Auth UI e pegar o ID dele para colocar abaixo.
    -- Se ele for um usuário apenas na tabela usuarios_acesso (login customizado), o ID acima funciona.
BEGIN
    -- 1. Inserir a Entidade (Prefeitura)
    INSERT INTO prefeituras (
        id, 
        nome, 
        cnpj, 
        uf, 
        municipio, 
        status, 
        created_at
    ) VALUES (
        new_prefeitura_id,
        'Ofir Licitações',
        '217867210001-49',
        'SP',
        'Vinhedo',
        'ativa',
        NOW()
    )
    ON CONFLICT (cnpj) DO UPDATE SET
        nome = EXCLUDED.nome;

    -- 2. Inserir o Usuário Administrador
    INSERT INTO usuarios_acesso (
        id,
        nome,
        email,
        senha, 
        tipo_perfil,
        prefeitura_id,
        status,
        cargo_funcional,
        modulos_acesso,
        created_at
    ) VALUES (
        new_user_id,
        'Ieda Lucia Silva',
        'contato@ofirlicitacoes.com.br',
        '123456', 
        'admin',
        new_prefeitura_id,
        'ativo',
        'Assessora',
        '{
            "dashboard": true,
            "dfd": true,
            "pca": true,
            "etp": true,
            "mapaRiscos": true,
            "cronograma": true,
            "termoReferencia": true,
            "edital": true,
            "perfil": true,
            "integracoes": true,
            "gerenciarUsuarios": true,
            "gestaoPrefeiturasAcesso": false
        }'::jsonb,
        NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
        nome = EXCLUDED.nome,
        senha = EXCLUDED.senha,
        tipo_perfil = EXCLUDED.tipo_perfil,
        prefeitura_id = EXCLUDED.prefeitura_id,
        status = EXCLUDED.status,
        cargo_funcional = EXCLUDED.cargo_funcional;

    RAISE NOTICE 'Dados inseridos com sucesso!';
    RAISE NOTICE 'Prefeitura ID: %', new_prefeitura_id;
    RAISE NOTICE 'Usuário ID: %', new_user_id;

END $$;
