import { useState, useMemo, useCallback } from 'react';
import { useStore, StoreType } from '@/store/useStore';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building2,
  Filter,
  X,
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  AlertTriangle,
  Save,
  CheckCircle,
  History,
  Link2,
  User,
  Tag,
} from 'lucide-react';
import type { Contact, ContactCategory, ServiceEntry } from '@/types';

// ============================================================================
// Helpers
// ============================================================================

function formatZAR(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================================
// Category Configuration
// ============================================================================

const CATEGORIES: ContactCategory[] = [
  'Managing Agent',
  'Letting Agent',
  'Municipality',
  'Bank',
  'Contractor',
  'Body Corporate Trustee',
  'Service Provider',
  'Insurance',
];

const categoryColors: Record<ContactCategory, { bg: string; text: string; border: string; dot: string; icon: string }> = {
  'Managing Agent':        { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-300',     dot: 'bg-blue-500',   icon: 'text-blue-500' },
  'Letting Agent':         { bg: 'bg-success-50', text: 'text-success-700',border: 'border-success-300',  dot: 'bg-success-500', icon: 'text-success-500' },
  'Municipality':          { bg: 'bg-warning-50', text: 'text-warning-700',border: 'border-warning-300',  dot: 'bg-warning-500', icon: 'text-warning-500' },
  'Bank':                  { bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-300',   dot: 'bg-purple-500',  icon: 'text-purple-500' },
  'Contractor':            { bg: 'bg-slate-100',  text: 'text-slate-600',  border: 'border-slate-300',    dot: 'bg-slate-500',   icon: 'text-slate-500' },
  'Body Corporate Trustee':{ bg: 'bg-teal-50',    text: 'text-teal-700',   border: 'border-teal-300',     dot: 'bg-teal-500',    icon: 'text-teal-500' },
  'Service Provider':      { bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-300',   dot: 'bg-orange-500',  icon: 'text-orange-500' },
  'Insurance':             { bg: 'bg-danger-50',  text: 'text-danger-700', border: 'border-danger-300',   dot: 'bg-danger-500',  icon: 'text-danger-500' },
};

// ============================================================================
// ContactsPage — top-level controller
// ============================================================================

export default function ContactsPage() {
  // ---- Store ---------------------------------------------------------------
  const contacts = useStore((s) => s.contacts);
  const properties = useStore((s) => s.properties);
  const addContact = useStore((s) => s.addContact);
  const updateContact = useStore((s) => s.updateContact);
  const deleteContact = useStore((s) => s.deleteContact);
  const addServiceEntry = useStore((s) => s.addServiceEntry);

  // ---- Local state ---------------------------------------------------------
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ContactCategory | 'All'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // ---- Derived: selected contact -------------------------------------------
  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === selectedContactId) ?? null,
    [contacts, selectedContactId],
  );

  // ---- Derived: filtered contacts ------------------------------------------
  const filteredContacts = useMemo(() => {
    let result = [...contacts];
    if (categoryFilter !== 'All') {
      result = result.filter((c) => c.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.company.toLowerCase().includes(q) ||
          c.person.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q),
      );
    }
    result.sort((a, b) => {
      const catCompare = a.category.localeCompare(b.category);
      if (catCompare !== 0) return catCompare;
      return a.company.localeCompare(b.company);
    });
    return result;
  }, [contacts, categoryFilter, searchQuery]);

  // ---- Handlers ------------------------------------------------------------

  const openDetail = useCallback((id: string) => {
    setSelectedContactId(id);
    setView('detail');
  }, []);

  const goBack = useCallback(() => {
    setView('list');
    setSelectedContactId(null);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteContact(id);
      setShowDeleteConfirm(null);
      if (selectedContactId === id) goBack();
    },
    [deleteContact, selectedContactId, goBack],
  );

  const handleAddContact = useCallback(
    (data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
      addContact(data);
      setShowAddModal(false);
    },
    [addContact],
  );

  // ==========================================================================
  // Empty State — no contacts at all
  // ==========================================================================
  if (contacts.length === 0 && !showAddModal) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-8 sm:p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-brand-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No contacts yet</h2>
            <p className="text-slate-500 max-w-md mb-8">
              Your contact directory is empty. Add managing agents, letting agents, contractors, and other key contacts.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-500 text-white font-medium text-sm
                         hover:bg-accent-600 transition-colors duration-150 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Your First Contact
            </button>
          </div>
        </div>
        {showAddModal && (
          <AddContactModal
            properties={properties}
            onSave={handleAddContact}
            onCancel={() => setShowAddModal(false)}
          />
        )}
      </div>
    );
  }

  // ==========================================================================
  // Main Render
  // ==========================================================================
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {view === 'list' && (
        <ContactListView
          contacts={filteredContacts}
          allCount={contacts.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          onAddContact={() => setShowAddModal(true)}
          onOpenDetail={openDetail}
          onDelete={(id) => setShowDeleteConfirm(id)}
        />
      )}

      {view === 'detail' && selectedContact && (
        <ContactDetailView
          contact={selectedContact}
          properties={properties}
          updateContact={updateContact}
          addServiceEntry={addServiceEntry}
          onGoBack={goBack}
          onDelete={() => setShowDeleteConfirm(selectedContact.id)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          contactName={
            contacts.find((c) => c.id === showDeleteConfirm)?.company ??
            contacts.find((c) => c.id === showDeleteConfirm)?.person ??
            ''
          }
          onConfirm={() => handleDelete(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}

      {showAddModal && (
        <AddContactModal
          properties={properties}
          onSave={handleAddContact}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// ContactListView — card grid
// ============================================================================

function ContactListView({
  contacts,
  allCount,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  onAddContact,
  onOpenDetail,
  onDelete,
}: {
  contacts: Contact[];
  allCount: number;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  categoryFilter: ContactCategory | 'All';
  onCategoryFilterChange: (v: ContactCategory | 'All') => void;
  onAddContact: () => void;
  onOpenDetail: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const counts = useMemo(() => {
    const storeState = useStore.getState();
    const c: Record<string, number> = { All: storeState.contacts.length };
    for (const cat of CATEGORIES) {
      c[cat] = storeState.contacts.filter((ct) => ct.category === cat).length;
    }
    return c;
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Contact Directory</h1>
          <span className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-full bg-accent-50 text-accent-700 text-xs font-semibold px-2">
            {allCount}
          </span>
        </div>
        <button
          type="button"
          onClick={onAddContact}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-500 text-white font-medium text-sm
                     hover:bg-accent-600 transition-colors duration-150 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by company, person, email, or phone..."
          className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm
                     placeholder:text-slate-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500
                     shadow-sm transition-shadow"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit flex-wrap">
        <FilterPill
          label="All"
          count={counts['All']}
          active={categoryFilter === 'All'}
          onClick={() => onCategoryFilterChange('All')}
        />
        {CATEGORIES.map((cat) => (
          <FilterPill
            key={cat}
            label={cat}
            count={counts[cat] ?? 0}
            active={categoryFilter === cat}
            onClick={() => onCategoryFilterChange(cat)}
            category={cat}
          />
        ))}
      </div>

      {/* Empty filtered state */}
      {contacts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-700">No contacts found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {searchQuery
              ? 'No contacts match your search. Try adjusting your query.'
              : categoryFilter !== 'All'
                ? `No contacts with category "${categoryFilter}".`
                : 'No contacts in your directory yet.'}
          </p>
          {(searchQuery || categoryFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onCategoryFilterChange('All');
              }}
              className="mt-4 text-xs text-accent-500 hover:text-accent-600 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        /* Contact card grid — 1 col on mobile, 2 on sm, 3 on lg */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((c) => (
            <ContactCard
              key={c.id}
              contact={c}
              propertiesCount={c.linkedProperties.length}
              onClick={() => onOpenDetail(c.id)}
              onDelete={() => onDelete(c.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ============================================================================
// FilterPill
// ============================================================================

function FilterPill({
  label,
  count,
  active,
  onClick,
  category,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  category?: ContactCategory;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
        active
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
      }`}
    >
      {category && active && (
        <span className={`w-2 h-2 rounded-full ${categoryColors[category].dot}`} />
      )}
      {label}
      <span
        className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-semibold ${
          active ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// ============================================================================
// ContactCard — card for the list grid
// ============================================================================

function ContactCard({
  contact,
  propertiesCount,
  onClick,
  onDelete,
}: {
  contact: Contact;
  propertiesCount: number;
  onClick: () => void;
  onDelete: () => void;
}) {
  const colors = categoryColors[contact.category];

  return (
    <div
      className="group relative rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-accent-300
                 transition-all duration-150 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Hover action buttons — top right */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-accent-600 hover:border-accent-300 shadow-sm transition-colors"
          title="Edit contact"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-danger-600 hover:border-danger-300 shadow-sm transition-colors"
          title="Delete contact"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-5 flex flex-col h-full">
        {/* Category badge */}
        <span
          className={`inline-flex items-center gap-1.5 self-start text-xs font-medium px-2.5 py-0.5 rounded-full border mb-3 ${colors.bg} ${colors.text} ${colors.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
          {contact.category}
        </span>

        {/* Company name */}
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-accent-600 transition-colors pr-16 truncate">
          {contact.company || contact.person || 'Unnamed Contact'}
        </h3>

        {/* Person name */}
        {contact.person && contact.company && (
          <p className="text-sm text-slate-600 mt-0.5 truncate">{contact.person}</p>
        )}
        {contact.person && !contact.company && (
          <p className="text-sm text-slate-600 mt-0.5 truncate">{contact.person}</p>
        )}

        {/* Phone */}
        {contact.phone && (
          <div className="flex items-center gap-1.5 mt-3">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-600 truncate">{contact.phone}</span>
          </div>
        )}

        {/* Email */}
        {contact.email && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-600 truncate">{contact.email}</span>
          </div>
        )}

        {/* Linked properties count */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">
            {propertiesCount} {propertiesCount === 1 ? 'property' : 'properties'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ContactDetailView
// ============================================================================

function ContactDetailView({
  contact,
  properties,
  updateContact,
  addServiceEntry,
  onGoBack,
  onDelete,
}: {
  contact: Contact;
  properties: StoreType['properties'];
  updateContact: (id: string, data: Partial<Contact>) => void;
  addServiceEntry: (contactId: string, entry: Omit<ServiceEntry, 'id'>) => void;
  onGoBack: () => void;
  onDelete: () => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [editedContact, setEditedContact] = useState<Contact | null>(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  const data = editMode && editedContact ? editedContact : contact;
  const colors = categoryColors[data.category];

  // ---- Linked properties ---------------------------------------------------
  const linkedProperties = useMemo(
    () => properties.filter((p) => data.linkedProperties.includes(p.id)),
    [properties, data.linkedProperties],
  );

  // ---- Edit toggle ---------------------------------------------------------
  const toggleEditMode = useCallback(() => {
    if (editMode && editedContact) {
      const updates: Partial<Contact> = { ...editedContact };
      delete (updates as Record<string, unknown>).id;
      delete (updates as Record<string, unknown>).serviceHistory;
      delete (updates as Record<string, unknown>).createdAt;
      delete (updates as Record<string, unknown>).updatedAt;
      updateContact(contact.id, updates);
    }
    if (!editMode) setEditedContact({ ...contact });
    setEditMode((p) => !p);
  }, [editMode, editedContact, contact, updateContact]);

  const cancelEdit = useCallback(() => {
    setEditMode(false);
    setEditedContact(null);
  }, []);

  const updateField = useCallback(
    <K extends keyof Contact>(key: K, value: Contact[K]) => {
      setEditedContact((prev) => (prev ? { ...prev, [key]: value } : prev));
    },
    [],
  );

  // ---- Service entry handlers ----------------------------------------------
  const handleAddServiceEntry = useCallback(
    (entry: Omit<ServiceEntry, 'id'>) => {
      addServiceEntry(contact.id, entry);
      setShowAddServiceModal(false);
    },
    [contact.id, addServiceEntry],
  );

  // ---- Sorted service history ----------------------------------------------
  const sortedServiceHistory = useMemo(
    () => [...data.serviceHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [data.serviceHistory],
  );

  return (
    <div className="space-y-6">
      {/* Top bar: back + title + edit/save toggle */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onGoBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {data.company || data.person || 'Unnamed Contact'}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              {data.category}
            </span>
          </div>
          {data.person && data.company && (
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {data.person}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {editMode && (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium
                         hover:bg-slate-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={toggleEditMode}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors ${
              editMode
                ? 'bg-success-500 text-white hover:bg-success-600'
                : 'bg-accent-500 text-white hover:bg-accent-600'
            }`}
          >
            {editMode ? (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Edit
              </>
            )}
          </button>
          {!editMode && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-danger-200 text-danger-600 text-sm font-medium
                         hover:bg-danger-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Contact Details */}
        <div className="space-y-6">
          {/* Contact Details Card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <User className={`w-4 h-4 ${colors.icon}`} />
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Contact Details</h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Category */}
              <FieldRow label="Category">
                {editMode ? (
                  <CategorySelect
                    value={data.category}
                    onChange={(v) => updateField('category', v)}
                  />
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                    {data.category}
                  </span>
                )}
              </FieldRow>

              {/* Company */}
              <FieldRow label="Company">
                {editMode ? (
                  <input
                    type="text"
                    value={data.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    className="input"
                    placeholder="Company name"
                  />
                ) : (
                  <span className="text-sm text-slate-700 font-medium">
                    {data.company || '—'}
                  </span>
                )}
              </FieldRow>

              {/* Person */}
              <FieldRow label="Contact Person">
                {editMode ? (
                  <input
                    type="text"
                    value={data.person}
                    onChange={(e) => updateField('person', e.target.value)}
                    className="input"
                    placeholder="Person name"
                  />
                ) : (
                  <span className="text-sm text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {data.person || '—'}
                  </span>
                )}
              </FieldRow>

              {/* Phone */}
              <FieldRow label="Phone">
                {editMode ? (
                  <input
                    type="text"
                    value={data.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="input"
                    placeholder="Phone number"
                  />
                ) : (
                  <span className="text-sm text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {data.phone || '—'}
                  </span>
                )}
              </FieldRow>

              {/* Email */}
              <FieldRow label="Email">
                {editMode ? (
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="input"
                    placeholder="Email address"
                  />
                ) : (
                  <span className="text-sm text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {data.email ? (
                      <a href={`mailto:${data.email}`} className="text-accent-600 hover:underline">
                        {data.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </span>
                )}
              </FieldRow>

              {/* Address */}
              <FieldRow label="Address">
                {editMode ? (
                  <textarea
                    value={data.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="input resize-none"
                    rows={2}
                    placeholder="Physical address"
                  />
                ) : (
                  <span className="text-sm text-slate-700 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    {data.address || '—'}
                  </span>
                )}
              </FieldRow>

              {/* Notes */}
              <FieldRow label="Notes">
                {editMode ? (
                  <textarea
                    value={data.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    className="input resize-none"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                ) : (
                  <span className="text-sm text-slate-600 italic whitespace-pre-wrap">
                    {data.notes || 'No notes.'}
                  </span>
                )}
              </FieldRow>

              {/* Metadata */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>Created {formatDate(data.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>Updated {formatDateTime(data.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Linked Properties + Service History */}
        <div className="space-y-6">
          {/* Linked Properties Card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-500" />
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                Linked Properties
              </h2>
              <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5 ml-auto">
                {linkedProperties.length}
              </span>
            </div>
            <div className="p-5">
              {linkedProperties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                    <Building2 className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No linked properties</p>
                  <p className="text-xs text-slate-400 mt-1">
                    This contact is not linked to any properties.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {linkedProperties.map((prop) => (
                    <div
                      key={prop.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-brand-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {prop.schemeName}
                          {prop.unitNumber ? ` #${prop.unitNumber}` : ''}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {prop.physicalAddress || prop.municipality || '—'}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                          prop.status === 'Active'
                            ? 'bg-success-50 text-success-700 border-success-300'
                            : prop.status === 'Vacant'
                              ? 'bg-warning-50 text-warning-700 border-warning-300'
                              : prop.status === 'Under Maintenance'
                                ? 'bg-accent-50 text-accent-700 border-accent-300'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {prop.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Service History Card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className={`w-4 h-4 ${colors.icon}`} />
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  Service History
                </h2>
                <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                  {sortedServiceHistory.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddServiceModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-500 text-white text-xs font-medium
                           hover:bg-accent-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Entry
              </button>
            </div>
            <div className="p-5">
              {sortedServiceHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                    <History className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No service history</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Service entries will appear here once added.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddServiceModal(true)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent-500 hover:text-accent-600 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Entry
                  </button>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline */}
                  {sortedServiceHistory.map((entry, idx) => (
                    <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
                      {/* Timeline line */}
                      {idx < sortedServiceHistory.length - 1 && (
                        <div className="absolute left-[11px] top-8 w-0.5 bg-slate-200 bottom-0 -mb-6" />
                      )}
                      {/* Timeline dot */}
                      <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${colors.bg} ${colors.border}`}>
                        <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(entry.date)}
                          </span>
                          {entry.cost > 0 && (
                            <span className="text-xs font-semibold text-slate-800">
                              {formatZAR(entry.cost)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700">{entry.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Service Entry Modal */}
      {showAddServiceModal && (
        <AddServiceEntryModal
          onSave={handleAddServiceEntry}
          onCancel={() => setShowAddServiceModal(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// AddServiceEntryModal
// ============================================================================

function AddServiceEntryModal({
  onSave,
  onCancel,
}: {
  onSave: (entry: Omit<ServiceEntry, 'id'>) => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');

  const handleSave = useCallback(() => {
    if (!description.trim()) return;
    onSave({
      date: new Date(date).toISOString(),
      description: description.trim(),
      cost: parseFloat(cost) || 0,
    });
  }, [date, description, cost, onSave]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
              <History className="w-5 h-5 text-accent-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add Service Entry</h2>
              <p className="text-xs text-slate-400 mt-0.5">Record a service interaction</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <FormField label="Date *">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </FormField>
          <FormField label="Description *">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none"
              rows={3}
              placeholder="Describe the service provided..."
            />
          </FormField>
          <FormField label="Cost (R)">
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="input"
              min={0}
              step="0.01"
              placeholder="0.00"
            />
          </FormField>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!description.trim()}
            className="px-5 py-2 rounded-lg bg-accent-500 text-white text-sm font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 inline mr-1.5" />
            Add Entry
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AddContactModal
// ============================================================================

function AddContactModal({
  properties,
  onSave,
  onCancel,
}: {
  properties: StoreType['properties'];
  onSave: (data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>({
    category: 'Managing Agent',
    company: '',
    person: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    linkedProperties: [],
    serviceHistory: [],
  });

  const update = useCallback(
    <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleProperty = useCallback(
    (propertyId: string) => {
      setForm((prev) => {
        const current = prev.linkedProperties;
        const updated = current.includes(propertyId)
          ? current.filter((id) => id !== propertyId)
          : [...current, propertyId];
        return { ...prev, linkedProperties: updated };
      });
    },
    [],
  );

  const handleSave = useCallback(() => {
    onSave(form);
  }, [form, onSave]);

  const [formTab, setFormTab] = useState<'details' | 'links'>('details');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add New Contact</h2>
              <p className="text-xs text-slate-400 mt-0.5">Add a contact to the directory</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form tabs */}
        <div className="flex items-center gap-0.5 px-6 pt-4 pb-2 bg-slate-50/50 border-b border-slate-100">
          {[
            { id: 'details', label: 'Contact Details', icon: User },
            { id: 'links', label: 'Linked Properties', icon: Building2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFormTab(tab.id as 'details' | 'links')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  formTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {formTab === 'details' && (
            <>
              <FormField label="Category *">
                <CategorySelect
                  value={form.category}
                  onChange={(v) => update('category', v)}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Company *">
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => update('company', e.target.value)}
                    className="input"
                    placeholder="Company name"
                  />
                </FormField>
                <FormField label="Contact Person">
                  <input
                    type="text"
                    value={form.person}
                    onChange={(e) => update('person', e.target.value)}
                    className="input"
                    placeholder="Person name"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Phone">
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className="input"
                    placeholder="e.g. +27 11 555 1234"
                  />
                </FormField>
                <FormField label="Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="input"
                    placeholder="email@example.com"
                  />
                </FormField>
              </div>
              <FormField label="Address">
                <textarea
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  className="input resize-none"
                  rows={2}
                  placeholder="Physical address..."
                />
              </FormField>
              <FormField label="Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  className="input resize-none"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </FormField>
            </>
          )}

          {formTab === 'links' && (
            <>
              <p className="text-xs text-slate-500 mb-3">
                Select properties that are associated with this contact:
              </p>
              {properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                    <Building2 className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No properties available</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Add properties first, then link them to this contact.
                  </p>
                </div>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {properties.map((prop) => {
                    const isChecked = form.linkedProperties.includes(prop.id);
                    return (
                      <label
                        key={prop.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors border ${
                          isChecked
                            ? 'bg-accent-50 border-accent-300'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleProperty(prop.id)}
                          className="w-4 h-4 rounded border-slate-300 text-accent-500 focus:ring-accent-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {prop.schemeName}
                            {prop.unitNumber ? ` #${prop.unitNumber}` : ''}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {prop.physicalAddress || prop.municipality || '—'}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                            prop.status === 'Active'
                              ? 'bg-success-50 text-success-700 border-success-300'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              {form.linkedProperties.length > 0 && (
                <p className="text-xs text-slate-400 mt-2">
                  {form.linkedProperties.length} {form.linkedProperties.length === 1 ? 'property' : 'properties'} selected
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
          <div className="text-xs text-slate-400">
            {formTab === 'details' ? 'Contact information' : `${form.linkedProperties.length} property(s) selected`}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.company.trim()}
              className="px-5 py-2 rounded-lg bg-accent-500 text-white text-sm font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 inline mr-1.5" />
              Save Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CategorySelect
// ============================================================================

function CategorySelect({
  value,
  onChange,
}: {
  value: ContactCategory;
  onChange: (value: ContactCategory) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ContactCategory)}
      className="input text-sm"
    >
      {CATEGORIES.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>
  );
}

// ============================================================================
// FormField
// ============================================================================

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

// ============================================================================
// FieldRow — for detail view read/edit rows
// ============================================================================

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <div className="flex-1 text-right">{children}</div>
    </div>
  );
}

// ============================================================================
// DeleteConfirmModal
// ============================================================================

function DeleteConfirmModal({
  contactName,
  onConfirm,
  onCancel,
}: {
  contactName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-danger-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-danger-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Contact?</h3>
          <p className="text-sm text-slate-500 mb-1">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-slate-700">{contactName}</span>?
          </p>
          <p className="text-xs text-slate-400">
            This action cannot be undone. All contact data including service history will be permanently removed.
          </p>
        </div>
        <div className="flex items-center border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-6 py-3.5 text-sm font-medium text-white bg-danger-500 hover:bg-danger-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
