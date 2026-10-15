
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct, uploadAdminProductImage,} from "../services/adminService";
import "../style/AdminProducts.css";

// Load image assets from src/assets/products.
const productImageModules = import.meta.glob(
  "../assets/products/*",
  {
    eager: true,
    import: "default",
    query: "?url"
  }
);

const resolveProductImage = (imageValue) => {
  if (typeof imageValue !== "string" || !imageValue.trim()) {
    return "";
  }

  const imagePath = imageValue.trim();

  if (/^https?:\/\//i.test(imagePath) || /^data:image\//i.test(imagePath)) {
    return imagePath;
  }

  const cleanPath = imagePath .replace(/\\/g, "/") .split(/[?#]/)[0];

  const fileName = cleanPath.split("/").pop().toLowerCase();

  const match = Object.entries(productImageModules).find(
    ([path]) => path.split("/").pop().toLowerCase() === fileName
  );

  return match ? match[1] : "";
};

const createEmptyProductForm = () => ({
  title: "",
  subtitle: "",
  price: "",
  monthlyPrice: "0",
  category: "",
  stock: "0",
  images: "",
  colors: "",
  isDiscounted: false,
  discountPercent: "0",
  filters: "{}"
});

const AdminProducts = () => {
  const navigate = useNavigate();

  // Product catalogue.
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Create and edit form.
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [formData, setFormData] = useState(createEmptyProductForm);
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load products from the backend.
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await getAdminProducts();

      if (!Array.isArray(result.data)) {
        throw new Error("The server returned an unexpected product list.");
      }

      setProducts(result.data);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load products.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Update the form when an input changes.
  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  };



const handleImageFilesChange = (event) => {
  const files = Array.from(event.target.files || []);

  if (files.length === 0) return;

  const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

  const invalidFile = files.find(
    (file) => !allowedTypes.has(file.type)
  );

  if (invalidFile) {
    setErrorMessage(
      "Only JPG, PNG, and WEBP images are allowed."
    );
    event.target.value = "";
    return;
  }

  const oversizedFile = files.find(
    (file) => file.size > 5 * 1024 * 1024
  );

  if (oversizedFile) {
    setErrorMessage(
      "Each image must be 5 MB or smaller."
    );
    event.target.value = "";
    return;
  }

  // Generate local previews before uploading.
  const previews = files.map((file) => ({
    file,
    url: URL.createObjectURL(file),
  }));

  setErrorMessage("");
  setSelectedImageFiles(files);
  setPreviewImages(previews);

  // Allow the same file to be selected again later.
  event.target.value = "";
};

// Release temporary browser URLs when previews change or unmount.
useEffect(() => {
  return () => {
    previewImages.forEach(({ url }) => {
      URL.revokeObjectURL(url);
    });
  };
}, [previewImages]);

const removeExistingImage = (imageToRemove) => {
  const remainingImages = formData.images
    .split(",")
    .map((image) => image.trim())
    .filter(Boolean)
    .filter((image) => image !== imageToRemove);

  setFormData((previous) => ({
    ...previous,
    images: remainingImages.join(", "),
  }));
};




  // Open a blank form for creating a product.
  const openCreateForm = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setEditingProductId(null);
    setFormData(createEmptyProductForm()); 
    setSelectedImageFiles([]);
    setPreviewImages([]);
    setUploadProgress(0);
    setShowProductForm(true);
  };

  // Open the form with an existing product's information.
  const openEditForm = (product) => {
    setErrorMessage("");
    setSuccessMessage("");
    setEditingProductId(product._id);
    

    const images = Array.isArray(product.images)
      ? product.images
      : product.images
        ? [product.images]
        : [];

    const colors = Array.isArray(product.colors)
      ? product.colors
      : product.colors
        ? [product.colors]
        : [];

    setFormData({
      title: product.title || "",
      subtitle: product.subtitle || "",
      price: String(product.price ?? ""),
      monthlyPrice: String(product.monthlyPrice ?? 0),
      category: product.category || "",
      stock: String(product.stock ?? 0),
      images: images.join(", "),
      colors: colors.join(", "),
      isDiscounted: Boolean(product.isDiscounted),
      discountPercent: String(product.discountPercent ?? 0),
      filters: JSON.stringify(product.filters ?? {}, null, 2)
    });

    setSelectedImageFiles([]);
    setPreviewImages([]);
    setUploadProgress(0);
    setShowProductForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeProductForm = () => {
    setShowProductForm(false);
    setEditingProductId(null);
    setFormData(createEmptyProductForm());
    setSelectedImageFiles([]);
    setPreviewImages([]);
    setUploadProgress(0);
    setErrorMessage("");
  };

 
const handleSubmitProduct = async (event) => {
  event.preventDefault();

  setErrorMessage("");
  setSuccessMessage("");

  const price = Number(formData.price);
  const monthlyPrice = Number(formData.monthlyPrice);
  const stock = Number(formData.stock);
  const discountPercent = Number(formData.discountPercent);

  if (!Number.isFinite(price) || price < 0) {
    setErrorMessage("Price must be a non-negative number.");
    return;
  }

  if (!Number.isFinite(monthlyPrice) || monthlyPrice < 0) {
    setErrorMessage("Monthly price must be a non-negative number.");
    return;
  }

  if (!Number.isInteger(stock) || stock < 0) {
    setErrorMessage("Stock must be a non-negative whole number.");
    return;
  }

  if (
    !Number.isFinite(discountPercent) ||
    discountPercent < 0 ||
    discountPercent > 100
  ) {
    setErrorMessage("Discount must be between 0 and 100.");
    return;
  }

  let parsedFilters;

  try {
    parsedFilters = JSON.parse(formData.filters || "{}");
  } catch {
    setErrorMessage("Filters must contain valid JSON.");
    return;
  }

  if (
    parsedFilters === null ||
    typeof parsedFilters !== "object" ||
    Array.isArray(parsedFilters)
  ) {
    setErrorMessage("Filters must be a JSON object.");
    return;
  }

  const existingImages = formData.images
    .split(",")
    .map((image) => image.trim())
    .filter(Boolean);

  const colors = formData.colors
    .split(",")
    .map((color) => color.trim())
    .filter(Boolean);

  if (
    existingImages.length === 0 &&
    selectedImageFiles.length === 0
  ) {
    setErrorMessage("Please provide at least one product image.");
    return;
  }

  if (colors.length === 0) {
    setErrorMessage("Please provide at least one product color.");
    return;
  }

  const existingProduct = products.find(
    (product) => product._id === editingProductId
  );

  setIsSaving(true);
  setIsUploadingImages(false);
  setUploadProgress(0);

  try {
    const uploadedImages = [];

    // Upload selected images to Cloudinary first.
    if (selectedImageFiles.length > 0) {
      setIsUploadingImages(true);

      for (let index = 0; index < selectedImageFiles.length; index += 1) {
        setUploadProgress(index + 1);

        const result = await uploadAdminProductImage(
          selectedImageFiles[index]
        );

        const imageUrl = result?.data?.url;

        if (!imageUrl) {
          throw new Error(
            "Cloudinary did not return an image URL."
          );
        }

        uploadedImages.push(imageUrl);
      }

      setIsUploadingImages(false);
    }

    // Preserve existing images and append new Cloudinary URLs.
    const productData = {
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      price,
      monthlyPrice,
      category: formData.category.trim(),
      rating: existingProduct?.rating ?? 0,
      reviewsCount: existingProduct?.reviewsCount ?? 0,
      images: [...existingImages, ...uploadedImages],
      colors,
      stock,
      isDiscounted: formData.isDiscounted,
      discountPercent: formData.isDiscounted
        ? discountPercent
        : 0,
      filters: parsedFilters,
    };

    if (editingProductId) {
      await updateAdminProduct(editingProductId, productData);
      setSuccessMessage("Product updated successfully!");
    } else {
      await createAdminProduct(productData);
      setSuccessMessage("Product created successfully!");
    }

    setShowProductForm(false);
    setEditingProductId(null);
    setFormData(createEmptyProductForm());
    setSelectedImageFiles([]);
    setPreviewImages([]);
    setUploadProgress(0);

    await loadProducts();
  } catch (error) {
    setErrorMessage(
      error.message || "Unable to save the product."
    );
  } finally {
    setIsSaving(false);
    setIsUploadingImages(false);
  }
};

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");
    setDeletingProductId(product._id);

    try {
      await deleteAdminProduct(product._id);

      setSuccessMessage(
        `"${product.title}" was deleted successfully.`
      );

      if (editingProductId === product._id) {
        closeProductForm();
      }

      await loadProducts();
    }
      catch (error) {
      setErrorMessage(
        error.message || "Unable to delete the product."
      );
    } finally {
      setDeletingProductId(null);
    }
  };

  // Format prices for display.
  const formatPrice = (price) => {
    const value = Number(price);

    return Number.isFinite(value) ? `$${value.toFixed(2)}` : "—";
  };

  const inStockCount = products.filter(
    (product) => Number(product.stock) > 0
  ).length;

  const outOfStockCount = products.filter(
    (product) => Number(product.stock) <= 0
  ).length;

  return (
    <main className="admin-products-page">
      <header className="admin-products-header">
        <div>
          <p className="admin-products-eyebrow">
            SHOPCART ADMINISTRATION
          </p>

          <h1>Products</h1>

          <p className="admin-products-description">
            Manage your product catalogue, prices, and stock.
          </p>
        </div>

        <div className="admin-products-header-actions">
          <button type="button" className="admin-products-secondary-button" onClick={() => navigate("/admin")}>
            Back to dashboard
          </button>

          <button type="button" className="admin-products-secondary-button" onClick={loadProducts} disabled={isLoading} >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>

          <button type="button" className="admin-products-primary-button" onClick={openCreateForm} disabled={isSaving}>
            + Add product
          </button>
        </div>
      </header>

      {successMessage && (
        <div className="admin-products-success" role="status">
          {successMessage}
        </div>
      )}

      {errorMessage && !showProductForm && (
        <div className="admin-products-error" role="alert">
          {errorMessage}
        </div>
      )}

      {/* Shared create/edit form */}
      {showProductForm && (
        <section className="admin-create-product">
          <div className="admin-create-product-heading">
            <div>
              <p className="admin-products-eyebrow">
                PRODUCT CATALOGUE
              </p>

              <h2>
                {editingProductId ? "Edit product" : "Add a new product"}
              </h2>
            </div>

            <button type="button" className="admin-products-close-button"
              onClick={closeProductForm}
              disabled={isSaving}
              aria-label="Close product form"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmitProduct}>
            <div className="admin-create-product-grid">
              <label>
                Product title *
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </label>

              <label>
                Subtitle / description *
                <input
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleFormChange}
                  required
                />
              </label>

              <label>
                Price *
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleFormChange}
                  required
                />
              </label>

              <label>
                Monthly price *
                <input
                  name="monthlyPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyPrice}
                  onChange={handleFormChange}
                  required
                />
              </label>

              <label>
                Category *
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  required
                />
              </label>

              <label>
                Stock quantity *
                <input
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={handleFormChange}
                  required
                />
              </label>

                 
<div className="admin-form-full-width admin-image-upload-field">
  <label htmlFor="product-image-upload">
    Product images *
  </label>

  <input
    id="product-image-upload"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    multiple
    onChange={handleImageFilesChange}
    disabled={isSaving}
  />

  <span className="admin-form-help">
    Select one or more JPG, PNG, or WEBP images.
    Maximum 5 MB per image. New images upload when you save
    the product.
  </span>

  {/* Existing images from MongoDB */}
  {formData.images
    .split(",")
    .map((image) => image.trim())
    .filter(Boolean).length > 0 && (
    <div className="admin-image-preview-section">
      <h3>Existing product images</h3>

      <div className="admin-image-preview-grid">
        {formData.images
          .split(",")
          .map((image) => image.trim())
          .filter(Boolean)
          .map((image, index) => {
            const imageUrl = resolveProductImage(image);

            return (
              <div
                className="admin-image-preview-card"
                key={`${image}-${index}`}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                  />
                ) : (
                  <div className="admin-image-preview-missing">
                    Preview unavailable
                  </div>
                )}

                <span title={image}>
                  {image.split("/").pop()}
                </span>

                <button
                  type="button"
                  onClick={() => removeExistingImage(image)}
                  disabled={isSaving}
                >
                  Remove
                </button>
              </div>
            );
          })}
      </div>
    </div>
  )}

  {/* Newly selected files */}
  {previewImages.length > 0 && (
    <div className="admin-image-preview-section">
      <h3>New images to upload</h3>

      <div className="admin-image-preview-grid">
        {previewImages.map(({ file, url }, index) => (
          <div
            className="admin-image-preview-card"
            key={`${file.name}-${index}`}
          >
            <img src={url} alt={file.name} />

            <span title={file.name}>
              {file.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )}

  {isUploadingImages && (
    <p className="admin-image-upload-progress" role="status">
      Uploading image {uploadProgress} of{" "}
      {selectedImageFiles.length} to Cloudinary...
    </p>
  )}
</div>
        

              <label className="admin-form-full-width">
                Product colors *
                <input
                  name="colors"
                  value={formData.colors}
                  onChange={handleFormChange}
                  placeholder="#E35D5D, #2C2C2C"
                  required
                />
              </label>

              <label className="admin-discount-checkbox">
                <input
                  type="checkbox"
                  name="isDiscounted"
                  checked={formData.isDiscounted}
                  onChange={handleFormChange}
                />
                <span>Apply a discount</span>
              </label>

              <label>
                Discount percentage
                <input
                  name="discountPercent"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.discountPercent}
                  onChange={handleFormChange}
                  disabled={!formData.isDiscounted}
                />
              </label>

              <label className="admin-form-full-width">
                Filters (JSON object)
                <textarea name="filters"
                 rows="4"
                  value={formData.filters}
                  onChange={handleFormChange}
                  placeholder='{"headphoneType":"Over-Ear"}'
                />
              </label>
            </div>

            {errorMessage && (
              <div className="admin-products-error" role="alert">
                {errorMessage}
              </div>
            )}

            <div className="admin-create-product-actions">
              <button type="button" className="admin-products-secondary-button" onClick={closeProductForm} disabled={isSaving} >
                Cancel
              </button>

              <button type="submit" className="admin-products-primary-button"   disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : editingProductId
                    ? "Save changes"
                    : "Create product"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Product summary */}
      <section className="admin-products-summary">
        <article className="admin-products-summary-card">
          <span className="admin-products-summary-label">
            Total products
          </span>
          <strong>{products.length}</strong>
          <span className="admin-products-summary-note">
            Products in your catalogue
          </span>
        </article>

        <article className="admin-products-summary-card">
          <span className="admin-products-summary-label">
            In stock
          </span>
          <strong>{inStockCount}</strong>
          <span className="admin-products-summary-note">
            Products currently available
          </span>
        </article>

        <article className="admin-products-summary-card">
          <span className="admin-products-summary-label">
            Out of stock
          </span>
          <strong>{outOfStockCount}</strong>
          <span className="admin-products-summary-note">
            Products requiring restocking
          </span>
        </article>
      </section>

      {/* Product catalogue */}
      <section className="admin-products-table-section">
        <div className="admin-products-table-heading">
          <div>
            <h2>Product catalogue</h2>
            <p>Products retrieved from the ShopCart backend.</p>
          </div>

          <span className="admin-products-count">
            {products.length} products
          </span>
        </div>

        {isLoading ? (
          <p className="admin-products-message">
            Loading products from the server...
          </p>
        ) : products.length === 0 ? (
          <div className="admin-products-empty">
            <h3>No products yet</h3>
            <p>Add your first product to start building your catalogue.</p>
            <button type="button" className="admin-products-primary-button" onClick={openCreateForm} >
              + Add your first product
            </button>
          </div>
        ) : (
          <div className="admin-products-table-wrapper">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Monthly price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const hasStock = Number(product.stock) > 0;

                  const firstImage = Array.isArray(product.images)
                    ? product.images[0]
                    : product.images;

                  const imageSrc = resolveProductImage(firstImage);

                  return (
                    <tr key={product._id}>
                      <td>
                        <div className="admin-product-cell">
                          {imageSrc ? (
                            <div className="admin-product-image">
                              <img src={imageSrc} alt={product.title} />
                            </div>
                          ) : (
                            <div className="admin-product-image admin-product-image-placeholder"
                              title={`Image not found: ${firstImage || "No image specified"}`} >
                              No image
                            </div>
                          )}

                          <div className="admin-product-name">
                            <strong>{product.title}</strong>
                            <span>
                              {product.subtitle || "No description"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{product.category || "Uncategorized"}</td>
                      <td>{formatPrice(product.price)}</td>

                      <td>
                        {product.monthlyPrice != null
                          ? formatPrice(product.monthlyPrice)
                          : "—"}
                      </td>

                      <td>{product.stock ?? 0}</td>

                      <td>
                        <span className={`admin-product-status ${
                            hasStock ? "in-stock" : "out-of-stock"
                          }`}
                        >
                          {hasStock ? "In stock" : "Out of stock"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-product-actions">
                          <button type="button" className="admin-product-action-button edit" onClick={() => openEditForm(product)}
                           disabled={ isSaving || deletingProductId === product._id  }>
                            Edit
                          </button>

                          <button type="button" className="admin-product-action-button delete" onClick={() => handleDeleteProduct(product)}
                            disabled={ isSaving || deletingProductId === product._id }>

                            {deletingProductId === product._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminProducts;
