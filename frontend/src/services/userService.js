
import API_URL from "./api";

// Send an authenticated request to the user API.
const userRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("shopcartToken");

  if (!token) {
    throw new Error("Please log in to access your account.");
  }

  const response = await fetch(`${API_URL}/users${endpoint}`, {
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
      result.message || "The account request failed."
    );
  }

  return result;
};

export const getMyProfile = async () =>
  userRequest("/me", {
    method: "GET",
  });

export const updateMyProfile = async (profileData) =>
  userRequest("/me", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
