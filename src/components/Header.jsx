import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/"); 
  };

  if (!user) return null; 

  return (
    <header style={{ display: "flex", justifyContent: "space-between", padding: "1rem", background: "#6c6bc4", color: "white" }}>
      <span>Welkom, {user.email}</span>
      <button onClick={handleLogout} style={{ background: "white", color: "#6c6bc4", padding: "0.5rem 1rem", borderRadius: "8px" }}>Uitloggen</button>
    </header>
  );
}
