import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    console.log('Sin token, redirigiendo al login');
    return <Navigate to="/login" replace />;
  }

  return children;
}
