import { Autocomplete, Box, FormControl, Grid, Paper, TextField, Typography, useTheme, Fade, Chip, IconButton, Tooltip as MuiTooltip, useMediaQuery } from '@mui/material';
import { cyan, green, grey } from '@mui/material/colors';
import React, { useState, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import StarIcon from '@mui/icons-material/Star';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { alpha } from '@mui/material/styles';

interface DropData {
  itemName: string;
  totalDropped: number;
}

interface MissionData {
  groupName: string;
  totalAttempts: number;
  dropRates: DropData[];
}

interface FarmToolProps {
  data: {
    results: {
      results: {
        data: MissionData[];
      };
    };
  };
}

const FarmTool: React.FC<FarmToolProps> = ({ data }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedItem, setSelectedItem] = useState<string>('');

  if (!data) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2,
        bgcolor: alpha(theme.palette.background.default, 0.9)
      }}>
        <BarChartIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
        <Typography variant="h5" sx={{ color: grey[100] }}>Carregando dados...</Typography>
      </Box>
    );
  }

  // Extrai todos os itens únicos disponíveis
  const allItems = useMemo(() => [
    ...new Set(
      data?.results?.results?.data.flatMap(mission => mission.dropRates.map(item => item.itemName)))
  ], [data]);

  // Transforma os dados para o gráfico agrupado
  const generalData = data?.results?.results?.data.map(mission => ({
    mission: mission.groupName,
    ...mission.dropRates.reduce((acc, item) => {
      acc[item.itemName] = item.totalDropped;
      return acc;
    }, {})
  }));

  // Filtra os dados para o item selecionado
  const filteredData = data?.results?.results?.data
    .map(mission => ({
      ...mission,
      dropRates: mission.dropRates.filter(item => item.itemName === selectedItem)
    }))
    .filter(mission => mission.dropRates.length > 0); // Remove missões sem o item selecionado

  // Calcula o drop rate por missão para o item selecionado
  const chartData = filteredData.map(mission => ({
    mission: mission.groupName,
    drops: mission.dropRates[0].totalDropped,
    dropRate: ((mission.dropRates[0].totalDropped / mission.totalAttempts) * 100).toFixed(2) + '%',
    attempts: mission.totalAttempts
  }));

  // Encontra a missão com mais drops do item selecionado
  const bestMission = chartData.reduce(
    (best, current) => (current.drops > best.drops ? current : best),
    { drops: 0 }
  );

  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    cyan[400],
    green[400],
    '#FF8042',
    '#AF19FF',
    '#FF19A3',
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        p: { xs: 2, md: 4 },
        bgcolor: alpha(theme.palette.background.paper, 0.1),
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        minHeight: '100vh',
        '&:hover': {
          bgcolor: alpha(theme.palette.background.paper, 0.15),
        }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            color: grey[100], 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}
        >
          <TrendingUpIcon sx={{ fontSize: { xs: 28, md: 36 }, color: theme.palette.primary.main }} />
          Ferramenta de Farm
        </Typography>
        <Chip 
          icon={<AssessmentIcon />}
          label={`${allItems.length} Itens Disponíveis`}
          color="primary"
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.2),
            fontSize: '0.9rem',
            height: 32
          }}
        />
      </Box>

      <Paper 
        elevation={6} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          borderRadius: 4, 
          bgcolor: alpha(grey[900], 0.7),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            color: grey[100], 
            fontWeight: 'medium', 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <StarIcon sx={{ color: theme.palette.primary.main }} />
          Selecione um Item para Análise Detalhada
        </Typography>
        <FormControl fullWidth>
          <Autocomplete<string>
            options={allItems}
            value={selectedItem}
            onChange={(event, newValue) => setSelectedItem(newValue || '')}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Buscar item" 
                variant="outlined"
                placeholder="Digite para buscar um item..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box 
                component="li" 
                {...props} 
                sx={{ 
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.1) 
                  }
                }}
              >
                {option}
              </Box>
            )}
          />
        </FormControl>
      </Paper>

      <Fade in={!!selectedItem} timeout={500}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={6} 
              sx={{ 
                p: { xs: 2, md: 3 }, 
                borderRadius: 4, 
                bgcolor: alpha(grey[900], 0.7),
                height: '100%',
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 0 20px ${alpha(theme.palette.success.main, 0.2)}`
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: grey[100], fontWeight: 'medium' }}>
                  Melhor Local para Farm
                </Typography>
                <Chip 
                  label={selectedItem} 
                  color="primary" 
                  size="small"
                  icon={<StarIcon />}
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.2) }}
                />
              </Box>
              <Grid container spacing={2}>
                {[
                  { label: 'Missão', value: bestMission.mission, icon: '🎯' },
                  { label: 'Drops Totais', value: bestMission.drops, icon: '📦' },
                  { label: 'Taxa de Drop', value: bestMission.dropRate, icon: '📊' },
                  { label: 'Tentativas', value: bestMission.attempts, icon: '🔄' }
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.background.paper, 0.1),
                        height: '100%'
                      }}
                    >
                      <Typography variant="body2" sx={{ color: grey[400], mb: 1 }}>
                        {item.icon} {item.label}
                      </Typography>
                      <Typography variant="h6" sx={{ color: green[300], fontWeight: 'bold' }}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper 
              elevation={6} 
              sx={{ 
                p: { xs: 2, md: 3 }, 
                borderRadius: 4, 
                bgcolor: alpha(grey[900], 0.7),
                height: '100%',
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 0 20px ${alpha(theme.palette.info.main, 0.2)}`
                }
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: grey[100], 
                  fontWeight: 'medium',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3
                }}
              >
                <BarChartIcon sx={{ color: theme.palette.info.main }} />
                Distribuição de Drops por Missão
              </Typography>
              <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis 
                    dataKey="mission" 
                    stroke={grey[400]}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke={grey[400]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: alpha(grey[900], 0.95),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      borderRadius: '8px',
                      padding: '10px'
                    }}
                    cursor={{ fill: alpha(theme.palette.primary.main, 0.1) }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="drops" 
                    fill={theme.palette.info.main}
                    name="Quantidade de Drops"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper 
              elevation={6} 
              sx={{ 
                p: { xs: 2, md: 3 }, 
                borderRadius: 4, 
                bgcolor: alpha(grey[900], 0.7),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: grey[100], 
                    fontWeight: 'medium',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <AssessmentIcon sx={{ color: theme.palette.warning.main }} />
                  Análise Detalhada de Drop Rates
                </Typography>
                <MuiTooltip title="Estatísticas detalhadas de drops por missão">
                  <IconButton size="small" sx={{ color: grey[400] }}>
                    <InfoIcon />
                  </IconButton>
                </MuiTooltip>
              </Box>
              <Grid container spacing={2}>
                {chartData.map((mission, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: alpha(theme.palette.background.paper, 0.1),
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.background.paper, 0.15),
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <Typography sx={{ color: grey[100], mb: 2, fontWeight: 'bold' }}>
                        {mission.mission}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip 
                          icon={<StarIcon />}
                          label={`${mission.drops} drops`}
                          size="small"
                          sx={{ bgcolor: alpha(theme.palette.success.main, 0.2), justifyContent: 'flex-start' }}
                        />
                        <Chip 
                          icon={<BarChartIcon />}
                          label={`Taxa: ${mission.dropRate}`}
                          size="small"
                          sx={{ bgcolor: alpha(theme.palette.info.main, 0.2), justifyContent: 'flex-start' }}
                        />
                        <Chip 
                          icon={<AssessmentIcon />}
                          label={`${mission.attempts} tentativas`}
                          size="small"
                          sx={{ bgcolor: alpha(theme.palette.warning.main, 0.2), justifyContent: 'flex-start' }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Fade>

      <Paper 
        elevation={6} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          borderRadius: 4, 
          bgcolor: alpha(grey[900], 0.7),
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: grey[100], 
              fontWeight: 'medium',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <BarChartIcon sx={{ color: theme.palette.secondary.main }} />
            Visão Geral de Todos os Drops
          </Typography>
          <MuiTooltip title="Distribuição total de drops por missão e item">
            <IconButton size="small" sx={{ color: grey[400] }}>
              <InfoIcon />
            </IconButton>
          </MuiTooltip>
        </Box>
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
          <BarChart data={generalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis 
              dataKey="mission" 
              stroke={grey[400]}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke={grey[400]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: alpha(grey[900], 0.95),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: '8px',
                padding: '10px'
              }}
              cursor={{ fill: alpha(theme.palette.primary.main, 0.1) }}
            />
            <Legend />
            {allItems.map((item, index) => (
              <Bar
                key={item}
                dataKey={item}
                stackId="a"
                fill={colors[index % colors.length]}
                name={item}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.1),
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <InfoIcon fontSize="small" sx={{ color: cyan[200] }} />
          <Typography variant="body2" sx={{ color: cyan[200] }}>
            Este gráfico apresenta uma visão completa da distribuição de todos os itens por missão,
            permitindo comparar a eficiência de farm entre diferentes locais e itens.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default FarmTool;