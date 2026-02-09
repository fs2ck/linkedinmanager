import React from 'react';
import './RichTextEditor.css';

export default function RichTextEditor({
    label,
    value,
    onChange,
    error,
    placeholder = 'Escreva seu conteúdo...',
    disabled = false,
    className = '',
    ...props
}) {
    const editorClasses = [
        'rich-text-editor',
        error && 'rich-text-editor-error',
        disabled && 'rich-text-editor-disabled',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className="rich-text-editor-wrapper">
            {label && <label className="rich-text-editor-label">{label}</label>}
            <div className={editorClasses}>
                <textarea
                    className="rich-text-textarea"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={12}
                    {...props}
                />
            </div>
            {error && <span className="rich-text-editor-error-message">{error}</span>}
        </div>
    );
}
