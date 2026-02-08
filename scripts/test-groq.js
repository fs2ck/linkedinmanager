
// scripts/test-groq.js
import Groq from 'groq-sdk';
import 'dotenv/config'; // To load .env

// Mock environment if needed or just use process.env
const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.error("❌ ERROR: VITE_GROQ_API_KEY is missing in .env");
    process.exit(1);
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

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
- "date": "YYYY-MM-DD"
- "pillar_id": (UUID of the pillar)
- "theme": String
- "title": String (Hook/Headline)
- "format": String (Framework, Provocação, Storytelling, Opinião, Reflexão, Caso de uso)
- "objective": String (Autoridade técnica, Debate executivo, Visibilidade C-level)
- "perspective": String (The unique angle)
`;

// MOCK DATA FROM USER EXAMPLE
const cycleData = {
    duration_days: 90,
    start_date: "2026-03-01",
    thesis: "Posicionar-me como uma das principais referências nacionais em IA aplicada a negócios, demonstrando que IA não é sobre tecnologia, mas sobre decisão executiva.",
    schedule_days: ['Mon', 'Wed', 'Fri']
};

const pillars = [
    { id: 'p1', name: 'IA COMO SISTEMA DE DECISÃO', key_message: 'IA não é ferramenta, é decisão executiva', focus_area: 'Negócios', proportion: 22 },
    { id: 'p2', name: 'CX/UX COMO SISTEMAS ESTRATÉGICOS', key_message: 'CX não é NPS, é sistema de criação de valor', focus_area: 'Estratégia', proportion: 19 },
    { id: 'p3', name: 'TRANSFORMAÇÃO DIGITAL EM AMBIENTES COMPLEXOS', key_message: 'Transformação real acontece em ambientes regulados', focus_area: 'Complexidade', proportion: 19 }
];

async function runTest() {
    console.log("🚀 Starting Groq Generation Test...");
    console.log("Thesis:", cycleData.thesis);

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
    2. Distribute dates correctly.
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
        console.log("\n✅ Generation Successful!");
        console.log("---------------------------------------------------");
        console.log(content);
        console.log("---------------------------------------------------");

        try {
            const parsed = JSON.parse(content);
            console.log(`\n📊 Generated ${parsed.posts?.length || 0} posts.`);
            if (parsed.posts?.length > 0) {
                console.log("Example Post:");
                console.log(parsed.posts[0]);
            }
        } catch (e) {
            console.error("❌ JSON Parse Error:", e.message);
        }

    } catch (error) {
        console.error("❌ Groq API Error:", error);
    }
}

runTest();
