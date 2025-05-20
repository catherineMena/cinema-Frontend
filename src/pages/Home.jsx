import { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Button, Typography } from '@mui/material';
import api from '../api/axios';
import { Link } from 'react-router-dom';

export default function Home() {
  const [rooms, setRooms] = useState([]);

useEffect(() => {
  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Respuesta del servidor:', res.data);
      setRooms(res.data.data || []);
    } catch (err) {
      console.error('Error al cargar las salas:', err);
    }
  };

  fetchRooms();
}, []);


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
                <Button variant="contained" fullWidth component={Link} to={`/seats/${room.id}`}>
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
