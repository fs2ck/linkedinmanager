import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
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

    const sizeClasses = {
        popup: 'max-w-sm w-full m-4',
        sm: 'max-w-md w-full m-4',
        md: 'max-w-xl w-full m-4',
        lg: 'max-w-3xl w-full m-4',
        xl: 'max-w-5xl w-full m-4',
        full: 'max-w-full m-4'
    };

    return (
        <div className="modal-backdrop animate-fade-in" onClick={handleBackdropClick}>
            <div
                ref={modalRef}
                className={`modal-content ${sizeClasses[size] || sizeClasses.md} animate-scale-in`}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal-header">
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {children}
                </div>

                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
