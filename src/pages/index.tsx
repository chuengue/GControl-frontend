import { Calculate as CalcIcon, SportsEsports as EquipIcon, Agriculture as FarmIcon, Person as PersonIcon, BarChart as StatsIcon, TrendingUp } from '@mui/icons-material';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { blue, cyan, green, orange, purple, red } from '@mui/material/colors';
import * as React from 'react';
import { useNavigate } from 'react-router';

// Ícones para as funcionalidades

export default function HomePage() {
  const navigate = useNavigate()
  return (
    <Box sx={{ padding:  {lg:1, xl:4}, minHeight: '100vh', mt:{lg:-4,xl:"0px"} }}>
      {/* Introdução */}
      <Box sx={{ textAlign: 'center', mb: {lg:2, xl:8}}}>
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            fontWeight: '900',
            color: '#1976d2',
            fontFamily: 'Anton',
            letterSpacing: '1px',
            backgroundColor: '#e3f2fd', // Cor de fundo suave
            padding: '15px 30px', // Espaçamento interno (como padding)
            borderRadius: '50px', // Borda arredondada para suavizar
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Sombras suaves para destacar
            display: 'inline-block', // Faz com que o texto e o fundo fiquem juntos
            textAlign: 'center', // Centraliza o texto
            margin: {lg:"5px auto", xl:"20px auto"}, // Margem para separar do restante do conteúdo
          }}
        >
          Chase Tracker
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', fontSize:{xl:"1.25rem", lg:"1.1rem"}}}>
          Gerencie seus personagens, equipamentos, sessões de farm e analise suas estatísticas de
          drops de forma eficiente.
        </Typography>
      </Box>

      {/* Funcionalidades */}
      <Grid container spacing={4} justifyContent="center">
        {/* Cadastro de Personagem */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            onClick={() => navigate("/chars/add-user-char")}
            sx={{
              height: '100%',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
              background: `linear-gradient(145deg, ${blue['50']}, ${blue[700]})`,
              transition: 'transform 0.3s, box-shadow 0.3s',
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
                Cadastre seus personagens existentes no jogo e mantenha um registro detalhado de
                cada um.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Equipamentos */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
              background: `linear-gradient(145deg, ${orange['100']}, ${orange[600]})`,
             
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <EquipIcon sx={{ fontSize: '3rem', color: '#f57c00', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                Gerenciamento de Equipamentos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Equipe seus personagens com os melhores itens e otimize seu desempenho em combate.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Calculadora de Ataque Total */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            onClick={() => navigate("/chars/add-user-char")}
            sx={{
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
              background: `linear-gradient(145deg, ${red[100]}, ${red[800]})`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)'
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <CalcIcon sx={{ fontSize: '3rem', color: '#d32f2f', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                Calculadora de Ataque Total
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Calcule o ataque total dos seus personagens e maximize seu poder de combate.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sessões de Farm */}
        <Grid item xs={12} sm={6} md={4}>
          <Card

            onClick={() => navigate("/farm-sessions")}
            sx={{
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
              background: `linear-gradient(145deg, ${green[100]}, ${green[700]})`,

              transition: 'transform 0.3s, box-shadow 0.3s',
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
                Registre suas sessões de farm, acompanhe os drops e calcule o tempo médio por item.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

          {/* Novo Card - Gráficos */}
          <Grid item xs={12} sm={6} md={4}>
          <Card
          onClick={() => navigate("/farm-tool")}
            sx={{
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
              background: `linear-gradient(145deg, ${purple['100']}, ${purple[700]})`,
              transition: 'transform 0.3s, box-shadow 0.3s',
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
                Analise seus dados através de gráficos interativos para otimizar suas estratégias de farm.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Análise de Drops */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
          onClick={() => navigate("/farm-sessions")}
            sx={{
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
              background: `linear-gradient(145deg, ${cyan['50']}, ${cyan[700]})`,

              transition: 'transform 0.3s, box-shadow 0.3s',
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
                Veja estatísticas detalhadas sobre seus drops e melhore sua eficiência de farm.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
