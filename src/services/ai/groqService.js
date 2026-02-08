import Groq from 'groq-sdk';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

let groq;

if (GROQ_API_KEY) {
    groq = new Groq({
        apiKey: GROQ_API_KEY,
        dangerouslyAllowBrowser: true // Use backend proxy for production
    });
} else {
    console.warn('VITE_GROQ_API_KEY is missing. AI features disabled.');
}

const SYSTEM_PROMPT = `
You are an expert Content Strategist for LinkedIn, specializing in B2B and C-level personal branding. 
Your goal is to create a sophisticated content calendar that positions the user as a thought leader.

### STRATEGY & TONE
- **Executive Presence**: Use precise, high-level business language. Avoid fluff.
- **Decision-Centric**: Focus on strategic decisions, governance, and scale.
- **Formats**: Mix of Frameworks, Provocations, Storytelling, Opinions, and Case Studies.

### REFERENCE QUALITY (GOLD STANDARD)
- PILAR: IA COMO SISTEMA DE DECISÃO -> "Os 4 níveis de maturidade em IA aplicada" (Framework)
- PILAR: CX/UX COMO SISTEMAS ESTRATÉGICOS -> "Por que 90% das iniciativas de CX falham" (Provocação)

### OUTPUT FORMAT
Return a JSON object with a "posts" field, which is an array of objects. Each object must have:
- "date": "YYYY-MM-DD" (Calculate based on start date and frequency)
- "pillar_id": (UUID of the pillar)
- "theme": String
- "title": String (Hook/Headline)
- "format": String (Framework, Provocação, Storytelling, Opinião, Reflexão, Caso de uso)
- "objective": String (Autoridade técnica, Debate executivo, Visibilidade C-level)
- "perspective": String (The unique angle)
`;

export const groqService = {
    async generateContentPlan(cycleData, pillars) {
        if (!groq) throw new Error("Groq API Key unavailable");

        const pillarsContext = pillars.map(p =>
            `- ID: ${p.id}\n  NAME: ${p.name}\n  KEY MESSAGE: ${p.key_message}\n  FOCUS: ${p.focus_area}\n  PROPORTION: ${p.proportion}%`
        ).join('\n\n');

        const userPrompt = `
        I need a content plan for a "${cycleData.duration_days}-day" cycle starting on "${cycleData.start_date}".
        
        **THESIS**: "${cycleData.thesis}"
        **DAYS**: ${cycleData.schedule_days.join(', ')}
        
        **PILLARS**:
        ${pillarsContext}

        **INSTRUCTIONS**:
        1. Create posts strictly adhering to pillar proportions.
        2. Distribute dates correctly (e.g., only on Mon, Wed, Fri if specified).
        3. Ensure variety in formats.
        4. Return ONLY valid JSON.
        `;

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userPrompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error("No content generated");

            const parsed = JSON.parse(content);
            return parsed.posts || parsed;
        } catch (error) {
            console.error("Groq Generation Error:", error);
            throw error;
        }
    }
};
