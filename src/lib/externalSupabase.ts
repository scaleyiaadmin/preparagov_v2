// Configurações do banco de dados de referência externo
// Usando fetch puro para evitar interferência de JWT do sistema principal.
const EXTERNAL_URL = 'https://qwlbclurkhfnsztopeoj.supabase.co';
const EXTERNAL_KEY = 'sb_publishable_5ATbbplIn-PbSyuB0gU87A_m2lawRWM';

const defaultHeaders = {
  'apikey': EXTERNAL_KEY,
  'Authorization': `Bearer ${EXTERNAL_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

/**
 * Wrapper minimalista que simula a interface do Supabase client
 * usando fetch puro para garantir isolamento total de sessão.
 */
function createExternalClient() {
  return {
    from(table: string) {
      let url = `${EXTERNAL_URL}/rest/v1/${table}`;
      const params: string[] = [];
      let selectColumns = '*';
      let rangeHeader: string | null = null;

      const builder: any = {
        select(columns: string = '*') {
          selectColumns = columns;
          params.push(`select=${encodeURIComponent(columns)}`);
          return builder;
        },
        eq(column: string, value: any) {
          params.push(`${column}=eq.${encodeURIComponent(value)}`);
          return builder;
        },
        gt(column: string, value: any) {
          params.push(`${column}=gt.${encodeURIComponent(value)}`);
          return builder;
        },
        ilike(column: string, pattern: string) {
          params.push(`${column}=ilike.${encodeURIComponent(pattern)}`);
          return builder;
        },
        or(filters: string) {
          params.push(`or=(${encodeURIComponent(filters)})`);
          return builder;
        },
        range(from: number, to: number) {
          rangeHeader = `${from}-${to}`;
          return builder;
        },
        limit(count: number) {
          params.push(`limit=${count}`);
          return builder;
        },
        order(column: string, opts?: { ascending?: boolean }) {
          const dir = opts?.ascending ? 'asc' : 'desc';
          params.push(`order=${column}.${dir}`);
          return builder;
        },
        async then(resolve: any, reject?: any) {
          try {
            const result = await builder._execute();
            resolve(result);
          } catch (e) {
            if (reject) reject(e);
            else resolve({ data: null, error: e });
          }
        },
        async _execute() {
          const queryStr = params.length > 0 ? `?${params.join('&')}` : '';
          const headers: Record<string, string> = { ...defaultHeaders };
          if (rangeHeader) {
            headers['Range'] = rangeHeader;
          }
          try {
            const response = await fetch(`${url}${queryStr}`, { headers });
            if (!response.ok) {
              const errorBody = await response.text();
              return { data: null, error: { message: errorBody, status: response.status } };
            }
            const data = await response.json();
            return { data, error: null };
          } catch (err: any) {
            return { data: null, error: { message: err.message } };
          }
        }
      };
      return builder;
    }
  };
}

export const externalSupabase = createExternalClient();

