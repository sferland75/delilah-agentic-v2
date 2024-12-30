import React from 'react';

type InputType = 'text' | 'number' | 'date' | 'textarea' | 'select';

interface InputFieldProps {
    label: string;
    name: string;
    value: string | number;
    type?: InputType;
    options?: { value: string; label: string }[];
    required?: boolean;
    error?: string;
    onChange: (value: any) => void;
    onBlur?: () => void;
    className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    name,
    value,
    type = 'text',
    options = [],
    required = false,
    error,
    onChange,
    onBlur,
    className = ''
}) => {
    const baseClassName = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm";
    const inputClassName = `${baseClassName} ${error ? 'border-red-500' : ''} ${className}`;

    const renderInput = () => {
        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        name={name}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        required={required}
                        className={`${inputClassName} min-h-[100px]`}
                    />
                );
            case 'select':
                return (
                    <select
                        name={name}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        required={required}
                        className={inputClassName}
                    >
                        <option value="">Select...</option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            default:
                return (
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onBlur={onBlur}
                        required={required}
                        className={inputClassName}
                    />
                );
        }
    };

    return (
        <div className="space-y-1">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderInput()}
            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
};

export default InputField;