
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  return currentUser ? children : <Login />;
}