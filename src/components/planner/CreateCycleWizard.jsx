import React, { useState } from 'react';
import { usePlannerStore } from '../../stores/usePlannerStore';
import { ArrowRight, Sparkles, Plus, Trash2, Loader, ChevronRight, MessageSquare, Target, Layout, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Stepper from './Stepper';
import './CreateCycleWizard.css';

const CreateCycleWizard = () => {
    const { createCycle, isGenerating } = usePlannerStore();
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});

    // Step 1: Basics
    const [basics, setBasics] = useState({
        name: 'Ciclo Q1 2026',
        start_date: new Date().toISOString().split('T')[0],
        duration_days: 90,
        schedule_days: ['Mon', 'Wed', 'Fri']
    });

    // Step 2: Strategy
    const [thesis, setThesis] = useState('');

    // Step 3: Pillars
    const [pillars, setPillars] = useState([
        { name: 'IA como Sistema de Decisão', key_message: 'IA não é ferramenta, é decisão', focus_area: 'Negócios', proportion: 40, color: '#6366F1' },
        { name: 'Governança e Escala', key_message: 'Sustentabilidade > Hype', focus_area: 'Técnico', proportion: 30, color: '#10b981' },
        { name: 'Liderança', key_message: 'Humanizar a tecnologia', focus_area: 'Pessoal', proportion: 30, color: '#f59e0b' }
    ]);

    const steps = [
        { label: 'Configuração' },
        { label: 'Tese Central' },
        { label: 'Pilares Estratégicos' }
    ];

    const handleAddPillar = () => {
        setPillars([...pillars, { name: '', key_message: '', focus_area: '', proportion: 0, color: '#64748b' }]);
    };

    const handleRemovePillar = (index) => {
        setPillars(pillars.filter((_, i) => i !== index));
    };

    const handlePillarChange = (index, field, value) => {
        const newPillars = [...pillars];
        newPillars[index][field] = value;
        setPillars(newPillars);
        if (errors.pillars) setErrors({ ...errors, pillars: null });
    };

    const validateStep = (s) => {
        const newErrors = {};

        if (s === 1) {
            if (!basics.name.trim()) newErrors.name = 'O nome do ciclo é obrigatório';
            if (basics.schedule_days.length === 0) newErrors.schedule_days = 'Selecione pelo menos um dia de publicação';
        }

        if (s === 2) {
            if (!thesis.trim()) newErrors.thesis = 'Sua tese central não pode estar vazia';
            else if (thesis.length < 50) newErrors.thesis = 'Sua tese está muito curta. Tente elaborar um pouco mais (mín. 50 caracteres)';
        }

        if (s === 3) {
            if (pillars.length === 0) newErrors.pillars = 'Adicione pelo menos um pilar estratégico';
            else {
                const totalProportion = pillars.reduce((sum, p) => sum + p.proportion, 0);
                if (totalProportion !== 100) {
                    newErrors.pillars = `A soma das proporções deve ser exatamente 100% (atual: ${totalProportion}%)`;
                }
                pillars.forEach((p, i) => {
                    if (!p.name.trim()) newErrors[`pillar_${i}_name`] = 'Nome obrigatório';
                });
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handleSubmit = () => {
        if (!validateStep(3)) return;

        const endDate = new Date(basics.start_date);
        endDate.setDate(endDate.getDate() + parseInt(basics.duration_days));

        createCycle({
            ...basics,
            end_date: endDate.toISOString().split('T')[0],
            thesis,
        }, pillars);
    };

    return (
        <div className="wizard-page-container">
            {/* Stepper inside its own card for consistency */}
            <Card className="wizard-stepper-card">
                <Stepper
                    steps={steps}
                    currentStep={step}
                    onStepClick={(s) => setStep(s)}
                />
            </Card>

            <div className="wizard-main-grid">
                {/* Main Content Area */}
                <div className="wizard-content-area">
                    <Card className="wizard-step-card">
                        <div className="step-content-box">
                            {step === 1 && (
                                <div className="animate-fade-in space-y-8">
                                    <div className="section-intro">
                                        <h2 className="section-heading">Fundamentos do Ciclo</h2>
                                        <p className="section-subheading">Defina o nome, duração e frequência das suas publicações.</p>
                                    </div>

                                    <div className="form-group">
                                        <label className="input-label">Nome do Ciclo</label>
                                        <Input
                                            value={basics.name}
                                            onChange={e => {
                                                setBasics({ ...basics, name: e.target.value });
                                                if (errors.name) setErrors({ ...errors, name: null });
                                            }}
                                            className={`large-input ${errors.name ? 'border-red-500' : ''}`}
                                            placeholder="Ex: Q1 2026 - Estratégia de Autoridade"
                                        />
                                        {errors.name && (
                                            <span className="error-message flex items-center gap-1 mt-1 text-red-500 text-xs font-medium">
                                                <AlertCircle size={14} /> {errors.name}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group flex-1">
                                            <label className="input-label">Data de Início</label>
                                            <Input
                                                type="date"
                                                value={basics.start_date}
                                                onChange={e => setBasics({ ...basics, start_date: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group flex-1">
                                            <label className="input-label">Duração Estratégica</label>
                                            <div className="segmented-control">
                                                {[30, 60, 90].map(days => (
                                                    <button
                                                        key={days}
                                                        onClick={() => setBasics({ ...basics, duration_days: days })}
                                                        className={`segmented-btn ${parseInt(basics.duration_days) === days ? 'active' : ''}`}
                                                    >
                                                        {days} Dias
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100">
                                        <label className="input-label mb-4 block">Dias de Publicação</label>
                                        <div className="day-picker">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                                const isSelected = basics.schedule_days.includes(day);
                                                const labelsMap = { Mon: 'S', Tue: 'T', Wed: 'Q', Thu: 'Q', Fri: 'S', Sat: 'S', Sun: 'D' };
                                                return (
                                                    <button
                                                        key={day}
                                                        onClick={() => {
                                                            let newDays;
                                                            if (isSelected) newDays = basics.schedule_days.filter(d => d !== day);
                                                            else newDays = [...basics.schedule_days, day];
                                                            setBasics({ ...basics, schedule_days: newDays });
                                                            if (errors.schedule_days) setErrors({ ...errors, schedule_days: null });
                                                        }}
                                                        className={`day-btn ${isSelected ? 'active' : ''} ${errors.schedule_days ? 'border-red-300' : ''}`}
                                                        title={day}
                                                    >
                                                        {labelsMap[day]}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {errors.schedule_days && (
                                            <span className="error-message flex items-center gap-1 mt-3 text-red-500 text-xs font-medium">
                                                <AlertCircle size={14} /> {errors.schedule_days}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="animate-fade-in space-y-8">
                                    <div className="section-intro">
                                        <h2 className="section-heading">Sua Tese Única</h2>
                                        <p className="section-subheading">O que você quer que sua audiência aprenda ou mude de opinião?</p>
                                    </div>

                                    <div className="textarea-container">
                                        <textarea
                                            className={`premium-textarea ${errors.thesis ? 'border-red-500 bg-red-50' : ''}`}
                                            placeholder="Ex: No mercado corporativo de hoje, a verdadeira agilidade não vem de frameworks, mas da simplificação radical de processos e da autonomia real dos times..."
                                            value={thesis}
                                            onChange={e => {
                                                setThesis(e.target.value);
                                                if (errors.thesis) setErrors({ ...errors, thesis: null });
                                            }}
                                        />
                                        <div className="textarea-footer">
                                            <span className={`char-count ${thesis.length < 50 ? 'text-amber-600' : ''}`}>{thesis.length} caracteres</span>
                                            <span className="info-tip">Mínimo sugerido: 50 caracteres</span>
                                        </div>
                                        {errors.thesis && (
                                            <span className="error-message flex items-center gap-1 mt-2 text-red-500 text-xs font-medium">
                                                <AlertCircle size={14} /> {errors.thesis}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="animate-fade-in space-y-8">
                                    <div className="flex justify-between items-end">
                                        <div className="section-intro">
                                            <h2 className="section-heading">Pilares Estratégicos</h2>
                                            <p className="section-subheading">Temas recorrentes que servem de base para sua comunicação.</p>
                                        </div>
                                        <Button onClick={handleAddPillar} variant="secondary" size="sm" icon={<Plus size={16} />}>
                                            Novo Pilar
                                        </Button>
                                    </div>

                                    <div className="pillars-list">
                                        {errors.pillars && (
                                            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-700 text-sm mb-4">
                                                <AlertCircle size={20} />
                                                <p className="font-medium">{errors.pillars}</p>
                                            </div>
                                        )}
                                        {pillars.map((pillar, idx) => (
                                            <div key={idx} className={`pillar-card-v2 ${errors[`pillar_${idx}_name`] ? 'border-red-300' : ''}`} style={{ borderLeftColor: pillar.color }}>
                                                <div className="pillar-header">
                                                    <div className="flex-1">
                                                        <Input
                                                            value={pillar.name}
                                                            onChange={e => {
                                                                handlePillarChange(idx, 'name', e.target.value);
                                                                if (errors[`pillar_${idx}_name`]) {
                                                                    const nest = { ...errors };
                                                                    delete nest[`pillar_${idx}_name`];
                                                                    setErrors(nest);
                                                                }
                                                            }}
                                                            className="pillar-name-input"
                                                            placeholder="Nome do Pilar (Ex: Liderança)"
                                                        />
                                                        {errors[`pillar_${idx}_name`] && (
                                                            <span className="text-red-500 text-[10px] font-bold mt-1 block uppercase tracking-wider">
                                                                {errors[`pillar_${idx}_name`]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="pillar-actions">
                                                        <span className="proportion-badge">{pillar.proportion}%</span>
                                                        <button onClick={() => handleRemovePillar(idx)} className="delete-btn">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="pillar-body">
                                                    <Input
                                                        value={pillar.key_message}
                                                        onChange={e => handlePillarChange(idx, 'key_message', e.target.value)}
                                                        placeholder="Mensagem chave"
                                                        className="subtle-input"
                                                    />
                                                    <div className="proportion-slider-container">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={pillar.proportion}
                                                            onChange={e => handlePillarChange(idx, 'proportion', Number(e.target.value))}
                                                            className="proportion-range"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="wizard-footer">
                            <Button
                                variant="ghost"
                                onClick={() => setStep(step - 1)}
                                disabled={step === 1}
                                className={step === 1 ? 'invisible' : ''}
                            >
                                Voltar
                            </Button>

                            {step < 3 ? (
                                <Button
                                    variant="primary"
                                    onClick={handleNext}
                                    className="next-btn"
                                >
                                    Próximo Passo <ChevronRight size={18} />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isGenerating}
                                    className="generate-btn"
                                >
                                    {isGenerating ? <Loader className="animate-spin" /> : <Sparkles size={18} />}
                                    <span>{isGenerating ? 'Gerando Plano...' : 'Gerar Estratégia'}</span>
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Strategic Sidebar (Summary) */}
                <div className="wizard-summary-sidebar">
                    <Card className="summary-card sticky-sidebar">
                        <div className="summary-header">
                            <MessageSquare className="text-primary-600" />
                            <h3>Cockpit Estratégico</h3>
                        </div>

                        <div className="context-box">
                            <div className="context-item">
                                <span className="context-icon"><Target size={14} /></span>
                                <div className="context-text">
                                    <label>Objetivo</label>
                                    <p>{basics.name || 'Sem nome'}</p>
                                </div>
                            </div>
                            <div className="context-item">
                                <span className="context-icon"><Layout size={14} /></span>
                                <div className="context-text">
                                    <label>Duração & Volume</label>
                                    <p>{basics.duration_days} dias • {basics.schedule_days.length}x p/ semana</p>
                                </div>
                            </div>
                        </div>

                        <div className="ai-tips-container">
                            <h4 className="sidebar-title">Dica da IA</h4>
                            <div className="tip-bubble">
                                {step === 1 && "Dica: Ciclos de 90 dias permitem um 'arco narrativo' mais profundo. Você começa plantando dúvidas e termina colhendo autoridade."}
                                {step === 2 && "Dica: A tese ideal deve causar um 'momento ahá!' no seu leitor. Se for óbvio, não é tese, é fato."}
                                {step === 3 && "Dica: Tente não passar de 4 pilares. Quanto mais foco, mais rápida é a associação do seu nome ao tema."}
                            </div>
                        </div>

                        {step > 1 && (
                            <div className="choices-summary pt-6 mt-6 border-t border-slate-100">
                                <h4 className="sidebar-title">Sua Escolha</h4>
                                {step === 2 && <p className="summary-preview">Configuração concluída: {basics.duration_days} dias previstos.</p>}
                                {step === 3 && thesis && <p className="summary-preview italic">"{(thesis.substring(0, 80))}..."</p>}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CreateCycleWizard;
