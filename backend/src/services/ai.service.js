import { GoogleGenAI, Type } from '@google/genai';

export const generateSchedule = async (userPrompt, todayDateStr, apiKey = null) => {
  try {
    // If a custom key is provided, we initialize a fresh client with that key.
    // Otherwise, it falls back to the system's process.env.GEMINI_API_KEY.
    const client = apiKey ? new GoogleGenAI({ apiKey }) : new GoogleGenAI({});
    
    const response = await client.models.generateContent({
      model: 'gemini-3.1-flash',
      contents: `User Prompt: "${userPrompt}"\n\nThe current local date is: ${todayDateStr}. Provide the schedule accordingly. If a time is missing, assume reasonable defaults for the task.`,
      config: {
        systemInstruction: `You are an expert productivity assistant. Your job is to parse a user's natural language request into a list of specific, scheduled tasks.
        
Rules:
1. Always output exactly the requested schema.
2. The times must be strict HH:MM AM/PM strings (e.g., "6:00 AM", "2:30 PM").
3. The date must be a string in YYYY-MM-DD format.
4. The duration must be an integer representing minutes.
5. Provide a single unified 'categoryName' that best fits the theme. Make it short (e.g., "Gym Workout", "Work", "Leisure").
`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categoryName: {
              type: Type.STRING,
              description: 'The overall theme or category for these tasks, e.g., "Gym Workout"'
            },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  time: { type: Type.STRING, description: 'e.g., "8:00 AM"' },
                  duration: { type: Type.INTEGER, description: 'Duration in minutes' },
                  date: { type: Type.STRING, description: 'YYYY-MM-DD' }
                },
                required: ['name', 'time', 'duration', 'date']
              }
            }
          },
          required: ['categoryName', 'tasks']
        }
      }
    });

    const outputString = response.text;
    const jsonOutput = JSON.parse(outputString);
    return jsonOutput;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate schedule from AI.");
  }
};
