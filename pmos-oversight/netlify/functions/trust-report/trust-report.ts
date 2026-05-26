import type { Handler } from "@netlify/functions";

export const handler: Handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      report_type: "trust",
      generated_at: new Date().toISOString(),
      status: "ready",
    }),
  };
};
