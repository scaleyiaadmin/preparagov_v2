import { externalSupabase as supabase } from './externalSupabase';
import { PNCPItem } from './pncp';

/**
 * Busca paginada no Supabase para contornar o limite de 1000 linhas por query.
 * Busca até `maxLimit` itens no total, buscando em blocos de `pageSize`.
 * @param columns - Colunas a selecionar (padrão: '*'). Especificar reduz payload.
 */
async function supabasePaginatedSearch(
    tableName: string,
    filterFn: (query: any) => any,
    maxLimit: number,
    pageSize = 1000,
    columns = '*'
): Promise<any[]> {
    const allData: any[] = [];
    let page = 0;

    while (allData.length < maxLimit) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        let query = supabase.from(tableName).select(columns);
        query = filterFn(query);
        query = query.range(from, to);

        const { data, error } = await query;

        if (error || !data || data.length === 0) break;

        allData.push(...data);
        page++;

        // Se a página veio com menos itens do que pageSize, não tem mais dados
        if (data.length < pageSize) break;

        // Se já temos o suficiente, para
        if (allData.length >= maxLimit) break;
    }

    return allData.slice(0, maxLimit);
}

export async function searchReferences(termo: string, sources: { catser: boolean; sinapi: boolean; cmed: boolean; bps?: boolean; bds?: boolean; setop?: boolean; simpro?: boolean; sigtap?: boolean; nfe?: boolean; ceasa?: boolean }, uf?: string, limit = 50000): Promise<PNCPItem[]> {
    if (!termo || termo.length < 3) return [];

    const results: PNCPItem[] = [];
    const searchPromises: Promise<void>[] = [];

    if (sources.catser) {
        searchPromises.push(
            (async () => {
                const data = await supabasePaginatedSearch(
                    'referencia_catser',
                    (q) => q.ilike('descricao', `%${termo}%`),
                    limit,
                    1000,
                    'id, descricao, codigo, grupo, classe'
                );

                if (data) {
                    data.forEach(item => {
                        results.push({
                            id: `catser-${item.id}`,
                            nome: item.descricao,
                            unidade: 'UN',
                            fonte: 'CATSER',
                            preco: 0, // CATSER não tem preço fixo por item na planilha base
                            data: 'Referência',
                            orgao: `Catálogo de Serviços (Cod: ${item.codigo})`,
                            metadata: `${item.grupo} / ${item.classe}`
                        });
                    });
                }
            })()
        );
    }

    if (sources.sinapi) {
        searchPromises.push(
            (async () => {
                const data = await supabasePaginatedSearch(
                    'referencia_sinapi',
                    (q) => q.ilike('descricao', `%${termo}%`).gt('preco_base', 0),
                    limit,
                    1000,
                    'id, descricao, unidade, preco_base, codigo'
                );

                if (data) {
                    data.forEach(item => {
                        results.push({
                            id: `sinapi-${item.id}`,
                            nome: item.descricao,
                            unidade: item.unidade || 'UN',
                            fonte: 'SINAPI',
                            preco: item.preco_base || 0,
                            data: 'Dez/2025',
                            orgao: `SINAPI (Cod: ${item.codigo})`,
                            metadata: 'Preço de Referência'
                        });
                    });
                }
            })()
        );
    }

    if (sources.cmed) {
        searchPromises.push(
            (async () => {
                // CMED usa OR, então precisamos de paginação manual com range
                const allData: any[] = [];
                let page = 0;
                const pageSize = 1000;

                while (allData.length < limit) {
                    const from = page * pageSize;
                    const to = from + pageSize - 1;

                    const { data, error } = await supabase
                        .from('referencia_cmed')
                        .select('id, produto, substancia, apresentacao, pf, pmvg, ean')
                        .or(`produto.ilike.%${termo}%,substancia.ilike.%${termo}%`)
                        .range(from, to);

                    if (error || !data || data.length === 0) break;
                    allData.push(...data);
                    page++;
                    if (data.length < pageSize) break;
                    if (allData.length >= limit) break;
                }

                allData.slice(0, limit).forEach(item => {
                    let labNome = "";

                    // 1. Extrair laboratório da apresentação (inserido via fallback)
                    let apresReal = item.apresentacao || "";
                    if (apresReal.includes(" • LAB: ")) {
                        const parts = apresReal.split(" • LAB: ");
                        apresReal = parts[0].trim();
                        labNome = parts[1].trim();
                    }

                    // 2. Montar o nome limpo: Produto (Marca) - Substância - Apresentação
                    let prodReal = (item.produto || "").trim();
                    let nomeReal = prodReal;

                    // Se o produto for diferente da substância, exibe a marca e a substância
                    if (prodReal && prodReal.toUpperCase() !== (item.substancia || "").toUpperCase() && item.substancia) {
                        nomeReal = `${prodReal} (${item.substancia})`;
                    } else if (!prodReal && item.substancia) {
                        nomeReal = item.substancia;
                    }

                    if (apresReal && apresReal !== "-") {
                        nomeReal = `${nomeReal} - ${apresReal}`;
                    } else if (!nomeReal) {
                        nomeReal = "Medicamento Não Especificado";
                    }

                    const eanEncontrado = (item.ean && item.ean !== "-") ? item.ean : "N/A";

                    results.push({
                        id: `cmed-${item.id}`,
                        nome: nomeReal.trim(),
                        unidade: 'UN',
                        fonte: 'CMED',
                        preco: item.pmvg || item.pf || 0,
                        data: '2025',
                        orgao: labNome ? `Laboratório: ${labNome}` : 'Medicamentos CMED',
                        metadata: `EAN: ${eanEncontrado} • PF: R$ ${item.pf} / PMVG: R$ ${item.pmvg}`
                    });
                });
            })()
        );
    }

    if (sources.bps) {
        searchPromises.push(
            (async () => {
                const data = await supabasePaginatedSearch(
                    'referencia_pncp',
                    (q) => q.ilike('item_nome', `%${termo}%`),
                    limit,
                    1000,
                    'id, item_nome, unidade, valor_unitario, data_publicacao, orgao_nome'
                );

                if (data) {
                    data.forEach(item => {
                        results.push({
                            id: `bps-${item.id}`,
                            nome: item.item_nome,
                            unidade: item.unidade || 'UN',
                            fonte: 'BPS',
                            preco: parseFloat(item.valor_unitario) || 0,
                            data: item.data_publicacao ? new Date(item.data_publicacao).toLocaleDateString('pt-BR') : '2025',
                            orgao: item.orgao_nome || 'Banco de Preços em Saúde',
                            metadata: 'Referência Saúde'
                        });
                    });
                }
            })()
        );
    }

    if ((sources as any).setop) {
        searchPromises.push(
            (async () => {
                const data = await supabasePaginatedSearch(
                    'referencia_setop',
                    (q) => {
                        let query = q.ilike('descricao', `%${termo}%`).gt('preco_base', 0);
                        if (uf) {
                            query = query.eq('uf', uf.toUpperCase());
                        }
                        return query;
                    },
                    limit,
                    1000,
                    'id, descricao, unidade, preco_base, data_referencia, codigo, regiao'
                );

                if (data) {
                    data.forEach(item => {
                        results.push({
                            id: `setop-${item.id}`,
                            nome: item.descricao,
                            unidade: item.unidade || 'UN',
                            fonte: 'SETOP',
                            preco: item.preco_base || 0,
                            data: item.data_referencia || '2025',
                            orgao: `SINFRA/DER-MG (Cod: ${item.codigo})`,
                            metadata: `Região: ${item.regiao || 'Geral'}`
                        });
                    });
                }
            })()
        );
    }

    if ((sources as any).simpro) {
        searchPromises.push(
            (async () => {
                const data = await supabasePaginatedSearch(
                    'referencia_simpro',
                    (q) => q.ilike('descricao', `%${termo}%`),
                    limit,
                    1000,
                    'id, descricao, unidade, preco, data_vigencia, fabricante, codigo_simpro'
                );

                if (data) {
                    data.forEach(item => {
                        results.push({
                            id: `simpro-${item.id}`,
                            nome: item.descricao,
                            unidade: item.unidade || 'UN',
                            fonte: 'SIMPRO',
                            preco: item.preco || 0,
                            data: item.data_vigencia || '2025',
                            orgao: `Hospitalar (${item.fabricante || 'Geral'})`,
                            metadata: `Cod SIMPRO: ${item.codigo_simpro}`
                        });
                    });
                }
            })()
        );
    }

    if ((sources as any).sigtap) {
        searchPromises.push(
            (async () => {
                const data = await supabasePaginatedSearch(
                    'referencia_sigtap',
                    (q) => q.ilike('descricao', `%${termo}%`),
                    limit,
                    1000,
                    'id, descricao, valor_total, valor_sa, valor_sp, codigo'
                );

                if (data) {
                    data.forEach(item => {
                        results.push({
                            id: `sigtap-${item.id}`,
                            nome: item.descricao,
                            unidade: 'PROC',
                            fonte: 'SIGTAP',
                            preco: item.valor_total || 0,
                            data: '2025',
                            orgao: `SUS (Cod: ${item.codigo})`,
                            metadata: `SA: R$ ${item.valor_sa} / SP: R$ ${item.valor_sp}`
                        });
                    });
                }
            })()
        );
    }

    if ((sources as any).nfe) {
        searchPromises.push(
            (async () => {
                const data = await supabasePaginatedSearch(
                    'referencia_nfe',
                    (q) => {
                        let query = q.ilike('item_nome', `%${termo}%`);
                        if (uf) {
                            query = query.eq('uf', uf.toUpperCase());
                        }
                        return query;
                    },
                    limit,
                    1000,
                    'id, item_nome, unidade, preco_unitario, data_emissao, orgao_nome, orgao_cnpj, fornecedor_nome, uf, municipio_fornecedor, uf_fornecedor'
                );

                if (data) {
                    data.forEach(item => {
                        results.push({
                            id: `nfe-${item.id}`,
                            nome: item.item_nome,
                            unidade: item.unidade || 'UN',
                            fonte: 'Banco de NFE',
                            preco: parseFloat(item.preco_unitario) || 0,
                            data: item.data_emissao ? item.data_emissao : '-',
                            orgao: item.orgao_nome || 'Órgão Particular',
                            metadata: `Fornecedor: ${item.fornecedor_nome || 'N/I'}`,
                            cnpj: item.orgao_cnpj,
                            cidadeUf: item.uf ? `${item.municipio_fornecedor || item.uf_fornecedor || ''}/${item.uf}` : undefined
                        });
                    });
                }
            })()
        );
    }

    if ((sources as any).ceasa) {
        searchPromises.push(
            (async () => {
                const data = await supabasePaginatedSearch(
                    'referencia_ceasa',
                    (q) => {
                        let query = q.ilike('item_nome', `%${termo}%`);
                        if (uf) {
                            query = query.ilike('ceasa', `%${uf}%`);
                        }
                        return query;
                    },
                    limit,
                    1000,
                    'id, item_nome, unidade, preco_unitario, data_referencia, ceasa'
                );

                if (data) {
                    data.forEach(item => {
                        // Tentar extrair UF da string do Ceasa, por exemplo, de "(MT)" ou "-MT"
                        let ufExtraido = undefined;
                        if (item.ceasa) {
                            const match = item.ceasa.match(/\(([A-Za-z]{2})\)|-([A-Za-z]{2})\b/);
                            if (match) {
                                ufExtraido = (match[1] || match[2]).toUpperCase();
                            }
                        }

                        results.push({
                            id: `ceasa-${item.id}`,
                            nome: item.item_nome,
                            unidade: item.unidade || 'UN',
                            fonte: 'Ceasa',
                            preco: parseFloat(item.preco_unitario) || 0,
                            data: item.data_referencia ? new Date(item.data_referencia).toLocaleDateString('pt-BR') : '-',
                            orgao: item.ceasa || 'Ceasa (Não Informado)',
                            metadata: `Cotação Agrolink`,
                            ufOrigem: ufExtraido,
                            cidadeUf: item.ceasa
                        });
                    });
                }
            })()
        );
    }

    await Promise.all(searchPromises);
    return results;
}
