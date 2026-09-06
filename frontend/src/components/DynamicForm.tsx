import React from 'react';

export interface FieldRule {
  name: string;
  label: string;
  field_type: string; // 'text' | 'number' | 'email' | 'date'
  required: boolean;
  validation_regex?: string;
  min_value?: number | null;
  max_value?: number | null;
}

interface DynamicFormProps {
  fields: FieldRule[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors: Record<string, string>;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ fields, values, onChange, errors }) => {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-black">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.max_value != null && (
              <span className="text-xs text-zinc-500 font-mono">
                Max limit: ₹{Number(field.max_value).toLocaleString()}
              </span>
            )}
          </div>
          
          <input
            type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'}
            value={values[field.name] || ''}
            min={field.min_value != null ? field.min_value : undefined}
            max={field.max_value != null ? field.max_value : undefined}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
          
          {errors[field.name] && (
            <span className="text-xs text-red-600 font-medium">{errors[field.name]}</span>
          )}
        </div>
      ))}
    </div>
  );
};