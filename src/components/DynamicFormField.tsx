import React from 'react';
import { OrderFieldConfig } from '../types';

interface DynamicFormFieldProps {
    field: OrderFieldConfig;
    value: any;
    onChange: (value: any) => void;
    error?: string;
    formValues: any; // For visibility logic
}

export const DynamicFormField: React.FC<DynamicFormFieldProps> = ({ field, value, onChange, error, formValues }) => {
    // Visibility Logic
    if (field.visibleIf) {
        const dependentValue = formValues[field.visibleIf.field];
        if (dependentValue !== field.visibleIf.value) {
            return null;
        }
    }

    const baseClasses = "w-full bg-slate-50 border border-transparent p-3 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium placeholder:text-slate-400";
    const labelClasses = "text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1";

    const renderInput = () => {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'date':
                return (
                    <input
                        type={field.type}
                        value={value || ''}
                        onChange={(e) => onChange(field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        className={baseClasses}
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        rows={3}
                        className={`${baseClasses} resize-none`}
                    />
                );
            case 'select':
                return (
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        required={field.required}
                        className={baseClasses}
                    >
                        <option value="">Select {field.label}...</option>
                        {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'boolean':
                return (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-transparent hover:bg-white hover:border-blue-500/20 transition-all">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => onChange(e.target.checked)}
                            className="w-5 h-5 accent-blue-600 rounded-lg cursor-pointer"
                        />
                        <span className="text-sm font-bold text-slate-700">{field.label}</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-1.5 animate-fade-in">
            {field.type !== 'boolean' && (
                <label className={labelClasses}>
                    {field.label} {field.required && <span className="text-red-500 font-black">*</span>}
                </label>
            )}
            {renderInput()}
            {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
        </div>
    );
};
