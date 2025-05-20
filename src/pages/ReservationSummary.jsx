import {
  Box, Button, Card, CardContent, Container, Divider,
  Grid, Typography, useTheme
} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ReservationSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const qrRef = useRef(null);

  const {
    selectedSeats = [],
    room = {},
    totalPrice = 0,
    dateSelected = ""
  } = state || {};

  const movieTitle = room?.movie_name || "Sin título";
  const roomName = room?.name || "Sala no especificada";
  const schedule = room?.hour ? `1970-01-01T${room.hour}` : null;

  const formatTime = (value) => {
    const d = new Date(value);
    if (!value || isNaN(d)) return "Horario no válido";
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (value) => {
    const d = new Date(value);
    if (!value || isNaN(d)) return "Fecha no válida";
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const generateQR = () => {
    return JSON.stringify({
      película: movieTitle,
      sala: roomName,
      fecha: formatDate(dateSelected),
      horario: formatTime(schedule),
      asientos: selectedSeats,
      total: `$${totalPrice.toFixed(2)}`
    }, null, 2);
  };

  const handleDownload = () => {
    const svg = qrRef.current.querySelector("svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const png = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `reserva-${movieTitle.replace(/\s+/g, "_")}.png`;
        link.href = png;
        link.click();
      };

      img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
    }
  };

  useEffect(() => {
    if (!state) navigate("/cine");
  }, [state, navigate]);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" fontWeight="bold" sx={{
          background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ¡Confirmado!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Guarda tu código y preséntalo en taquilla.
        </Typography>
      </Box>

      <Card elevation={4} sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight="bold" mb={3}>
            {movieTitle}
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="subtitle1"><strong>Sala:</strong> {roomName}</Typography>
                <Typography variant="subtitle1"><strong>Fecha:</strong> {formatDate(dateSelected)}</Typography>
                <Typography variant="subtitle1"><strong>Horario:</strong> {formatTime(schedule)}</Typography>
                <Typography variant="subtitle1"><strong>Asientos:</strong></Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {selectedSeats.map((seat, idx) => (
                    <Box key={idx} sx={{
                      px: 2, py: 1,
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                      borderRadius: 1,
                      fontWeight: 500
                    }}>
                      {seat}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box bgcolor="grey.100" p={3} borderRadius={2}>
                <Typography variant="h6" gutterBottom>Resumen de pago</Typography>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Subtotal ({selectedSeats.length}):</Typography>
                  <Typography>${(totalPrice / selectedSeats.length).toFixed(2)} c/u</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h4" fontWeight="bold">${totalPrice.toFixed(2)}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box textAlign="center" mb={4}>
        <Typography variant="h6" mb={2}>Código QR:</Typography>
        <Box ref={qrRef} sx={{
          display: 'inline-block',
          p: 2,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 3
        }}>
          <QRCodeSVG
            value={generateQR()}
            size={200}
            level="H"
            includeMargin={true}
            fgColor={theme.palette.primary.dark}
          />
          <Typography variant="caption" display="block" mt={1}>
            {movieTitle}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="center" gap={2} mt={3}>
          <Button variant="contained" onClick={handleDownload}>Descargar QR</Button>
          <Button variant="outlined" onClick={() => navigate("/cine")}>Volver al inicio</Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ReservationSummary;
