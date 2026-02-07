import React, { useEffect } from 'react';
import { usePlannerStore } from '../stores/usePlannerStore';
import DashboardLayout from '../components/layout/DashboardLayout';
import WeeklyPlanner from '../components/planner/WeeklyPlanner';
import CreateCycleWizard from '../components/planner/CreateCycleWizard';
import { Sparkles, Loader } from 'lucide-react';

const Planner = () => {
    const { currentPlan, fetchCurrentPlan, isLoading } = usePlannerStore();

    useEffect(() => {
        fetchCurrentPlan();
    }, [fetchCurrentPlan]);

    if (isLoading && !currentPlan) {
        return (
            <DashboardLayout title="Planejamento Estratégico">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader className="w-8 h-8 animate-spin text-primary-500" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Estratégia de Conteúdo"
            headerActions={
                currentPlan && (
                    <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold border border-indigo-100 animate-fade-in transition-all">
                        <Sparkles size={16} />
                        <span>Ciclo Ativo: {currentPlan.thesis.substring(0, 20)}...</span>
                    </div>
                )
            }
        >
            <div className="animate-fade-in">
                {!currentPlan ? (
                    <div className="py-10">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Domine o Jogo no LinkedIn</h2>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                                Crie um ecossistema de autoridade em 90 dias com nossa IA estratégica.
                                Sem bloqueios criativos, apenas execução de alto nível.
                            </p>
                        </div>
                        <CreateCycleWizard />
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div>
                                <h2 className="text-2xl font-bold">Calendário Editorial</h2>
                                <p className="text-slate-500">Acompanhe e refine sua tese estratégica semanalmente.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase">Tese do Ciclo</p>
                                    <p className="text-sm font-medium text-slate-700 italic">"{currentPlan.thesis}"</p>
                                </div>
                            </div>
                        </div>
                        <WeeklyPlanner />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Planner;
