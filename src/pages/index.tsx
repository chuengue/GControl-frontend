import { Calculate, Agriculture as FarmIcon, Person, BarChart as StatsIcon, TrendingUp } from '@mui/icons-material';
import { Box, Card, CardContent, Container, Grid, Paper, Skeleton, Typography, useTheme } from '@mui/material';
import { blue, cyan, green, purple, red } from '@mui/material/colors';
import { motion } from 'framer-motion';
import * as React from 'react';
import { useNavigate } from 'react-router';

import { useSession } from '../SessionContext';
import useCharStore from '../stores/charStore';

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const theme = useTheme();
  const {userChars, fetchUserCharsData} = useCharStore()
  const {session} = useSession()
  React.useEffect(() => {
    fetchUserCharsData(session?.user.uid)
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const QuickStatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${color[50]}, ${color[100]})`,
          border: `1px solid ${color[200]}`,
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 8px 24px ${color[100]}40`,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ color: color[700], fontSize: 28, mr: 1 }} />
          <Typography variant="subtitle1" color={color[700]} 
          
          fontWeight="medium">
            {title}
          </Typography>
        </Box>
        {loading ? (
          <Skeleton width={60} height={40} />
        ) : (
          <Typography variant="h4" sx={{ color: color[700], fontWeight: 'bold' }}>
            {value}
          </Typography>
        )}
      </Paper>
    </motion.div>
  );

  const FeatureCard = ({ title, description, icon: Icon, color, onClick, delay }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card
        onClick={onClick}
        sx={{
          height: '100%',
          borderRadius: '16px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${color[50]}, ${color[700]})`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 12px 28px ${color[100]}70`,
            '& .card-content': {
              transform: 'translateY(-5px)',
            },
            '& .icon-wrapper': {
              transform: 'scale(1.1)',
            },
          },
        }}
      >
        <CardContent 
          className="card-content"
          sx={{ 
            textAlign: 'center', 
            p: 4,
            transition: 'transform 0.3s ease',
          }}
        >
          <Box
            className="icon-wrapper"
            sx={{
              mb: 3,
              transition: 'transform 0.3s ease',
              display: 'inline-flex',
              p: 2,
              borderRadius: '50%',
              bgcolor: `${color[50]}80`,
            }}
          >
            <Icon sx={{ fontSize: '3rem', color: color[700] }} />
          </Box>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: color[900],
              mb: 2,
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: color[900],
              opacity: 0.8,
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: { xs: 4, md: 6 } }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography
              variant="h1"
              gutterBottom
              sx={{
                fontWeight: '900',
                color: theme.palette.primary.main,
                fontFamily: 'Anton',
                letterSpacing: '2px',
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)',
                mb: 3,
              }}
            >
              Chase Tracker
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'text.secondary',
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.6,
                mb: 6,
              }}
            >
              Gerencie seus personagens, equipamentos, sessões de farm e analise suas estatísticas de
              drops de forma eficiente.
            </Typography>

            {/* Quick Stats */}
        
          </Box>
        </motion.div>

        {/* Character Management Section */}
        
        {/* Farm & Analysis Section */}
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 4,
              fontWeight: 'bold',
              color: theme.palette.text.primary,
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 60,
                height: 4,
                borderRadius: 2,
                bgcolor: theme.palette.primary.main,
              }
            }}
          >
            Farm e Análise
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                title="Controle de Farm"
                description="Registre e acompanhe suas sessões de farm em tempo real com estatísticas detalhadas."
                icon={FarmIcon}
                color={green}
                onClick={() => navigate("/farm-sessions")}
                delay={0.4}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                title="Visualização de Gráficos"
                description="Analise seu progresso com gráficos interativos e relatórios detalhados."
                icon={TrendingUp}
                color={purple}
                onClick={() => navigate("/farm-tool")}
                delay={0.5}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                title="Análise de Drops"
                description="Acompanhe estatísticas detalhadas dos seus drops e otimize suas estratégias."
                icon={StatsIcon}
                color={cyan}
                onClick={() => navigate("/farm-sessions")}
                delay={0.6}
              />
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ my: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 4,
              fontWeight: 'bold',
              color: theme.palette.text.primary,
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 60,
                height: 4,
                borderRadius: 2,
                bgcolor: theme.palette.primary.main,
              }
            }}
          >
            Gerenciamento de Personagem
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                title="Cadastro de Personagem"
                description="Cadastre e gerencie seus personagens com detalhes completos e estatísticas personalizadas."
                icon={Person}
                color={blue}
                onClick={() => navigate("/chars/add-user-char")}
                delay={0.1}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                title="Gerenciamento de Equipamentos"
                description="Organize e otimize os equipamentos dos seus personagens para máximo desempenho."
                icon={EquipIcon}
                color={orange}
                onClick={() => navigate("/chars/my-chars")}
                delay={0.2}
              />
            </Grid> */}
            <Grid item xs={12} sm={6} md={4}>
              <FeatureCard
                title="Calculadora de Ataque"
                description="Calcule e otimize o poder de ataque dos seus personagens com nossa calculadora avançada."
                icon={Calculate}
                color={red}
                onClick={() => navigate("/chars/my-chars")}
                delay={0.3}
              />
            </Grid>
          </Grid>
        </Box>

      </Box>
    </Container>
  );
}
