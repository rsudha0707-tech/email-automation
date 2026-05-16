const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env' });

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = [
    "gemini-3.1-flash",
    "gemini-3.1-pro",
    "gemini-3.0-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
  ];
  
  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      await model.generateContent("Hi");
      console.log(`✅ ${m} works!`);
      return;
    } catch (e) {
      console.log(`❌ ${m} failed: ${e.message}`);
    }
  }
}

list();
