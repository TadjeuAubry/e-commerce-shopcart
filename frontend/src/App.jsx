import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import { CartProvider } from "./context/CartContext";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminProducts from "./pages/AdminProducts";
import AdminUsers from "./pages/AdminUsers";
import AdminOrders from "./pages/AdminOrders";
import Register from "./pages/Register";
import MyOrders from "./pages/MyOrders";
import CustomerDashboard from "./pages/CustomerDashboard";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Products from "./pages/Products";


const App = () => {
  return (
   <CartProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />}/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<CustomerDashboard />} />
          <Route path="/orders" element={<MyOrders />} />
        </Route> 
        <Route path="/admin" element={ <ProtectedAdminRoute> <AdminDashboard /> </ProtectedAdminRoute> }/>
       <Route path="/admin/products" element={ <ProtectedAdminRoute> <AdminProducts /> </ProtectedAdminRoute>}/>
       <Route path="/admin/users" element={ <ProtectedAdminRoute> <AdminUsers /> </ProtectedAdminRoute> }/>
       <Route path="/admin/orders" element={ <ProtectedAdminRoute> <AdminOrders /> </ProtectedAdminRoute>}/>
      </Routes>
    </BrowserRouter>
     </CartProvider>
  );
};

export default App;