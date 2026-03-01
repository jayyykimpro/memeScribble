import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function checkModels() {
    try {
        console.log("Fetching available models...");
        // List models
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();

        if (data.models) {
            const imageModels = data.models.filter(m =>
                m.name.includes('image') ||
                m.name.includes('vision') ||
                m.supportedGenerationMethods.includes('generateContent')
            );

            console.log("--- Models that might support images ---");
            data.models.filter(m => m.name.includes("imagen") || m.name.includes("gemini-2.5") || m.name.includes("gemini-3")).forEach(m => {
                console.log(`- ${m.name} (methods: ${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.error("Failed to list models:", data);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

checkModels();
