import { createClient } from '@supabase/supabase-js';

const supabaseReferenceUrl = import.meta.env.VITE_SUPABASE_REFERENCE_URL || '';
const supabaseReferenceAnonKey = import.meta.env.VITE_SUPABASE_REFERENCE_ANON_KEY || '';

if (!supabaseReferenceUrl || !supabaseReferenceAnonKey) {
    console.warn('Variáveis VITE_SUPABASE_REFERENCE_URL/KEY faltando em supabaseReference. Integrações externas podem falhar.');
}

export const supabaseReference = createClient(
    supabaseReferenceUrl || 'https://placeholder.supabase.co',
    supabaseReferenceAnonKey || 'placeholder'
);
