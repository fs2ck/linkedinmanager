import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './DeletePlanModal.css';

const DeletePlanModal = ({ isOpen, onClose, onConfirm }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="delete-modal-overlay" onClick={handleBackdropClick}>
            <div className="delete-modal-container">
                <button className="delete-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="delete-modal-icon-container">
                    <AlertTriangle className="delete-modal-icon" size={32} />
                </div>

                <h2 className="delete-modal-title">Excluir Plano</h2>

                <p className="delete-modal-description">
                    Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita e removerá todos os dados associados.
                </p>

                <div className="delete-modal-actions">
                    <button className="delete-modal-btn btn-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="delete-modal-btn btn-delete-confirm" onClick={onConfirm}>
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeletePlanModal;
