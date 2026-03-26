import { searchPNCPItems, PNCPItem } from './pncp';
import { searchReferences } from './referencias';

export interface SearchFilters {
    includePNCP: boolean;
    includeBPS: boolean;
    includeCMED?: boolean;
    includeSINAPI: boolean;
    includeCATSER?: boolean;
    includeSETOP?: boolean;
    includeSIMPRO?: boolean;
    includeSIGTAP?: boolean;
    includeBDS?: boolean;
    includeNFe?: boolean;
    includeCeasa?: boolean;
    uf?: string;
    limitPerSource?: number;
}

const dicionarioSinonimos: Record<string, string[]> = {
    "cadeira": ["poltrona", "assento", "longarina"],
    "paracetamol": ["acetaminofeno", "analgésico", "antitérmico"],
    "carro": ["veículo", "automóvel", "picape", "van"],
    "reforma": ["obra", "manutenção", "construção", "pintura"],
    "computador": ["notebook", "laptop", "desktop", "estação de trabalho"],
    "papel": ["sulfite", "a4", "resma"],
    "limpeza": ["detergente", "desinfetante", "sabão", "higiene"],
    "pilha": ["bateria", "cloreto de zinco", "alcalina"],
    "papelaria": ["caderno", "caneta", "lápis", "borracha", "grampeador"],
    "medicação": ["remédio", "fármaco", "comprimido", "ampola"],
    "arroz": ["cereal", "grão"],
    "feijão": ["leguminosa", "grão"],
    "caneta": ["esferográfica", "marcador"],
    "mesa": ["estação de trabalho", "bancada"],
    "impressora": ["multifuncional", "laser", "jato de tinta"],
    "monitor": ["tela", "display"],
    "toner": ["cartucho", "refil"],
};

const stopWords = [
    "DE", "PARA", "COM", "TIPO", "MARCA", "UNIDADE", "COR", "TAMANHO", "MODELO",
    "VALOR", "PREÇO", "ITEM", "FORNECIMENTO", "AQUISICAO", "MATERIAL", "PRODUTO",
    // Termos de embalagem/medida (novos)
    "FOLHAS", "FOLHA", "RESMA", "EMBALAGEM", "CAIXA", "PACOTE", "UNIDADE", "FRASCO",
    "LITRO", "LITROS", "METRO", "METROS", "GRAMAS", "QUILOS", "QUILOGRAMA",
    "CONTENDO", "CADA", "APROXIMADAMENTE", "MINIMO", "MAXIMO", "MEDINDO",
    "CONFORME", "ESPECIFICACAO", "DESCRICAO", "REFERENCIA", "SIMILAR", "EQUIVALENTE",
    "ALTA", "QUALIDADE", "PRIMEIRA", "LINHA", "ORIGINAL"
];

/**
 * Limpa o termo de busca para extrair a essência do item.
 * Remove prefixos de numeração (ITEM 01), textos após pontuação e detalhes excessivos.
 */
function cleanSearchTerm(termo: string): string {
    if (!termo) return "";

    let clean = termo.toUpperCase();

    // 1. Remover "ITEM 01", "ITEM: ", "ITEM - ", etc no início
    clean = clean.replace(/^ITEM\s*\d*\s*[:.\-]*\s*/i, "");

    // 2. Pegar apenas a primeira parte significativa (antes de . , ; ou - que não seja parte de medida)
    const partes = clean.split(/[.;:]/);
    if (partes.length > 0) {
        clean = partes[0].trim();
    }

    // 3. Remover parênteses se sobrarem no final (detalhes técnicos)
    clean = clean.split('(')[0].trim();

    // 4. Limpeza de espaços duplos
    clean = clean.replace(/\s+/g, ' ').trim();

    return clean;
}

/**
 * Extrai palavras-chave significativas de um termo, removendo stopWords e palavras curtas.
 */
function extractKeywords(termo: string): string[] {
    return termo.toUpperCase().split(/\s+/)
        .filter(w => w.trim().length > 0 && !stopWords.includes(w))
        .map(w => w.toLowerCase());
}

export async function searchAllSources(termo: string, filters: SearchFilters, fastMode = false): Promise<PNCPItem[]> {
    if (!termo || termo.length < 3) return [];

    const limit = filters.limitPerSource || (fastMode ? 1 : 1000);
    const termoLower = termo.toLowerCase();
    const termoLimpo = cleanSearchTerm(termo);
    const termoLimpoLower = termoLimpo.toLowerCase();
    const uf = filters.uf;

    const refSources = {
        catser: !!filters.includeCATSER,
        sinapi: !!filters.includeSINAPI,
        cmed: !!filters.includeCMED,
        bps: !!filters.includeBPS,
        setop: !!filters.includeSETOP,
        simpro: !!filters.includeSIMPRO,
        sigtap: !!filters.includeSIGTAP,
        bds: !!filters.includeBDS,
        ceasa: !!filters.includeCeasa,
        nfe: !!filters.includeNFe
    };

    /**
     * Executa a busca em uma "camada" específica
     */
    async function executeSearchLayer(targetTerm: string, layerLimit: number): Promise<PNCPItem[]> {
        const promises: Promise<PNCPItem[]>[] = [];
        if (filters.includePNCP) {
            promises.push(searchPNCPItems(targetTerm, fastMode, uf, layerLimit));
        }
        if (Object.values(refSources).some(v => v)) {
            promises.push(searchReferences(targetTerm, refSources, uf, layerLimit));
        }
        const results = await Promise.all(promises);
        return results.flat();
    }

    const MIN_RESULTS = fastMode ? 3 : 10;

    // === CAMADA 1 + 2: PARALELO ===
    // Executar busca exata e busca limpa ao mesmo tempo para economizar tempo
    const shouldDoLayer2 = termoLimpo.toLowerCase() !== termo.toLowerCase() && termoLimpo.length >= 3;
    
    console.log(`[IA Busca] Camada 1 - Termo exato: "${termo}"${shouldDoLayer2 ? ` | Camada 2 em paralelo: "${termoLimpo}"` : ''}`);
    
    const layerPromises: Promise<PNCPItem[]>[] = [executeSearchLayer(termo, limit)];
    if (shouldDoLayer2) {
        layerPromises.push(executeSearchLayer(termoLimpo, limit));
    }
    
    const layerResults = await Promise.all(layerPromises);
    let allItems = layerResults.flat();
    console.log(`[IA Busca] Camadas 1+2 retornaram ${allItems.length} resultados`);

    // --- CAMADA 3: REDUÇÃO PROGRESSIVA DE PALAVRAS-CHAVE ---
    // Se ainda temos menos de MIN_RESULTS, reduzimos o escopo progressivamente
    // Ex: "Papel A4 75g resma com 500 folhas" → "Papel A4 75g" → "Papel A4"
    if (allItems.length < MIN_RESULTS && termoLimpo.length > 3) {
        const keywords = extractKeywords(termoLimpo);
        console.log(`[IA Busca] Camada 3 - Palavras-chave extraídas: [${keywords.join(', ')}]`);

        if (keywords.length > 1) {
            // Tenta combinações decrescentes: N-1 palavras, N-2 palavras, ..., 1 palavra
            for (let numWords = keywords.length - 1; numWords >= 1; numWords--) {
                if (allItems.length >= MIN_RESULTS) break;

                const subTermo = keywords.slice(0, numWords).join(' ');
                // Evitar buscar algo que já foi buscado
                if (subTermo.toLowerCase() === termoLower || subTermo.toLowerCase() === termoLimpoLower) continue;
                if (subTermo.length < 3) continue;

                console.log(`[IA Busca] Camada 3 - Tentando: "${subTermo}" (${numWords} palavras)`);
                const layerResults = await executeSearchLayer(subTermo, limit);
                allItems = [...allItems, ...layerResults];
                console.log(`[IA Busca] Camada 3 acumulou ${allItems.length} resultados`);
            }
        } else if (keywords.length === 1 && keywords[0] !== termoLimpoLower) {
            // Só tem 1 palavra-chave e ela é diferente do que já buscamos
            console.log(`[IA Busca] Camada 3 - Palavra-chave única: "${keywords[0]}"`);
            const fallbackResults = await executeSearchLayer(keywords[0], limit);
            allItems = [...allItems, ...fallbackResults];
            console.log(`[IA Busca] Camada 3 acumulou ${allItems.length} resultados`);
        }
    }

    // --- CAMADA 4: SINÔNIMOS (Se ainda sem resultados) ---
    if (allItems.length === 0) {
        const keywords = extractKeywords(termoLimpo);
        for (const kw of keywords) {
            // Procurar sinônimos no dicionário
            const sinonimos = dicionarioSinonimos[kw];
            if (sinonimos && sinonimos.length > 0) {
                console.log(`[IA Busca] Camada 4 - Sinônimos para "${kw}": [${sinonimos.join(', ')}]`);
                for (const sin of sinonimos) {
                    if (allItems.length >= MIN_RESULTS) break;
                    const sinResults = await executeSearchLayer(sin, limit);
                    allItems = [...allItems, ...sinResults];
                }
            }
            if (allItems.length >= MIN_RESULTS) break;
        }
        if (allItems.length > 0) {
            console.log(`[IA Busca] Camada 4 acumulou ${allItems.length} resultados via sinônimos`);
        }
    }

    // --- DEDUPLICAÇÃO INTELIGENTE ---
    // Remove duplicatas por ID e também por "Chave de Negócio" (Nome + Preço + Órgão + Unidade)
    // Isso evita que compras em lote (mesmo item, mesmo preço, mesmo dia) ocupem a tela toda.
    const uniqueItemsMap = new Map<string, PNCPItem>();
    
    // IDs já processados (para garantir que IDs idênticos nunca entrem)
    const seenIds = new Set<string>();

    allItems.forEach(item => {
        if (!item || !item.id || seenIds.has(item.id)) return;
        
        // Gerar chave composta: Nome (limpo) + Preço + Órgão + Unidade
        const priceStr = (item.preco || 0).toFixed(2);
        const organStr = (item.orgao || "").toUpperCase().trim();
        const unitStr = (item.unidade || "").toUpperCase().trim();
        const nameKey = item.nome.toUpperCase().trim();
        
        const compositeKey = `${nameKey}|${priceStr}|${organStr}|${unitStr}`;

        if (!uniqueItemsMap.has(compositeKey)) {
            uniqueItemsMap.set(compositeKey, item);
            seenIds.add(item.id);
        }
    });
    const uniqueItems = Array.from(uniqueItemsMap.values());

    // --- RANKING ESTILIZADO E RESTRITO ---
    const palavrasAProcessar = extractKeywords(termoLimpoLower);
    const keywords = palavrasAProcessar.length > 0 ? palavrasAProcessar : termoLimpoLower.split(/\s+/).filter(w => w.trim().length > 0);

    const finalResults = uniqueItems
        .map(item => {
            const nomeStr = (item.nome || "").toLowerCase();
            const descStr = (item.descricao || "").toLowerCase();
            const fullText = `${nomeStr} ${descStr}`;
            
            let matchedWords = 0;
            let hasFirstWord = false;

            keywords.forEach((kw, index) => {
                if (fullText.includes(kw)) {
                    matchedWords++;
                    if (index === 0) hasFirstWord = true;
                }
            });

            // Relevância baseada no % de palavras encontradas: base ampla para suportar a pirâmide
            let score = (matchedWords / keywords.length) * 100;

            // Bônus gigantesco por ter TODAS as palavras (topo da pirâmide absoluto)
            if (matchedWords === keywords.length) {
                score += 50;
            }

            // Bônus para texto exato no nome (Super Relevante)
            if (nomeStr === termoLimpoLower || nomeStr === termoLower) score += 50;
            else if (nomeStr.includes(termoLimpoLower)) score += 30;
            else if (nomeStr.includes(termoLower)) score += 20;

            // Bônus se a primeira palavra bate
            if (hasFirstWord) {
                score += 15;
                // Bônus extra se a primeira palavra for a PRIMEIRA palavra do nome
                if (nomeStr.startsWith(keywords[0])) {
                    score += 20;
                }
            }

            // --- FILTRO SEVERO ---
            // Construção da pirâmide: exigimos que pelo menos a primeira palavra (substantivo) esteja presente,
            // ou a grande maioria das palavras.
            let isValid = false;
            
            if (hasFirstWord) {
                isValid = true; // Base da pirâmide garantida
            } else if (matchedWords >= Math.ceil(keywords.length / 2)) {
                isValid = true; // Alternativa para manter resultados relevantes sem a primeira palavra
            }

            // Penalidade fatal para itens lixo
            if (!isValid) {
                score -= 1000;
            }

            const metadata = score >= 80 ? item.metadata : (item.metadata ? `${item.metadata} • Aproximado` : "Busca Inteligente");

            // Bônus para itens que têm preço real
            if (item.preco > 0) score += 5;

            return { ...item, metadata, score } as PNCPItem;
        })
        .filter(item => (item.score || 0) > 0)
        .sort((a, b) => {
            // Empate de score prioritiza quem tem preço
            if (b.score === a.score) {
                return (b.preco > 0 ? 1 : 0) - (a.preco > 0 ? 1 : 0);
            }
            return (b.score || 0) - (a.score || 0);
        });

    // --- GARANTIA DE RESULTADO ---
    if (finalResults.length === 0) {
        finalResults.push({
            id: `placeholder-${termoLimpo.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`,
            nome: termoLimpo,
            unidade: 'UN',
            fonte: 'Preenchimento Manual',
            preco: 0,
            data: new Date().toLocaleDateString('pt-BR'),
            orgao: 'Nenhuma correspondência encontrada',
            metadata: 'ITEM SEM PREÇO NAS BASES OFICIAIS',
            score: 1
        });
    }

    return finalResults;
}


