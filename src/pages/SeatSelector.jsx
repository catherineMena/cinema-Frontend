import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Button, Snackbar, Alert } from '@mui/material';
import { Chair } from '@mui/icons-material';
import api from '../api/axios';

export default function SeatsSelector() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estilos para los asientos
  const seatStyles = (status, selected) => ({
    width: 40,
    height: 40,
    margin: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: status === 'reserved' ? '#f44336' : selected ? '#4caf50' : '#1976d2',
    color: 'white',
    borderRadius: '4px',
    cursor: status === 'reserved' ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: status !== 'reserved' ? 'scale(1.1)' : 'none'
    }
  });

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/rooms/${roomId}/seats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSeats(res.data);
      } catch (err) {
        setError('Error al cargar los asientos');
      }
    };
    fetchSeats();
  }, [roomId]);

  const handleSeatClick = (seat) => {
    if (seat.status === 'reserved') return;

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.row === seat.row && s.column === seat.column);
      if (isSelected) {
        return prev.filter(s => !(s.row === seat.row && s.column === seat.column));
      } else {
        return [...prev, { row: seat.row, column: seat.column }];
      }
    });
  };

  const handleReservation = async () => {
    if (selectedSeats.length === 0) {
      setError('Selecciona al menos un asiento');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.put(`/rooms/${roomId}/seats/${selectedSeats[0].row}-${selectedSeats[0].column}/reserve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(`Reserva exitosa para ${selectedSeats.length} asiento(s)`);
      setSelectedSeats([]);
      // Recargar los asientos
      const res = await api.get(`/rooms/${roomId}/seats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSeats(res.data);
    } catch (err) {
      setError('Error al realizar la reserva');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Selección de Asientos
      </Typography>

      {/* Mostrar los asientos */}
      <Grid container spacing={1} justifyContent="center">
        {seats.map(seat => (
          <Grid item key={seat.id}>
            <Box
              sx={seatStyles(seat.status, selectedSeats.some(s => s.row === seat.row && s.column === seat.column))}
              onClick={() => handleSeatClick(seat)}
            >
              <Chair fontSize="small" />
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Botón de reserva */}
      {selectedSeats.length > 0 && (
        <Button variant="contained" color="primary" onClick={handleReservation}>
          Confirmar Reserva
        </Button>
      )}

      {/* Notificaciones */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
    </Box>
  );
}
