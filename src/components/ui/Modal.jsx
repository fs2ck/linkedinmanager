import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md', hideHeader = false, hideFooter = false }) => {
    const modalRef = useRef(null);

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

    const sizeClass = size === 'fullscreen' ? 'modal-fullscreen' : '';

    const modalContent = (
        <div className="modal-backdrop animate-fade-in" onClick={handleBackdropClick}>
            <div
                ref={modalRef}
                className={`modal-content ${sizeClass} animate-scale-in`}
                role="dialog"
                aria-modal="true"
            >
                {!hideHeader && (
                    <div className="modal-header">
                        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                )}

                <div className="modal-body">
                    {children}
                </div>

                {!hideFooter && footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    // Use portal to render modal at document.body level
    return createPortal(modalContent, document.body);
};

export default Modal;
