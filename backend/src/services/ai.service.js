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
 */
export const fallbackCategorize = (prompt) => {
  console.log("Using Improved Rule-based Fallback Categorization...");
  
  const lines = prompt.split(/[,\n]| and /).map(s => s.trim()).filter(Boolean);
  const tasksByCat = { Workout: [], Academics: [], Personal: [] };

  lines.forEach(line => {
    let assigned = false;
    const lowerLine = line.toLowerCase();
    
    // Attempt to extract duration (e.g., "1 hour", "30 min")
    let duration = 60;
    const hourMatch = lowerLine.match(/(\d+)\s*hour/);
    const minMatch = lowerLine.match(/(\d+)\s*min/);
    if (hourMatch) duration = parseInt(hourMatch[1]) * 60;
    else if (minMatch) duration = parseInt(minMatch[1]);

    // Clean title: Remove duration and time markers, then uppercase
    let title = line
      .replace(/for\s+\d+\s*(hour|hr|min)s?/gi, '')
      .replace(/at\s+\d+(:?\d+)?\s*(am|pm)?/gi, '')
      .trim()
      .toUpperCase();

    if (CATEGORY_RULES.Workout.some(kw => lowerLine.includes(kw))) {
      tasksByCat.Workout.push({ title, time: "09:00", duration });
      assigned = true;
    } else if (CATEGORY_RULES.Academics.some(kw => lowerLine.includes(kw))) {
      tasksByCat.Academics.push({ title, time: "10:00", duration });
      assigned = true;
    }

    if (!assigned) {
      tasksByCat.Personal.push({ title, time: "12:00", duration });
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
Categorize the user's tasks into exactly: "Workout", "Academics", or "Personal".

STRICT RULES:
1. TITLES: Extract ONLY the core action as the title (e.g., "STUDY", "GYM", "MATH"). Always use UPPERCASE.
2. DURATION: Calculate the duration in minutes. (e.g., "1 hour" -> 60, "1.5 hours" -> 90, "2 hours" -> 120).
3. MAINTAIN EXACT TIMES: Use the start times provided by the user (e.g., "4pm" -> "16:00").
4. OUTPUT FORMAT: Return ONLY a valid JSON object.

JSON STRUCTURE:
{
  "categories": [
    {
      "category": "Academics",
      "tasks": [
        { "title": "STUDY", "time": "16:00", "duration": 60 }
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

