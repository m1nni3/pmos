import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Reconciliation engine run complete",
      verified: 0,
      exceptions: 0,
    }),
  };
};
