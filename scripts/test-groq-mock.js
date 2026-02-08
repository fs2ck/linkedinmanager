
// scripts/test-groq-mock.js

// MOCK GROQ SDK
class MockGroq {
    constructor(options) {
        this.apiKey = options.apiKey;
        this.chat = {
            completions: {
                create: async ({ messages }) => {
                    console.log("\n[MOCK] Sending prompt to AI...");
                    console.log("---------------------------------------------------");
                    console.log(messages[1].content.trim()); // User Prompt
                    console.log("---------------------------------------------------");

                    // Simulate API Delay
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Return Mock Response (Based on prompt requirements)
                    const mockResponse = {
                        posts: [
                            {
                                date: "2026-03-02", // Monday
                                pillar_id: "p1",
                                theme: "Os 4 níveis de maturidade em IA aplicada",
                                title: "Onde sua empresa está na escala de maturidade de IA?",
                                format: "Framework",
                                objective: "Autoridade técnica",
                                perspective: "IA evolui de automação tática para decisão autônoma."
                            },
                            {
                                date: "2026-03-04", // Wednesday
                                pillar_id: "p2",
                                theme: "Por que 90% das iniciativas de CX falham",
                                title: "CX além do NPS: O erro de focar na métrica errada",
                                format: "Provocação",
                                objective: "Debate executivo",
                                perspective: "CX estratégico conecta experiência a P&L."
                            },
                            {
                                date: "2026-03-06", // Friday
                                pillar_id: "p3",
                                theme: "Orquestrando 12 áreas e 3 legados",
                                title: "Transformação Digital: O mapa não é o território",
                                format: "Storytelling",
                                objective: "Demonstrar experiência",
                                perspective: "Transformação real exige alinhamento de incentivos."
                            }
                        ]
                    };

                    return {
                        choices: [
                            {
                                message: {
                                    content: JSON.stringify(mockResponse)
                                }
                            }
                        ]
                    };
                }
            }
        };
    }
}

// ------------------------------------------------------------------

const cycleData = {
    duration_days: 90,
    start_date: "2026-03-01",
    thesis: "Posicionar-me como autoridade em IA executive.",
    schedule_days: ['Mon', 'Wed', 'Fri']
};

const pillars = [
    { id: 'p1', name: 'IA COMO SISTEMA DE DECISÃO', key_message: 'IA é decisão', focus_area: 'Negócios', proportion: 40 },
    { id: 'p2', name: 'CX/UX ESTRATÉGICO', key_message: 'CX é valor', focus_area: 'Estratégia', proportion: 30 },
    { id: 'p3', name: 'TRANSFORMAÇÃO', key_message: 'Complexidade real', focus_area: 'Operação', proportion: 30 }
];

async function runTest() {
    console.log("🚀 Starting Groq MOCK Generation Test...");

    // Instantiate Mock instead of real SDK
    const groq = new MockGroq({ apiKey: "MOCK_KEY" });

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
                { role: "system", content: "SYSTEM PROMPT..." },
                { role: "user", content: userPrompt }
            ]
        });

        const content = completion.choices[0]?.message?.content;
        console.log("\n✅ [MOCK] Response Received!");

        try {
            const parsed = JSON.parse(content);
            console.log(`\n📊 Generated ${parsed.posts?.length || 0} posts.`);
            console.log("sample Post 1:", parsed.posts[0]);
            console.log("sample Post 2:", parsed.posts[1]);
        } catch (e) {
            console.error("❌ JSON Parse Error:", e.message);
        }

    } catch (error) {
        console.error("❌ Groq API Error:", error);
    }
}

runTest();
