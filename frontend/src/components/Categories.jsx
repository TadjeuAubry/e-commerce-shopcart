import { Link } from "react-router-dom";
import "../style/Categories.css";

const categories = [
  {
    id: 1,
    title: "Smartphones",
    description: "Discover the latest smartphones.",
    image: null,
    link: "/products?category=Smartphones",
  },
  {
    id: 2,
    title: "Headphones",
    description: "Enjoy high-quality sound.",
    image: null,
    link: "/products?category=Headphones",
  },
  {
    id: 3,
    title: "Laptops",
    description: "Powerful laptops for every need.",
    image: null,
    link: "/products?category=Laptops",
  },
  {
    id: 4,
    title: "Accessories",
    description: "Complete your setup with accessories.",
    image: null,
    link: "/products?category=Accessories",
  },
];

const Categories = () => {
  return (
    <section className="categories-section">

      <div className="categories-heading">
        <span className="categories-label">
          SHOP BY CATEGORY
        </span>

        <h2>Explore Our Categories</h2>

        <p>
          Find the products you need from our carefully selected categories.
        </p>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <Link to={category.link} className="category-card" key={category.id}>
            <div className="category-image-placeholder">
              {category.image ? (
                <img  src={category.image} alt={category.title}/>
              ) : (
                <span>{category.title}</span>
              )}
            </div>

            <h3>{category.title}</h3>
            <p>{category.description}</p>
          </Link>
        ))}
      </div>

    </section>
  );
};

export default Categories;