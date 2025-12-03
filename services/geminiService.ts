
import { GoogleGenAI } from "@google/genai";
import { ProblemDef, Language } from "../types";

const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateExplanation = async (
  problem: ProblemDef,
  step: number,
  currentValues: Record<string, number>,
  currentCode: string,
  language: Language
): Promise<string> => {
  if (!ai) {
    return language === 'cn' 
      ? "未配置 API Key。请查看动画以理解逻辑。"
      : "API Key not configured. Please view the animation to understand the logic.";
  }

  const langContext = language === 'cn' 
    ? "Language: Chinese (Simplified). Explain in Chinese." 
    : "Language: English.";
  
  const tutorPersona = language === 'cn'
    ? "你是一位友好的计算机科学导师，正在教初学者 C++。"
    : "You are a friendly Computer Science tutor teaching C++ to a beginner.";

  const prompt = `
    ${tutorPersona}
    ${langContext}
    
    Context:
    - Algorithm: ${problem.title.en}
    - Description: ${problem.description.en}
    - Current Variable State: ${JSON.stringify(currentValues)}
    - Step: ${step} of ${problem.maxSteps}
    - Current C++ Code Executing: "${currentCode.trim()}"

    Task:
    Explain briefly (maximum 2 sentences) what is happening in computer memory or logic flow at this specific step. 
    Use simple language suitable for students. Focus on data movement or comparison logic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || (language === 'cn' ? "无法生成解释。" : "Could not generate explanation.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'cn' 
      ? "我现在无法连接到大脑。请稍后再试！" 
      : "I'm having trouble connecting to my brain right now. Try again later!";
  }
};
