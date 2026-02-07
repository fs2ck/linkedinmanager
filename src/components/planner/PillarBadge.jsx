import React from 'react';
import { PILLARS } from '../../utils/plannerUtils';

const PillarBadge = ({ pillarId }) => {
    const pillar = PILLARS[pillarId?.toUpperCase()] || { label: pillarId, color: 'bg-slate-500', bgColor: 'bg-slate-50', textColor: 'text-slate-600' };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${pillar.bgColor} ${pillar.textColor} border border-current opacity-90`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pillar.color} mr-1.5`}></span>
            {pillar.label}
        </span>
    );
};

export default PillarBadge;
