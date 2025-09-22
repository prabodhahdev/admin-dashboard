import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";


// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   if (loading) return null; 

//   const isLoggedIn =
//     localStorage.getItem("isLoggedIn") === "true" ||
//     sessionStorage.getItem("isLoggedIn") === "true";

//   if (!user || !isLoggedIn) return <Navigate to="/" />;

//   const role = localStorage.getItem("role") || sessionStorage.getItem("role");
//   if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;

//   return children;
// };

// export default ProtectedRoute;


 const ProtectedRoute = ({ children, requiredPermission }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { currentUser, hasPermission } = useUser();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  const isLoggedIn =
    localStorage.getItem("isLoggedIn") === "true" ||
    sessionStorage.getItem("isLoggedIn") === "true";

  if (!user || !isLoggedIn) return <Navigate to="/" />;

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" />; // redirect if no permission
  }

  return children;
};

export default ProtectedRoute;