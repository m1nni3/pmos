// ============================================================================
// PMOS Type System
// ============================================================================

export type PropertyStatus = 'Active' | 'Vacant' | 'Under Maintenance' | 'Sold';
export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type MaintenanceStatus = 'Reported' | 'Assigned' | 'In Progress' | 'Completed' | 'Closed';
export type MaintenanceCategory = 'Electrical' | 'Plumbing' | 'Security' | 'Appliances' | 'Structural' | 'General';
export type ReconciliationStatus = 'Verified' | 'Pending' | 'Partial Match' | 'Mismatch' | 'Missing' | 'Overpayment';
export type ContactCategory = 'Managing Agent' | 'Letting Agent' | 'Municipality' | 'Bank' | 'Contractor' | 'Body Corporate Trustee' | 'Service Provider' | 'Insurance';
export type TransactionType = 'Rent Received' | 'Levy Deduction' | 'Municipality Deduction' | 'Agent Commission' | 'Bank Payment' | 'Insurance Payment' | 'Maintenance Payment' | 'Other Income' | 'Other Expense' | 'Net Payment';
export type DocType = 'Sale Agreement' | 'Bond Document' | 'Scheme Rules' | 'Insurance' | 'Body Corporate' | 'Property Plan' | 'Other';
export type LevyType = 'Levy Payment' | 'Special Levy' | 'Levy Charge' | 'Other';
export type MuniCategory = 'Rates' | 'Refuse' | 'Water' | 'Sewerage' | 'Other';
export type BankType = 'Loan Repayment' | 'Interest' | 'Debit Order' | 'Transfer' | 'Fee' | 'Other';
export type ExceptionType = 'Unverified Levy' | 'Unverified Municipality' | 'Missing Bank Transaction' | 'Aging Discrepancy' | 'Overpayment' | 'Other';
export type LedgerName = 'Rental' | 'Levy' | 'Municipality' | 'Bank';

export interface PropertyDocument {
  id: string; name: string; type: DocType; url: string; uploadedAt: string;
}

export interface Property {
  id: string; referenceId: string; unitNumber: string; schemeName: string;
  sectionalTitleScheme: string; physicalAddress: string; municipality: string;
  gpsCoordinates: string; bedrooms: number; bathrooms: number; parkingBays: number;
  size: number; balcony: boolean; garden: boolean; furnished: boolean;
  purchasePrice: number; currentValuation: number; loanAmount: number;
  loanBalance: number; interestRate: number; monthlyRepayment: number;
  rentalAmount: number; yieldPercentage: number; trustOwnership: string;
  acquisitionDate: string; lettingAgentId: string; managingAgentId: string;
  municipalityContactId: string; bankId: string; insuranceDetails: string;
  status: PropertyStatus; documents: PropertyDocument[]; notes: string;
  createdAt: string; updatedAt: string;
}

export interface ServiceEntry {
  id: string; date: string; description: string; cost: number;
}

export interface Contact {
  id: string; category: ContactCategory; company: string; person: string;
  phone: string; email: string; address: string; notes: string;
  linkedProperties: string[]; serviceHistory: ServiceEntry[];
  createdAt: string; updatedAt: string;
}

export interface RentalTransaction {
  id: string; propertyId: string; type: TransactionType; description: string;
  amount: number; date: string; referenceNumber: string; reconciled: boolean;
  reconciliationStatus: ReconciliationStatus; linkedTransactionId?: string; notes: string;
}

export interface LevyTransaction {
  id: string; propertyId: string; description: string; amount: number;
  date: string; type: LevyType; referenceNumber: string; statementRef: string;
  balance: number; reconciled: boolean; reconciliationStatus: ReconciliationStatus;
  linkedTransactionId?: string;
}

export interface MunicipalityTransaction {
  id: string; propertyId: string; description: string; amount: number;
  date: string; category: MuniCategory; referenceNumber: string;
  invoiceNumber: string; balance: number; reconciled: boolean;
  reconciliationStatus: ReconciliationStatus; linkedTransactionId?: string;
}

export interface BankTransaction {
  id: string; propertyId: string; description: string; amount: number;
  date: string; type: BankType; referenceNumber: string; loanBalance: number;
  reconciled: boolean; reconciliationStatus: ReconciliationStatus;
  linkedTransactionId?: string;
}

export interface ReconciliationEntry {
  id: string; sourceLedger: LedgerName; targetLedger: LedgerName;
  sourceTransactionId: string; targetTransactionId?: string;
  expectedAmount: number; actualAmount?: number; status: ReconciliationStatus;
  difference: number; propertyId: string;
  dateRange: { start: string; end: string }; notes: string; createdAt: string;
}

export interface Exception {
  id: string; type: ExceptionType; severity: 'Low' | 'Medium' | 'High' | 'Critical';
  propertyId: string; description: string; amount: number; daysOutstanding: number;
  reconciliationId?: string; resolved: boolean; createdAt: string;
}

export interface MaintenanceTimelineEntry {
  id: string; date: string; status: MaintenanceStatus; note: string;
}

export interface MaintenanceIssue {
  id: string; propertyId: string; title: string; description: string;
  category: MaintenanceCategory; priority: MaintenancePriority; status: MaintenanceStatus;
  reportedDate: string; assignedContractorId?: string; estimatedCost: number;
  actualCost: number; photos: string[]; notes: string;
  timeline: MaintenanceTimelineEntry[]; createdAt: string; updatedAt: string;
}

export interface DashboardMetrics {
  portfolioValue: number; totalRentalIncome: number; loanExposure: number;
  occupancyRate: number; totalLevyObligations: number; totalMunicipalityObligations: number;
  openMaintenanceIssues: number; exceptionsRequiringAttention: number;
  reconciliationHealthScore: number; netCashFlow: number;
}

export interface AppState {
  properties: Property[]; contacts: Contact[];
  rentalTransactions: RentalTransaction[]; levyTransactions: LevyTransaction[];
  municipalityTransactions: MunicipalityTransaction[]; bankTransactions: BankTransaction[];
  reconciliationEntries: ReconciliationEntry[]; exceptions: Exception[];
  maintenanceIssues: MaintenanceIssue[];
}
