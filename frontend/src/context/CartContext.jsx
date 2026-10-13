
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getMyCart,
  addProductToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearMyCart,
} from "../services/cartService";

const CartContext = createContext();

const normalizeCartItems = (cart) => {
  if (!cart || !Array.isArray(cart.items)) {
    return [];
  }

  return cart.items
    .map((item) => {
      // The backend populates productId with the product document.
      const product =
        item.productId &&
        typeof item.productId === "object"
          ? item.productId
          : null;

      // Ignore missing or deleted products safely.
      if (!product || !product._id) {
        return null;
      }

      return {
        ...product,
        _id: String(product._id),
        quantity: Number(item.quantity) || 1,
      };
    })
    .filter(Boolean);
};

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");

  // Prevent older requests from overwriting newer cart data.
  const requestVersion = useRef(0);

  // ==========================================
  // 1. FETCH THE LOGGED-IN CUSTOMER'S CART
  // ==========================================

  const refreshCart = useCallback(async () => {
    const version = ++requestVersion.current;
    const token = localStorage.getItem("shopcartToken");

    // No authenticated customer means no personal cart to show.
    if (!token) {
      setCartItems([]);
      setCartError("");
      setCartLoading(false);
      return [];
    }

    setCartLoading(true);
    setCartError("");

    try {
      const cart = await getMyCart();
      const items = normalizeCartItems(cart);

      if (version === requestVersion.current) {
        setCartItems(items);
      }

      return items;
    } catch (error) {
      if (version === requestVersion.current) {
        setCartItems([]);
        setCartError(
          error.message || "Unable to load your cart."
        );
      }

      return [];
    } finally {
      if (version === requestVersion.current) {
        setCartLoading(false);
      }
    }
  }, []);

  // Load the cart on startup and whenever authentication changes.
  useEffect(() => {
    refreshCart();

    const handleAuthenticationChange = () => {
      // Immediately remove the previous account's cart from memory.
      requestVersion.current += 1;
      setCartItems([]);
      setCartError("");
      refreshCart();
    };

    const handleStorageChange = (event) => {
      if (event.key === "shopcartToken") {
        handleAuthenticationChange();
      }
    };

    window.addEventListener(
      "shopcart-auth-changed",
      handleAuthenticationChange
    );

    window.addEventListener("storage", handleStorageChange);

    return () => {
      requestVersion.current += 1;

      window.removeEventListener(
        "shopcart-auth-changed",
        handleAuthenticationChange
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, [refreshCart]);


const addToCart = async (product, quantity = 1) => {
  const productId = product?._id;
  const requestedQuantity = Number(quantity);

  if (!productId) {
    const message = "The selected product has no valid ID.";
    setCartError(message);
    return { success: false, message };
  }

  if ( !Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
    const message = "Please select a valid product quantity.";
    setCartError(message);
    return { success: false, message };
  }

  // Only authenticated customers can save a cart.
  if (!localStorage.getItem("shopcartToken")) {
    const message = "Please log in before adding products to your cart.";
    setCartError(message);
    return { success: false, message };
  }

  const version = ++requestVersion.current;
  setCartError("");

  try {
    // Send the product ID and selected quantity to the backend.
    const cart = await addProductToCart(
      productId,
      requestedQuantity
    );

    if (version === requestVersion.current) {
      setCartItems(normalizeCartItems(cart));
    }

    return { success: true, message: "" };
  } catch (error) {
    const message =
      error.message || "Unable to add this product to your cart.";

    if (version === requestVersion.current) {
      setCartError(message);
    }

    return { success: false, message };
  }
};
 
  const removeFromCart = async (productId) => {
    const version = ++requestVersion.current;
    setCartError("");

    try {
      const cart = await removeCartItem(productId);

      if (version === requestVersion.current) {
        setCartItems(normalizeCartItems(cart));
      }

      return true;
    } 
    catch (error)
   {
      if (version === requestVersion.current) {
        setCartError(
          error.message || "Unable to remove this product."
        );
      }

      return false;
    }
  };


  const increaseQuantity = async (productId) => {
    const item = cartItems.find(
      (cartItem) => cartItem._id === productId
    );

    if (!item) {
      setCartError("This product is not in your cart.");
      return false;
    }

    const version = ++requestVersion.current;
    setCartError("");

    try {
      const cart = await updateCartItemQuantity(
        productId,
        item.quantity + 1
      );

      if (version === requestVersion.current) {
        setCartItems(normalizeCartItems(cart));
      }

      return true;
    } catch (error) {
      if (version === requestVersion.current) {
        setCartError(
          error.message || "Unable to increase the quantity."
        );
      }

      return false;
    }
  };

  //  DECREASE PRODUCT QUANTITY

  const decreaseQuantity = async (productId) => {
    const item = cartItems.find(
      (cartItem) => cartItem._id === productId
    );

    if (!item) {
      setCartError("This product is not in your cart.");
      return false;
    }

    // Quantity cannot go below one.
    // Decreasing from one removes the product.
    if (item.quantity <= 1) {
      return removeFromCart(productId);
    }

    const version = ++requestVersion.current;
    setCartError("");

    try {
      const cart = await updateCartItemQuantity(
        productId,
        item.quantity - 1
      );

      if (version === requestVersion.current) {
        setCartItems(normalizeCartItems(cart));
      }

      return true;
    } catch (error) {
      if (version === requestVersion.current) {
        setCartError(
          error.message || "Unable to decrease the quantity."
        );
      }

      return false;
    }
  };

  // CLEAR THE CUSTOMER'S CART
  
  const clearCart = async () => {
    if (cartItems.length === 0) {
      setCartItems([]);
      setCartError("");
      return true;
    }

    const version = ++requestVersion.current;
    setCartError("");

    try {
      const cart = await clearMyCart();

      if (version === requestVersion.current) {
        setCartItems(normalizeCartItems(cart));
      }

      return true;
    } catch (error) {
      if (version === requestVersion.current) {
        setCartError(
          error.message || "Unable to clear your cart."
        );
      }

      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartError,
        setCartError,
        refreshCart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => useContext(CartContext);

export { CartProvider, useCart };
