import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateSchedule = async (userPrompt, todayDateStr, apiKey = null) => {
  try {
    // Falls back to backend key if no user key provided
    const finalApiKey = apiKey || process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(finalApiKey);
    
    // Using gemini-flash-latest as it has available free quota without billing
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

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

- If task repeats daily → categoryType = "DAILY" and recurrence = "DAILY"
- If task is related to festivals (Diwali, Holi, etc.) → categoryType = "FESTIVAL"
- All other tasks → categoryType = "MISC"

----------------------

OUTPUT FORMAT (ALWAYS RETURN AN ARRAY):

[
  {
    "name": "Task name",
    "time": "HH:MM",
    "duration": number,
    "categoryType": "DAILY | FESTIVAL | MISC",
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const outputString = response.text();
    
    // Handle potential markdown formatting
    const cleanOutput = outputString.replace(/```json/g, '').replace(/```/g, '').trim();
    const tasks = JSON.parse(cleanOutput);
    
    // Ensure we always return an array
    return Array.isArray(tasks) ? tasks : [tasks];

  } catch (error) {
    console.error("Gemini (Legacy SDK) Error:", error);
    throw new Error("Failed to generate schedule from AI.");
  }
};
