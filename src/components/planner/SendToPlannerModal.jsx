import React, { useState, useEffect } from 'react';
import { Calendar, Tag, Clock, X, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { usePlannerStore } from '../../stores/usePlannerStore';
import DateTimePicker from '../ui/DateTimePicker';
import toast from 'react-hot-toast';
import './SendToPlannerModal.css';

export default function SendToPlannerModal({ isOpen, onClose, draftContent, draftTitle }) {
    const { pillars, currentPlan, fetchCurrentPlan } = usePlannerStore();
    const [selectedPillar, setSelectedPillar] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && !currentPlan) {
            fetchCurrentPlan();
        }
    }, [isOpen, currentPlan, fetchCurrentPlan]);

    const handleSend = async () => {
        if (!selectedPillar) {
            toast.error('Selecione um pilar estratégico');
            return;
        }

        setLoading(true);
        try {
            const { storageService } = await import('../../services/storage/supabaseService');

            await storageService.createPlannedPosts([{
                cycle_id: currentPlan.id,
                pillar_id: selectedPillar,
                title: draftTitle,
                content: draftContent,
                date: selectedDate.toISOString(),
                status: 'planned'
            }]);

            toast.success('Rascunho enviado para o Planejamento!');
            onClose();
        } catch (error) {
            console.error('Error sending to planner:', error);
            toast.error('Erro ao enviar para o planejamento');
        } finally {
            setLoading(false);
        }
    };

    if (!currentPlan && !loading) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Enviar para Planejamento" size="md">
                <div className="p-6 text-center">
                    <p className="text-gray-500 mb-4">Você precisa de um plano de conteúdo ativo para fazer isso.</p>
                    <Button variant="primary" onClick={onClose}>Fechar</Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Enviar para Planejamento" size="md">
            <div className="planner-modal-content">
                <p className="modal-description">
                    Selecione onde este rascunho deve ser encaixado no seu planejamento estratégico.
                </p>

                <div className="modal-sections">
                    {/* Pillar Selection */}
                    <div className="modal-section">
                        <label className="modal-section-label">
                            <Tag size={20} />
                            Pilar Estratégico
                        </label>
                        <div className="pillars-chips-container">
                            {pillars.map(pillar => (
                                <button
                                    key={pillar.id}
                                    type="button"
                                    onClick={() => setSelectedPillar(pillar.id)}
                                    className={`pillar-chip ${selectedPillar === pillar.id ? 'active' : ''}`}
                                >
                                    {pillar.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div className="modal-section planner-modal-date-picker">
                        <label className="modal-section-label">
                            <Calendar size={20} />
                            Data e Hora Sugerida
                        </label>
                        <DateTimePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            minDate={new Date()}
                        />
                    </div>
                </div>

                <div className="modal-footer-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="btn-confirm"
                        onClick={handleSend}
                        disabled={loading || !selectedPillar}
                    >
                        {loading ? 'Enviando...' : 'Confirmar Envio'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
