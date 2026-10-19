import { cookies } from "next/headers";

// Vendure Shop API (GraphQL). The cart lives in Vendure's "active order",
// which is tied to the auth token Vendure returns on the first call.
const VENDURE_SHOP_API =
  process.env.VENDURE_SHOP_API_URL || "http://localhost:3002/shop-api";

// httpOnly cookie that holds the Vendure token (set by routes/cartApi.js).
export const VENDURE_TOKEN_COOKIE = "vendure-token";
const VENDURE_TOKEN_HEADER = "vendure-auth-token";

const ADD_CONFIGURED_ITEM = /* GraphQL */ `
  mutation AddConfiguredItem($input: AddToCartInput!) {
    addConfiguredItemToOrder(input: $input) {
      __typename
      ... on Order {
        id
        code
        totalQuantity
        totalWithTax
        currencyCode
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

// Sends `Authorization: Bearer <token>` once we have a token; the first call
// goes without one and Vendure answers with a new token in the response header.
async function shopApiFetch(query, variables) {
  const cookieStore = await cookies();
  const token = cookieStore.get(VENDURE_TOKEN_COOKIE)?.value;

  const response = await fetch(VENDURE_SHOP_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vendure Shop API error ${response.status}: ${error}`);
  }

  const { data, errors } = await response.json();
  if (errors?.length) {
    const error = new Error(`Vendure Shop API: ${errors.map((e) => e.message).join("; ")}`);
    // Vendure's validation errors (invalid SKU, no price, wrong currency) are
    // safe to show the shopper; anything else stays a generic failure.
    const inputError = errors.find((e) => e.extensions?.code === "USER_INPUT_ERROR");
    if (inputError) error.userMessage = inputError.message;
    throw error;
  }

  return { data, token: response.headers.get(VENDURE_TOKEN_HEADER) };
}

// Adds a configured design (AddToCartInput, see utils/cartInput.js) to the
// active order. Returns { result, token }: result is an Order or an
// ErrorResult ({ errorCode, message }); token is the (new) Vendure token, if any.
export async function addConfiguredItemToBag(input) {
  const { data, token } = await shopApiFetch(ADD_CONFIGURED_ITEM, { input });
  return { result: data.addConfiguredItemToOrder, token };
}
