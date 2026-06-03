import React from 'react'
import { ChevronDown } from 'lucide-react'

interface FormSelectProps {
  label?: string
  value: string | number
  onChange: (value: string | number) => void
  options: Array<{ value: string | number; label: string }>
  required?: boolean
  disabled?: boolean
  error?: string
  placeholder?: string
  className?: string
}

export function FormSelect({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  error,
  placeholder,
  className = ''
}: FormSelectProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full appearance-none px-3 py-2 text-sm border rounded-lg bg-white pr-8
            transition-colors disabled:bg-gray-50 disabled:text-gray-400
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-300 focus:border-pomp-blue focus:ring-1 focus:ring-pomp-blue/20'
            }
            focus:outline-none`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
