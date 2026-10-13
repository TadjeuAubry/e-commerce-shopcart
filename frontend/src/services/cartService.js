
import API_URL from "./api";

// Handle authenticated requests to the cart API.
const cartRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("shopcartToken");

  if (!token) {
    throw new Error("Please log in to use your shopping cart.");
  }

  const response = await fetch(`${API_URL}/cart${endpoint}`, {
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
      result.message || "The cart request could not be completed."
    );
  }

  return result.data;
};

// Retrieve the logged-in customer's cart.
export const getMyCart = async () =>
  cartRequest("", {
    method: "GET",
  });

// Add a product to the customer's cart.
export const addProductToCart = async (productId, quantity = 1) =>
  cartRequest("/items", {
    method: "POST",
    body: JSON.stringify({
      productId,
      quantity,
    }),
  });

// Set the quantity of a product already in the cart.
export const updateCartItemQuantity = async (
  productId,
  quantity
) =>
  cartRequest(`/items/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: JSON.stringify({
      quantity,
    }),
  });

export const removeCartItem = async (productId) =>
  cartRequest(`/items/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });

export const clearMyCart = async () =>
  cartRequest("", {
    method: "DELETE",
  });
