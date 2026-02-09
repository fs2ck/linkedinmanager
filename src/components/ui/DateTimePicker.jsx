import React, { forwardRef } from 'react';
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
    return (
        <div className="datetime-picker-wrapper">
            {label && <label className="datetime-picker-label">{label}</label>}
            <div className="datetime-picker-container">
                <span className="datetime-picker-icon">
                    {showTimeSelect ? <Clock size={18} /> : <Calendar size={18} />}
                </span>
                <DatePicker
                    ref={ref}
                    selected={value}
                    onChange={onChange}
                    showTimeSelect={showTimeSelect}
                    minDate={minDate}
                    dateFormat={dateFormat}
                    placeholderText={placeholderText}
                    disabled={disabled}
                    className={`datetime-picker-input ${error ? 'datetime-picker-error' : ''} ${className}`}
                    timeIntervals={15}
                    timeCaption="Hora"
                    {...props}
                />
            </div>
            {error && <span className="datetime-picker-error-message">{error}</span>}
        </div>
    );
});

DateTimePicker.displayName = 'DateTimePicker';

export default DateTimePicker;
