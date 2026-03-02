const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const { data, error } = await supabase
        .from('etp')
        .select('objeto, descricao_sucinta')
        .limit(1);

    if (error) {
        console.error("Colunas não existem:", error.message);
    } else {
        console.log("Colunas existem! Dados:", data);
    }
}

checkColumns();
