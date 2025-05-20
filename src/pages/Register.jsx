// src/pages/Register.jsx
import { useState } from 'react';
import { TextField, Button, Typography, Box, Container, Alert } from '@mui/material';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [user_name, setUserName] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', { email, user_name, pwd });
      navigate('/');
    } catch (err) {
      setError('No se pudo crear la cuenta. Verifica los datos.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8}>
        <Typography variant="h5" gutterBottom>Crear Cuenta</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Correo" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Nombre de usuario" fullWidth margin="normal" value={user_name} onChange={(e) => setUserName(e.target.value)} />
        <TextField label="Contraseña" type="password" fullWidth margin="normal" value={pwd} onChange={(e) => setPwd(e.target.value)} />
        <Button variant="contained" color="primary" fullWidth onClick={handleRegister}>Registrarse</Button>
        <Button onClick={() => navigate('/')} fullWidth sx={{ mt: 1 }}>Volver al login</Button>
      </Box>
    </Container>
  );
}
