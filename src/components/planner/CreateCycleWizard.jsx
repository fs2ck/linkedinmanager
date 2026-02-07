import React, { useState } from 'react';
import { usePlannerStore } from '../../stores/usePlannerStore';
import { Calendar, Target, ChevronRight, Loader, Sparkles, ArrowLeft } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CreateCycleWizard = () => {
    const { createCycle, isLoading } = usePlannerStore();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        thesis: '',
        startDate: '',
    });

    const handleCreate = async () => {
        if (!formData.thesis || !formData.startDate) return;
        try {
            await createCycle({
                startDate: formData.startDate,
                thesis: formData.thesis
            });
        } catch (err) {
            console.error(err);
        }
    };

    const nextMonday = () => {
        const d = new Date();
        d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7));
        return d.toISOString().split('T')[0];
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 animate-fade-in">
            <div className="surface overflow-hidden border-none shadow-premium">
                <div className="p-10 surface-premium relative">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-primary-200 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                            <Sparkles size={14} />
                            <span>Planejamento Estratégico</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Novo Ciclo de 90 Dias</h2>
                        <p className="text-primary-100 opacity-90">Defina sua tese central e prepare-se para dominar seu nicho.</p>
                    </div>
                    {/* Abstract background elements */}
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="p-10 space-y-8 bg-white">
                    {/* Step Indicators */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`flex-1 h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-primary-500' : 'bg-slate-100'}`}></div>
                        <div className={`flex-1 h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-primary-500' : 'bg-slate-100'}`}></div>
                    </div>

                    {/* Step 1: Tese */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                                    Sua Tese Central
                                </label>
                                <textarea
                                    className="w-full p-5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 h-40 transition-all text-lg leading-relaxed placeholder:text-slate-300"
                                    placeholder="Ex: IA não é sobre tecnologia, é sobre a economia da atenção..."
                                    value={formData.thesis}
                                    onChange={e => setFormData({ ...formData, thesis: e.target.value })}
                                />
                                <p className="text-sm text-slate-400">
                                    Esta tese será a alma de todos os seus 36 posts deste trimestre.
                                </p>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!formData.thesis}
                                    className="btn btn-primary px-8 group"
                                >
                                    Definir Datas <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Dates */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                                    Data de Início
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Calendar size={20} />
                                    </div>
                                    <input
                                        type="date"
                                        className="w-full pl-12 p-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all"
                                        defaultValue={nextMonday()}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {formData.startDate && (
                                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-primary-500 shrink-0">
                                        <Target size={20} />
                                    </div>
                                    <div>
                                        <p className="text-slate-600 font-medium">Cronograma Estimado</p>
                                        <p className="text-sm text-slate-500 mt-1 uppercase tracking-tight font-bold">
                                            {format(new Date(formData.startDate), "dd 'de' MMMM", { locale: ptBR })}
                                            <span className="mx-2 text-slate-300">→</span>
                                            {format(addDays(new Date(formData.startDate), 90), "dd 'de' MMMM", { locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 flex justify-between items-center">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-semibold transition-colors"
                                >
                                    <ArrowLeft size={18} /> Voltar
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!formData.startDate || isLoading}
                                    className="btn btn-primary px-8"
                                >
                                    {isLoading ? <Loader className="animate-spin" /> : <Sparkles />}
                                    Gerar Estratégia
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateCycleWizard;
