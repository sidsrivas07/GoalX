import { fallbackCategorize } from './src/services/ai.service.js';

console.log("--- Testing Fallback Categorization ---");

const testPrompts = [
  "Go to the gym at 5pm and study math for 2 hours",
  "College class at 10am, then running at 6pm, and call mom at 8pm",
  "Buy groceries and do homework"
];

testPrompts.forEach(prompt => {
  console.log(`\nPrompt: "${prompt}"`);
  const result = fallbackCategorize(prompt);
  console.log(JSON.stringify(result, null, 2));
});

console.log("\n--- Verification Complete ---");
