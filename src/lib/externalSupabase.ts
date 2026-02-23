import { createClient } from '@supabase/supabase-js';

// Configurações do banco de dados de referência externo
const supabaseUrl = 'https://qwlbclurkhfnsztopeoj.supabase.co';
const supabaseAnonKey = 'sb_publishable_5ATbbplIn-PbSyuB0gU87A_m2lawRWM';

export const externalSupabase = createClient(supabaseUrl, supabaseAnonKey);
