
import API_URL from "./api";

// Send authenticated requests to the ShopCart backend.
const adminRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("shopcartToken");

  if (!token) {
    throw new Error("Please log in to continue.");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
      Authorization: `Bearer ${token}`
    }
  });

  // Parse the backend response.
  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  // Report errors returned by the backend.
  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "The request could not be completed."
    );
  }

  return result;
};


export const getAdminProducts = async () => {
  return adminRequest("/products", {
    method: "GET"
  });
};

export const createAdminProduct = async (productData) => {
  return adminRequest("/products", {
    method: "POST",
    body: JSON.stringify(productData)
  });
};

export const updateAdminProduct = async (productId, productData) => {
  return adminRequest(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(productData)
  });
};

export const deleteAdminProduct = async (productId) => {
  return adminRequest(`/products/${productId}`, {
    method: "DELETE"
  });
};

export const getAdminUsers = async () => {
  return adminRequest("/admin/users", {
    method: "GET"
  });
};

export const createAdminUser = async (userData) => {
  return adminRequest("/admin/users", {
    method: "POST",
    body: JSON.stringify(userData)
  });
};

export const updateAdminUser = async (userId, userData) => {
  return adminRequest(`/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(userData)
  });
};

export const updateAdminUserStatus = async (userId, isActive) => {
  return adminRequest(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive })
  });
};

export const deleteAdminUser = async (userId) => {
  return adminRequest(`/admin/users/${userId}`, {
    method: "DELETE"
  });
};

export const getAdminOrders = async () =>
  adminRequest("/admin/orders", {
    method: "GET",
  });

export const updateAdminOrderStatus = async (orderId, status) =>
  adminRequest(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ orderStatus: status }),
  });
