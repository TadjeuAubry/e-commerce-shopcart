import { Link } from "react-router-dom";
import "../style/Home.css";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";
import heroplace from "../assets/home/heroplace.jpg";
import hero from "../assets/home/hero.jpg";

const Home = () => {
  return (
    <div className="home-page">

      <section className="hero-section">

        <div className="hero-content">
          <span className="hero-label">  SHOPCART</span>
          <h1>Grab Up To 50% Off <br /> On Selected Products</h1>
          <p>
            Discover amazing products, great prices,and a better way to shop.
          </p>

          <Link to="/products" className="hero-button" >Shop Now</Link>
        </div>

        <div className="hero-image-placeholder">
          <span>
          <img src={heroplace} alt="heroplaceholder" />
          </span>
        </div>
          <div className="hero-image-placeholder">
          <span>
            <img src={hero} alt="hero" />
          </span>
        </div>
      </section>
       <Categories/>
       <FeaturedProducts/>
    </div>
  );
};

export default Home;
