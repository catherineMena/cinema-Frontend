// src/pages/SeatSelector.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  Box, Button, Typography, CircularProgress, Container, Grid, Paper, IconButton
} from '@mui/material';

export default function SeatSelector() {
  const { cinemaId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateSelected, setDateSelected] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [availableSeats, setAvailableSeats] = useState(0);
  const [totalSeats, setTotalSeats] = useState(0);

  useEffect(() => {
    api.get(`/rooms/${cinemaId}`)
      .then(res => {
        setRoom(res.data.data); // ✅ corregido
        const total = res.data.data.num_rows * res.data.data.num_columns;
        setTotalSeats(total);
        setAvailableSeats(total);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar la sala:', err);
        setLoading(false);
      });
  }, [cinemaId]);

  useEffect(() => {
    if (dateSelected && room) {
      setLoading(true);
      api.get(`/reservations`, {
        params: { room_id: cinemaId, date: dateSelected }
      }).then(res => {
        const reserved = res.data.map(r => ({
          row: r.seat_row,
          column: r.seat_column,
          id: `${r.seat_row}-${r.seat_column}`
        }));
        setReservedSeats(reserved);
        setAvailableSeats(totalSeats - reserved.length);
      }).catch(() => {
        setReservedSeats([]);
        setAvailableSeats(totalSeats);
      }).finally(() => setLoading(false));
    } else {
      setReservedSeats([]);
      setAvailableSeats(totalSeats);
    }
  }, [dateSelected, room, cinemaId, totalSeats]);

  const toggleSeat = (seatId) => {
    if (reservedSeats.some(s => s.id === seatId)) return;
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const confirmReservation = () => {
    if (!dateSelected) {
      setErrorMessage('Selecciona una fecha válida');
      return;
    }
    if (selectedSeats.length === 0) {
      setErrorMessage('Selecciona al menos un asiento');
      return;
    }

    navigate("/resumen", {
      state: {
        selectedSeats,
        room,
        totalPrice: selectedSeats.length * (room?.price || 0),
        dateSelected
      }
    });
  };

  const handleDateChange = (e) => {
    const selected = e.target.value;
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 8);

    const selectedDate = new Date(selected);
    if (selectedDate >= today && selectedDate <= maxDate) {
      setDateSelected(selected);
      setErrorMessage('');
    } else {
      setDateSelected('');
      setErrorMessage('Selecciona una fecha válida dentro de los próximos 8 días');
    }
  };

  const seatStyles = (isSelected, isReserved) => ({
    width: 36,
    height: 36,
    minWidth: 36,
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1rem',
    backgroundColor: isReserved
      ? '#ffcdd2'
      : isSelected
        ? '#bbdefb'
        : '#c8e6c9',
    color: isReserved
      ? '#d32f2f'
      : isSelected
        ? '#1976d2'
        : '#388e3c',
    border: `2px solid ${isReserved ? '#d32f2f' : isSelected ? '#1976d2' : '#388e3c'}`,
    cursor: isReserved ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease'
  });

  if (loading) return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress size={60} />
    </Container>
  );

  if (!room) return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Typography variant="h5" color="error">Error al cargar la sala.</Typography>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" mb={1}>{room?.movie_name}</Typography>
        <Typography variant="body1">Sala: {room?.name}</Typography>
        <Typography variant="body1">Precio por asiento: ${room?.price || "0.00"}</Typography>

        <Box mt={2}>
          <Typography variant="h6">Selecciona la fecha</Typography>
          <input
            type="date"
            value={dateSelected}
            onChange={handleDateChange}
            min={new Date().toISOString().split("T")[0]}
            max={new Date(new Date().setDate(new Date().getDate() + 8)).toISOString().split("T")[0]}
          />
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>Mapa de Asientos</Typography>
        <Grid container spacing={1} justifyContent="center">
          {Array.from({ length: room?.num_rows || 0 }, (_, rowIndex) => (
            <Grid item xs={12} key={`row-${rowIndex}`}>
              <Grid container spacing={1} justifyContent="center">
                {Array.from({ length: room?.num_columns || 0 }, (_, colIndex) => {
                  const seatId = `${rowIndex + 1}-${colIndex + 1}`;
                  const isSelected = selectedSeats.includes(seatId);
                  const isReserved = reservedSeats.some(s => s.id === seatId);
                  return (
                    <Grid item key={seatId}>
                      <Box onClick={() => toggleSeat(seatId)} sx={seatStyles(isSelected, isReserved)}>
                        {seatId}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Resumen</Typography>
        <Typography>Asientos seleccionados: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Ninguno'}</Typography>
        <Typography>Total: ${((room?.price || 0) * selectedSeats.length).toFixed(2)}</Typography>
        <Button
          fullWidth
          variant="contained"
          onClick={confirmReservation}
          disabled={!dateSelected || selectedSeats.length === 0}
          sx={{ mt: 2 }}
        >
          Confirmar Reserva
        </Button>
      </Paper>
    </Container>
  );
}
