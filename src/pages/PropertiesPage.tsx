import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useStore, StoreType } from '@/store/useStore';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Car,
  Ruler,
  X,
  ArrowLeft,
  FileText,
  Home,
  DollarSign,
  Percent,
  Calendar,
  Upload,
  Save,
  Shield,
  Info,
  Eye,
  Key,
  Trees,
  Sofa,
  CheckCircle,
  Ban,
  AlertTriangle,
  TrendingUp,
  Banknote,
  Users,
} from 'lucide-react';
import type { Property, PropertyDocument, PropertyStatus, DocType } from '@/types';

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

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ============================================================================
// Constants
// ============================================================================

const STATUS_FILTERS: PropertyStatus[] = ['Active', 'Vacant', 'Under Maintenance', 'Sold'];

const statusBadge: Record<PropertyStatus, string> = {
  Active: 'bg-success-50 text-success-700 border-success-500/30',
  Vacant: 'bg-warning-50 text-warning-700 border-warning-500/30',
  'Under Maintenance': 'bg-accent-50 text-accent-700 border-accent-500/30',
  Sold: 'bg-slate-100 text-slate-600 border-slate-300',
};

const statusDot: Record<PropertyStatus, string> = {
  Active: 'bg-success-500',
  Vacant: 'bg-warning-500',
  'Under Maintenance': 'bg-accent-500',
  Sold: 'bg-slate-400',
};

const DOC_TYPES: DocType[] = [
  'Sale Agreement',
  'Bond Document',
  'Scheme Rules',
  'Insurance',
  'Body Corporate',
  'Property Plan',
  'Other',
];

type PageView = 'list' | 'detail';
type DetailTab = 'overview' | 'financial' | 'documents' | 'notes';

// ============================================================================
// PropertiesPage — top-level controller
// ============================================================================

export default function PropertiesPage() {
  // ---- Store ---------------------------------------------------------------
  const properties = useStore((s) => s.properties);
  const contacts = useStore((s) => s.contacts);
  const addProperty = useStore((s) => s.addProperty);
  const updateProperty = useStore((s) => s.updateProperty);
  const deleteProperty = useStore((s) => s.deleteProperty);
  const addPropertyDocument = useStore((s) => s.addPropertyDocument);
  const deletePropertyDocument = useStore((s) => s.deletePropertyDocument);
  const getContactById = useStore((s) => s.getContactById);

  // ---- Local state ---------------------------------------------------------
  const [view, setView] = useState<PageView>('list');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'All'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // ---- Derived: selected property ------------------------------------------
  const selectedProperty = useMemo(
    () => properties.find((p) => p.id === selectedPropertyId) ?? null,
    [properties, selectedPropertyId],
  );

  // ---- Derived: filtered properties ----------------------------------------
  const filteredProperties = useMemo(() => {
    let result = [...properties];
    if (statusFilter !== 'All') result = result.filter((p) => p.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.referenceId.toLowerCase().includes(q) ||
          p.unitNumber.toLowerCase().includes(q) ||
          p.schemeName.toLowerCase().includes(q) ||
          p.physicalAddress.toLowerCase().includes(q),
      );
    }
    result.sort((a, b) => a.schemeName.localeCompare(b.schemeName));
    return result;
  }, [properties, statusFilter, searchQuery]);

  // ---- Handlers ------------------------------------------------------------

  const openDetail = useCallback((id: string) => {
    setSelectedPropertyId(id);
    setView('detail');
  }, []);

  const goBack = useCallback(() => {
    setView('list');
    setSelectedPropertyId(null);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteProperty(id);
      setShowDeleteConfirm(null);
      if (selectedPropertyId === id) goBack();
    },
    [deleteProperty, selectedPropertyId, goBack],
  );

  const handleAddProperty = useCallback(
    (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
      addProperty(data);
      setShowAddModal(false);
    },
    [addProperty],
  );

  const handleAddDocument = useCallback(() => {
    if (!selectedProperty) return;
    const name = window.prompt('Document name:');
    if (!name?.trim()) return;
    const type = window.prompt(`Document type: ${DOC_TYPES.join(', ')}`, 'Other') as DocType | null;
    if (!type || !DOC_TYPES.includes(type)) return;
    addPropertyDocument(selectedProperty.id, { name: name.trim(), type, url: '' });
  }, [selectedProperty, addPropertyDocument]);

  // ==========================================================================
  // Empty State — no properties at all
  // ==========================================================================
  if (properties.length === 0 && !showAddModal) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-8 sm:p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
              <Building2 className="w-8 h-8 text-brand-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No properties yet</h2>
            <p className="text-slate-500 max-w-md mb-8">
              Your property portfolio is empty. Add your first property to start managing your investments.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-500 text-white font-medium text-sm
                         hover:bg-accent-600 transition-colors duration-150 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Your First Property
            </button>
          </div>
        </div>
        {showAddModal && (
          <AddPropertyModal
            contacts={contacts}
            onSave={handleAddProperty}
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
        <PropertyListView
          properties={filteredProperties}
          allCount={properties.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onAddProperty={() => setShowAddModal(true)}
          onOpenDetail={openDetail}
          onDelete={(id) => setShowDeleteConfirm(id)}
        />
      )}

      {view === 'detail' && selectedProperty && (
        <PropertyDetailView
          property={selectedProperty}
          contacts={contacts}
          getContactById={getContactById}
          updateProperty={updateProperty}
          addPropertyDocument={addPropertyDocument}
          deletePropertyDocument={deletePropertyDocument}
          onGoBack={goBack}
          onDelete={() => setShowDeleteConfirm(selectedProperty.id)}
          onAddDocument={handleAddDocument}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          propertyName={properties.find((p) => p.id === showDeleteConfirm)?.schemeName ?? ''}
          onConfirm={() => handleDelete(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}

      {showAddModal && (
        <AddPropertyModal
          contacts={contacts}
          onSave={handleAddProperty}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// PropertyListView — card grid
// ============================================================================

function PropertyListView({
  properties,
  allCount,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddProperty,
  onOpenDetail,
  onDelete,
}: {
  properties: Property[];
  allCount: number;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  statusFilter: PropertyStatus | 'All';
  onStatusFilterChange: (v: PropertyStatus | 'All') => void;
  onAddProperty: () => void;
  onOpenDetail: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const counts = useMemo(() => {
    const storeState = useStore.getState();
    const c: Record<string, number> = { All: storeState.properties.length };
    for (const s of STATUS_FILTERS) {
      c[s] = storeState.properties.filter((p) => p.status === s).length;
    }
    return c;
  }, []);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Property Portfolio</h1>
          <span className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-full bg-accent-50 text-accent-700 text-xs font-semibold px-2">
            {allCount}
          </span>
        </div>
        <button
          type="button"
          onClick={onAddProperty}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-500 text-white font-medium text-sm
                     hover:bg-accent-600 transition-colors duration-150 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by reference ID, unit number, scheme name, or address..."
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

      {/* Status filter pills */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit flex-wrap">
        <FilterPill label="All" count={counts['All']} active={statusFilter === 'All'} onClick={() => onStatusFilterChange('All')} />
        {STATUS_FILTERS.map((s) => (
          <FilterPill key={s} label={s} count={counts[s] ?? 0} active={statusFilter === s} onClick={() => onStatusFilterChange(s)} />
        ))}
      </div>

      {/* Empty filtered state */}
      {properties.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-700">No properties found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {searchQuery
              ? 'No properties match your search. Try adjusting your query.'
              : statusFilter !== 'All'
                ? `No properties with status "${statusFilter}".`
                : 'No properties in your portfolio yet.'}
          </p>
          {(searchQuery || statusFilter !== 'All') && (
            <button
              type="button"
              onClick={() => { onSearchChange(''); onStatusFilterChange('All'); }}
              className="mt-4 text-xs text-accent-500 hover:text-accent-600 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        /* Card grid — 1 col on mobile, 2 on sm/md, 3 on lg */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              onClick={() => onOpenDetail(p.id)}
              onEdit={() => onOpenDetail(p.id)}
              onDelete={() => onDelete(p.id)}
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
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
      }`}
    >
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
// PropertyCard — card for the list grid
// ============================================================================

function PropertyCard({
  property,
  onClick,
  onEdit,
  onDelete,
}: {
  property: Property;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-accent-600 hover:border-accent-300 shadow-sm transition-colors"
          title="Edit property"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-danger-600 hover:border-danger-300 shadow-sm transition-colors"
          title="Delete property"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-5 flex flex-col h-full">
        {/* Title: scheme name + unit */}
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-accent-600 transition-colors pr-16 truncate">
          {property.schemeName}
          {property.unitNumber ? ` #${property.unitNumber}` : ''}
        </h3>

        {/* Address */}
        <div className="flex items-start gap-1.5 mt-1.5 mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
          <span className="text-xs text-slate-500 leading-tight line-clamp-2">{property.physicalAddress || '—'}</span>
        </div>

        {/* Status badge */}
        <span
          className={`inline-flex items-center gap-1.5 self-start text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusBadge[property.status]} mb-3`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[property.status]}`} />
          {property.status}
        </span>

        {/* Bed / Bath / Parking / Size row */}
        <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1" title={`${property.bedrooms} Bedroom(s)`}>
            <Bed className="w-3.5 h-3.5 text-slate-400" /> {property.bedrooms}
          </span>
          <span className="inline-flex items-center gap-1" title={`${property.bathrooms} Bathroom(s)`}>
            <Bath className="w-3.5 h-3.5 text-slate-400" /> {property.bathrooms}
          </span>
          <span className="inline-flex items-center gap-1" title={`${property.parkingBays} Parking bay(s)`}>
            <Car className="w-3.5 h-3.5 text-slate-400" /> {property.parkingBays}
          </span>
          {property.size > 0 && (
            <span className="inline-flex items-center gap-1" title={`${property.size} m²`}>
              <Ruler className="w-3.5 h-3.5 text-slate-400" /> {property.size} m²
            </span>
          )}
        </div>

        {/* Financial row */}
        <div className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-2 gap-y-1 gap-x-2">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Rental</span>
            <p className="text-sm font-bold text-slate-800">{formatZAR(property.rentalAmount)}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Valuation</span>
            <p className="text-sm font-bold text-slate-800">{formatZAR(property.currentValuation)}</p>
          </div>
          <div className="col-span-2 flex items-center justify-between mt-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Yield</span>
            <span
              className={`text-xs font-semibold ${
                property.yieldPercentage >= 8 ? 'text-success-700' : property.yieldPercentage >= 5 ? 'text-warning-700' : 'text-danger-700'
              }`}
            >
              {formatPercent(property.yieldPercentage)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PropertyDetailView
// ============================================================================

function PropertyDetailView({
  property,
  contacts,
  getContactById,
  updateProperty,
  addPropertyDocument,
  deletePropertyDocument,
  onGoBack,
  onDelete,
  onAddDocument,
}: {
  property: Property;
  contacts: StoreType['contacts'];
  getContactById: StoreType['getContactById'];
  updateProperty: (id: string, data: Partial<Property>) => void;
  addPropertyDocument: (propertyId: string, doc: Omit<PropertyDocument, 'id' | 'uploadedAt'>) => void;
  deletePropertyDocument: (propertyId: string, docId: string) => void;
  onGoBack: () => void;
  onDelete: () => void;
  onAddDocument: () => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [editedProperty, setEditedProperty] = useState<Property | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [notesDraft, setNotesDraft] = useState(property.notes);
  const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync notes when property changes
  useEffect(() => {
    setNotesDraft(property.notes);
  }, [property.notes]);

  const data = editMode && editedProperty ? editedProperty : property;

  const toggleEditMode = useCallback(() => {
    if (editMode && editedProperty) {
      const updates: Partial<Property> = { ...editedProperty };
      delete (updates as Record<string, unknown>).id;
      delete (updates as Record<string, unknown>).documents;
      delete (updates as Record<string, unknown>).createdAt;
      delete (updates as Record<string, unknown>).updatedAt;
      updateProperty(property.id, updates);
    }
    if (!editMode) setEditedProperty({ ...property });
    setEditMode((p) => !p);
  }, [editMode, editedProperty, property, updateProperty]);

  const cancelEdit = useCallback(() => {
    setEditMode(false);
    setEditedProperty(null);
  }, []);

  const updateField = useCallback(<K extends keyof Property>(key: K, value: Property[K]) => {
    setEditedProperty((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  // Auto-save notes
  const handleNotesChange = useCallback(
    (value: string) => {
      setNotesDraft(value);
      if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
      notesTimerRef.current = setTimeout(() => {
        updateProperty(property.id, { notes: value });
      }, 1000);
    },
    [property.id, updateProperty],
  );

  useEffect(() => {
    return () => { if (notesTimerRef.current) clearTimeout(notesTimerRef.current); };
  }, []);

  const TABS: { id: DetailTab; label: string; icon: typeof Home }[] = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'notes', label: 'Notes', icon: Edit },
  ];

  // Helper to handle document deletion in detail view
  const handleDeleteDocument = useCallback(
    (docId: string) => {
      deletePropertyDocument(property.id, docId);
    },
    [property.id, deletePropertyDocument],
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
              {property.schemeName}
              {property.unitNumber ? ` #${property.unitNumber}` : ''}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusBadge[property.status]}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot[property.status]}`} />
              {property.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">Ref: {property.referenceId}</p>
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

      {/* Tab bar */}
      <div className="flex items-center gap-0.5 p-1 bg-slate-100 rounded-xl w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDetailTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                detailTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {detailTab === 'overview' && (
          <OverviewTab data={data} editMode={editMode} updateField={updateField} getContactById={getContactById} contacts={contacts} />
        )}
        {detailTab === 'financial' && (
          <FinancialTab data={data} editMode={editMode} updateField={updateField} />
        )}
        {detailTab === 'documents' && (
          <DocumentsTab documents={property.documents} onAdd={onAddDocument} onDelete={handleDeleteDocument} />
        )}
        {detailTab === 'notes' && (
          <NotesTab notes={notesDraft} onNotesChange={handleNotesChange} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// OverviewTab
// ============================================================================

function OverviewTab({
  data,
  editMode,
  updateField,
  getContactById,
  contacts,
}: {
  data: Property;
  editMode: boolean;
  updateField: <K extends keyof Property>(key: K, value: Property[K]) => void;
  getContactById: StoreType['getContactById'];
  contacts: StoreType['contacts'];
}) {
  const lettingAgent = getContactById(data.lettingAgentId);
  const managingAgent = getContactById(data.managingAgentId);
  const municipalityContact = getContactById(data.municipalityContactId);
  const bank = getContactById(data.bankId);

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* IDENTIFICATION */}
      <SectionCard title="Identification" icon={Building2}>
        <FieldRow label="Reference ID">
          {editMode ? (
            <input type="text" value={data.referenceId} onChange={(e) => updateField('referenceId', e.target.value)} className="input" />
          ) : (
            <span className="text-sm font-mono text-slate-700 bg-slate-50 rounded px-2 py-0.5">{data.referenceId}</span>
          )}
        </FieldRow>
        <FieldRow label="Unit Number">
          {editMode ? (
            <input type="text" value={data.unitNumber} onChange={(e) => updateField('unitNumber', e.target.value)} className="input" />
          ) : (
            <span className="text-sm text-slate-700">{data.unitNumber || '—'}</span>
          )}
        </FieldRow>
        <FieldRow label="Scheme Name">
          {editMode ? (
            <input type="text" value={data.schemeName} onChange={(e) => updateField('schemeName', e.target.value)} className="input" />
          ) : (
            <span className="text-sm font-semibold text-slate-900">{data.schemeName}</span>
          )}
        </FieldRow>
        <FieldRow label="Sectional Title Scheme">
          {editMode ? (
            <input type="text" value={data.sectionalTitleScheme} onChange={(e) => updateField('sectionalTitleScheme', e.target.value)} className="input" />
          ) : (
            <span className="text-sm text-slate-700">{data.sectionalTitleScheme || '—'}</span>
          )}
        </FieldRow>
        <FieldRow label="Physical Address">
          {editMode ? (
            <input type="text" value={data.physicalAddress} onChange={(e) => updateField('physicalAddress', e.target.value)} className="input" />
          ) : (
            <span className="text-sm text-slate-700 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              {data.physicalAddress || '—'}
            </span>
          )}
        </FieldRow>
        <FieldRow label="Municipality">
          {editMode ? (
            <input type="text" value={data.municipality} onChange={(e) => updateField('municipality', e.target.value)} className="input" />
          ) : (
            <span className="text-sm text-slate-700">{data.municipality || '—'}</span>
          )}
        </FieldRow>
        <FieldRow label="GPS Coordinates">
          {editMode ? (
            <input type="text" value={data.gpsCoordinates} onChange={(e) => updateField('gpsCoordinates', e.target.value)} className="input" placeholder="-26.2041, 28.0473" />
          ) : (
            <span className="text-sm text-slate-700 font-mono">{data.gpsCoordinates || '—'}</span>
          )}
        </FieldRow>
      </SectionCard>

      {/* PROPERTY DETAILS */}
      <SectionCard title="Property Details" icon={Home}>
        <FieldRow label="Bedrooms">
          {editMode ? (
            <input type="number" value={data.bedrooms} onChange={(e) => updateField('bedrooms', parseInt(e.target.value) || 0)} className="input" min={0} />
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-700"><Bed className="w-4 h-4 text-slate-400" />{data.bedrooms}</span>
          )}
        </FieldRow>
        <FieldRow label="Bathrooms">
          {editMode ? (
            <input type="number" value={data.bathrooms} onChange={(e) => updateField('bathrooms', parseInt(e.target.value) || 0)} className="input" min={0} />
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-700"><Bath className="w-4 h-4 text-slate-400" />{data.bathrooms}</span>
          )}
        </FieldRow>
        <FieldRow label="Parking Bays">
          {editMode ? (
            <input type="number" value={data.parkingBays} onChange={(e) => updateField('parkingBays', parseInt(e.target.value) || 0)} className="input" min={0} />
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-700"><Car className="w-4 h-4 text-slate-400" />{data.parkingBays}</span>
          )}
        </FieldRow>
        <FieldRow label="Floor Size">
          {editMode ? (
            <input type="number" value={data.size} onChange={(e) => updateField('size', parseInt(e.target.value) || 0)} className="input" min={0} />
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-700"><Ruler className="w-4 h-4 text-slate-400" />{data.size} m²</span>
          )}
        </FieldRow>
        <FieldRow label="Balcony">
          {editMode ? (
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.balcony} onChange={(e) => updateField('balcony', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-accent-500 focus:ring-accent-500" />
              <span className="text-sm text-slate-700">{data.balcony ? 'Yes' : 'No'}</span>
            </label>
          ) : (
            <BooleanBadge value={data.balcony} />
          )}
        </FieldRow>
        <FieldRow label="Garden">
          {editMode ? (
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.garden} onChange={(e) => updateField('garden', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-accent-500 focus:ring-accent-500" />
              <span className="text-sm text-slate-700">{data.garden ? 'Yes' : 'No'}</span>
            </label>
          ) : (
            <BooleanBadge value={data.garden} />
          )}
        </FieldRow>
        <FieldRow label="Furnished">
          {editMode ? (
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.furnished} onChange={(e) => updateField('furnished', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-accent-500 focus:ring-accent-500" />
              <span className="text-sm text-slate-700">{data.furnished ? 'Yes' : 'No'}</span>
            </label>
          ) : (
            <BooleanBadge value={data.furnished} />
          )}
        </FieldRow>
      </SectionCard>

      {/* OWNERSHIP */}
      <SectionCard title="Ownership" icon={Shield}>
        <FieldRow label="Trust / Ownership">
          {editMode ? (
            <input type="text" value={data.trustOwnership} onChange={(e) => updateField('trustOwnership', e.target.value)} className="input" />
          ) : (
            <span className="text-sm text-slate-700">{data.trustOwnership || '—'}</span>
          )}
        </FieldRow>
        <FieldRow label="Acquisition Date">
          {editMode ? (
            <input type="date" value={data.acquisitionDate?.split('T')[0] || ''} onChange={(e) => updateField('acquisitionDate', e.target.value)} className="input" />
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(data.acquisitionDate)}
            </span>
          )}
        </FieldRow>
      </SectionCard>

      {/* OPERATIONAL */}
      <SectionCard title="Operational" icon={Users}>
        <FieldRow label="Letting Agent">
          {editMode ? (
            <ContactSelect value={data.lettingAgentId} contacts={contacts} category="Letting Agent" onChange={(v) => updateField('lettingAgentId', v)} />
          ) : (
            <ContactChip contact={lettingAgent} />
          )}
        </FieldRow>
        <FieldRow label="Managing Agent">
          {editMode ? (
            <ContactSelect value={data.managingAgentId} contacts={contacts} category="Managing Agent" onChange={(v) => updateField('managingAgentId', v)} />
          ) : (
            <ContactChip contact={managingAgent} />
          )}
        </FieldRow>
        <FieldRow label="Municipality">
          {editMode ? (
            <ContactSelect value={data.municipalityContactId} contacts={contacts} category="Municipality" onChange={(v) => updateField('municipalityContactId', v)} />
          ) : (
            <ContactChip contact={municipalityContact} />
          )}
        </FieldRow>
        <FieldRow label="Bank">
          {editMode ? (
            <ContactSelect value={data.bankId} contacts={contacts} category="Bank" onChange={(v) => updateField('bankId', v)} />
          ) : (
            <ContactChip contact={bank} />
          )}
        </FieldRow>
        <FieldRow label="Insurance">
          {editMode ? (
            <input type="text" value={data.insuranceDetails} onChange={(e) => updateField('insuranceDetails', e.target.value)} className="input" />
          ) : (
            <span className="text-sm text-slate-700">{data.insuranceDetails || 'Not specified'}</span>
          )}
        </FieldRow>
      </SectionCard>
    </div>
  );
}

// ============================================================================
// FinancialTab
// ============================================================================

function FinancialTab({
  data,
  editMode,
  updateField,
}: {
  data: Property;
  editMode: boolean;
  updateField: <K extends keyof Property>(key: K, value: Property[K]) => void;
}) {
  const ltv = data.currentValuation > 0 ? (data.loanBalance / data.currentValuation) * 100 : 0;
  const equity = data.currentValuation - data.loanBalance;

  return (
    <div className="p-6 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniCard label="Purchase Price" value={formatZAR(data.purchasePrice)} icon={Banknote} color="bg-slate-100 text-slate-600" />
        <MiniCard label="Current Valuation" value={formatZAR(data.currentValuation)} icon={TrendingUp} color="bg-success-50 text-success-500" />
        <MiniCard label="Rental Amount" value={`${formatZAR(data.rentalAmount)}/mo`} icon={DollarSign} color="bg-accent-50 text-accent-500" />
        <MiniCard label="Yield" value={formatPercent(data.yieldPercentage)} icon={Percent} color="bg-warning-50 text-warning-500" />
      </div>

      {/* Loan section */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4" />
          Loan Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FieldRow label="Loan Amount">
            {editMode ? (
              <input type="number" value={data.loanAmount} onChange={(e) => updateField('loanAmount', parseFloat(e.target.value) || 0)} className="input" min={0} step="0.01" />
            ) : (
              <span className="text-sm font-semibold text-slate-800">{formatZAR(data.loanAmount)}</span>
            )}
          </FieldRow>
          <FieldRow label="Loan Balance">
            {editMode ? (
              <input type="number" value={data.loanBalance} onChange={(e) => updateField('loanBalance', parseFloat(e.target.value) || 0)} className="input" min={0} step="0.01" />
            ) : (
              <span className="text-sm font-semibold text-slate-800">{formatZAR(data.loanBalance)}</span>
            )}
          </FieldRow>
          <FieldRow label="Interest Rate">
            {editMode ? (
              <input type="number" value={data.interestRate} onChange={(e) => updateField('interestRate', parseFloat(e.target.value) || 0)} className="input" min={0} step="0.01" />
            ) : (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800"><Percent className="w-3.5 h-3.5" />{data.interestRate}%</span>
            )}
          </FieldRow>
          <FieldRow label="Monthly Repayment">
            {editMode ? (
              <input type="number" value={data.monthlyRepayment} onChange={(e) => updateField('monthlyRepayment', parseFloat(e.target.value) || 0)} className="input" min={0} step="0.01" />
            ) : (
              <span className="text-sm font-semibold text-slate-800">{formatZAR(data.monthlyRepayment)} <span className="text-xs font-normal text-slate-400">/mo</span></span>
            )}
          </FieldRow>
        </div>

        {/* Mini loan summary: LTV + Equity */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">LTV Ratio</p>
            <p className={`text-lg font-bold mt-1 ${ltv > 80 ? 'text-danger-700' : ltv > 60 ? 'text-warning-700' : 'text-success-700'}`}>
              {ltv.toFixed(1)}%
            </p>
            <div className="w-full h-2 rounded-full bg-slate-100 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${ltv > 80 ? 'bg-danger-500' : ltv > 60 ? 'bg-warning-500' : 'bg-success-500'}`}
                style={{ width: `${Math.min(ltv, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {ltv > 80 ? 'High — consider additional payments' : ltv > 60 ? 'Moderate — within acceptable range' : 'Healthy — low leverage'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Net Equity</p>
            <p className={`text-lg font-bold mt-1 ${equity >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
              {formatZAR(equity)}
            </p>
            <div className="w-full h-2 rounded-full bg-slate-100 mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-success-500 transition-all"
                style={{ width: `${data.currentValuation > 0 ? Math.max(0, (equity / data.currentValuation) * 100) : 0}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {equity >= 0 ? `${((equity / (data.currentValuation || 1)) * 100).toFixed(1)}% of property value` : 'Negative equity'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DocumentsTab
// ============================================================================

function DocumentsTab({
  documents,
  onAdd,
  onDelete,
}: {
  documents: PropertyDocument[];
  onAdd: () => void;
  onDelete: (docId: string) => void;
}) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Documents ({documents.length})
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-500 text-white text-xs font-medium
                     hover:bg-accent-600 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Add Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-600">No documents yet</p>
          <p className="text-xs text-slate-400 mt-1">Upload sale agreements, bond documents, scheme rules, and more.</p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent-500 hover:text-accent-600 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Document
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 py-3 hover:bg-slate-50/50 transition-colors px-2 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">{doc.type}</span>
                  <span className="text-xs text-slate-400">{formatDate(doc.uploadedAt)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDelete(doc.id)}
                className="p-2 rounded-lg text-slate-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// NotesTab — with auto-save on change
// ============================================================================

function NotesTab({
  notes,
  onNotesChange,
}: {
  notes: string;
  onNotesChange: (value: string) => void;
}) {
  const [saved, setSaved] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onNotesChange(e.target.value);
      setSaved(false);
      // Show "Saved" after a brief delay to simulate auto-save feedback
      setTimeout(() => setSaved(true), 1500);
    },
    [onNotesChange],
  );

  // Show saved state on mount if there are notes
  useEffect(() => {
    if (notes) setSaved(true);
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Property Notes
        </h3>
        {notes && saved && (
          <span className="text-xs font-medium text-success-600 bg-success-50 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Auto-saved
          </span>
        )}
      </div>
      <textarea
        value={notes}
        onChange={handleChange}
        rows={12}
        className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm
                   placeholder:text-slate-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500
                   shadow-sm resize-y transition-shadow"
        placeholder="Add notes about this property — they will auto-save..."
      />
      <p className="text-xs text-slate-400 mt-2">
        Notes are automatically saved as you type.
      </p>
    </div>
  );
}

// ============================================================================
// Shared components
// ============================================================================

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.FC<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-200">
        <Icon className="w-4 h-4 text-slate-400" />
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <div className="flex-1 text-right">{children}</div>
    </div>
  );
}

function BooleanBadge({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-xs text-success-700 bg-success-50 rounded-full px-2 py-0.5">
      <CheckCircle className="w-3 h-3" /> Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
      <Ban className="w-3 h-3" /> No
    </span>
  );
}

function ContactChip({ contact }: { contact: StoreType['getContactById'] extends (id: string) => infer R ? R : never }) {
  if (!contact) return <span className="text-xs text-slate-400 italic">Not assigned</span>;
  return (
    <span className="text-sm font-medium text-slate-700">{contact.person || contact.company}</span>
  );
}

function ContactSelect({
  value,
  contacts,
  category,
  onChange,
}: {
  value: string;
  contacts: StoreType['contacts'];
  category: string;
  onChange: (value: string) => void;
}) {
  const filtered = contacts.filter((c) => c.category === category);
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input text-sm">
      <option value="">None</option>
      {filtered.map((c) => (
        <option key={c.id} value={c.id}>
          {c.person || c.company}{c.company && c.person ? ` (${c.company})` : ''}
        </option>
      ))}
    </select>
  );
}

function MiniCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.FC<{ className?: string }>; color: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-2">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

// ============================================================================
// AddPropertyModal
// ============================================================================

function AddPropertyModal({
  contacts,
  onSave,
  onCancel,
}: {
  contacts: StoreType['contacts'];
  onSave: (data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}) {
  type FormTab = 'identification' | 'details' | 'financial' | 'ownership';
  const [formTab, setFormTab] = useState<FormTab>('identification');

  const [form, setForm] = useState<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>>({
    referenceId: '',
    unitNumber: '',
    schemeName: '',
    sectionalTitleScheme: '',
    physicalAddress: '',
    municipality: '',
    gpsCoordinates: '',
    bedrooms: 0,
    bathrooms: 0,
    parkingBays: 0,
    size: 0,
    balcony: false,
    garden: false,
    furnished: false,
    purchasePrice: 0,
    currentValuation: 0,
    loanAmount: 0,
    loanBalance: 0,
    interestRate: 0,
    monthlyRepayment: 0,
    rentalAmount: 0,
    yieldPercentage: 0,
    trustOwnership: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    lettingAgentId: '',
    managingAgentId: '',
    municipalityContactId: '',
    bankId: '',
    insuranceDetails: '',
    status: 'Active' as PropertyStatus,
    documents: [],
    notes: '',
  });

  const update = useCallback(<K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    onSave(form);
  }, [form, onSave]);

  const FORM_TABS: { id: FormTab; label: string; icon: typeof Building2 }[] = [
    { id: 'identification', label: 'Identification', icon: Building2 },
    { id: 'details', label: 'Details', icon: Home },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'ownership', label: 'Ownership & Ops', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add New Property</h2>
              <p className="text-xs text-slate-400 mt-0.5">Register a new property in the portfolio</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form tabs */}
        <div className="flex items-center gap-0.5 px-6 pt-4 pb-2 bg-slate-50/50 border-b border-slate-100">
          {FORM_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFormTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  formTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
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
          {formTab === 'identification' && (
            <>
              <FormField label="Scheme / Building Name *">
                <input type="text" value={form.schemeName} onChange={(e) => update('schemeName', e.target.value)} className="input" placeholder="e.g. Sandton Views" />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Reference ID *">
                  <input type="text" value={form.referenceId} onChange={(e) => update('referenceId', e.target.value)} className="input" placeholder="e.g. SV-001" />
                </FormField>
                <FormField label="Unit Number">
                  <input type="text" value={form.unitNumber} onChange={(e) => update('unitNumber', e.target.value)} className="input" placeholder="e.g. 12A" />
                </FormField>
              </div>
              <FormField label="Sectional Title Scheme">
                <input type="text" value={form.sectionalTitleScheme} onChange={(e) => update('sectionalTitleScheme', e.target.value)} className="input" placeholder="e.g. SS Sandton Views" />
              </FormField>
              <FormField label="Physical Address *">
                <input type="text" value={form.physicalAddress} onChange={(e) => update('physicalAddress', e.target.value)} className="input" placeholder="e.g. 123 Rivonia Road, Sandton" />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Municipality">
                  <input type="text" value={form.municipality} onChange={(e) => update('municipality', e.target.value)} className="input" placeholder="e.g. City of Johannesburg" />
                </FormField>
                <FormField label="GPS Coordinates">
                  <input type="text" value={form.gpsCoordinates} onChange={(e) => update('gpsCoordinates', e.target.value)} className="input" placeholder="-26.2041, 28.0473" />
                </FormField>
              </div>
            </>
          )}

          {formTab === 'details' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Bedrooms">
                  <input type="number" value={form.bedrooms} onChange={(e) => update('bedrooms', parseInt(e.target.value) || 0)} className="input" min={0} />
                </FormField>
                <FormField label="Bathrooms">
                  <input type="number" value={form.bathrooms} onChange={(e) => update('bathrooms', parseInt(e.target.value) || 0)} className="input" min={0} />
                </FormField>
                <FormField label="Parking Bays">
                  <input type="number" value={form.parkingBays} onChange={(e) => update('parkingBays', parseInt(e.target.value) || 0)} className="input" min={0} />
                </FormField>
              </div>
              <FormField label="Floor Size (m²)">
                <input type="number" value={form.size} onChange={(e) => update('size', parseInt(e.target.value) || 0)} className="input" min={0} />
              </FormField>
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Features</p>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.balcony} onChange={(e) => update('balcony', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-accent-500 focus:ring-accent-500" />
                    <span className="text-sm text-slate-700 flex items-center gap-1.5"><Trees className="w-3.5 h-3.5 text-slate-400" />Balcony</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.garden} onChange={(e) => update('garden', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-accent-500 focus:ring-accent-500" />
                    <span className="text-sm text-slate-700 flex items-center gap-1.5"><Trees className="w-3.5 h-3.5 text-slate-400" />Garden</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.furnished} onChange={(e) => update('furnished', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-accent-500 focus:ring-accent-500" />
                    <span className="text-sm text-slate-700 flex items-center gap-1.5"><Sofa className="w-3.5 h-3.5 text-slate-400" />Furnished</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {formTab === 'financial' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Purchase Price (R)">
                  <input type="number" value={form.purchasePrice} onChange={(e) => update('purchasePrice', parseFloat(e.target.value) || 0)} className="input" min={0} step="0.01" />
                </FormField>
                <FormField label="Current Valuation (R)">
                  <input type="number" value={form.currentValuation} onChange={(e) => update('currentValuation', parseFloat(e.target.value) || 0)} className="input" min={0} step="0.01" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Rental Amount (R/month)">
                  <input type="number" value={form.rentalAmount} onChange={(e) => update('rentalAmount', parseFloat(e.target.value) || 0)} className="input" min={0} step="0.01" />
                </FormField>
                <FormField label="Yield (%)">
                  <input type="number" value={form.yieldPercentage} onChange={(e) => update('yieldPercentage', parseFloat(e.target.value) || 0)} className="input" min={0} step="0.01" />
                </FormField>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loan Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Loan Amount (R)">
                    <input type="number" value={form.loanAmount} onChange={(e) => update('loanAmount', parseFloat(e.target.value) || 0)} className="input" min={0} step="0.01" />
                  </FormField>
                  <FormField label="Loan Balance (R)">
                    <input type="number" value={form.loanBalance} onChange={(e) => update('loanBalance', parseFloat(e.target.value) || 0)} className="input" min={0} step="0.01" />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Interest Rate (%)">
                    <input type="number" value={form.interestRate} onChange={(e) => update('interestRate', parseFloat(e.target.value) || 0)} className="input" min={0} step="0.01" />
                  </FormField>
                  <FormField label="Monthly Repayment (R)">
                    <input type="number" value={form.monthlyRepayment} onChange={(e) => update('monthlyRepayment', parseFloat(e.target.value) || 0)} className="input" min={0} step="0.01" />
                  </FormField>
                </div>
              </div>
            </>
          )}

          {formTab === 'ownership' && (
            <>
              <FormField label="Trust / Ownership Entity">
                <input type="text" value={form.trustOwnership} onChange={(e) => update('trustOwnership', e.target.value)} className="input" placeholder="e.g. Smith Family Trust" />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Acquisition Date">
                  <input type="date" value={form.acquisitionDate} onChange={(e) => update('acquisitionDate', e.target.value)} className="input" />
                </FormField>
                <FormField label="Status">
                  <select value={form.status} onChange={(e) => update('status', e.target.value as PropertyStatus)} className="input">
                    {STATUS_FILTERS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </FormField>
              </div>
              <FormField label="Insurance Details">
                <input type="text" value={form.insuranceDetails} onChange={(e) => update('insuranceDetails', e.target.value)} className="input" placeholder="e.g. Outsurance Policy #12345" />
              </FormField>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operational Assignments</p>
                <FormField label="Letting Agent">
                  <ContactSelect value={form.lettingAgentId} contacts={contacts} category="Letting Agent" onChange={(v) => update('lettingAgentId', v)} />
                </FormField>
                <FormField label="Managing Agent">
                  <ContactSelect value={form.managingAgentId} contacts={contacts} category="Managing Agent" onChange={(v) => update('managingAgentId', v)} />
                </FormField>
                <FormField label="Municipality Contact">
                  <ContactSelect value={form.municipalityContactId} contacts={contacts} category="Municipality" onChange={(v) => update('municipalityContactId', v)} />
                </FormField>
                <FormField label="Bank">
                  <ContactSelect value={form.bankId} contacts={contacts} category="Bank" onChange={(v) => update('bankId', v)} />
                </FormField>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
          <div className="text-xs text-slate-400">
            Step {FORM_TABS.findIndex((t) => t.id === formTab) + 1} of {FORM_TABS.length}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.schemeName.trim() || !form.referenceId.trim()}
              className="px-5 py-2 rounded-lg bg-accent-500 text-white text-sm font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 inline mr-1.5" />
              Save Property
            </button>
          </div>
        </div>
      </div>
    </div>
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
// DeleteConfirmModal
// ============================================================================

function DeleteConfirmModal({
  propertyName,
  onConfirm,
  onCancel,
}: {
  propertyName: string;
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
          <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Property?</h3>
          <p className="text-sm text-slate-500 mb-1">
            Are you sure you want to delete <span className="font-semibold text-slate-700">{propertyName}</span>?
          </p>
          <p className="text-xs text-slate-400">
            This action cannot be undone. All property data including documents, notes, and linked records will be permanently removed.
          </p>
        </div>
        <div className="flex items-center border-t border-slate-200">
          <button type="button" onClick={onCancel} className="flex-1 px-6 py-3.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 px-6 py-3.5 text-sm font-medium text-white bg-danger-500 hover:bg-danger-600 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
