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

    const prompt = `User Prompt: "${userPrompt}"\n\nThe current local date is: ${todayDateStr}. Provide the schedule accordingly. If a time is missing, assume reasonable defaults for the task.
    You are an expert productivity assistant. Your job is to parse a user's natural language request into a list of specific, scheduled tasks.

Rules:
1. Always output exactly the requested JSON schema.
2. The times must be strict HH:MM AM/PM strings (e.g., "6:00 AM", "2:30 PM").
3. The date must be a string in YYYY-MM-DD format.
4. The duration must be an integer representing minutes.
5. Provide a single unified 'categoryName' that best fits the theme. Make it short (e.g., "Gym Workout", "Work", "Leisure").

JSON Schema:
{
  "categoryName": "string",
  "tasks": [
    {
      "name": "string",
      "time": "string (HH:MM AM/PM)",
      "duration": "number (minutes)",
      "date": "string (YYYY-MM-DD)"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const outputString = response.text();
    
    // Handle potential markdown formatting if any
    const cleanOutput = outputString.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonOutput = JSON.parse(cleanOutput);
    return jsonOutput;

  } catch (error) {
    console.error("Gemini (Legacy SDK) Error:", error);
    throw new Error("Failed to generate schedule from AI.");
  }
};
