
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
    contents: `Create a professional and extremely focused English-language Spanish Grammar Guide for: "${topicName}".

    MANDATORY RULES:
    1. THE ENTIRE GUIDE MUST BE IN ENGLISH (except for Spanish conjugation examples).
    2. USE ENGLISH HEADERS (e.g., "# 1. Definition", "# 2. Usage").
    3. NO generic filler or "Introduction". Focus ONLY on "${topicName}".
    
    The guide MUST have these sections in this order:
    
    # 1. Key Irregulars
    Immediately list the most critical irregular verbs for this tense (e.g., if Subjunctive, list Ser, Ir, Dar, Estar, Saber). Use bullet points.
    
    # 2. What is it? (Definition)
    A 1-sentence technical definition of the grammar point in English.
    
    # 3. When to use? (Usage & Triggers)
    Explain the logic and triggers in English. List categories like Doubt, Emotion, Impersonal phrases, etc. 
    Include specific Spanish examples like "Es fundamental que..." or "Dudo que...".
    
    # 4. How to conjugate? (Verb Transformations)
    Explain the conjugation rule in English.
    Provide a Markdown Table for endings:
    | Pronoun | -ar verbs | -er / -ir verbs |
    |---|---|---|
    | Yo | ... | ... |
    | Tú | ... | ... |
    | Él/Ella/Ud | ... | ... |
    | Nosotros | ... | ... |
    | Vosotros | ... | ... |
    | Ellos/Ellas/Uds | ... | ... |

    Style: Professional, clean, and DELE B2 level depth.`,
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
