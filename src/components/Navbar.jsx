import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../components/Navbar.css";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  }

  if (!currentUser) return null;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <h2 style={{ color: "white" }}>🗺️ RouteMapper</h2>
        </div>
        <div className="nav-user">
          <span className="user-email">{currentUser.email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
