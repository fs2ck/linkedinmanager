import React from 'react';
import './Button.css';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    disabled = false,
    onClick,
    type = 'button',
    className = ''
}) {
    const classes = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full',
        className
    ].filter(Boolean).join(' ');

    const renderIcon = (icon) => {
        if (!icon) return null;

        // If it's already a React element (JSX literal like <Icon />), just return it
        if (React.isValidElement(icon)) {
            return icon;
        }

        // It's a component (function, class, or forwardRef object like Lucide icons)
        return React.createElement(icon, { size: size === 'sm' ? 16 : 20 });
    };

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            disabled={disabled}
        >
            {Icon && iconPosition === 'left' && (
                <span className="btn-icon">{renderIcon(Icon)}</span>
            )}
            {children}
            {Icon && iconPosition === 'right' && (
                <span className="btn-icon">{renderIcon(Icon)}</span>
            )}
        </button>
    );
}
