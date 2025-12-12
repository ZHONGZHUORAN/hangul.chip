import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAI = () => {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    }
    return ai;
};

export const generateLessonContent = async (level: string, context: string, missionTarget?: string) => {
    const aiInstance = getAI();
    try {
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a Korean language tutor for a beginner. 
            
            STRICT LANGUAGE RULE: Speak ONLY in English. Do NOT write full Korean sentences in your explanation. You may ONLY use Korean characters when citing specific words or syllables from the user's board.
            
            Current State:
            - User Level: ${level}
            - Text Built on Board: "${context || 'None'}"
            - Active Mission Target: "${missionTarget || 'None'}"
            
            Task: Provide a ONE sentence reaction (max 30 words).
            1. If "Text Built" matches "Active Mission Target", CONGRATULATE them in English!
            2. If "Text Built" is a SENTENCE, briefly explain the grammar (Subject/Object/Verb) in English.
            3. If "Text Built" is unrelated, briefly translate what they built to English, then guide them back to the mission.
            4. If nothing is built, give a hint for the mission in English.
            
            Tone: Fun, retro, pixel-game style.`,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Combine consonants and vowels to make sounds! Keep trying!";
    }
};

export const explainGrammar = async (sentence: string) => {
  const aiInstance = getAI();
    try {
        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this Korean text: "${sentence}". Breakdown the syllables, meaning, and if it's a sentence, the grammar structure (Subject/Object/Verb) for a complete beginner. 
            
            STRICT LANGUAGE RULE: The explanation must be in ENGLISH. Only use Korean for the words you are analyzing.
            
            Keep the style "chip/pixel" - concise, robotic but friendly.`,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Service unavailable.";
    }
}

export const generateMission = async (currentLevel: number) => {
    const aiInstance = getAI();
    try {
        // For levels > 3, we occasionally generate simple sentences
        const isAdvanced = currentLevel >= 3;
        const promptType = isAdvanced ? 
            "Generate a simple Korean SENTENCE (Subject + Object + Verb or Subject + Adjective, e.g., 'I like milk' or 'The tree is big')." : 
            "Generate a simple Korean WORD for a beginner.";

        const response = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${promptType}
            User Level: ${currentLevel}.
            Return ONLY a JSON object with this schema (no markdown):
            {
                "target": "Korean Text (MUST be Hangul)",
                "translation": "English Meaning",
                "romaja": "Romanization",
                "type": "${isAdvanced ? 'sentence' : 'word'}",
                "components": ["List", "of", "single", "jamo", "characters", "needed", "to", "build", "it"],
                "reward": Integer (50-200 based on difficulty)
            }`,
             config: {
                responseMimeType: "application/json",
             }
        });
        
        // Remove markdown formatting if present (backticks) just in case
        const cleanText = response.text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini Mission Error:", error);
        return { 
            target: "나무", 
            translation: "Tree", 
            romaja: "Namu", 
            components: ["ㄴ", "ㅏ", "ㅁ", "ㅜ"], 
            reward: 50,
            type: 'word'
        };
    }
};