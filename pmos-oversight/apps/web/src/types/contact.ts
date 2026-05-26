export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ManagingAgent extends Contact {
  properties_managed: string[];
  commission_rate: number;
}

export interface LettingAgent extends Contact {
  properties_let: string[];
  commission_rate: number;
}

export interface Municipality extends Contact {
  account_number: string;
  rates_payable: number;
}

export interface Bank extends Contact {
  branch_code: string;
  account_number: string;
  account_type: string;
}

export interface Contractor extends Contact {
  trade: string;
  insurance_expiry?: string;
  rating?: number;
}
