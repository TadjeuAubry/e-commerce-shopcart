const productImages = import.meta.glob(
  "../assets/products/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

const getProductImage = (imageName) => {
  if (!imageName) {
    return null;
  }

  const fileName = imageName.split("/").pop();

  const imagePath = `../assets/products/${fileName}`;

  return productImages[imagePath] || null;
};

export { getProductImage };