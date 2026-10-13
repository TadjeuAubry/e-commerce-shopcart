// import { Link } from "react-router-dom";
// import "../style/Categories.css";

// const categories = [
//   {
//     id: 1,
//     title: "Smartphones",
//     description: "Discover the latest smartphones.",
//     image: null,
//     link: "/products?category=Smartphones",
//   },
//   {
//     id: 2,
//     title: "Headphones",
//     description: "Enjoy high-quality sound.",
//     image: null,
//     link: "/products?category=Headphones",
//   },
//   {
//     id: 3,
//     title: "Laptops",
//     description: "Powerful laptops for every need.",
//     image: null,
//     link: "/products?category=Laptops",
//   },
//   {
//     id: 4,
//     title: "Accessories",
//     description: "Complete your setup with accessories.",
//     image: null,
//     link: "/products?category=Accessories",
//   },
// ];

// const Categories = () => {
//   return (
//     <section className="categories-section">

//       <div className="categories-heading">
//         <span className="categories-label">
//           SHOP BY CATEGORY
//         </span>

//         <h2>Explore Our Categories</h2>

//         <p>
//           Find the products you need from our carefully selected categories.
//         </p>
//       </div>

//       <div className="categories-grid">
//         {categories.map((category) => (
//           <Link to={category.link} className="category-card" key={category.id}>
//             <div className="category-image-placeholder">
//               {category.image ? (
//                 <img  src={category.image} alt={category.title}/>
//               ) : (
//                 <span>{category.title}</span>
//               )}
//             </div>

//             <h3>{category.title}</h3>
//             <p>{category.description}</p>
//           </Link>
//         ))}
//       </div>

//     </section>
//   );
// };

// export default Categories;



import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import { getProductImage } from "../utils/productImages";
import "../style/Categories.css";

const normalizeCategory = (value = "") =>
  value.trim().toLowerCase().replace(/ies$/, "y").replace(/s$/, "");

const getCategoryLabel = (category) => {
  const labels = {
    headphone: "Headphones",
    laptop: "Laptops",
    smartphone: "Smartphones",
    accessory: "Accessories",
    furniture: "Furniture",
    shoe: "Shoes",
    Console: "Console",
    book: "Books",
  };

  return labels[normalizeCategory(category)] || category;
};

const getCategoryDescription = (category) => {
  const descriptions = {
    headphone: "Enjoy high-quality sound.",
    laptop: "Powerful laptops for every need.",
    smartphone: "Discover the latest smartphones.",
    accessory: "Complete your setup with accessories.",
    furniture: "Explore furniture for your space.",
    shoe: "Find footwear for every occasion.",
    console: "Discover console for everyday use.",
    book: "Explore books and reading essentials.",
  };

  return (
    descriptions[normalizeCategory(category)] ||
    `Explore our ${category.toLowerCase()} collection.`
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const products = await getProducts();
        const categoryMap = new Map();

        (Array.isArray(products) ? products : []).forEach(
          (product) => {
            if (!product.category) return;

            const categoryValue = product.category.trim();
            const key = normalizeCategory(categoryValue);

            if (!key) return;

            //this find the first available image for this product.
            const imageName = Array.isArray(product.images)
              ? product.images.find(Boolean)
              : product.images;

            if (!categoryMap.has(key)) {
              categoryMap.set(key, {
                id: key,
                title: getCategoryLabel(categoryValue),
                categoryValue,
                image: imageName || null,
                count: 0,
              });
            }

            const category = categoryMap.get(key);
            category.count += 1;

            // If the first product has no image, use another
            // product from the same category that has one.
            if (!category.image && imageName) {
              category.image = imageName;
            }
          }
        );

        const categoryList = Array.from(
          categoryMap.values()
        ).sort((a, b) => a.title.localeCompare(b.title));

        if (isMounted) {
          setCategories(categoryList);
        }
      } 
       catch (err) {
        if (isMounted) {
          setError(
            err.message || "Unable to load product categories."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="categories-section">

      <div className="categories-heading">
        <span className="categories-label">
          SHOP BY CATEGORY
        </span>

        <h2>Explore Our Categories</h2>

        <p>
          Find the products you need from our carefully
          selected categories.
        </p>
      </div>

      {loading && (
        <p className="categories-message">
          Loading categories...
        </p>
      )}

      {!loading && error && (
        <div className="categories-message" role="alert">
          <p>{error}</p>
          <Link to="/products">Browse All Products</Link>
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="categories-message">
          <p>No product categories are available yet.</p>
          <Link to="/products">Browse All Products</Link>
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="categories-grid">
          {categories.map((category) => {
            const imageUrl = category.image
              ? getProductImage(category.image)
              : null;

            return (
              <Link to={`/products?category=${encodeURIComponent(
                  category.categoryValue
                )}`}
                className="category-card"
                key={category.id}
              >
                <div className="category-image-placeholder">
                  {imageUrl ? (
                    <img src={imageUrl}  alt={`${category.title} category`}  loading="lazy"/>
                  ) : (
                    <span>{category.title}</span>
                  )}
                </div>

                <h3>{category.title}</h3>

                <p>
                  {getCategoryDescription(category.categoryValue)}
                </p>

                <span className="category-product-count">
                  {category.count}{" "}
                  {category.count === 1 ? "product" : "products"}
                </span>
              </Link>
            );
          })}
        </div>
      )}

    </section>
  );
};

export default Categories;
