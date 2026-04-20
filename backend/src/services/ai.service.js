import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

/**
 * Smart AI Selection Hierarchy:
 * 1. User's own Gemini Key (if provided via x-gemini-key header)
 * 2. Developer's Groq Free Key (Ultra-fast default)
 * 3. Developer's Gemini Key (Robust fallback)
 */
export const generateSchedule = async (userPrompt, todayDateStr, userGeminiApiKey = null) => {
  const prompt = `You are an advanced AI scheduling assistant for a productivity app called GoalX.

Your job is to convert a user's natural language request into a structured task schedule.

The user may describe:
- Daily recurring habits (e.g., "gym everyday at 5pm for 2 hours")
- One-time tasks (e.g., "study tomorrow at 7pm")
- Festival-related tasks (e.g., "Diwali shopping at 4pm")

You must analyze intent and classify tasks properly.

----------------------

STRICT RULES:

1. Output ONLY valid JSON (no explanation, no text)
2. Use 24-hour time format (HH:MM)
3. If duration is not given, default to 60 minutes
4. Do not create overlapping tasks
5. Distribute tasks logically if multiple tasks exist
6. Use YYYY-MM-DD for any date fields if needed, based on Today's Date: ${todayDateStr}

----------------------

TASK CLASSIFICATION RULES:

- Determine a short, descriptive "category" for each task (e.g., "Gym Workout", "Academics", "Meetings", "Habits", "Festivals"). Group similar tasks into the same category.
- If task repeats daily → set recurrence = "DAILY". Otherwise set "NONE".

----------------------

OUTPUT FORMAT (ALWAYS RETURN AN ARRAY):

[
  {
    "name": "Task name",
    "time": "HH:MM",
    "duration": number,
    "category": "Descriptive category name",
    "recurrence": "NONE | DAILY",
    "status": "PENDING",
    "editable": true
  }
]

----------------------

USER INPUT:
"${userPrompt}"

----------------------

Return only JSON.`;

  // 1. Try User's personal Gemini Key first if they provided one
  if (userGeminiApiKey) {
    try {
      console.log("Using User-provided Gemini Key...");
      return await callGemini(prompt, userGeminiApiKey);
    } catch (error) {
      console.error("User Gemini Key error:", error.message);
      // Fall through to developer keys if user key fails
    }
  }

  // 2. Try Developer's Groq Key (Primary Fast Engine)
  if (process.env.GROQ_API_KEY) {
    try {
      console.log("Using Developer Groq Key (Fast Mode)...");
      return await callGroq(prompt, process.env.GROQ_API_KEY);
    } catch (error) {
      console.error("Groq Engine error:", error.message);
      // Fall through to Gemini fallback
    }
  }

  // 3. Last Resort: Developer's Gemini Key
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log("Using Developer Gemini Fallback...");
      return await callGemini(prompt, process.env.GEMINI_API_KEY);
    } catch (error) {
      console.error("Gemini Fallback error:", error.message);
      throw new Error("All AI engines failed to respond.");
    }
  }

  throw new Error("No valid AI API keys found in the system.");
};

/**
 * Helper to call Groq (Llama 3.1)
 */
async function callGroq(prompt, apiKey) {
  const groq = new Groq({ apiKey });
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.1, // Low temperature for consistent JSON
    response_format: { type: "json_object" },
  });

  const content = chatCompletion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from Groq");
  
  const parsed = JSON.parse(content);
  // Ensure we always return an array (even if the model returned a single object in some keys)
  if (Array.isArray(parsed)) return parsed;
  if (parsed.tasks && Array.isArray(parsed.tasks)) return parsed.tasks;
  return [parsed];
}

/**
 * Helper to call Google Gemini
 */
async function callGemini(prompt, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const outputString = response.text();
  
  const cleanOutput = outputString.replace(/```json/g, '').replace(/```/g, '').trim();
  const tasks = JSON.parse(cleanOutput);
  
  return Array.isArray(tasks) ? tasks : [tasks];
}
