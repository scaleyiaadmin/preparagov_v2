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
            content: `Você é um assistente especializado em processamento de Documentos de Formalização de Demanda (DFD) para licitações públicas. Sua tarefa é extrair as seguintes informações das imagens fornecidas (podem ser páginas de um mesmo documento contínuo):
- "objeto": Nome curto e central da contratação pretendida.
- "justificativa": Motivação ou necessidade técnica e legal para a demanda.
- "descricaoDemanda": Detalhamento de como essa demanda vai solucionar o problema. Extraia ou resuma se houver informações.
- "tipoDFD": Tente classificar entre as opções: "Aquisição de Material de Consumo", "Aquisição de Material Permanente", "Contratação de Serviço Continuado", "Contratação de Serviço Não Continuado", ou "Obras e Serviços de Engenharia". Se não for óbvio, omita.
- "itens": Uma lista preenchida de objetos de todos os itens em TODAS as imagens onde cada item deve ter:
  - "descricao": Nome e especificação do item.
  - "quantidade": Número (como number/float).
  - "unidade": Ex: "UN", "KG", "L", "M", "PCT".
  - "valorReferencia": Um valor estimado unitário em R$, se estiver visível (number). Caso contrário omlita ou envie 0.

Seu retorno DEVE ser EXCLUSIVAMENTE um JSON válido, sem NENHUM texto Markdown adicional (como \`\`\`json). Não envolva a resposta em blocos de código. APENAS o JSON puro seguindo exatamente a estrutura pedida.`
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
