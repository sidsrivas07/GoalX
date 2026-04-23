import 'dotenv/config';
import { generateSchedule } from './src/services/ai.service.js';

async function test() {
  try {
    console.log("Testing Groq...");
    const res = await generateSchedule("study math for 2 hours", new Date().toISOString(), null);
    console.log("Result:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
