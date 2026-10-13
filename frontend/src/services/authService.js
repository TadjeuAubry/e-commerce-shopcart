import API_URL from "./api";

// this send requests to the backend authentication API
const authRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}/auth${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Authentication request failed"
    );
  }

  return result;
};

export const registerUser = async (userData) => {
  return authRequest("/register", {
    method: "POST",
    body: JSON.stringify(userData)
  });
};

export const loginUser = async (credentials) => {
  return authRequest("/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });
};

export const getCurrentUser = async (token) => {
  return authRequest("/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
