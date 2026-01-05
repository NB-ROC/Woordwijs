import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Laden...</p>;
  if (!user) return <Navigate to="/" />;        
  if (!user.claims?.admin) return <Navigate to="/game" />; 

  return children;
};

export default AdminRoute;
