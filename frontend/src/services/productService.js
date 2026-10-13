import API_URL from "./api";

const getProducts = async () => {
  const response = await fetch(`${API_URL}/products`);

  console.log("Products API status:", response.status);

  if (!response.ok) {
    throw new Error(`Products API error: ${response.status}`);
  }

  const result = await response.json();
  console.log("Products API response:", result);

  return result.data;
};

const getProductById = async (productId) => {
  const response = await fetch(`${API_URL}/products/${productId}`);

  if (!response.ok) {
    throw new Error(`Product API error: ${response.status}`);
  }

  const result = await response.json();

  return result.data;
};

export { getProducts, getProductById };