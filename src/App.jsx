import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SeatsSelector from './pages/SeatSelector';
import Home from './pages/Home';
import Login from './pages/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import ReservationSummary from './pages/ReservationSummary'; // ✅ IMPORTACIÓN CORRECTA


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública para login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/seats/:cinemaId" element={<ProtectedRoute><SeatsSelector /></ProtectedRoute>} />
      <Route path="/resumen" element={<ReservationSummary />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
