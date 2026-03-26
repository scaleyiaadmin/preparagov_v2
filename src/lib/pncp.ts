import { externalSupabase as supabase } from './externalSupabase';

// URLs base pré-calculadas (evita import.meta.env.DEV em cada chamada)
const IS_DEV = import.meta.env.DEV;
const BASE_URL_SEARCH = IS_DEV ? '/api/pncp_search' : 'https://pncp.gov.br/api/search';
const BASE_URL_PNCP = IS_DEV ? '/api/pncp' : 'https://pncp.gov.br/api/pncp';
const BASE_URL_CONSULTA = IS_DEV ? '/api/consulta' : 'https://pncp.gov.br/api/consulta';

export interface PNCPItem {
    id: string;
    nome: string;
    unidade: string;
    fonte: string;
    preco: number;
    data: string;
    orgao: string;
    modalidade?: string;
    registroPreco?: string;        // "Sim" | "Não"
    idContratacaoPNCP?: string;    // sequencialCompra ou id do item
    cnpj?: string;                 // CNPJ do órgão
    nomeFornecedor?: string;       // razão social do fornecedor vencedor
    porteFornecedor?: string;      // porte da empresa (ME, EPP, etc.)
    cidadeUf?: string;
    ufOrigem?: string;
    metadata?: string;
    link?: string;
    score?: number;
    descricao?: string;
    // Novos campos detalhados
    unidadeCompradora?: string;
    amparoLegal?: string;
    tipoEdital?: string;
    modoDisputa?: string;
    fonteOrcamentaria?: string;
    situacaoCompra?: string;
    dataInicioPropostas?: string;
    dataFimPropostas?: string;
    objetoCompra?: string;
}

/**
 * Paginação interna para contornar o limite do Supabase (1000 linhas/request).
 */
async function supabasePaginate(
    filterFn: (q: any) => any,
    maxLimit: number,
    pageSize = 1000
): Promise<any[]> {
    const allData: any[] = [];
    let page = 0;
    while (allData.length < maxLimit) {
        const from = page * pageSize;
        const to = from + pageSize - 1;
        let q = supabase.from('referencia_pncp').select('*');
        q = filterFn(q);
        const { data, error } = await q.range(from, to);
        if (error || !data || data.length === 0) break;
        allData.push(...data);
        page++;
        if (data.length < pageSize) break;
        if (allData.length >= maxLimit) break;
    }
    return allData.slice(0, maxLimit);
}

/**
 * Busca itens localmente na tabela sincronizada do PNCP (Muito Rápido)
 */
export async function searchLocalPNCP(termo: string, uf?: string, limit = 50000): Promise<PNCPItem[]> {
    if (!termo || termo.length < 3) return [];

    try {
        const data = await supabasePaginate(
            (q) => {
                let query = q
                    .ilike('item_nome', `%${termo}%`)
                    .gt('valor_unitario', 0);
                if (uf) {
                    query = query.eq('uf', uf.toUpperCase());
                }
                return query;
            },
            limit
        );

        if (!data) {
            console.error("[PNCP Local] Sem dados retornados.");
            return [];
        }

        return data.map(item => {
            const cnpj = item.orgao_cnpj?.replace(/\D/g, '');
            const ano = item.data_publicacao ? new Date(item.data_publicacao).getFullYear() : new Date().getFullYear();
            const seq = item.sequencial_compra;
            const link = (cnpj && seq) ? `https://pncp.gov.br/app/editais/${cnpj}/${ano}/${seq}` : undefined;

            return {
                id: `local-pncp-${item.id}`,
                nome: item.item_nome,
                unidade: item.unidade || 'un',
                fonte: 'PNCP (Local)',
                preco: parseFloat(item.valor_unitario) || 0,
                data: item.data_publicacao ? new Date(item.data_publicacao).toLocaleDateString('pt-BR') : "-",
                orgao: item.orgao_nome || "Órgão desconhecido",
                modalidade: item.modalidade || "Não informada",
                registroPreco: item.registro_preco === true || item.registro_preco === 'Sim' ? 'Sim' : (item.registro_preco === false || item.registro_preco === 'Não' ? 'Não' : undefined),
                idContratacaoPNCP: item.sequencial_compra ? String(item.sequencial_compra) : undefined,
                cnpj: item.orgao_cnpj,
                nomeFornecedor: item.fornecedor_nome || undefined,
                porteFornecedor: item.porte_fornecedor || undefined,
                cidadeUf: item.municipio && item.uf ? `${item.municipio}/${item.uf}` : item.uf || "Brasil",
                ufOrigem: item.uf,
                metadata: "Base de Dados Local",
                link,
                unidadeCompradora: item.orgao_nome,
                situacaoCompra: "Concluída/Encerrada", // Base de referencia local só puxa encerrados
                objetoCompra: item.item_descricao || item.item_nome,
                modoDisputa: item.modalidade,
                dataInicioPropostas: item.data_publicacao ? new Date(item.data_publicacao).toLocaleString('pt-BR') : undefined,
                tipoEdital: item.modalidade
            };
        });
    } catch (err) {
        console.error("[PNCP Local] Erro inesperado:", err);
        return [];
    }
}

/**
 * Busca itens no PNCP seguindo uma estratégia híbrida:
 * 1. Busca primeiro no banco local (instantâneo).
 * 2. Se trouxer poucos resultados, busca na API do governo (lento mas atualizado).
 */
export async function searchPNCPItems(termo: string, fastMode = false, uf?: string, limit = 50000): Promise<PNCPItem[]> {
    if (!termo || termo.length < 3) return [];

    try {
        console.log(`[PNCP] Iniciando busca híbrida para: "${termo}" (UF: ${uf || 'Brasil'})`);

        // 1. Tentar busca local primeiro
        const localResults = await searchLocalPNCP(termo, uf, limit);

        if (fastMode && localResults.length > 0) {
            console.log(`[PNCP] Busca rápida finalizada no Banco Local: ${localResults.length} itens.`);
            return localResults;
        }

        const threshold = 50;
        if (localResults.length >= threshold) {
            console.log(`[PNCP] Banco Local suficiente: ${localResults.length} itens.`);
            return localResults;
        }

        console.log(`[PNCP] Banco local vazio ou insuficiente. Acionando API do Governo...`);

        // 2. Fallback para API
        const [apiItemResults, apiContractResults] = await Promise.all([
            searchPNCPItemsDirectlyAPI(termo, uf),
            searchPNCPItemsAPI(termo, uf)
        ]);

        const apiResults = [...apiItemResults, ...apiContractResults];
        const combined = [...localResults];

        apiResults.forEach(apiItem => {
            const isDuplicate = combined.some(localItem =>
                localItem.orgao === apiItem.orgao &&
                Math.abs(localItem.preco - apiItem.preco) < 0.05 &&
                (localItem.nome.toLowerCase().includes(apiItem.nome.toLowerCase()) ||
                    apiItem.nome.toLowerCase().includes(localItem.nome.toLowerCase()))
            );

            if (!isDuplicate) {
                combined.push(apiItem);
            }
        });

        console.log(`[PNCP] Busca finalizada com API: ${combined.length} itens totais.`);
        return combined;
    } catch (error) {
        console.error("Erro geral PNCP:", error);
        return [];
    }
}

/**
 * Helper para fetch com timeout e headers de navegador
 */
async function fetchWithTimeout(url: string, options: any = {}, timeout = 15000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const defaultHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...(options.headers || {})
            },
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
}

/**
 * Busca itens na API oficial do PNCP através de contratos
 */
async function searchPNCPItemsAPI(termo: string, uf?: string): Promise<PNCPItem[]> {
    try {
        const hoje = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setDate(hoje.getDate() - 180);

        const formatDate = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');
        const baseUrlSearch = BASE_URL_SEARCH;

        const allContratos: any[] = [];
        // Busca apenas a 1ª página com no máximo 50 contratos
        const paginasParaBuscar = [1];

        for (const pagina of paginasParaBuscar) {
            // SEM &status=encerradas para trazer tudo (Em Andamento + Concluídas)
            const searchUrl = `${baseUrlSearch}/?q=${encodeURIComponent(termo)}&tipos_documento=edital&ordenacao=-data&pagina=${pagina}&tam_pagina=50`;

            try {
                const res = await fetchWithTimeout(searchUrl, {}, 6000);
                if (!res.ok) break;
                const json = await res.json();
                const contractsOnPage = json.items || [];
                if (contractsOnPage.length === 0) break;
                allContratos.push(...contractsOnPage);
                if (contractsOnPage.length < 500) break;
            } catch (err) {
                break;
            }
        }

        if (allContratos.length === 0) return [];

        const uniqueContratos = Array.from(new Map(allContratos.map((c: any) => [`${c.orgao_cnpj}-${c.ano}-${c.numero_sequencial}`, c])).values());
        // Limita radicalmente a 25 contratos para não afogar a rede (25 requisições paralelas é muito rápido)
        const topContratos = uniqueContratos.slice(0, 25);
        const baseUrlPncp = BASE_URL_PNCP;

        const stopwords = ["de", "para", "com", "tipo", "marca", "unidade"];
        const palavrasTermo = termo.toLowerCase().split(' ').filter(p => p.length > 2 && !stopwords.includes(p));

        const allItems: PNCPItem[] = [];
        const BATCH_SIZE = 50;

        for (let i = 0; i < topContratos.length; i += BATCH_SIZE) {
            if (allItems.length >= 2000) break;

            const batch = topContratos.slice(i, i + BATCH_SIZE);
            const batchPromises = batch.map(async (contrato: any) => {
                try {
                    const seq = contrato.numero_sequencial;
                    const itemsUrl = `${baseUrlPncp}/v1/orgaos/${contrato.orgao_cnpj}/compras/${contrato.ano}/${seq}/itens`;

                    const resItems = await fetchWithTimeout(itemsUrl, {}, 5000);
                    if (!resItems.ok) return [];

                    const itemsData = await resItems.json();

                    return itemsData
                        .filter((item: any) => {
                            const desc = (item.descricao || item.materialOuServicoDescricao || "").toLowerCase();
                            const preco = item.valorUnitarioHomologado || item.valorUnitarioEstimado || item.precoUnitario || 0;
                            const matchFlexivel = palavrasTermo.length === 0 || palavrasTermo.some(p => desc.includes(p));
                            return matchFlexivel && (preco > 0 || item.valorTotal > 0);
                        })
                        .map((item: any) => {
                            const cnpj = contrato.orgao_cnpj?.replace(/\D/g, '');
                            const link = (cnpj && seq) ? `https://pncp.gov.br/app/editais/${cnpj}/${contrato.ano}/${seq}` : undefined;

                            const sNome = (contrato.situacao_compra_nome || "").toLowerCase();
                            const situacaoFinal = (sNome.includes('encerrada') || sNome.includes('concluí') || sNome.includes('homologada'))
                                ? "Concluída/Encerrada"
                                : "Em andamento";

                            return {
                                id: `pncp-${item.id || Math.random()}`,
                                nome: (item.descricao || item.materialOuServicoDescricao || "Item sem nome").trim(),
                                unidade: item.unidadeMedida || "unid",
                                fonte: "PNCP",
                                preco: item.valorUnitarioHomologado || item.valorUnitarioEstimado || item.precoUnitario || (item.quantidade > 0 ? (item.valorTotal / item.quantidade) : item.valorTotal) || 0,
                                data: contrato.data_publicacao ? new Date(contrato.data_publicacao).toLocaleDateString('pt-BR') : "-",
                                orgao: contrato.orgao_nome || "Desconhecido",
                                modalidade: contrato.modalidade_nome || "Licitação",
                                registroPreco: contrato.srp === true ? 'Sim' : 'Não',
                                idContratacaoPNCP: String(seq),
                                cnpj: contrato.orgao_cnpj,
                                nomeFornecedor: item.nomeRazaoSocialFornecedor || item.fornecedor?.razaoSocial,
                                porteFornecedor: item.porteFornecedor,
                                ufOrigem: contrato.uf,
                                link,
                                unidadeCompradora: contrato.unidade_nome,
                                amparoLegal: contrato.amparo_legal_nome,
                                tipoEdital: contrato.tipo_nome,
                                modoDisputa: contrato.modo_disputa_nome,
                                situacaoCompra: situacaoFinal,
                                dataInicioPropostas: contrato.data_abertura_proposta ? new Date(contrato.data_abertura_proposta).toLocaleString('pt-BR') : undefined,
                                dataFimPropostas: contrato.data_encerramento_proposta ? new Date(contrato.data_encerramento_proposta).toLocaleString('pt-BR') : undefined,
                                objetoCompra: contrato.objeto_compra
                            };
                        });
                } catch (err) {
                    return [];
                }
            });

            const batchResults = await Promise.all(batchPromises);
            allItems.push(...batchResults.flat().filter(item => item.preco > 0));
        }

        return allItems;
    } catch (error) {
        console.error("Erro PNCP API:", error);
        return [];
    }
}

/**
 * Busca itens DIRETAMENTE na API do PNCP pelo endpoint de resumo de itens.
 */
async function searchPNCPItemsDirectlyAPI(termo: string, uf?: string): Promise<PNCPItem[]> {
    try {
        const hoje = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setDate(hoje.getDate() - 180);

        const dataInicial = sixMonthsAgo.toISOString().split('T')[0].replace(/-/g, '').slice(0, 8);
        const dataFinal = hoje.toISOString().split('T')[0].replace(/-/g, '').slice(0, 8);

        const baseUrlConsulta = BASE_URL_CONSULTA;
        const modalidadesPrincipais = [6, 8]; // Pregão e Dispensa apenas

        const directRequests = modalidadesPrincipais.map(async (mod) => {
            try {
                const allPageResults: any[] = [];
                // Busca no máximo 1 página para evitar lentidão extrema na API nova
                for (let pagina = 1; pagina <= 1; pagina++) {
                    let url = `${baseUrlConsulta}/v1/contratacoes/publicacao?dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${pagina}&tamanhoPagina=200&termo=${encodeURIComponent(termo)}&codigoModalidadeContratacao=${mod}`;
                    if (uf && uf.trim().length === 2) url += `&ufSigla=${uf.toUpperCase()}`;

                    const response = await fetchWithTimeout(url, {}, 6000);
                    if (!response.ok) break;

                    const json = await response.json();
                    const pageData = json.data || [];
                    allPageResults.push(...pageData);
                    if (pageData.length < 500) break;
                }

                return allPageResults.map((item: any) => {
                    const cnpj = item.orgaoEntidade?.cnpj?.replace(/\D/g, '');
                    const link = (cnpj && item.sequencialCompra) ? `https://pncp.gov.br/app/editais/${cnpj}/${item.anoCompra}/${item.sequencialCompra}` : undefined;

                    const sNome = (item.situacaoCompraNome || "").toLowerCase();
                    const situacaoFinal = (sNome.includes('encerrada') || sNome.includes('concluí') || sNome.includes('homologada'))
                        ? "Concluída/Encerrada"
                        : "Em andamento";

                    return {
                        id: `pncp-pub-${item.anoCompra}-${item.sequencialCompra}-${Math.random().toString(36).substr(2, 5)}`,
                        nome: (item.objetoCompra || item.descricao || "Item sem nome").trim(),
                        unidade: "un",
                        fonte: "PNCP",
                        preco: item.valorTotalEstimado || item.valorTotalHomologado || 0,
                        data: item.dataPublicacaoPncp ? new Date(item.dataPublicacaoPncp).toLocaleDateString('pt-BR') : "-",
                        orgao: item.orgaoEntidade?.razaoSocial || "Órgão desconhecido",
                        modalidade: item.modalidadeNome || "Licitação",
                        registroPreco: item.srp === true ? 'Sim' : 'Não',
                        idContratacaoPNCP: item.sequencialCompra ? String(item.sequencialCompra) : undefined,
                        cidadeUf: (item.unidadeOrgao?.municipioNome && item.unidadeOrgao?.ufSigla) ? `${item.unidadeOrgao.municipioNome}/${item.unidadeOrgao.ufSigla}` : (item.orgaoEntidade?.ufSigla || "Brasil"),
                        ufOrigem: item.unidadeOrgao?.ufSigla || item.orgaoEntidade?.ufSigla,
                        metadata: "Busca Direta PNCP",
                        link,
                        unidadeCompradora: item.unidadeOrgao?.nomeUnidade,
                        amparoLegal: item.amparoLegalNome,
                        tipoEdital: item.tipoNome,
                        modoDisputa: item.modoDisputaNome,
                        situacaoCompra: situacaoFinal,
                        dataInicioPropostas: item.dataAberturaProposta ? new Date(item.dataAberturaProposta).toLocaleString('pt-BR') : undefined,
                        dataFimPropostas: item.dataEncerramentoProposta ? new Date(item.dataEncerramentoProposta).toLocaleString('pt-BR') : undefined,
                        objetoCompra: item.objetoCompra
                    };
                });
            } catch (err) {
                return [];
            }
        });

        const results = await Promise.all(directRequests);
        return results.flat().filter((i: PNCPItem) => i.preco > 0);
    } catch (error) {
        return [];
    }
}
