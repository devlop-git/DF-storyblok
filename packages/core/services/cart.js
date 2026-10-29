import { cookies } from "next/headers";

// Vendure Shop API (GraphQL): cart, coupons and checkout. The cart is Vendure's
// "active order" of the session; the session is the token Vendure returns in
// the `vendure-auth-token` header on the first call. We keep it in an httpOnly
// cookie (set by the /api/cart/* routes) and send it as a Bearer token.
const VENDURE_SHOP_API = process.env.VENDURE_SHOP_API_URL || "http://localhost:3002/shop-api";

export const VENDURE_TOKEN_COOKIE = "vendure-token";
const VENDURE_TOKEN_HEADER = "vendure-auth-token";

// Everything the cart / checkout pages show. Money is in minor units (pence).
const ORDER_FIELDS = /* GraphQL */ `
  fragment CartOrder on Order {
    id
    code
    state
    currencyCode
    totalQuantity
    subTotalWithTax
    shippingWithTax
    totalWithTax
    couponCodes
    discounts {
      description
      amountWithTax
    }
    orderPlacedAt
    customer {
      emailAddress
    }
    shippingLines {
      shippingMethod {
        id
        name
      }
    }
    shippingAddress {
      fullName
      streetLine1
      streetLine2
      city
      postalCode
      country
      phoneNumber
    }
    lines {
      id
      quantity
      unitPriceWithTax
      linePriceWithTax
      discountedLinePriceWithTax
      productVariant {
        name
        sku
      }
      featuredAsset {
        preview
      }
      customFields {
        configSku
        productName
        imageUrl
        selectedOptions
      }
    }
  }
`;

const ERROR_FIELDS = "... on ErrorResult { errorCode message }";

/**
 * One Shop API call with the session token. Returns { data, token } -- token
 * is the (new) session token when Vendure sent one. Throws on HTTP / GraphQL
 * errors; Vendure's validation errors carry `userMessage` (safe to show).
 */
async function shopApi(query, variables) {
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
    throw new Error(`Vendure Shop API error ${response.status}: ${await response.text()}`);
  }

  const { data, errors } = await response.json();
  if (errors?.length) {
    const error = new Error(`Vendure Shop API: ${errors.map((e) => e.message).join("; ")}`);
    const inputError = errors.find((e) => e.extensions?.code === "USER_INPUT_ERROR");
    if (inputError) error.userMessage = inputError.message;
    throw error;
  }

  return { data, token: response.headers.get(VENDURE_TOKEN_HEADER) };
}

// Mutation results are the Order (or another success type), or an
// ErrorResult ({ errorCode, message }) -- whose message is shown to the shopper.
function throwIfError(result) {
  if (!result || result.errorCode) {
    const error = new Error(result?.message ?? "Vendure returned no result");
    error.userMessage = result?.message;
    throw error;
  }
  return result;
}

const money = (minor) => (minor ?? 0) / 100;

function parseJson(value) {
  if (!value) return null;
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
}

/** Vendure order -> the cart shape the pages render (major units). */
export function toCart(order) {
  if (!order) return null;
  return {
    id: order.id,
    code: order.code,
    state: order.state,
    currency: order.currencyCode,
    email: order.customer?.emailAddress,
    placedAt: order.orderPlacedAt,
    shippingMethod: order.shippingLines?.[0]?.shippingMethod ?? null, // { id, name }
    address: order.shippingAddress?.streetLine1 ? order.shippingAddress : null,
    totalQuantity: order.totalQuantity,
    subtotal: money(order.subTotalWithTax),
    shipping: money(order.shippingWithTax),
    total: money(order.totalWithTax),
    couponCodes: order.couponCodes ?? [],
    discounts: (order.discounts ?? []).map((d) => ({
      description: d.description,
      amount: money(d.amountWithTax),
    })),
    items: (order.lines ?? []).map((line) => {
      const options = parseJson(line.customFields?.selectedOptions) ?? [];
      return {
        id: line.id,
        title: line.customFields?.productName || line.productVariant?.name,
        sku: line.customFields?.configSku || line.productVariant?.sku,
        thumbnail: line.customFields?.imageUrl || line.featuredAsset?.preview,
        options: options.map((o) => o.value).join(", "),
        quantity: line.quantity,
        unitPrice: money(line.unitPriceWithTax),
        linePrice: money(line.linePriceWithTax),
        discountedLinePrice: money(line.discountedLinePriceWithTax),
      };
    }),
  };
}

/**
 * Adds a configured design (AddToCartInput, see utils/cartInput.js) to the
 * active order. Returns { cart, token } (token: the new session, if any).
 */
export async function addConfiguredItemToBag(input) {
  const { data, token } = await shopApi(
    `mutation AddToBag($input: AddToCartInput!) {
      addConfiguredItemToOrder(input: $input) { __typename ...CartOrder ${ERROR_FIELDS} }
    }
    ${ORDER_FIELDS}`,
    { input },
  );
  return { cart: toCart(throwIfError(data.addConfiguredItemToOrder)), token };
}

/** The session's cart, or null when there is none / it's empty. */
export async function getCart() {
  const cookieStore = await cookies();
  if (!cookieStore.get(VENDURE_TOKEN_COOKIE)) return null;
  const { data } = await shopApi(`{ activeOrder { ...CartOrder } } ${ORDER_FIELDS}`);
  return toCart(data.activeOrder);
}

/** Applies / removes a coupon code on the active order. Returns the cart. */
export async function applyCoupon(couponCode) {
  const { data } = await shopApi(
    `mutation ApplyCoupon($couponCode: String!) {
      applyCouponCode(couponCode: $couponCode) { __typename ...CartOrder ${ERROR_FIELDS} }
    }
    ${ORDER_FIELDS}`,
    { couponCode },
  );
  return toCart(throwIfError(data.applyCouponCode));
}

export async function removeCoupon(couponCode) {
  const { data } = await shopApi(
    `mutation RemoveCoupon($couponCode: String!) {
      removeCouponCode(couponCode: $couponCode) { __typename ...CartOrder }
    }
    ${ORDER_FIELDS}`,
    { couponCode },
  );
  return toCart(throwIfError(data.removeCouponCode));
}

/** Removes one line from the cart. Returns the cart. */
export async function removeLine(orderLineId) {
  const { data } = await shopApi(
    `mutation RemoveLine($orderLineId: ID!) {
      removeOrderLine(orderLineId: $orderLineId) { __typename ...CartOrder ${ERROR_FIELDS} }
    }
    ${ORDER_FIELDS}`,
    { orderLineId },
  );
  return toCart(throwIfError(data.removeOrderLine));
}

/**
 * Places the order: guest customer, shipping + billing address, the first
 * eligible shipping method, then payment with the first eligible payment
 * method (the dev server's dummy "standard-payment" handler). Returns the
 * placed order as a cart.
 *
 * `address`: { first_name, last_name, address_1, address_2, city,
 * postal_code, country_code, phone } (the checkout form's fields).
 */
export async function checkoutCart({ email, address }) {
  const fullName = `${address.first_name} ${address.last_name}`.trim();
  const vendureAddress = {
    fullName,
    streetLine1: address.address_1,
    streetLine2: address.address_2 || undefined,
    city: address.city,
    postalCode: address.postal_code,
    countryCode: (address.country_code || "GB").toUpperCase(),
    phoneNumber: address.phone || undefined,
  };

  const { data: customer } = await shopApi(
    `mutation SetCustomer($input: CreateCustomerInput!) {
      setCustomerForOrder(input: $input) { __typename ${ERROR_FIELDS} }
    }`,
    {
      input: {
        emailAddress: email,
        firstName: address.first_name,
        lastName: address.last_name,
        phoneNumber: address.phone || undefined,
      },
    },
  );
  // A logged-in customer is already attached to the order; anything else is an error.
  const customerResult = customer.setCustomerForOrder;
  if (customerResult.errorCode && customerResult.errorCode !== "ALREADY_LOGGED_IN_ERROR") {
    throwIfError(customerResult);
  }

  const { data: addressed } = await shopApi(
    `mutation SetAddresses($address: CreateAddressInput!) {
      setOrderShippingAddress(input: $address) { __typename ${ERROR_FIELDS} }
      setOrderBillingAddress(input: $address) { __typename ${ERROR_FIELDS} }
    }`,
    { address: vendureAddress },
  );
  throwIfError(addressed.setOrderShippingAddress);
  throwIfError(addressed.setOrderBillingAddress);

  const { data: methods } = await shopApi(`{
    eligibleShippingMethods { id name priceWithTax }
    eligiblePaymentMethods { code isEligible eligibilityMessage }
  }`);
  // The method picked in the bag (setShippingMethod), else the first eligible one.
  const { data: current } = await shopApi(
    `{ activeOrder { shippingLines { shippingMethod { id } } } }`,
  );
  const pickedId = current.activeOrder?.shippingLines?.[0]?.shippingMethod?.id;
  const shippingMethod =
    methods.eligibleShippingMethods.find((m) => m.id === pickedId) ??
    methods.eligibleShippingMethods[0];
  const paymentMethod = methods.eligiblePaymentMethods.find((m) => m.isEligible);
  if (!shippingMethod || !paymentMethod) {
    const error = new Error("No shipping or payment method available");
    error.userMessage = "No shipping or payment method is available for this address.";
    throw error;
  }

  const { data: shipped } = await shopApi(
    `mutation SetShipping($id: [ID!]!) {
      setOrderShippingMethod(shippingMethodId: $id) { __typename ${ERROR_FIELDS} }
    }`,
    { id: [shippingMethod.id] },
  );
  throwIfError(shipped.setOrderShippingMethod);

  const { data: arranging } = await shopApi(
    `mutation { transitionOrderToState(state: "ArrangingPayment") { __typename ... on OrderStateTransitionError { errorCode message transitionError } } }`,
  );
  if (arranging.transitionOrderToState?.errorCode) {
    const result = arranging.transitionOrderToState;
    const error = new Error(`${result.message}: ${result.transitionError}`);
    error.userMessage = result.transitionError || result.message;
    throw error;
  }

  const { data: paid } = await shopApi(
    `mutation Pay($input: PaymentInput!) {
      addPaymentToOrder(input: $input) { __typename ...CartOrder ${ERROR_FIELDS} }
    }
    ${ORDER_FIELDS}`,
    { input: { method: paymentMethod.code, metadata: {} } },
  );
  return toCart(throwIfError(paid.addPaymentToOrder));
}

/** Shipping methods the cart can use: [{ id, name, price }] (major units). */
export async function getShippingMethods() {
  const { data } = await shopApi(`{ eligibleShippingMethods { id name priceWithTax } }`);
  return data.eligibleShippingMethods.map((m) => ({ id: m.id, name: m.name, price: money(m.priceWithTax) }));
}

/** Picks the shipping method for the cart. Returns the cart. */
export async function setShippingMethod(shippingMethodId) {
  const { data } = await shopApi(
    `mutation SetShipping($id: [ID!]!) {
      setOrderShippingMethod(shippingMethodId: $id) { __typename ...CartOrder ${ERROR_FIELDS} }
    }
    ${ORDER_FIELDS}`,
    { id: [shippingMethodId] },
  );
  return toCart(throwIfError(data.setOrderShippingMethod));
}

/** Changes a line's quantity (0 removes it). Returns the cart. */
export async function adjustLine(orderLineId, quantity) {
  const { data } = await shopApi(
    `mutation AdjustLine($orderLineId: ID!, $quantity: Int!) {
      adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) { __typename ...CartOrder ${ERROR_FIELDS} }
    }
    ${ORDER_FIELDS}`,
    { orderLineId, quantity },
  );
  return toCart(throwIfError(data.adjustOrderLine));
}

/**
 * A placed order by its code, for the confirmation page. With Vendure's default
 * access strategy: a customer's own orders, and guest orders for 2 hours after
 * they're placed; otherwise null.
 */
export async function getOrderByCode(code) {
  const { data } = await shopApi(
    `query OrderByCode($code: String!) { orderByCode(code: $code) { ...CartOrder } } ${ORDER_FIELDS}`,
    { code },
  );
  return toCart(data.orderByCode);
}
