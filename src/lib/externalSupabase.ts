import { createClient } from '@supabase/supabase-js';

// Configurações do banco de dados de referência externo
// Fixado no código para evitar falhas por misconfiguration na Vercel/Ambiente.
// Este banco é um repositório universal de itens aberto para o SaaS, por isso é seguro manter a chave Anon exposta no build.
const supabaseUrl = 'https://qwlbclurkhfnsztopeoj.supabase.co';
const supabaseAnonKey = 'sb_publishable_5ATbbplIn-PbSyuB0gU87A_m2lawRWM';

export const externalSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
    }
  }
});
