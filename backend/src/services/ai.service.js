import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

/**
 * CATEGORY DEFINITIONS
 */
const CATEGORY_RULES = {
  Workout: ['gym', 'running', 'exercise', 'workout', 'yoga', 'training', 'cardio', 'swimming'],
  Academics: ['study', 'college', 'class', 'exam', 'test', 'homework', 'lecture', 'assignment', 'research'],
  Personal: [] // Default category
};

/**
 * Rule-based Fallback Categorization
 * Assigns categories based on keywords if AI fails.
 */
export const fallbackCategorize = (prompt) => {
  console.log("Using Rule-based Fallback Categorization...");
  
  const lines = prompt.split(/[,\n]| and /).map(s => s.trim()).filter(Boolean);
  
  const tasksByCat = {
    Workout: [],
    Academics: [],
    Personal: []
  };

  lines.forEach(line => {
    let assigned = false;
    const lowerLine = line.toLowerCase();
    
    if (CATEGORY_RULES.Workout.some(kw => lowerLine.includes(kw))) {
      tasksByCat.Workout.push({ title: line, time: "09:00" });
      assigned = true;
    } else if (CATEGORY_RULES.Academics.some(kw => lowerLine.includes(kw))) {
      tasksByCat.Academics.push({ title: line, time: "10:00" });
      assigned = true;
    }

    if (!assigned) {
      tasksByCat.Personal.push({ title: line, time: "12:00" });
    }
  });

  return {
    categories: Object.entries(tasksByCat)
      .filter(([_, tasks]) => tasks.length > 0)
      .map(([category, tasks]) => ({ category, tasks }))
  };
};

/**
 * Main AI Scheduling Function
 */
export const generateSchedule = async (userPrompt, todayDateStr, userGeminiApiKey = null) => {
  const systemPrompt = `You are an expert scheduler for GoalX. 
Categorize the user's tasks into exactly these three categories: "Workout", "Academics", or "Personal".

RULES:
1. MAINTAIN EXACT TIMES: Use the times provided by the user (e.g., "5pm" -> "17:00"). If no time is provided, default to a logical time.
2. CATEGORIZATION:
   - Workout: gym, running, exercise, etc.
   - Academics: study, college, class, exam, etc.
   - Personal: everything else.
3. OUTPUT FORMAT: Return ONLY a valid JSON object. No extra text, no markdown blocks.

JSON STRUCTURE:
{
  "categories": [
    {
      "category": "Workout",
      "tasks": [
        { "title": "Gym", "time": "17:00" }
      ]
    }
  ]
}

USER INPUT:
"${userPrompt}"`;

  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      let response;
      if (userGeminiApiKey) {
        response = await callGemini(systemPrompt, userGeminiApiKey);
      } else if (process.env.GROQ_API_KEY) {
        response = await callGroq(systemPrompt, process.env.GROQ_API_KEY);
      } else if (process.env.GEMINI_API_KEY) {
        response = await callGemini(systemPrompt, process.env.GEMINI_API_KEY);
      } else {
        throw new Error("No API keys configured");
      }

      if (response && response.categories && Array.isArray(response.categories)) {
        return response;
      }
      throw new Error("Invalid response structure from AI");
    } catch (error) {
      console.error(`AI Attempt ${attempt} failed:`, error.message);
      lastError = error;
    }
  }

  return fallbackCategorize(userPrompt);
};

async function callGroq(prompt, apiKey) {
  const groq = new Groq({ apiKey });
  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    response_format: { type: "json_object" },
  });
  const content = chatCompletion.choices[0]?.message?.content;
  return JSON.parse(content);
}

async function callGemini(prompt, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: "application/json" }
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

