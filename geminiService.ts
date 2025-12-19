
import { GoogleGenAI, Type } from "@google/genai";
import { Level, Question } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateSpanishQuestions(topics: string[], level: Level, count: number = 10): Promise<Question[]> {
  const topicsString = topics.join(", ");
  const prompt = `Act as a DELE examiner. Create ${count} NEW and UNIQUE multiple-choice Spanish grammar questions.
  Level: ${level}.
  Topics to cover: [${topicsString}].
  
  Requirements:
  - Language of instruction/explanation: ENGLISH.
  - Sentence style: Natural, sophisticated Spanish. Use "___" for the blank.
  - Options: Provide exactly 4 plausible choices.
  - Explanation: Write a detailed academic explanation in ENGLISH.`;

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
    // Safely parse JSON from response.text, handling potential undefined values.
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
}

export async function fetchGrammarReference(topicName: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a professional Spanish teacher. Create a concise English-language grammar "Cheat Sheet" for: "${topicName}". Use standard Markdown.`,
  });
  return response.text || "No reference available.";
}

/**
 * Generates an AI analysis of user weaknesses and provides a study plan.
 */
export async function generateWeaknessAnalysis(masteryData: Record<string, number>, topics: any[]): Promise<string> {
  const performanceReport = Object.entries(masteryData).map(([id, score]) => {
    const topic = topics.find(t => t.id === id);
    return `${topic?.name} (${topic?.category}): ${score}% mastery`;
  }).join("\n");

  if (!performanceReport) return "Study more units to unlock AI performance analysis!";

  const prompt = `Act as a DELE B2 Academic Advisor. Analyze the following Spanish student performance data and provide a strategic study plan in English.
  
  Student Performance:
  ${performanceReport}
  
  Structure your response in Markdown:
  1. ### 🔍 Core Weaknesses: Identify patterns (e.g., "Difficulty with mood distinction" or "Weak verb endings").
  2. ### 💡 Strategic Advice: Specific tips to overcome these hurdles.
  3. ### 📅 Recommended Next Steps: Prioritize 3 topics to study next.
  
  Keep it professional, encouraging, and highly specific to Spanish grammar.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text || "Analysis currently unavailable.";
}
