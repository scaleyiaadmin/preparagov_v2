import { DFDItem } from '@/components/DFD/types';

export interface ExtractedDFDData {
  objeto?: string;
  justificativa?: string;
  descricaoDemanda?: string;
  tipoDFD?: string;
  itens: Partial<DFDItem>[];
}

export const openaiService = {
  async extractDFDFromImage(base64Images: string[]): Promise<ExtractedDFDData> {
    if (!base64Images || base64Images.length === 0) {
      throw new Error("No images provided for extraction.");
    }

    const defaultResponse: ExtractedDFDData = {
      objeto: '',
      justificativa: '',
      descricaoDemanda: '',
      itens: []
    };

    try {
      // Use environment variable for the API key to respect GitHub Secret Scanning
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

      if (!apiKey) {
         throw new Error("A chave da API da OpenAI (VITE_OPENAI_API_KEY) não está configurada nas variáveis de ambiente (.env).");
      }
      
      const payload = {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é um assistente especializado em processamento de Documentos de Formalização de Demanda (DFD) para licitações públicas governamentais. Sua tarefa é analisar as imagens fornecidas (podem ser páginas de um documento, notas fiscais, planilhas ou lista de compras) e montar um escopo estruturado:
- "objeto": Nome curto e central da contratação pretendida. (Se a imagem não informar textualmente, deduza e CRIE um Objeto técnico adequado baseado na lista de itens encontrados. Ex: "Aquisição de Material de Limpeza para as Secretarias").
- "justificativa": Motivação ou necessidade técnica e legal para a demanda. (Mesmo se não estiver escrito na foto, CRIE uma justificativa legal, robusta e plausível para a necessidade de adquirir os itens listados que sirva para convencer a aprovação da licitação).
- "descricaoDemanda": Detalhamento de como essa demanda vai solucionar o problema público. (Escreva um pequeno resumo do propósito prático desses itens).
- "tipoDFD": Baseado estritamente na natureza dos itens lidos, você DEVE classificar OBRIGATORIAMENTE em uma destas exatas opções: "MATERIAIS DE CONSUMO", "MATERIAIS PERMANENTES", "SERVIÇO CONTINUADO", "SERVIÇO NÃO CONTINUADO", ou "SERVIÇO DE ENGENHARIA".
- "itens": Uma lista preenchida de objetos de todos os itens em TODAS as imagens onde cada item deve ter:
  - "descricao": Nome e especificação clara do item.
  - "quantidade": Número (como number/float). Se não houver, assuma 1.
  - "unidade": Uma das métricas padrão comuns (ex: "UN", "KG", "L", "M", "PCT", "CX"). Se não houver, deduza (ex: Arroz = PCT ou KG).
  - "valorReferencia": Um valor estimado unitário em R$, se estiver visível (number). Caso contrário omlita ou envie 0.

Seu retorno DEVE ser EXCLUSIVAMENTE um JSON válido, sem NENHUM texto Markdown adicional (como \`\`\`json). APENAS o JSON puro seguindo exatamente a estrutura pedida. Se a imagem contiver apenas itens jogados, force a inteligência para deduzir ativamente os campos de texto que faltaram.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extraia e una as informações do DFD encontradas nestas imagens em um único JSON consistente."
              },
              ...base64Images.map(imgBase64 => ({
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imgBase64}`,
                  detail: "high"
                }
              }))
            ]
          }
        ],
        max_tokens: 2500, // increased tokens to handle multiple pages of items
        temperature: 0.1
      };

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.statusText}`);
      }

      const data = await response.json();
      let responseText = data.choices[0].message.content.trim();
      
      // Clean up potential markdown formatting block if the AI disobeys
      if (responseText.startsWith('\`\`\`json')) {
        responseText = responseText.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
      }

      const extractedData = JSON.parse(responseText);
      
      return {
        objeto: extractedData.objeto || '',
        justificativa: extractedData.justificativa || '',
        descricaoDemanda: extractedData.descricaoDemanda || '',
        tipoDFD: extractedData.tipoDFD || '',
        itens: Array.isArray(extractedData.itens) ? extractedData.itens : []
      };

    } catch (error) {
      console.error("Error processing DFD image via OpenAI:", error);
      throw error;
    }
  }
};
