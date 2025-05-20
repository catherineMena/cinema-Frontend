import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  Grid,
  IconButton
} from '@mui/material';
import {
  EventSeat as SeatIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
  LocalMovies as ScreenIcon
} from '@mui/icons-material';

export default function SeatSelector() {
  const { cinemaId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const selectedSchedule = state?.schedule;

  const [room, setRoom] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    console.log('cinemaId:', cinemaId);
    console.log('schedule:', selectedSchedule);

    if (!cinemaId || isNaN(Number(cinemaId))) {
      setError('ID de sala no válido.');
      setLoading(false);
      return;
    }

    const fetchSeats = async () => {
      try {
const token = localStorage.getItem('token');
const res = await api.get(`/rooms/${cinemaId}/seats`, {
  headers: { Authorization: `Bearer ${token}` }
});
        console.log('Respuesta del servidor:', res.data);

        const { data, roomInfo } = res.data;

        if (!Array.isArray(data)) throw new Error('Formato de datos inválido');
        setSeats(data);
        setRoom(roomInfo || {
          name: 'Sala desconocida',
          movie_name: 'Película no especificada',
          price: 0
        });
      } catch (err) {
        console.error('Error al obtener asientos:', err);
        setError('Error al cargar los asientos');
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [cinemaId]);

  const toggleSeat = (seat) => {
    if (seat.status === 'reserved') return;

    setSelectedSeats(prev =>
      prev.some(s => s.id === seat.id)
        ? prev.filter(s => s.id !== seat.id)
        : [...prev, seat]
    );
  };

  const handleReserve = async () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || !selectedSchedule) {
      showSnackbar('Faltan datos para reservar', 'error');
      return;
    }

    if (selectedSeats.length === 0) {
      showSnackbar('Selecciona al menos un asiento', 'warning');
      return;
    }

    try {
      await api.post('/reservations', {
        user_id: user.id,
        schedule_id: selectedSchedule.id,
        seats: selectedSeats.map(s => s.id)
      });

      showSnackbar('Reservación exitosa!', 'success');
      setSelectedSeats([]);

      setSeats(prev =>
        prev.map(seat =>
          selectedSeats.some(s => s.id === seat.id)
            ? { ...seat, status: 'reserved' }
            : seat
        )
      );
    } catch (err) {
      console.error(err);
      showSnackbar('Error al reservar. Intenta nuevamente', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress size={60} />
    </Box>
  );

  if (error) return (
    <Box p={3}>
      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      <Button
        variant="outlined"
        startIcon={<BackIcon />}
        onClick={() => navigate('/home')}
      >
        Volver
      </Button>
    </Box>
  );

  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/home')} sx={{ mr: 2 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Selección de Asientos
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">{room.movie_name}</Typography>
        <Typography variant="subtitle1">Sala: {room.name}</Typography>
        <Typography variant="body2">
          Horario: {selectedSchedule?.time || 'No especificado'} |
          Precio: ${room.price || '0'}
        </Typography>
      </Paper>

      <Box sx={{
        width: '100%',
        height: 20,
        bgcolor: 'grey.800',
        mb: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 1
      }}>
        <ScreenIcon sx={{ color: 'grey.300', fontSize: 16 }} />
        <Typography variant="caption" sx={{ color: 'grey.300', ml: 1 }}>
          PANTALLA
        </Typography>
      </Box>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 4
      }}>
        {Object.entries(seatsByRow).map(([row, rowSeats]) => (
          <Box key={row} sx={{ display: 'flex', mb: 1 }}>
            <Typography sx={{ width: 24, textAlign: 'center', mr: 1 }}>
              {row}
            </Typography>
            {rowSeats.map(seat => (
              <Box
                key={seat.id}
                sx={{
                  width: 36,
                  height: 36,
                  m: 0.5,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: seat.status === 'reserved' ? 'error.main' :
                    selectedSeats.some(s => s.id === seat.id) ? 'success.main' :
                      'primary.main',
                  color: 'white',
                  borderRadius: 1,
                  cursor: seat.status === 'reserved' ? 'default' : 'pointer',
                  '&:hover': {
                    opacity: seat.status === 'reserved' ? 1 : 0.8
                  }
                }}
                onClick={() => toggleSeat(seat)}
              >
                <SeatIcon fontSize="small" />
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resumen
        </Typography>

        {selectedSeats.length > 0 ? (
          <>
            <Typography>
              Asientos seleccionados: {selectedSeats.length}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Total: ${(room?.price || 0) * selectedSeats.length}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={handleReserve}
                fullWidth
              >
                Confirmar ({selectedSeats.length})
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setSelectedSeats([])}
              >
                Limpiar
              </Button>
            </Box>
          </>
        ) : (
          <Typography color="text.secondary">
            Selecciona tus asientos
          </Typography>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
