import React from 'react';
import { OrderFieldConfig } from '../types';

interface DynamicFormFieldProps {
    field: OrderFieldConfig;
    value: any;
    onChange: (value: any) => void;
    formValues: any;
}

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
    field,
    value,
    onChange,
    formValues
}) => {
    // Visibility Logic (Conditional Rendering)
    if (field.visibleIf) {
        const dependentValue = formValues[field.visibleIf.field];
        if (dependentValue !== field.visibleIf.value) {
            return null;
        }
    }

    const baseInputStyles = "w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold outline-none focus:bg-white focus:border-blue-500 transition-all placeholder:text-slate-300 text-sm";

    const labelMarkup = (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
            {field.label} {field.required && <span className="text-rose-500">*</span>}
        </label>
    );

    const renderField = () => {
        switch (field.type) {
            case 'textarea':
                return (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        className={`${baseInputStyles} min-h-[100px] resize-none`}
                        required={field.required}
                    />
                );

            case 'select':
                return (
                    <div className="relative">
                        <select
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className={`${baseInputStyles} appearance-none pr-10`}
                            required={field.required}
                        >
                            <option value="">Select an option</option>
                            {field.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                );

            case 'checkbox':
                return (
                    <div
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${value ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'
                            }`}
                        onClick={() => onChange(!value)}
                    >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${value ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                            }`}>
                            {value && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <span className={`text-sm font-bold ${value ? 'text-blue-700' : 'text-slate-600'}`}>
                            {field.label}
                        </span>
                    </div>
                );

            default:
                return (
                    <input
                        type={field.type}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        className={baseInputStyles}
                        required={field.required}
                    />
                );
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-top-1 duration-300">
            {field.type !== 'checkbox' && labelMarkup}
            {renderField()}
        </div>
    );
};
