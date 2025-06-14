import Navbar from "../components/Navbar";
import MapComponent from "../components/MapComponent";
import { useAuth } from "../contexts/AuthContext";
import "../components/Map.css";
import "./Dashboard.css";

export default function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome to RouteMapper</h1>
          <p>From start to finish, your ideal route – mapped and ready</p>
        </div>
        <div className="map-container-wrapper">
          <MapComponent />
        </div>
      </div>
    </div>
  );
}
