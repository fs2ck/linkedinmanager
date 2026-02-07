import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const groqClient = axios.create({
    baseURL: GROQ_API_URL,
    headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
    },
});

// AI Service for content generation and refinement
export const aiService = {
    async generateDraft({ topic, tone = 'professional', length = 'medium', context = '' }) {
        const prompt = `Você é um especialista em criação de conteúdo para LinkedIn.

Tarefa: Criar um post sobre "${topic}"

Tom: ${tone}
Tamanho: ${length === 'short' ? '100-150 palavras' : length === 'medium' ? '150-250 palavras' : '250-400 palavras'}
${context ? `Contexto adicional: ${context}` : ''}

Diretrizes:
- Comece com um gancho forte que capture atenção
- Use parágrafos curtos para facilitar leitura
- Inclua insights valiosos ou aprendizados
- Termine com uma call-to-action ou pergunta para engajamento
- Use emojis estrategicamente (mas não exagere)
- Não use hashtags (serão adicionadas separadamente)

Crie o post:`;

        try {
            const response = await groqClient.post('', {
                model: 'llama-3.1-70b-versatile',
                messages: [
                    { role: 'system', content: 'Você é um especialista em criação de conteúdo para LinkedIn, focado em gerar posts que engajam e agregam valor.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1000,
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error generating draft:', error);
            throw new Error('Falha ao gerar rascunho. Verifique sua API key.');
        }
    },

    async refineDraft({ content, instructions }) {
        const prompt = `Você é um editor especializado em conteúdo para LinkedIn.

Post atual:
"""
${content}
"""

Instruções de refinamento:
${instructions}

Por favor, refine o post seguindo as instruções acima. Mantenha o tom profissional e o formato adequado para LinkedIn.

Post refinado:`;

        try {
            const response = await groqClient.post('', {
                model: 'llama-3.1-70b-versatile',
                messages: [
                    { role: 'system', content: 'Você é um editor especializado em refinar conteúdo para LinkedIn.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.6,
                max_tokens: 1000,
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error refining draft:', error);
            throw new Error('Falha ao refinar rascunho.');
        }
    },

    async suggestImprovements(content) {
        const prompt = `Analise o seguinte post do LinkedIn e sugira melhorias específicas:

"""
${content}
"""

Forneça 3-5 sugestões concretas de melhoria, focando em:
- Clareza e impacto
- Estrutura e formatação
- Engajamento
- Call-to-action

Formato: Liste as sugestões de forma concisa e acionável.`;

        try {
            const response = await groqClient.post('', {
                model: 'llama-3.1-70b-versatile',
                messages: [
                    { role: 'system', content: 'Você é um consultor de conteúdo para LinkedIn.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500,
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error suggesting improvements:', error);
            throw new Error('Falha ao gerar sugestões.');
        }
    },

    async generateHashtags(content) {
        const prompt = `Com base no seguinte post do LinkedIn, sugira 5-8 hashtags relevantes:

"""
${content}
"""

Retorne apenas as hashtags, separadas por espaço, no formato #hashtag.`;

        try {
            const response = await groqClient.post('', {
                model: 'llama-3.1-70b-versatile',
                messages: [
                    { role: 'system', content: 'Você é um especialista em estratégia de hashtags para LinkedIn.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5,
                max_tokens: 200,
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error generating hashtags:', error);
            throw new Error('Falha ao gerar hashtags.');
        }
    },

    async chatWithAgent({ messages, systemPrompt }) {
        try {
            const response = await groqClient.post('', {
                model: 'llama-3.1-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt || 'Você é um assistente especializado em criação de conteúdo para LinkedIn.' },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 800,
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error in chat:', error);
            throw new Error('Falha na comunicação com o agente.');
        }
    },
};
