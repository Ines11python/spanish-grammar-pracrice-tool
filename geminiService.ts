
import { GoogleGenAI, Type } from "@google/genai";
import { Level, Question } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateSpanishQuestions(topics: string[], level: Level, count: number = 10): Promise<Question[]> {
  const topicsString = topics.join(", ");
  const prompt = `Task: DELE B2 Spanish Exam. Create ${count} unique MCQs.
  Topics: ${topicsString}. Level: ${level}.
  JSON Structure: Array of {id, sentence (use "___"), options (4), correctAnswer, explanation (short, English), grammarTopic, level}.
  Rule: Use natural, advanced Spanish. No headers or markdown blocks outside JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            sentence: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            grammarTopic: { type: Type.STRING },
            level: { type: Type.STRING }
          },
          required: ["id", "sentence", "options", "correctAnswer", "explanation", "grammarTopic", "level"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("JSON Parsing failed", error);
    return [];
  }
}

export async function fetchGrammarReference(topicName: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a comprehensive English "Grammar Guide" for Spanish: "${topicName}". 
    
    REQUIRED SECTIONS:
    1. **Overview**: What is this grammar point?
    2. **When to Use**: Clear rules, contexts, or triggers (especially for B2 level).
    3. **How to Use**: Conjugation rules or structural patterns. 
    4. **Conjugation Table**: A Markdown table showing Regular AR/ER/IR and major Irregulars if applicable.
    5. **Examples**: 3-4 natural sentences with translations.

    MANDATORY: 
    - Use GFM Markdown tables (| Header | Header | followed by |---|---|).
    - Maintain a professional, encouraging tone.`,
  });
  return response.text || "No reference available.";
}

export async function generateWeaknessAnalysis(masteryData: Record<string, number>, topics: any[]): Promise<string> {
  const performanceReport = Object.entries(masteryData).map(([id, score]) => {
    const topic = topics.find(t => t.id === id);
    return `${topic?.name}: ${score}%`;
  }).join(", ");

  if (!performanceReport) return "Study more units to unlock analysis!";

  const prompt = `Analyze: ${performanceReport}. Provide a short Markdown study plan for a DELE B2 student (English). Use:
  1. ### 🔍 Core Weaknesses
  2. ### 💡 Advice
  3. ### 📅 Next Steps`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text || "Analysis currently unavailable.";
}
