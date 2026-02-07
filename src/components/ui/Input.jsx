import React from 'react';
import './Input.css';

export default function Input({
    type = 'text',
    label,
    placeholder,
    value,
    onChange,
    error,
    icon,
    disabled = false,
    fullWidth = false,
    className = '',
    ...props
}) {
    const inputClasses = [
        'input',
        error && 'input-error',
        icon && 'input-with-icon',
        fullWidth && 'input-full',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className="input-wrapper">
            {label && <label className="input-label">{label}</label>}
            <div className="input-container">
                {icon && (
                    <span className="input-icon">
                        {typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof) ? (
                            React.createElement(icon, { size: 18 })
                        ) : (
                            icon
                        )}
                    </span>
                )}
                <input
                    type={type}
                    className={inputClasses}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    {...props}
                />
            </div>
            {error && <span className="input-error-message">{error}</span>}
        </div>
    );
}

export function Textarea({
    label,
    placeholder,
    value,
    onChange,
    error,
    rows = 4,
    disabled = false,
    fullWidth = true,
    className = '',
    ...props
}) {
    const textareaClasses = [
        'textarea',
        error && 'input-error',
        fullWidth && 'input-full',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className="input-wrapper">
            {label && <label className="input-label">{label}</label>}
            <textarea
                className={textareaClasses}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                rows={rows}
                disabled={disabled}
                {...props}
            />
            {error && <span className="input-error-message">{error}</span>}
        </div>
    );
}
