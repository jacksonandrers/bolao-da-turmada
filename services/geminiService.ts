
import { GoogleGenAI } from "@google/genai";

export const getAIResponse = async (userMessage: string) => {
  // Fix: Initializing GoogleGenAI with process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: `Você é o suporte oficial do aplicativo "Bolão da Turmada". 
        Seu objetivo é ajudar os usuários com dúvidas sobre apostas, depósitos via PIX e regras do sistema.
        Seja cordial, eficiente e mantenha o tom profissional. 
        O app funciona com depósitos manuais aprovados por administradores. 
        A chave PIX padrão é 010.235.721-84, mas pode ser alterada pelo admin.`
      },
    });
    // Fix: Accessing .text property directly
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, tive um problema ao processar sua mensagem. Tente novamente em instantes.";
  }
};
