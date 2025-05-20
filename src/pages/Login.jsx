import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Se envió el login'); // ✅ Verifica que entra aquí

    try {
      const res = await api.post('/auth/login', { email, pwd });
      console.log('Respuesta del servidor:', res.data); // ✅ Verifica que responde

      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate(user.role === 'admin' ? '/admin/users' : '/home');
    } catch (err) {
      console.error('Error al iniciar sesión:', err.response?.data || err.message || err);
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box component="form" onSubmit={handleSubmit} mt={8} noValidate>
        <Typography variant="h5" gutterBottom>Iniciar Sesión</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          label="Correo"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <TextField
          label="Contraseña"
          type="password"
          fullWidth
          margin="normal"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          Ingresar
        </Button>
      </Box>
    </Container>
  );
}
