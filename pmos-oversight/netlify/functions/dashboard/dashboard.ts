import type { Handler } from "@netlify/functions";

export const handler: Handler = async () => {
  const summary = {
    portfolio_value: 48_200_000,
    monthly_rental_income: 342_000,
    loan_exposure: 18_700_000,
    levy_obligations: 89_000,
    municipality_obligations: 124_000,
    open_maintenance: 14,
    reconciliation_health: 94,
    exceptions: 7,
    occupancy: 92,
    net_cashflow: 129_000,
  };

  return {
    statusCode: 200,
    body: JSON.stringify(summary),
  };
};
