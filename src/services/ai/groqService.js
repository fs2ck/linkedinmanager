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
- "tone_of_voice": String (Profissional, Analítico, Inspirador, Provocativo)
- "size": String (Curto (50-100 palavras), Médio (150-250 palavras), Longo (300-500 palavras))
`;

export const groqService = {
    async generateContentPlan(cycleData, pillars) {
        if (!groq) throw new Error("Groq API Key unavailable");

        const pillarsContext = pillars.map(p =>
            `- ID: ${p.id}\n  NAME: ${p.name}\n  KEY MESSAGE: ${p.key_message}\n  FOCUS: ${p.focus_area}\n  PROPORTION: ${p.proportion}%`
        ).join('\n\n');

        // Convert schedule_days to weekday names for clarity
        const dayMap = {
            'Monday': 'Segunda-feira',
            'Tuesday': 'Terça-feira',
            'Wednesday': 'Quarta-feira',
            'Thursday': 'Quinta-feira',
            'Friday': 'Sexta-feira',
            'Saturday': 'Sábado',
            'Sunday': 'Domingo'
        };

        const scheduleDaysFormatted = cycleData.schedule_days.map(day => `${day} (${dayMap[day]})`).join(', ');

        const userPrompt = `
        I need a content plan for a "${cycleData.duration_days}-day" cycle starting on "${cycleData.start_date}".
        
        **THESIS**: "${cycleData.thesis}"
        **ALLOWED WEEKDAYS**: ${scheduleDaysFormatted}
        
        **PILLARS**:
        ${pillarsContext}

        **CRITICAL DATE CALCULATION RULES**:
        1. Start date: ${cycleData.start_date} (YYYY-MM-DD format)
        2. ONLY schedule posts on these weekdays: ${cycleData.schedule_days.join(', ')}
        3. Calculate each post date by finding the NEXT occurrence of an allowed weekday
        4. Example: If start is Monday 2026-02-03 and allowed days are [Monday, Wednesday, Friday]:
           - Post 1: 2026-02-03 (Monday)
           - Post 2: 2026-02-05 (Wednesday)
           - Post 3: 2026-02-07 (Friday)
           - Post 4: 2026-02-10 (Monday)
           - Post 5: 2026-02-12 (Wednesday)
           - Continue this pattern...
        5. NEVER use weekdays not in the allowed list
        6. Double-check each date to ensure it falls on an allowed weekday

        **INSTRUCTIONS**:
        1. Create posts strictly adhering to pillar proportions.
        2. Calculate dates PRECISELY using the rules above - verify each date's weekday.
        3. Ensure variety in formats, objectives, tones, and sizes.
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
    },

    async generatePostContent({ title, format, objective, perspective, toneOfVoice, size }) {
        if (!groq) throw new Error("Groq API Key unavailable");

        const sizeMap = {
            'Curto (50-100 palavras)': '50-100 palavras',
            'Médio (150-250 palavras)': '150-250 palavras',
            'Longo (300-500 palavras)': '300-500 palavras'
        };

        const targetSize = sizeMap[size] || size;

        const contentPrompt = `
        Você é um especialista em criação de conteúdo para LinkedIn, focado em personal branding executivo e B2B.

        **TAREFA**: Criar um post para LinkedIn com as seguintes especificações:

        **TÍTULO/TEMA**: ${title}
        **FORMATO**: ${format}
        **OBJETIVO**: ${objective}
        **PERSPECTIVA**: ${perspective}
        **TOM DE VOZ**: ${toneOfVoice}
        **TAMANHO**: ${targetSize}

        **DIRETRIZES**:
        1. Use linguagem executiva e estratégica
        2. Seja direto e evite fluff
        3. Inclua insights acionáveis
        4. Use formatação LinkedIn (quebras de linha, emojis estratégicos)
        5. Termine com uma pergunta ou call-to-action quando apropriado
        6. Respeite o tamanho solicitado

        **FORMATO DE SAÍDA**:
        Retorne APENAS o conteúdo do post, sem aspas, sem prefixos como "Post:" ou similares.
        O texto deve estar pronto para ser copiado e colado no LinkedIn.
        `;

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: "Você é um especialista em criação de conteúdo para LinkedIn com foco em C-level e estratégia executiva." },
                    { role: "user", content: contentPrompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.8,
                max_tokens: 1024
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error("No content generated");

            return content.trim();
        } catch (error) {
            console.error("Groq Content Generation Error:", error);
            throw error;
        }
    },

    async refineDraft({ content, instructions }) {
        if (!groq) throw new Error("Groq API Key unavailable");

        const refinePrompt = `
        Você é um especialista em refinar conteúdo para LinkedIn com foco em personal branding executivo.

        **CONTEÚDO ATUAL**:
        ${content}

        **INSTRUÇÕES DE REFINAMENTO**:
        ${instructions}

        **DIRETRIZES**:
        1. Mantenha a essência e mensagem principal do conteúdo original
        2. Aplique as instruções fornecidas de forma precisa
        3. Use linguagem executiva e profissional
        4. Mantenha a formatação adequada para LinkedIn
        5. Preserve emojis estratégicos se existirem

        **FORMATO DE SAÍDA**:
        Retorne APENAS o conteúdo refinado, sem explicações adicionais.
        O texto deve estar pronto para ser usado diretamente.
        `;

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: "Você é um especialista em refinar conteúdo para LinkedIn com foco em C-level e estratégia executiva." },
                    { role: "user", content: refinePrompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                max_tokens: 1024
            });

            const refined = completion.choices[0]?.message?.content;
            if (!refined) throw new Error("No refined content generated");

            return refined.trim();
        } catch (error) {
            console.error("Groq Refine Error:", error);
            throw error;
        }
    },

    async suggestImprovements(content) {
        if (!groq) throw new Error("Groq API Key unavailable");

        const suggestPrompt = `
        Você é um consultor especializado em conteúdo LinkedIn para executivos e C-level.

        **CONTEÚDO PARA ANÁLISE**:
        ${content}

        **TAREFA**:
        Analise o conteúdo acima e forneça sugestões específicas e acionáveis para melhorá-lo.

        **FOQUE EM**:
        1. **Estrutura**: O post tem um gancho forte? A progressão faz sentido?
        2. **Clareza**: A mensagem é clara e direta?
        3. **Engajamento**: O conteúdo incentiva interação?
        4. **Autoridade**: Demonstra expertise e pensamento estratégico?
        5. **Formatação**: Está otimizado para leitura no LinkedIn?

        **FORMATO DE SAÍDA**:
        Forneça 3-5 sugestões concretas e específicas, numeradas.
        Seja direto e prático. Evite generalidades.
        `;

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: "Você é um consultor especializado em conteúdo LinkedIn para executivos." },
                    { role: "user", content: suggestPrompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                max_tokens: 800
            });

            const suggestions = completion.choices[0]?.message?.content;
            if (!suggestions) throw new Error("No suggestions generated");

            return suggestions.trim();
        } catch (error) {
            console.error("Groq Suggestions Error:", error);
            throw error;
        }
    },

    async chatWithAgent({ messages, systemPrompt }) {
        if (!groq) throw new Error("Groq API Key unavailable");

        const defaultSystemPrompt = "Você é um assistente especializado em criação e refinamento de conteúdo para LinkedIn, com foco em personal branding executivo e C-level.";

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt || defaultSystemPrompt },
                    ...messages
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.8,
                max_tokens: 1024
            });

            const response = completion.choices[0]?.message?.content;
            if (!response) throw new Error("No response generated");

            return response.trim();
        } catch (error) {
            console.error("Groq Chat Error:", error);
            throw error;
        }
    },

    async generateDraft({ topic, tone, length, context }) {
        if (!groq) throw new Error("Groq API Key unavailable");

        const lengthMap = {
            'short': '100-150 palavras',
            'medium': '150-250 palavras',
            'long': '250-400 palavras'
        };

        const toneMap = {
            'professional': 'profissional e executivo',
            'casual': 'casual e acessível',
            'inspirational': 'inspirador e motivacional',
            'educational': 'educacional e didático'
        };

        const targetLength = lengthMap[length] || length;
        const targetTone = toneMap[tone] || tone;

        const draftPrompt = `
        Você é um especialista em criação de conteúdo para LinkedIn com foco em personal branding executivo.

        **TAREFA**: Criar um rascunho de post para LinkedIn sobre o seguinte tópico:

        **TÓPICO**: ${topic}
        **TOM DE VOZ**: ${targetTone}
        **TAMANHO**: ${targetLength}
        ${context ? `**CONTEXTO ADICIONAL**: ${context}` : ''}

        **DIRETRIZES**:
        1. Use linguagem adequada ao tom solicitado
        2. Seja direto e evite fluff
        3. Inclua insights valiosos e acionáveis
        4. Use formatação LinkedIn (quebras de linha, emojis estratégicos quando apropriado)
        5. Termine com uma pergunta ou call-to-action para incentivar engajamento
        6. Respeite rigorosamente o tamanho solicitado

        **FORMATO DE SAÍDA**:
        Retorne APENAS o conteúdo do post, sem aspas, sem prefixos como "Post:" ou similares.
        O texto deve estar pronto para ser copiado e colado no LinkedIn.
        `;

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: "Você é um especialista em criação de conteúdo para LinkedIn com foco em personal branding executivo e C-level." },
                    { role: "user", content: draftPrompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.8,
                max_tokens: 1024
            });

            const draft = completion.choices[0]?.message?.content;
            if (!draft) throw new Error("No draft generated");

            return draft.trim();
        } catch (error) {
            console.error("Groq Draft Generation Error:", error);
            throw error;
        }
    }
};
