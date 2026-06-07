import React, { useMemo } from 'react'
import { Phone, Mail, AlertTriangle, Wrench, UserCheck, Edit3, Trash2 } from 'lucide-react'
import { cn } from '../lib/utils'
import type { Contact, ContactCategory } from '../types'

const CAT_ICON: Record<ContactCategory, typeof Phone> = {
  emergency: AlertTriangle,
  service_provider: Wrench,
  professional: UserCheck,
}

const CAT_COLOR: Record<ContactCategory, string> = {
  emergency: 'text-red-500 bg-red-50',
  service_provider: 'text-orange-500 bg-orange-50',
  professional: 'text-blue-500 bg-blue-50',
}

interface ContactCardProps {
  contact: Contact
  propertyName?: string
  onClick?: (c: Contact) => void
  onEdit?: (c: Contact) => void
  onDelete?: (c: Contact) => void
  variant?: 'full' | 'mini'
  className?: string
}

export function ContactCard({
  contact: c,
  propertyName,
  onClick,
  onEdit,
  onDelete,
  variant = 'full',
  className,
}: ContactCardProps) {
  const Icon = CAT_ICON[c.category] || Phone
  const colorClass = CAT_COLOR[c.category] || 'text-gray-500 bg-gray-50'
  const interactive = !!(onClick || onEdit || onDelete)

  const subLabel = useMemo(() => {
    if (c.subcategory) return c.subcategory
    return c.category.replace(/_/g, ' ')
  }, [c.subcategory, c.category])

  const handleClick = () => onClick?.(c)
  const handleKey = (e: React.KeyboardEvent) => {
    if (!interactive) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  if (variant === 'mini') {
    return (
      <div
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={onClick ? handleClick : undefined}
        onKeyDown={handleKey}
        className={cn(
          'card flex items-start gap-2.5 p-3 transition-shadow',
          onClick && 'cursor-pointer hover:shadow-md',
          className,
        )}
        aria-label={onClick ? `Open ${c.name} on contacts page` : undefined}
      >
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', colorClass)}>
          <Icon size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[13px] text-pomp-navy truncate">{c.name}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate">{subLabel}</p>
          <div className="flex flex-col gap-0.5 mt-1.5 text-[11px] text-gray-600">
            {c.phone && (
              <span className="flex items-center gap-1 truncate">
                <Phone size={10} className="shrink-0" />
                <a href={`tel:${c.phone}`} onClick={e => e.stopPropagation()} className="hover:text-pomp-blue truncate">{c.phone}</a>
              </span>
            )}
            {c.email && (
              <span className="flex items-center gap-1 truncate">
                <Mail size={10} className="shrink-0" />
                <a href={`mailto:${c.email}`} onClick={e => e.stopPropagation()} className="hover:text-pomp-blue truncate">{c.email}</a>
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('card flex flex-col', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', colorClass)}>
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-pomp-navy truncate">{c.name}</p>
            <p className="text-xs text-gray-400 truncate">
              {propertyName ? `${propertyName} — ` : ''}{subLabel}
            </p>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(c)}
                className="text-gray-300 hover:text-pomp-blue transition-colors shrink-0 p-1"
                title="Edit contact"
                aria-label={`Edit ${c.name}`}
              >
                <Edit3 aria-hidden size={15} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(c)}
                className="text-gray-300 hover:text-red-500 transition-colors shrink-0 p-1"
                title="Delete contact"
                aria-label={`Delete ${c.name}`}
              >
                <Trash2 aria-hidden size={16} />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 text-xs text-gray-600">
        {c.phone && (
          <span className="flex items-center gap-1 truncate">
            <Phone size={12} className="flex-shrink-0" aria-hidden />
            <a href={`tel:${c.phone}`} className="hover:text-pomp-blue truncate">{c.phone}</a>
          </span>
        )}
        {c.email && (
          <span className="flex items-center gap-1 truncate">
            <Mail size={12} className="flex-shrink-0" aria-hidden />
            <a href={`mailto:${c.email}`} className="hover:text-pomp-blue truncate">{c.email}</a>
          </span>
        )}
      </div>
      {c.notes && <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">{c.notes}</p>}
    </div>
  )
}
