import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SeatsSelector from './pages/SeatSelector';
import Home from './pages/Home';
import Login from './pages/Login';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/seats/:roomId" element={<ProtectedRoute><SeatsSelector /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
