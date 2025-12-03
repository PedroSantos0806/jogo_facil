import { GoogleGenAI, Type, Schema } from "@google/genai";
import { VerificationResult } from '../types';

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const verificationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isValid: {
      type: Type.BOOLEAN,
      description: "Whether the receipt appears to be a valid banking transaction for the correct amount.",
    },
    amountFound: {
      type: Type.NUMBER,
      description: "The monetary amount found on the receipt.",
    },
    dateFound: {
      type: Type.STRING,
      description: "The date and time found on the receipt.",
    },
    reason: {
      type: Type.STRING,
      description: "A short explanation of why the receipt is valid or invalid.",
    },
  },
  required: ["isValid", "reason"],
};

export const verifyPixReceipt = async (
  file: File,
  expectedAmount: number,
  expectedReceiverName: string
): Promise<VerificationResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = await fileToGenerativePart(file);

    const prompt = `
      Você é um assistente financeiro anti-fraude para um aplicativo de futebol.
      Analise esta imagem de comprovante PIX.
      
      Dados esperados:
      - Valor: R$ ${expectedAmount}
      - Destinatário (nome parcial ou chave): "${expectedReceiverName}"
      
      Verifique se:
      1. É um comprovante bancário legítimo (não é meme, foto aleatória, etc).
      2. O valor corresponde ao esperado (ou muito próximo).
      3. A data é recente (hoje ou ontem).
      
      Responda estritamente em JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: verificationSchema,
        temperature: 0.1, // Low temperature for factual extraction
      },
    });

    if (response.text) {
      const result = JSON.parse(response.text) as VerificationResult;
      return result;
    }

    throw new Error("No response text from AI");

  } catch (error) {
    console.error("AI Verification failed:", error);
    return {
      isValid: false,
      amountFound: null,
      dateFound: null,
      reason: "Erro técnico na verificação da IA. Tente novamente ou contate o suporte.",
    };
  }
};