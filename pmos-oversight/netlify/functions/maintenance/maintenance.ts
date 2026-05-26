import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  const { httpMethod } = event;

  switch (httpMethod) {
    case "GET":
      return {
        statusCode: 200,
        body: JSON.stringify({ work_orders: [] }),
      };
    case "POST":
      return {
        statusCode: 201,
        body: JSON.stringify({ message: "Work order created", id: null }),
      };
    default:
      return { statusCode: 405, body: "Method Not Allowed" };
  }
};
