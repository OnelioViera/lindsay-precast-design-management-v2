'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface FormField {
  fieldId: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date';
  required: boolean;
  placeholder?: string;
  order: number;
  options?: string[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

interface DynamicFormRendererProps {
  fields: FormField[];
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  selectOptions?: Record<string, Array<{ value: string; label: string }>>;
}

export function DynamicFormRenderer({
  fields,
  values,
  onChange,
  errors = {},
  disabled = false,
  selectOptions = {},
}: DynamicFormRendererProps) {
  // Sort fields by order
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {sortedFields.map((field) => {
        const value = values[field.name] || '';
        const error = errors[field.name];

        return (
          <div key={field.fieldId}>
            <Label htmlFor={field.fieldId}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.type === 'textarea' ? (
              <Textarea
                id={field.fieldId}
                name={field.name}
                value={value}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                disabled={disabled}
                className="mt-2"
                required={field.required}
              />
            ) : field.type === 'select' ? (
              <Select
                value={value}
                onValueChange={(val) => onChange(field.name, val)}
                disabled={disabled}
              >
                <SelectTrigger className="mt-2" id={field.fieldId}>
                  <SelectValue placeholder={field.placeholder || 'Select an option'} />
                </SelectTrigger>
                <SelectContent>
                  {(selectOptions[field.name] || field.options || []).map((option) => {
                    const optValue = typeof option === 'string' ? option : option.value;
                    const optLabel = typeof option === 'string' ? option : option.label;
                    return (
                      <SelectItem key={optValue} value={optValue}>
                        {optLabel}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  id={field.fieldId}
                  name={field.name}
                  type="checkbox"
                  checked={value === true || value === 'true'}
                  onChange={(e) => onChange(field.name, e.target.checked)}
                  disabled={disabled}
                  className="h-4 w-4"
                />
                <Label htmlFor={field.fieldId} className="cursor-pointer mb-0">
                  {field.label}
                </Label>
              </div>
            ) : (
              <Input
                id={field.fieldId}
                name={field.name}
                type={field.type}
                value={value}
                onChange={(e) => onChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                disabled={disabled}
                className="mt-2"
                required={field.required}
                min={field.validation?.min}
                max={field.validation?.max}
                minLength={field.validation?.minLength}
                maxLength={field.validation?.maxLength}
                pattern={field.validation?.pattern}
              />
            )}

            {error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
