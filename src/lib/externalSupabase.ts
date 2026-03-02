import { createClient } from '@supabase/supabase-js';

// Configurações do banco de dados de referência externo
const supabaseUrl = import.meta.env.VITE_SUPABASE_REFERENCE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_REFERENCE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Variáveis VITE_SUPABASE_REFERENCE_URL/KEY faltando. Integrações externas podem falhar.');
}

export const externalSupabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);
