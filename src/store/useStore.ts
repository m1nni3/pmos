import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type {
  AppState, Property, Contact, RentalTransaction, LevyTransaction,
  MunicipalityTransaction, BankTransaction, ReconciliationEntry, Exception,
  MaintenanceIssue, DashboardMetrics, PropertyDocument, ServiceEntry,
  MaintenanceTimelineEntry, LedgerName, ReconciliationStatus, ExceptionType,
  TransactionType
} from '@/types';

// ============================================================================
// Actions Interface
// ============================================================================

interface StoreActions {
  // Properties
  addProperty: (p: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProperty: (id: string, data: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  // Contacts
  addContact: (c: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContact: (id: string, data: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  addServiceEntry: (contactId: string, entry: Omit<ServiceEntry, 'id'>) => void;

  // Rental Transactions
  addRentalTransaction: (tx: Omit<RentalTransaction, 'id'>) => void;
  updateRentalTransaction: (id: string, data: Partial<RentalTransaction>) => void;
  deleteRentalTransaction: (id: string) => void;

  // Levy Transactions
  addLevyTransaction: (tx: Omit<LevyTransaction, 'id'>) => void;
  updateLevyTransaction: (id: string, data: Partial<LevyTransaction>) => void;
  deleteLevyTransaction: (id: string) => void;

  // Municipality Transactions
  addMunicipalityTransaction: (tx: Omit<MunicipalityTransaction, 'id'>) => void;
  updateMunicipalityTransaction: (id: string, data: Partial<MunicipalityTransaction>) => void;
  deleteMunicipalityTransaction: (id: string) => void;

  // Bank Transactions
  addBankTransaction: (tx: Omit<BankTransaction, 'id'>) => void;
  updateBankTransaction: (id: string, data: Partial<BankTransaction>) => void;
  deleteBankTransaction: (id: string) => void;

  // Reconciliation
  addReconciliationEntry: (entry: Omit<ReconciliationEntry, 'id' | 'createdAt'>) => void;
  updateReconciliationEntry: (id: string, data: Partial<ReconciliationEntry>) => void;
  runReconciliation: (propertyId?: string) => void;

  // Exceptions
  addException: (ex: Omit<Exception, 'id' | 'createdAt'>) => void;
  updateException: (id: string, data: Partial<Exception>) => void;
  resolveException: (id: string) => void;

  // Maintenance
  addMaintenanceIssue: (issue: Omit<MaintenanceIssue, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>) => void;
  updateMaintenanceIssue: (id: string, data: Partial<MaintenanceIssue>) => void;
  deleteMaintenanceIssue: (id: string) => void;
  addTimelineEntry: (issueId: string, entry: Omit<MaintenanceTimelineEntry, 'id'>) => void;

  // Documents
  addPropertyDocument: (propertyId: string, doc: Omit<PropertyDocument, 'id' | 'uploadedAt'>) => void;
  deletePropertyDocument: (propertyId: string, docId: string) => void;

  // Dashboard
  getDashboardMetrics: () => DashboardMetrics;
  getPropertyById: (id: string) => Property | undefined;
  getContactById: (id: string) => Contact | undefined;

  // Bulk
  seedData: (state: AppState) => void;
  resetAll: () => void;
}

type Store = AppState & StoreActions;
export type StoreType = Store;

// ============================================================================
// Persistence Helpers
// ============================================================================

const STORAGE_KEY = 'pmos_data';
const RECONCILIATION_DATE_RANGE_DAYS = 7;

function loadState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    properties: state.properties,
    contacts: state.contacts,
    rentalTransactions: state.rentalTransactions,
    levyTransactions: state.levyTransactions,
    municipalityTransactions: state.municipalityTransactions,
    bankTransactions: state.bankTransactions,
    reconciliationEntries: state.reconciliationEntries,
    exceptions: state.exceptions,
    maintenanceIssues: state.maintenanceIssues,
  }));
}

function isWithinDateRange(date1: string, date2: string, rangeDays: number): boolean {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  const rangeMs = rangeDays * 24 * 60 * 60 * 1000;
  return Math.abs(d1 - d2) <= rangeMs;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: AppState = {
  properties: [],
  contacts: [],
  rentalTransactions: [],
  levyTransactions: [],
  municipalityTransactions: [],
  bankTransactions: [],
  reconciliationEntries: [],
  exceptions: [],
  maintenanceIssues: [],
};

const loaded = loadState();

// ============================================================================
// Reconciliation Mapping: which Rental TransactionType maps to which ledger
// ============================================================================

const DEDUCTION_TO_LEDGER: Record<string, LedgerName> = {
  'Levy Deduction': 'Levy',
  'Municipality Deduction': 'Municipality',
  'Bank Payment': 'Bank',
};

const LEDGER_TO_DEDUCTION: Record<string, TransactionType> = {
  'Levy': 'Levy Deduction',
  'Municipality': 'Municipality Deduction',
  'Bank': 'Bank Payment',
};

// ============================================================================
// Store
// ============================================================================

export const useStore = create<Store>()((set, get) => ({
  ...initialState,
  ...loaded,

  // ==========================================================================
  // Properties
  // ==========================================================================

  addProperty: (p) => {
    const id = uuid();
    const now = new Date().toISOString();
    set((state) => ({
      properties: [...state.properties, { ...p, id, createdAt: now, updatedAt: now }],
    }));
    saveState(get());
  },

  updateProperty: (id, data) => {
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      ),
    }));
    saveState(get());
  },

  deleteProperty: (id) => {
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
    }));
    saveState(get());
  },

  // ==========================================================================
  // Contacts
  // ==========================================================================

  addContact: (c) => {
    const id = uuid();
    const now = new Date().toISOString();
    set((state) => ({
      contacts: [...state.contacts, { ...c, id, createdAt: now, updatedAt: now }],
    }));
    saveState(get());
  },

  updateContact: (id, data) => {
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      ),
    }));
    saveState(get());
  },

  deleteContact: (id) => {
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    }));
    saveState(get());
  },

  addServiceEntry: (contactId, entry) => {
    const id = uuid();
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === contactId
          ? {
              ...c,
              updatedAt: new Date().toISOString(),
              serviceHistory: [...c.serviceHistory, { ...entry, id }],
            }
          : c
      ),
    }));
    saveState(get());
  },

  // ==========================================================================
  // Rental Transactions
  // ==========================================================================

  addRentalTransaction: (tx) => {
    const id = uuid();
    set((state) => ({
      rentalTransactions: [...state.rentalTransactions, { ...tx, id }],
    }));
    saveState(get());
  },

  updateRentalTransaction: (id, data) => {
    set((state) => ({
      rentalTransactions: state.rentalTransactions.map((tx) =>
        tx.id === id ? { ...tx, ...data } : tx
      ),
    }));
    saveState(get());
  },

  deleteRentalTransaction: (id) => {
    set((state) => ({
      rentalTransactions: state.rentalTransactions.filter((tx) => tx.id !== id),
    }));
    saveState(get());
  },

  // ==========================================================================
  // Levy Transactions
  // ==========================================================================

  addLevyTransaction: (tx) => {
    const id = uuid();
    set((state) => ({
      levyTransactions: [...state.levyTransactions, { ...tx, id }],
    }));
    saveState(get());
  },

  updateLevyTransaction: (id, data) => {
    set((state) => ({
      levyTransactions: state.levyTransactions.map((tx) =>
        tx.id === id ? { ...tx, ...data } : tx
      ),
    }));
    saveState(get());
  },

  deleteLevyTransaction: (id) => {
    set((state) => ({
      levyTransactions: state.levyTransactions.filter((tx) => tx.id !== id),
    }));
    saveState(get());
  },

  // ==========================================================================
  // Municipality Transactions
  // ==========================================================================

  addMunicipalityTransaction: (tx) => {
    const id = uuid();
    set((state) => ({
      municipalityTransactions: [...state.municipalityTransactions, { ...tx, id }],
    }));
    saveState(get());
  },

  updateMunicipalityTransaction: (id, data) => {
    set((state) => ({
      municipalityTransactions: state.municipalityTransactions.map((tx) =>
        tx.id === id ? { ...tx, ...data } : tx
      ),
    }));
    saveState(get());
  },

  deleteMunicipalityTransaction: (id) => {
    set((state) => ({
      municipalityTransactions: state.municipalityTransactions.filter((tx) => tx.id !== id),
    }));
    saveState(get());
  },

  // ==========================================================================
  // Bank Transactions
  // ==========================================================================

  addBankTransaction: (tx) => {
    const id = uuid();
    set((state) => ({
      bankTransactions: [...state.bankTransactions, { ...tx, id }],
    }));
    saveState(get());
  },

  updateBankTransaction: (id, data) => {
    set((state) => ({
      bankTransactions: state.bankTransactions.map((tx) =>
        tx.id === id ? { ...tx, ...data } : tx
      ),
    }));
    saveState(get());
  },

  deleteBankTransaction: (id) => {
    set((state) => ({
      bankTransactions: state.bankTransactions.filter((tx) => tx.id !== id),
    }));
    saveState(get());
  },

  // ==========================================================================
  // Reconciliation
  // ==========================================================================

  addReconciliationEntry: (entry) => {
    const id = uuid();
    const now = new Date().toISOString();
    set((state) => ({
      reconciliationEntries: [...state.reconciliationEntries, { ...entry, id, createdAt: now }],
    }));
    saveState(get());
  },

  updateReconciliationEntry: (id, data) => {
    set((state) => ({
      reconciliationEntries: state.reconciliationEntries.map((e) =>
        e.id === id ? { ...e, ...data } : e
      ),
    }));
    saveState(get());
  },

  runReconciliation: (propertyId) => {
    const state = get();
    const now = new Date().toISOString();

    // Filter transactions by propertyId if provided
    const rentalTxs = propertyId
      ? state.rentalTransactions.filter((tx) => tx.propertyId === propertyId)
      : state.rentalTransactions;

    const levyTxs = propertyId
      ? state.levyTransactions.filter((tx) => tx.propertyId === propertyId)
      : state.levyTransactions;

    const muniTxs = propertyId
      ? state.municipalityTransactions.filter((tx) => tx.propertyId === propertyId)
      : state.municipalityTransactions;

    const bankTxs = propertyId
      ? state.bankTransactions.filter((tx) => tx.propertyId === propertyId)
      : state.bankTransactions;

    // Track which transactions have been matched to avoid duplicates
    const matchedRentalIds = new Set<string>();
    const matchedLevyIds = new Set<string>();
    const matchedMuniIds = new Set<string>();
    const matchedBankIds = new Set<string>();

    const newEntries: ReconciliationEntry[] = [];
    const newExceptions: Exception[] = [];

    // ------------------------------------------------------------------
    // Helper: get target transactions for a given ledger
    // ------------------------------------------------------------------
    function getTargetTxs(ledger: LedgerName): { id: string; propertyId: string; amount: number; date: string }[] {
      switch (ledger) {
        case 'Levy':
          return levyTxs.map((tx) => ({ id: tx.id, propertyId: tx.propertyId, amount: tx.amount, date: tx.date }));
        case 'Municipality':
          return muniTxs.map((tx) => ({ id: tx.id, propertyId: tx.propertyId, amount: tx.amount, date: tx.date }));
        case 'Bank':
          return bankTxs.map((tx) => ({ id: tx.id, propertyId: tx.propertyId, amount: tx.amount, date: tx.date }));
        default:
          return [];
      }
    }

    // ------------------------------------------------------------------
    // Helper: find best match in target ledger for a given source transaction
    // ------------------------------------------------------------------
    function findMatch(
      sourceId: string,
      sourcePropertyId: string,
      sourceAmount: number,
      sourceDate: string,
      targetLedger: LedgerName,
      excludeIds: Set<string>
    ): { id: string; amount: number; date: string } | null {
      const candidates = getTargetTxs(targetLedger).filter(
        (tx) =>
          tx.propertyId === sourcePropertyId &&
          Math.abs(tx.amount - sourceAmount) < 0.01 &&
          isWithinDateRange(sourceDate, tx.date, RECONCILIATION_DATE_RANGE_DAYS) &&
          !excludeIds.has(tx.id)
      );
      // Prefer exact amount match; take the closest date match
      if (candidates.length === 0) return null;
      candidates.sort(
        (a, b) =>
          Math.abs(new Date(a.date).getTime() - new Date(sourceDate).getTime()) -
          Math.abs(new Date(b.date).getTime() - new Date(sourceDate).getTime())
      );
      return candidates[0];
    }

    // ------------------------------------------------------------------
    // Pass 1: Rental Deductions → Target Ledgers
    // ------------------------------------------------------------------
    const deductionTypes: TransactionType[] = ['Levy Deduction', 'Municipality Deduction', 'Bank Payment'];

    for (const rentalTx of rentalTxs) {
      if (!deductionTypes.includes(rentalTx.type)) continue;

      const targetLedger = DEDUCTION_TO_LEDGER[rentalTx.type];
      if (!targetLedger) continue;

      const match = findMatch(
        rentalTx.id,
        rentalTx.propertyId,
        rentalTx.amount,
        rentalTx.date,
        targetLedger,
        targetLedger === 'Levy' ? matchedLevyIds : targetLedger === 'Municipality' ? matchedMuniIds : matchedBankIds
      );

      let status: ReconciliationStatus;
      let targetId: string | undefined;
      let actualAmount: number | undefined;
      let difference: number;

      if (match) {
        status = 'Verified';
        targetId = match.id;
        actualAmount = match.amount;
        difference = 0;
        matchedRentalIds.add(rentalTx.id);
        if (targetLedger === 'Levy') matchedLevyIds.add(match.id);
        else if (targetLedger === 'Municipality') matchedMuniIds.add(match.id);
        else matchedBankIds.add(match.id);
      } else {
        status = 'Missing';
        targetId = undefined;
        actualAmount = undefined;
        difference = rentalTx.amount;
      }

      const entry: ReconciliationEntry = {
        id: uuid(),
        sourceLedger: 'Rental',
        targetLedger,
        sourceTransactionId: rentalTx.id,
        targetTransactionId: targetId,
        expectedAmount: rentalTx.amount,
        actualAmount,
        status,
        difference,
        propertyId: rentalTx.propertyId,
        dateRange: {
          start: new Date(new Date(rentalTx.date).getTime() - RECONCILIATION_DATE_RANGE_DAYS * 86400000).toISOString(),
          end: new Date(new Date(rentalTx.date).getTime() + RECONCILIATION_DATE_RANGE_DAYS * 86400000).toISOString(),
        },
        notes: status === 'Verified'
          ? `Matched ${targetLedger} transaction ${match?.id ?? 'unknown'}`
          : `No matching ${targetLedger} transaction found within ±${RECONCILIATION_DATE_RANGE_DAYS} days`,
        createdAt: now,
      };

      newEntries.push(entry);

      // Create Exception for Missing status
      if (status === 'Missing') {
        newExceptions.push({
          id: uuid(),
          type: targetLedger === 'Levy'
            ? 'Unverified Levy'
            : targetLedger === 'Municipality'
              ? 'Unverified Municipality'
              : 'Missing Bank Transaction',
          severity: 'High',
          propertyId: rentalTx.propertyId,
          description: `Rental deduction "${rentalTx.description}" (${rentalTx.amount}) has no matching ${targetLedger} transaction`,
          amount: rentalTx.amount,
          daysOutstanding: Math.floor(
            (Date.now() - new Date(rentalTx.date).getTime()) / 86400000
          ),
          reconciliationId: entry.id,
          resolved: false,
          createdAt: now,
        });
      }
    }

    // ------------------------------------------------------------------
    // Pass 2: Target Ledgers → Rental Deductions (unmatched only)
    // ------------------------------------------------------------------
    function reverseMatch(
      sourceLedger: LedgerName,
      sourceId: string,
      sourcePropertyId: string,
      sourceAmount: number,
      sourceDate: string,
      alreadyMatched: boolean
    ): void {
      if (alreadyMatched) return;

      const deductionType = LEDGER_TO_DEDUCTION[sourceLedger];
      if (!deductionType) return;

      const matchingRental = rentalTxs.find(
        (tx) =>
          tx.type === deductionType &&
          tx.propertyId === sourcePropertyId &&
          Math.abs(tx.amount - sourceAmount) < 0.01 &&
          isWithinDateRange(sourceDate, tx.date, RECONCILIATION_DATE_RANGE_DAYS) &&
          !matchedRentalIds.has(tx.id)
      );

      let status: ReconciliationStatus;
      let targetId: string | undefined;
      let actualAmount: number | undefined;
      let difference: number;

      if (matchingRental) {
        status = 'Verified';
        targetId = matchingRental.id;
        actualAmount = matchingRental.amount;
        difference = 0;
        matchedRentalIds.add(matchingRental.id);
      } else {
        status = 'Missing';
        targetId = undefined;
        actualAmount = undefined;
        difference = sourceAmount;
      }

      const entry: ReconciliationEntry = {
        id: uuid(),
        sourceLedger,
        targetLedger: 'Rental',
        sourceTransactionId: sourceId,
        targetTransactionId: targetId,
        expectedAmount: sourceAmount,
        actualAmount,
        status,
        difference,
        propertyId: sourcePropertyId,
        dateRange: {
          start: new Date(new Date(sourceDate).getTime() - RECONCILIATION_DATE_RANGE_DAYS * 86400000).toISOString(),
          end: new Date(new Date(sourceDate).getTime() + RECONCILIATION_DATE_RANGE_DAYS * 86400000).toISOString(),
        },
        notes: status === 'Verified'
          ? `Matched Rental deduction ${matchingRental?.id ?? 'unknown'}`
          : `No matching Rental deduction found within ±${RECONCILIATION_DATE_RANGE_DAYS} days`,
        createdAt: now,
      };

      newEntries.push(entry);

      if (status === 'Missing') {
        newExceptions.push({
          id: uuid(),
          type: 'Unverified Levy',
          severity: 'High',
          propertyId: sourcePropertyId,
          description: `${sourceLedger} transaction (${sourceAmount}) has no matching Rental deduction`,
          amount: sourceAmount,
          daysOutstanding: Math.floor(
            (Date.now() - new Date(sourceDate).getTime()) / 86400000
          ),
          reconciliationId: entry.id,
          resolved: false,
          createdAt: now,
        });
      }
    }

    // Reverse-match remaining unmatched levy transactions
    for (const levyTx of levyTxs) {
      reverseMatch('Levy', levyTx.id, levyTx.propertyId, levyTx.amount, levyTx.date, matchedLevyIds.has(levyTx.id));
    }

    // Reverse-match remaining unmatched municipality transactions
    for (const muniTx of muniTxs) {
      reverseMatch('Municipality', muniTx.id, muniTx.propertyId, muniTx.amount, muniTx.date, matchedMuniIds.has(muniTx.id));
    }

    // Reverse-match remaining unmatched bank transactions
    for (const bankTx of bankTxs) {
      reverseMatch('Bank', bankTx.id, bankTx.propertyId, bankTx.amount, bankTx.date, matchedBankIds.has(bankTx.id));
    }

    // ------------------------------------------------------------------
    // Update transaction reconciled statuses
    // ------------------------------------------------------------------
    const updatedRentalTxs = state.rentalTransactions.map((tx) => {
      if (matchedRentalIds.has(tx.id)) {
        return { ...tx, reconciled: true, reconciliationStatus: 'Verified' as ReconciliationStatus };
      }
      // Check if this rental deduction has a Missing entry
      const hasMissing = newEntries.some(
        (e) => e.sourceTransactionId === tx.id && e.status === 'Missing'
      );
      if (hasMissing) {
        return { ...tx, reconciled: false, reconciliationStatus: 'Missing' as ReconciliationStatus };
      }
      return tx;
    });

    const updatedLevyTxs = state.levyTransactions.map((tx) => {
      if (matchedLevyIds.has(tx.id)) {
        return { ...tx, reconciled: true, reconciliationStatus: 'Verified' as ReconciliationStatus };
      }
      const hasMissing = newEntries.some(
        (e) => e.sourceTransactionId === tx.id && e.status === 'Missing'
      );
      if (hasMissing) {
        return { ...tx, reconciled: false, reconciliationStatus: 'Missing' as ReconciliationStatus };
      }
      return tx;
    });

    const updatedMuniTxs = state.municipalityTransactions.map((tx) => {
      if (matchedMuniIds.has(tx.id)) {
        return { ...tx, reconciled: true, reconciliationStatus: 'Verified' as ReconciliationStatus };
      }
      const hasMissing = newEntries.some(
        (e) => e.sourceTransactionId === tx.id && e.status === 'Missing'
      );
      if (hasMissing) {
        return { ...tx, reconciled: false, reconciliationStatus: 'Missing' as ReconciliationStatus };
      }
      return tx;
    });

    const updatedBankTxs = state.bankTransactions.map((tx) => {
      if (matchedBankIds.has(tx.id)) {
        return { ...tx, reconciled: true, reconciliationStatus: 'Verified' as ReconciliationStatus };
      }
      const hasMissing = newEntries.some(
        (e) => e.sourceTransactionId === tx.id && e.status === 'Missing'
      );
      if (hasMissing) {
        return { ...tx, reconciled: false, reconciliationStatus: 'Missing' as ReconciliationStatus };
      }
      return tx;
    });

    // ------------------------------------------------------------------
    // Persist: keep old entries not related to filtered scope, add new ones
    // ------------------------------------------------------------------
    const existingEntries = propertyId
      ? state.reconciliationEntries.filter((e) => e.propertyId !== propertyId)
      : [];

    const existingExceptions = propertyId
      ? state.exceptions.filter((e) => e.propertyId !== propertyId)
      : [];

    set({
      reconciliationEntries: [...existingEntries, ...newEntries],
      exceptions: [...existingExceptions, ...newExceptions],
      rentalTransactions: updatedRentalTxs,
      levyTransactions: updatedLevyTxs,
      municipalityTransactions: updatedMuniTxs,
      bankTransactions: updatedBankTxs,
    });

    saveState(get());
  },

  // ==========================================================================
  // Exceptions
  // ==========================================================================

  addException: (ex) => {
    const id = uuid();
    const now = new Date().toISOString();
    set((state) => ({
      exceptions: [...state.exceptions, { ...ex, id, createdAt: now }],
    }));
    saveState(get());
  },

  updateException: (id, data) => {
    set((state) => ({
      exceptions: state.exceptions.map((ex) =>
        ex.id === id ? { ...ex, ...data } : ex
      ),
    }));
    saveState(get());
  },

  resolveException: (id) => {
    set((state) => ({
      exceptions: state.exceptions.map((ex) =>
        ex.id === id ? { ...ex, resolved: true } : ex
      ),
    }));
    saveState(get());
  },

  // ==========================================================================
  // Maintenance
  // ==========================================================================

  addMaintenanceIssue: (issue) => {
    const id = uuid();
    const now = new Date().toISOString();
    const initialTimelineEntry: MaintenanceTimelineEntry = {
      id: uuid(),
      date: now,
      status: issue.status,
      note: 'Issue reported',
    };
    set((state) => ({
      maintenanceIssues: [
        ...state.maintenanceIssues,
        {
          ...issue,
          id,
          createdAt: now,
          updatedAt: now,
          timeline: [initialTimelineEntry],
        },
      ],
    }));
    saveState(get());
  },

  updateMaintenanceIssue: (id, data) => {
    set((state) => ({
      maintenanceIssues: state.maintenanceIssues.map((issue) =>
        issue.id === id
          ? { ...issue, ...data, updatedAt: new Date().toISOString() }
          : issue
      ),
    }));
    saveState(get());
  },

  deleteMaintenanceIssue: (id) => {
    set((state) => ({
      maintenanceIssues: state.maintenanceIssues.filter((issue) => issue.id !== id),
    }));
    saveState(get());
  },

  addTimelineEntry: (issueId, entry) => {
    const id = uuid();
    set((state) => ({
      maintenanceIssues: state.maintenanceIssues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              updatedAt: new Date().toISOString(),
              timeline: [...issue.timeline, { ...entry, id }],
            }
          : issue
      ),
    }));
    saveState(get());
  },

  // ==========================================================================
  // Property Documents
  // ==========================================================================

  addPropertyDocument: (propertyId, doc) => {
    const id = uuid();
    const now = new Date().toISOString();
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              updatedAt: now,
              documents: [...p.documents, { ...doc, id, uploadedAt: now }],
            }
          : p
      ),
    }));
    saveState(get());
  },

  deletePropertyDocument: (propertyId, docId) => {
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              updatedAt: new Date().toISOString(),
              documents: p.documents.filter((d) => d.id !== docId),
            }
          : p
      ),
    }));
    saveState(get());
  },

  // ==========================================================================
  // Dashboard Metrics
  // ==========================================================================

  getDashboardMetrics: () => {
    const state = get();

    // Portfolio Value: sum of all property currentValuation
    const portfolioValue = state.properties.reduce(
      (sum, p) => sum + (p.currentValuation || 0),
      0
    );

    // Total Rental Income: sum of all "Rent Received" rental transactions
    const totalRentalIncome = state.rentalTransactions
      .filter((tx) => tx.type === 'Rent Received')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Loan Exposure: sum of all property loanBalance
    const loanExposure = state.properties.reduce(
      (sum, p) => sum + (p.loanBalance || 0),
      0
    );

    // Occupancy Rate: percentage of Active properties / total
    const activeCount = state.properties.filter((p) => p.status === 'Active').length;
    const totalProperties = state.properties.length;
    const occupancyRate = totalProperties > 0
      ? Math.round((activeCount / totalProperties) * 100)
      : 0;

    // Total Levy Obligations: sum of levy transactions where type is 'Levy Charge'
    const totalLevyObligations = state.levyTransactions
      .filter((tx) => tx.type === 'Levy Charge')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Total Municipality Obligations: sum of all municipality transactions
    const totalMunicipalityObligations = state.municipalityTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );

    // Open Maintenance Issues: count of maintenance not Closed
    const openMaintenanceIssues = state.maintenanceIssues.filter(
      (issue) => issue.status !== 'Closed'
    ).length;

    // Exceptions Requiring Attention: count of unresolved exceptions
    const exceptionsRequiringAttention = state.exceptions.filter(
      (ex) => !ex.resolved
    ).length;

    // Reconciliation Health Score: percentage of verified reconciliations (0-100)
    const totalReconciliations = state.reconciliationEntries.length;
    const verifiedReconciliations = state.reconciliationEntries.filter(
      (e) => e.status === 'Verified'
    ).length;
    const reconciliationHealthScore = totalReconciliations > 0
      ? Math.round((verifiedReconciliations / totalReconciliations) * 100)
      : 100; // Default to 100 if no entries yet

    // Net Cash Flow: rental income minus all deductions
    const allIncome = state.rentalTransactions
      .filter((tx) => tx.type === 'Rent Received' || tx.type === 'Other Income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const allExpenses = state.rentalTransactions
      .filter(
        (tx) =>
          tx.type === 'Levy Deduction' ||
          tx.type === 'Municipality Deduction' ||
          tx.type === 'Agent Commission' ||
          tx.type === 'Bank Payment' ||
          tx.type === 'Insurance Payment' ||
          tx.type === 'Maintenance Payment' ||
          tx.type === 'Other Expense'
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    const netCashFlow = allIncome - allExpenses;

    return {
      portfolioValue,
      totalRentalIncome,
      loanExposure,
      occupancyRate,
      totalLevyObligations,
      totalMunicipalityObligations,
      openMaintenanceIssues,
      exceptionsRequiringAttention,
      reconciliationHealthScore,
      netCashFlow,
    };
  },

  // ==========================================================================
  // Lookups
  // ==========================================================================

  getPropertyById: (id) => {
    return get().properties.find((p) => p.id === id);
  },

  getContactById: (id) => {
    return get().contacts.find((c) => c.id === id);
  },

  // ==========================================================================
  // Bulk Operations
  // ==========================================================================

  seedData: (data) => {
    set({
      properties: data.properties,
      contacts: data.contacts,
      rentalTransactions: data.rentalTransactions,
      levyTransactions: data.levyTransactions,
      municipalityTransactions: data.municipalityTransactions,
      bankTransactions: data.bankTransactions,
      reconciliationEntries: data.reconciliationEntries,
      exceptions: data.exceptions,
      maintenanceIssues: data.maintenanceIssues,
    });
    saveState(get());
  },

  resetAll: () => {
    set({ ...initialState });
    saveState(get());
  },
}));


