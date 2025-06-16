
import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  rows?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  min,
  max,
  rows = 3
}) => {
  const inputProps = {
    id: name,
    name,
    value,
    onChange,
    placeholder,
    disabled,
    className: error ? 'border-red-500 focus:border-red-500' : ''
  };

  const numberProps = type === 'number' ? { min, max } : {};

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {type === 'textarea' ? (
        <Textarea
          {...inputProps}
          rows={rows}
        />
      ) : (
        <Input
          {...inputProps}
          {...numberProps}
          type={type}
        />
      )}
      
      {error && (
        <div className="flex items-center space-x-1 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
