import React from 'react';
import { Check } from 'lucide-react';
import './Stepper.css';

const Stepper = ({ steps, currentStep, onStepClick }) => {
    return (
        <div className="stepper-container">
            <div className="stepper-wrapper">
                {/* Background Line */}
                <div className="stepper-line-bg" />

                {/* Active Line */}
                <div
                    className="stepper-line-active"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isCompleted = currentStep > stepNum;
                    const isActive = currentStep === stepNum;
                    const isPending = currentStep < stepNum;

                    return (
                        <div
                            key={stepNum}
                            className={`stepper-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                            onClick={() => isCompleted && onStepClick && onStepClick(stepNum)}
                        >
                            <div className="stepper-circle">
                                {isCompleted ? <Check size={18} strokeWidth={3} /> : stepNum}
                            </div>
                            <div className="stepper-label-container">
                                <span className="stepper-label">{step.label}</span>
                                <span className="stepper-status">
                                    {isCompleted ? 'Concluído' : isActive ? 'Em andamento' : 'Pendente'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Stepper;
