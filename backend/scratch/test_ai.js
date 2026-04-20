import 'dotenv/config';
import { generateSchedule } from '../src/services/ai.service.js';

async function testGroq() {
  console.log('=== TEST 1: No user key → Groq (default) ===');
  try {
    const today = new Date().toISOString().split('T')[0];
    const tasks = await generateSchedule("Gym at 6am for 1 hour daily", today, null);
    console.log('✅ Groq Success!');
    console.log(JSON.stringify(tasks, null, 2));
  } catch (err) {
    console.error('❌ Groq Failed:', err.message);
  }
}

async function testGeminiFallback() {
  console.log('\n=== TEST 2: User provides their own Gemini key ===');
  try {
    const today = new Date().toISOString().split('T')[0];
    // Use the developer Gemini key as a stand-in for a "user-provided" key
    const tasks = await generateSchedule("Read a book at 8pm for 30 minutes", today, process.env.GEMINI_API_KEY);
    console.log('✅ Gemini (user key) Success!');
    console.log(JSON.stringify(tasks, null, 2));
  } catch (err) {
    console.error('❌ Gemini (user key) Failed:', err.message);
  }
}

async function run() {
  await testGroq();
  await testGeminiFallback();
  console.log('\n🏁 All AI engine tests complete.');
}

run();
