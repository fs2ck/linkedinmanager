import React, { forwardRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DateTimePicker.css';
import { Calendar, Clock } from 'lucide-react';

const DateTimePicker = forwardRef(({
    label,
    value,
    onChange,
    error,
    disabled = false,
    showTimeSelect = true,
    minDate = new Date(),
    dateFormat = "dd/MM/yyyy HH:mm",
    placeholderText = "Selecione data e hora",
    className = '',
    ...props
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    // Format time for display
    const formatTime = (date) => {
        if (!date) return '';
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Handle time change from input
    const handleTimeChange = (e) => {
        const timeValue = e.target.value; // Format: "HH:mm"
        if (!timeValue || !value) return;

        const [hours, minutes] = timeValue.split(':').map(Number);
        const newDate = new Date(value);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        onChange(newDate);
    };

    // Handle date change from calendar
    const handleDateChange = (date) => {
        if (!date) {
            onChange(null);
            return;
        }

        // Preserve time if it exists
        if (value && showTimeSelect) {
            date.setHours(value.getHours());
            date.setMinutes(value.getMinutes());
        } else if (showTimeSelect) {
            // Set default time to 10:00 if no time selected
            date.setHours(10);
            date.setMinutes(0);
        }

        onChange(date);
    };

    const displayValue = value
        ? `${value.toLocaleDateString('pt-BR')}${showTimeSelect ? ` às ${formatTime(value)}` : ''}`
        : '';

    return (
        <div className="datetime-picker-wrapper">
            {label && <label className="datetime-picker-label">{label}</label>}

            {/* Display Input */}
            <div className="datetime-picker-display" onClick={() => !disabled && setIsOpen(!isOpen)}>
                <span className="datetime-picker-icon">
                    <Calendar size={18} />
                </span>
                <input
                    type="text"
                    value={displayValue}
                    placeholder={placeholderText}
                    readOnly
                    disabled={disabled}
                    className={`datetime-picker-input ${error ? 'datetime-picker-error' : ''} ${className}`}
                />
            </div>

            {/* Inline Calendar Popup */}
            {isOpen && !disabled && (
                <div className="datetime-picker-popup">
                    <div className="datetime-picker-popup-header">
                        <span>Selecionar Data{showTimeSelect ? ' e Hora' : ''}</span>
                        <button
                            className="datetime-picker-close"
                            onClick={() => setIsOpen(false)}
                            type="button"
                        >
                            ✕
                        </button>
                    </div>

                    <DatePicker
                        ref={ref}
                        selected={value}
                        onChange={handleDateChange}
                        minDate={minDate}
                        inline
                        calendarClassName="datetime-picker-calendar"
                        {...props}
                    />

                    {showTimeSelect && (
                        <div className="datetime-picker-time-section">
                            <div className="datetime-picker-time-input-wrapper">
                                <Clock size={16} />
                                <input
                                    type="time"
                                    value={value ? formatTime(value) : '10:00'}
                                    onChange={handleTimeChange}
                                    className="datetime-picker-time-input"
                                />
                            </div>
                            <div className="datetime-picker-time-presets">
                                <button type="button" onClick={() => {
                                    const newDate = value ? new Date(value) : new Date();
                                    newDate.setHours(9, 0, 0, 0);
                                    onChange(newDate);
                                }}>09:00</button>
                                <button type="button" onClick={() => {
                                    const newDate = value ? new Date(value) : new Date();
                                    newDate.setHours(12, 0, 0, 0);
                                    onChange(newDate);
                                }}>12:00</button>
                                <button type="button" onClick={() => {
                                    const newDate = value ? new Date(value) : new Date();
                                    newDate.setHours(15, 0, 0, 0);
                                    onChange(newDate);
                                }}>15:00</button>
                                <button type="button" onClick={() => {
                                    const newDate = value ? new Date(value) : new Date();
                                    newDate.setHours(18, 0, 0, 0);
                                    onChange(newDate);
                                }}>18:00</button>
                            </div>
                        </div>
                    )}

                    <div className="datetime-picker-popup-footer">
                        <button
                            type="button"
                            className="datetime-picker-clear-btn"
                            onClick={() => {
                                onChange(null);
                                setIsOpen(false);
                            }}
                        >
                            Limpar
                        </button>
                        <button
                            type="button"
                            className="datetime-picker-confirm-btn"
                            onClick={() => setIsOpen(false)}
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            )}

            {error && <span className="datetime-picker-error-message">{error}</span>}
        </div>
    );
});

DateTimePicker.displayName = 'DateTimePicker';

export default DateTimePicker;
