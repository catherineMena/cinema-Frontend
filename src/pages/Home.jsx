import { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Button, Typography } from '@mui/material';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/rooms', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRooms(res.data.data); // asumiendo { success, data }
      } catch (err) {
        console.error('Error al cargar las salas:', err);
      }
    };

    fetchRooms();
  }, []);

  const handleViewSeats = (room) => {
    try {
      const exampleSchedule = {
        id: room.id * 10, // simulación de ID de horario
        time: '19:00'
      };
      // ✅ Guardamos correctamente en localStorage
      localStorage.setItem('selectedSchedule', JSON.stringify(exampleSchedule));
      navigate(`/seats/${room.id}`); // ✅ Redirigimos
    } catch (err) {
      console.error('Error al navegar a la vista de butacas:', err);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom mt={4}>Salas disponibles</Typography>
      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{room.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Película: {room.movie_name}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleViewSeats(room)}
                >
                  Ver Asientos
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
