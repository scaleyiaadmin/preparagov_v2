import { createClient } from '@supabase/supabase-js';

const supabaseReferenceUrl = import.meta.env.VITE_SUPABASE_REFERENCE_URL;
const supabaseReferenceAnonKey = import.meta.env.VITE_SUPABASE_REFERENCE_ANON_KEY;

if (!supabaseReferenceUrl || !supabaseReferenceAnonKey) {
    console.error('Supabase Reference URL ou Anon Key não encontradas no arquivo .env');
}

export const supabaseReference = createClient(supabaseReferenceUrl, supabaseReferenceAnonKey);
