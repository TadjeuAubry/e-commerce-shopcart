
import API_URL from "./api";

const orderRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("shopcartToken");

  if (!token) {
    throw new Error("Please log in to view your orders.");
  }

  const response = await fetch(`${API_URL}/orders${endpoint}`, {
    ...options,
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Unable to retrieve your orders."
    );
  }

  return result;
};

export const getMyOrders = async () =>
  orderRequest("", {
    method: "GET",
  });

export const getMyOrderById = async (orderId) =>
  orderRequest(`/${encodeURIComponent(orderId)}`, {
    method: "GET",
  });

  
export const createMyOrder = async (shippingAddress) =>
  orderRequest("", {
    method: "POST",
    body: JSON.stringify({ shippingAddress }),
  });
