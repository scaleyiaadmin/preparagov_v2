const fs = require('fs');

let code = fs.readFileSync('src/services/referenciaService.ts', 'utf8');

const helper = `async function fetchPaginated(
    table: string,
    queryBuilder: (query: any) => any,
    maxLimit: number = 10000
): Promise<any[]> {
    const allData: any[] = [];
    let page = 0;
    const pageSize = 1000;

    while (allData.length < maxLimit) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        let query = externalSupabase.from(table).select('*');
        query = queryBuilder(query).range(from, to);

        const { data, error } = await query;
        if (error) throw error;
        if (!data || data.length === 0) break;

        allData.push(...data);
        page++;

        if (data.length < pageSize) break;
    }

    return allData.slice(0, maxLimit);
}

export const referenciaService = {`;

code = code.replace('export const referenciaService = {', helper);

code = code.replace(/const \{\s*data\s*,\s*error\s*\}\s*=\s*await externalSupabase[\s\S]*?\.from\('([^']+)'\)[\s\S]*?\.select\('\*'\)[\s\S]*?\.or\(`([^`]+)`\)[\s\S]*?\.limit\(\d+\);[\s\S]*?if\s*\(error\)\s*throw error;/g, 
"const data = await fetchPaginated('$1', q => q.or(`$2`));");

code = code.replace(/const \{\s*data\s*,\s*error\s*\}\s*=\s*await externalSupabase[\s\S]*?\.from\('([^']+)'\)[\s\S]*?\.select\('\*'\)[\s\S]*?\.ilike\('([^']+)',\s*`([^`]+)`\)[\s\S]*?\.limit\(\d+\);[\s\S]*?if\s*\(error\)\s*throw error;/g, 
"const data = await fetchPaginated('$1', q => q.ilike('$2', `$3`));");

const nfeOld = `        let query = externalSupabase
            .from('referencia_nfe')
            .select('*')
            .ilike('item_nome', \`%\${term}%\`);

        if (uf) query = query.eq('uf', uf.toUpperCase());

        const { data, error } = await query.limit(1000); 

        if (error) throw error;`;

const nfeNew = `        const data = await fetchPaginated('referencia_nfe', q => {
            let mq = q.ilike('item_nome', \`%\${term}%\`);
            if (uf) mq = mq.eq('uf', uf.toUpperCase());
            return mq;
        });`;

code = code.replace(nfeOld, nfeNew);

const catmatOld = `        const { data, error } = await externalSupabase
            .from('referencia_pncp') // Usando PNCP como fallback enquanto a tabela oficial catmat é carregada, ou mudar para a correta se existir
            .select('*')
            .ilike('item_nome', \`%\${term}%\`)
            .limit(10000); 

        if (error) throw error;`;

const catmatNew = `        const data = await fetchPaginated('referencia_pncp', q => q.ilike('item_nome', \`%\${term}%\`)); // Usando PNCP como fallback enquanto a tabela oficial catmat é carregada, ou mudar para a correta se existir`;
code = code.replace(catmatOld, catmatNew);

// Fallbacks para as que não pegaram por conta de comentários etc (PNCP, CMED, etc)
const pncpOld = `        const { data, error } = await externalSupabase
            .from('referencia_pncp')
            .select('*')
            .or(\`item_nome.ilike.%\${processedTerm}%,municipio.ilike.%\${processedTerm}%\`)
            .limit(10000); 

        if (error) throw error;`;
const pncpNew = `        const data = await fetchPaginated('referencia_pncp', q => q.or(\`item_nome.ilike.%\${processedTerm}%,municipio.ilike.%\${processedTerm}%\`));`;
code = code.replace(pncpOld, pncpNew);


const cmedOld = `        const { data, error } = await externalSupabase
            .from('referencia_cmed')
            .select('*')
            .or(\`produto.ilike.%\${term}%,substancia.ilike.%\${term}%\`)
            .limit(10000); 

        if (error) throw error;`;
const cmedNew = `        const data = await fetchPaginated('referencia_cmed', q => q.or(\`produto.ilike.%\${term}%,substancia.ilike.%\${term}%\`));`;
code = code.replace(cmedOld, cmedNew);

// E também substituir o if (error) throw error se ficar solto a mais
// e usar (data || []) com (data) já que agora o fetchPaginated devolve sempre array.
code = code.replace(/\(data \|\| \[\]\)/g, "data");

fs.writeFileSync('src/services/referenciaService.ts', code);
console.log('Done refactoring');
