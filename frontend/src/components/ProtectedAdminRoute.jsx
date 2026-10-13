
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";

const ProtectedAdminRoute = ({ children }) => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      const token = localStorage.getItem("shopcartToken");

      if (!token) {
        setStatus("unauthenticated");
        return;
      }

      try {
        const result = await getCurrentUser(token);

        if (!isMounted) return;

        if (result.data?.role === "admin") {
          setStatus("authorized");
        }
         else {
          setStatus("forbidden");
        }
      } catch (error) {
        if (!isMounted) return;

        if (
          error instanceof TypeError &&
          error.message.toLowerCase().includes("fetch")
        ) 
        {
          setStatus("error");
          return;
        }

        localStorage.removeItem("shopcartToken");
        localStorage.removeItem("shopcartUser");
        setStatus("unauthenticated");
      }
    };

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "checking") {
    return <p>Verifying administrator access...</p>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (status === "forbidden") {
    return <Navigate to="/" replace />;
  }

  if (status === "error") {
    return (
      <main>
        <h2>Unable to verify administrator access</h2>
        <p>Please check that the ShopCart backend is running.</p>
      </main>
    );
  }

  return children;
};

export default ProtectedAdminRoute;
