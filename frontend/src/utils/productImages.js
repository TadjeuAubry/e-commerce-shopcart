const productImages = import.meta.glob( "../assets/products/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

const getProductImage = (imageValue) => {

  if (!imageValue || typeof imageValue !== "string") {
    return null;
  }

  const imageName = imageValue.trim();

  if (!imageName) {
    return null;
  }

  if (/^https?:\/\//i.test(imageName)) {
    return imageName;
  }

  if (/^data:image\//i.test(imageName)) {
    return imageName;
  }

  const fileName = imageName.split("/").pop();

  const imagePath = `../assets/products/${fileName}`;

  return productImages[imagePath] || null;
};

export { getProductImage };
