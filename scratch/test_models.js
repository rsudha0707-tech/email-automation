const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '../backend/.env' });

async function list() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There is no direct listModels in the SDK easily accessible this way
    // But we can try a few common ones
    const models = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-1.0-pro",
      "gemini-pro",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash-8b"
    ];
    
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("test");
        console.log(`✅ ${m} works!`);
        process.exit(0);
      } catch (e) {
        console.log(`❌ ${m} failed: ${e.message}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

list();
