import React from 'react';
import './Select.css';

export default function Select({
    label,
    placeholder = 'Selecione...',
    value,
    onChange,
    options = [],
    error,
    icon,
    disabled = false,
    fullWidth = false,
    className = '',
    ...props
}) {
    const selectClasses = [
        'select',
        error && 'select-error',
        icon && 'select-with-icon',
        fullWidth && 'select-full',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className="select-wrapper">
            {label && <label className="select-label">{label}</label>}
            <div className="select-container">
                {icon && (
                    <span className="select-icon">
                        {React.isValidElement(icon) ? icon : React.createElement(icon, { size: 18 })}
                    </span>
                )}
                <select
                    className={selectClasses}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            {error && <span className="select-error-message">{error}</span>}
        </div>
    );
}
