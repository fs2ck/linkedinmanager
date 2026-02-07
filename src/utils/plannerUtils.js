import { addDays, format, startOfWeek, nextMonday } from 'date-fns';

export const PILLARS = {
    AUTHORITY: {
        id: 'authority',
        label: 'Autoridade',
        description: 'Posts técnicos, estudos de caso e visão de mercado para construir respeito.',
        color: 'bg-indigo-500',
        textColor: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
    },
    PERSONAL: {
        id: 'personal',
        label: 'Conexão Pessoal',
        description: 'Histórias, vulnerabilidade e bastidores para humanizar a marca.',
        color: 'bg-secondary-500',
        textColor: 'text-secondary-600',
        bgColor: 'bg-secondary-50'
    },
    CONVERSION: {
        id: 'conversion',
        label: 'Vendas / Conversão',
        description: 'Chamadas diretas para ação, ofertas e demonstração de valor claro.',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50'
    }
};

export const POST_FORMATS = [
    { id: 'text', label: 'Texto Curto' },
    { id: 'carousel', label: 'Carrossel' },
    { id: 'video', label: 'Vídeo / Reel' },
    { id: 'article', label: 'Artigo / News' }
];

export const POST_OBJECTIVES = [
    { id: 'educational', label: 'Educar o Público' },
    { id: 'inspiring', label: 'Inspirar / Motivar' },
    { id: 'sales', label: 'Chamada para Venda' },
    { id: 'discussion', label: 'Gerar Debate' }
];

export const generate90DaySlots = (startDateStr) => {
    const slots = [];
    let currentDate = new Date(startDateStr);

    // Garantir que começamos na segunda-feira
    const monday = nextMonday(addDays(currentDate, -1));

    // 12 Semanas (aproximadamente 90 dias)
    for (let week = 1; week <= 12; week++) {
        const weekStart = addDays(monday, (week - 1) * 7);

        // Estratégia de 3 posts por semana: Seg, Qua, Sex
        const schedule = [
            { day: 'monday', offset: 0, pillar: 'authority' },
            { day: 'wednesday', offset: 2, pillar: 'personal' },
            { day: 'friday', offset: 4, pillar: 'conversion' }
        ];

        schedule.forEach(slot => {
            const slotDate = addDays(weekStart, slot.offset);
            slots.push({
                week_number: week,
                day_of_week: slot.day,
                date: format(slotDate, 'yyyy-MM-dd'),
                pillar: slot.pillar,
                format: 'text',
                objective: 'educational',
                status: 'planned'
            });
        });
    }

    return slots;
};
