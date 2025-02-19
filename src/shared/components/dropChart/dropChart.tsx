import {
  Autocomplete,
  Box,
  FormControl,
  Grid,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { blue, cyan, green, grey } from '@mui/material/colors';
import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const FarmTool = ({ data }) => {
  const [selectedItem, setSelectedItem] = useState('');

 
  if (!data) {
    return <Typography>Carregando dados...</Typography>;
  }

  // Extrai todos os itens únicos disponíveis
  const allItems = [
    ...new Set(
      data?.results?.results?.data.flatMap(mission => mission.dropRates.map(item => item.itemName))
    )
  ];

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

  // Cores baseadas na paleta blue do Material-UI
  const colors = ['#ff4b4b', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3', '#19FF8C'];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        p: 3,
        bgcolor: blue[700],
        borderRadius: '14px'
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ color: grey[100], fontWeight: 'bold' }}>
        Ferramenta de Farm
      </Typography>
      {/* Seleção de Item */}
      <Paper elevation={3} sx={{ p: 2, borderRadius: 3, bgcolor:grey[900] }}>
        <Typography variant="h6" gutterBottom sx={{ color: grey[100], fontWeight: 'medium' }}>
          Selecione um Item para Detalhes
        </Typography>
        <FormControl fullWidth>
          <Autocomplete
            options={allItems}
            value={selectedItem}
            onChange={(event, newValue) => setSelectedItem(newValue)}
            renderInput={(params) => <TextField {...params} label="Selecione um item" variant="outlined" />}
          />
        </FormControl>
      </Paper>
      {selectedItem && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Melhor Missão para Farmar */}
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3,bgcolor:grey[900] }}>
            <Typography variant="h6" gutterBottom sx={{ color: grey[100], fontWeight: 'medium' }}>
              Melhor Missão para Farmar "{selectedItem}"
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: green[300] }}>
                  <strong style={{ color: grey[100] }}>Missão:</strong> {bestMission.mission}
                </Typography>
                <Typography sx={{ color: green[300] }}>
                  <strong style={{ color: grey[100] }}>Drops:</strong> {bestMission.drops}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: green[300] }}>
                  <strong style={{ color: grey[100] }}>Drop Rate:</strong> {bestMission.dropRate}
                </Typography>
                <Typography sx={{ color: green[300] }}>
                  <strong style={{ color: grey[100] }}>Tentativas:</strong> {bestMission.attempts}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Gráfico de Drops por Missão */}
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, bgcolor:grey[900] }}>
            <Typography variant="h6" gutterBottom sx={{ color: grey[100], fontWeight: 'medium' }}>
              Drops de "{selectedItem}" por Missão
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mission" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="drops" fill="#00C49F" name="Drops" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Detalhes do Drop Rate */}
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, bgcolor:grey[900] }}>
            <Typography variant="h6" gutterBottom sx={{ color: grey[100], fontWeight: 'medium' }}>
              Detalhes do Drop Rate por Missão
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {chartData.map((mission, index) => (
                <Typography key={index} sx={{ color: grey[100] }}>
                  <strong>{mission.mission}</strong>: <a style={{ color: green[300] }}>{mission.drops}</a>{' '}
                  drops <a style={{ color: green[300] }}>({mission.dropRate})</a> em{' '}
                  <a style={{ color: green[300] }} >{mission.attempts}</a> tentativas.
                </Typography>
              ))}
            </Box>
          </Paper>
        </Box>
      )}
      {/* Gráfico Geral com Itens Agrupados */}
      <Paper elevation={3} sx={{ p: 2, borderRadius: 3, bgcolor:grey[900] }}>
        <Typography variant="h6" gutterBottom sx={{ color: grey[100], fontWeight: 'medium' }}>
          Visão Geral das Missões e Itens
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={generalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mission" />
            <YAxis />
            <Tooltip />
            <Legend />
            {allItems.map((item, index) => (
              <Bar
                key={item}
                dataKey={item}
                stackId="a"
                fill={colors[index % colors.length]}
                name={item}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <Typography variant="body2" sx={{ mt: 2, color: cyan[200] }}>
          ⓘ Este gráfico mostra a distribuição de drops por item em cada missão.
        </Typography>
      </Paper>
    </Box>
  );
};

export default FarmTool;
