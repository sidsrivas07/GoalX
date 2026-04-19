import { GoogleGenerativeAI } from '@google/generative-ai';

const TEST_USER_KEY = process.argv[2] || process.env.GEMINI_API_KEY;

async function runTest() {
  if (!TEST_USER_KEY) {
    console.error("No API key provided.");
    return;
  }

  console.log('Testing with key:', TEST_USER_KEY.slice(0, 16) + '...');

  try {
    const genAI = new GoogleGenerativeAI(TEST_USER_KEY);
    
    // Models retrieved from the actual ListModels response for this key
    const models = ["gemini-2.0-flash-lite", "gemini-flash-latest", "gemini-2.0-flash"];

    for (const mName of models) {
        console.log(`\n--- Testing Model: ${mName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: mName });
            const result = await model.generateContent("hello");
            const response = await result.response;
            console.log(`✅ SUCCESS: ${response.text()}`);
        } catch (err) {
            console.error(`❌ FAILED: ${err.message}`);
        }
    }

  } catch (err) {
    console.error("Setup Error:", err);
  }
}

runTest();
