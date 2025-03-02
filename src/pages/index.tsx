import { Calculate as CalcIcon, SportsEsports as EquipIcon, Agriculture as FarmIcon, Person as PersonIcon, BarChart as StatsIcon, TrendingUp, Dashboard } from '@mui/icons-material';
import { Box, Card, CardContent, Grid, Typography, Divider, Skeleton, Paper } from '@mui/material';
import { blue, cyan, green, orange, purple, red } from '@mui/material/colors';
import * as React from 'react';
import { useNavigate } from 'react-router';

// Ícones para as funcionalidades

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const QuickStatCard = ({ title, value, color }) => (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 2,
        background: `linear-gradient(145deg, ${color[50]}, ${color[100]})`,
        border: `1px solid ${color[200]}`,
      }}
    >
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
      {loading ? (
        <Skeleton width={60} height={40} />
      ) : (
        <Typography variant="h4" sx={{ color: color[700], fontWeight: 'bold' }}>
          {value}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box>
      <Box >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { lg: 3, xl: 4 } }}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: '900',
              color: '#1976d2',
              fontFamily: 'Anton',
              letterSpacing: '1px',
              backgroundColor: '#e3f2fd',
              padding: '15px 30px',
              borderRadius: '50px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              display: 'inline-block',
            }}
          >
            Chase Tracker
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontSize: { xl: "1.25rem", lg: "1.1rem" }, maxWidth: '800px', mx: 'auto' }}>
            Gerencie seus personagens, equipamentos, sessões de farm e analise suas estatísticas de
            drops de forma eficiente.
          </Typography>
        </Box>

     
        {/* Category Headers */}
        <Typography variant="h5" sx={{ mb: 2, color: 'text.primary', fontWeight: 'bold' }}>
          Gerenciamento de Personagem
        </Typography>

        {/* Character Management Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate("/chars/add-user-char")}
              sx={{
                height: '100%',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                background: `linear-gradient(145deg, ${blue['50']}, ${blue[700]})`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <PersonIcon sx={{ fontSize: '3rem', color: '#1976d2', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  Cadastro de Personagem
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cadastre e gerencie seus personagens com detalhes completos.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                background: `linear-gradient(145deg, ${orange['100']}, ${orange[600]})`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <EquipIcon sx={{ fontSize: '3rem', color: '#f57c00', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                  Gerenciamento de Equipamentos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Organize e otimize os equipamentos dos seus personagens.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate("/chars/add-user-char")}
              sx={{
                height: '100%',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                background: `linear-gradient(145deg, ${red[100]}, ${red[800]})`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <CalcIcon sx={{ fontSize: '3rem', color: '#d32f2f', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                  Calculadora de Ataque
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Calcule e otimize o poder de ataque dos seus personagens.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Farm & Analysis Section Header */}
        <Typography variant="h5" sx={{ mb: 2, mt: 4, color: 'text.primary', fontWeight: 'bold' }}>
          Farm e Análise
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate("/farm-sessions")}
              sx={{
                height: '100%',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                background: `linear-gradient(145deg, ${green[100]}, ${green[700]})`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <FarmIcon sx={{ fontSize: '3rem', color: '#388e3c', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                  Controle de Farm
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registre e acompanhe suas sessões de farm em tempo real.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate("/farm-tool")}
              sx={{
                height: '100%',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                background: `linear-gradient(145deg, ${purple['100']}, ${purple[700]})`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <TrendingUp sx={{ fontSize: '3rem', color: '#6a1b9a', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#6a1b9a' }}>
                  Visualização de Gráficos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analise seus dados com gráficos interativos e detalhados.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate("/farm-sessions")}
              sx={{
                height: '100%',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                background: `linear-gradient(145deg, ${cyan['50']}, ${cyan[700]})`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <StatsIcon sx={{ fontSize: '3rem', color: '#1976d2', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  Análise de Drops
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Acompanhe estatísticas detalhadas dos seus drops.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
