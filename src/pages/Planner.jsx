import React, { useEffect, useState } from 'react';
import { usePlannerStore } from '../stores/usePlannerStore';
import DashboardLayout from '../components/layout/DashboardLayout';
import PlannerCalendar from '../components/planner/PlannerCalendar';
import CreateCycleWizard from '../components/planner/CreateCycleWizard';
import { Sparkles, Loader, Trash2, AlertTriangle } from 'lucide-react';
import DeletePlanModal from '../components/planner/DeletePlanModal';
import Button from '../components/ui/Button';
import './Planner.css';

const Planner = () => {
    const { currentPlan, fetchCurrentPlan, pillars, posts, isLoading, deleteCurrentPlan } = usePlannerStore();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchCurrentPlan();
    }, [fetchCurrentPlan]);

    if (isLoading) {
        return (
            <DashboardLayout title="Estratégia de Conteúdo">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader className="w-8 h-8 animate-spin text-primary-500" />
                </div>
            </DashboardLayout>
        );
    }

    const hasContent = currentPlan && (pillars.length > 0 || posts.length > 0);

    return (
        <DashboardLayout title="Estratégia de Conteúdo">
            <div className="animate-fade-in">
                {!hasContent ? (
                    <div className="py-2">
                        <CreateCycleWizard />
                    </div>
                ) : (
                    <div>
                        {/* Main Header Card */}
                        <div className="planner-header-card">
                            {/* Top Section: Title + Subtitle + Button */}
                            <div className="planner-header-top">
                                <div className="planner-header-content">
                                    <h1 className="planner-title">
                                        Calendário Editorial
                                    </h1>
                                    <p className="planner-subtitle">
                                        Acompanhe e refine sua tese estratégica semanalmente. Visualize sua presença digital e garanta consistência.
                                    </p>
                                </div>
                                <div className="planner-button-container">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="btn-delete-secondary font-medium"
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        icon={Trash2}
                                    >
                                        Excluir Plano
                                    </Button>
                                </div>
                            </div>

                            {/* Thesis Section */}
                            <div className="planner-thesis-section">
                                <div className="planner-thesis-icon">
                                    <Sparkles size={20} />
                                </div>
                                <div className="planner-thesis-content">
                                    <div className="planner-thesis-label">
                                        TESE ESTRATÉGICA
                                    </div>
                                    <p className="planner-thesis-text">
                                        "{currentPlan?.strategic_thesis || currentPlan?.thesis || 'Nenhuma tese definida'}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Card */}
                        <div className="planner-calendar-card">
                            <PlannerCalendar onOpenDelete={() => setIsDeleteModalOpen(true)} />
                        </div>
                    </div>
                )}
            </div>

            <DeletePlanModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={async () => {
                    await deleteCurrentPlan();
                    setIsDeleteModalOpen(false);
                }}
            />
        </DashboardLayout>
    );
};

export default Planner;
