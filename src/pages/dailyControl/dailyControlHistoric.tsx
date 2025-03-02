import { Autocomplete, Box, Button, Container, FormControl, Grid, InputLabel, MenuItem, Pagination, Paper, Select, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useTheme, Chip, Divider, IconButton, Tooltip } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React, { useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { getUserMissionsLogsHistoric } from '../../service/requests/limitedMissions/limitedMissions';
import { useSession } from '../../SessionContext';

const MissionHistoricPage: React.FC = () => {
  const theme = useTheme();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [missionsData, setMissionsData] = useState<any[]>([]); // Dados para a tabela
  const [summaryData, setSummaryData] = useState<any[]>([]); // Dados para o resumo
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryOptions, setSummaryOptions] = useState({
    characters: [],
    missions: []
  });
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession();

  // Estados para paginação
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Estados para filtros
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [selectedMission, setSelectedMission] = useState<string>('');

  // Estados para o resumo
  const [selectedSummaryCharacter, setSelectedSummaryCharacter] = useState<string | null>(null);
  const [selectedSummaryMission, setSelectedSummaryMission] = useState<string | null>(null);

  // Listas de personagens e missões para os filtros
  const characters = Array.from(new Set(missionsData.map(character => character.name)));

  const missions = Array.from(
    new Set(
      missionsData.flatMap(character =>
        character.missionsCompleted.map((mission: any) => mission.name)
      )
    )
  );

  // Função para buscar os dados da tabela
  const handleFetchData = async () => {
    if (!session) return;
    if (startDate && endDate) {
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatEndDate(endDate);
      setLoading(true);
      setError(null);

      try {
        const data = await getUserMissionsLogsHistoric(
          session?.user.uid,
          formattedStartDate,
          formattedEndDate,
          page,
          limit,
          selectedCharacter,
          selectedMission
        );
        setMissionsData(data.results.results);
        setTotal(data.results.pagination.total);
      } catch (err) {
        setError('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Selecione um intervalo de datas.');
    }
  };

  // Função para buscar os dados do resumo
  const handleFetchSummary = async () => {
    if (!session) return;
    setSummaryLoading(true);
    try {
      const data = await getUserMissionsLogsHistoric(
        session.user.uid,
        null, // Sem data de início
        null, // Sem data de fim
        1, // Página 1
        9999, // Limite alto para retornar tudo
        '', // Sem filtro de personagem
        '' // Sem filtro de missão
      );
      const charactersSummary = Array.from(
        new Set(data.results.results.map(character => character.name))
      );

      const missionsSummary = Array.from(
        new Set(
          data.results.results.flatMap(character =>
            character.missionsCompleted.map((mission: any) => mission.name)
          )
        )
      );
      setSummaryData(data.results.results);
      setSummaryOptions({
        characters: charactersSummary,
        missions: missionsSummary
      });
    } catch (err) {
      console.error('Erro ao carregar resumo:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Função para calcular o resumo de missões por personagem (detalhado por missão)
  const getCharacterSummary = (characterName: string) => {
    const character = summaryData.find(char => char.name === characterName);
    if (!character) return {};

    const missionCounts: { [key: string]: number } = {};
    character.missionsCompleted.forEach((mission: any) => {
      missionCounts[mission.name] = (missionCounts[mission.name] || 0) + 1;
    });

    return missionCounts;
  };

  // Função para calcular o resumo de personagens por missão
  const getMissionSummary = (missionName: string) => {
    const missionCounts: { [key: string]: number } = {};
    summaryData.forEach(character => {
      character.missionsCompleted.forEach((mission: any) => {
        if (mission.name === missionName) {
          missionCounts[character.name] = (missionCounts[character.name] || 0) + 1;
        }
      });
    });
    return missionCounts;
  };

  const handleStartDateChange = (newDate: Date | null) => {
    setStartDate(newDate);
    setPage(1);
  };

  const handleEndDateChange = (newDate: Date | null) => {
    setEndDate(newDate);
    setPage(1);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const formattedDate = new Date(date);
    formattedDate.setHours(-3, 0, 0, 0);
    return formattedDate.toISOString();
  };

  const formatEndDate = (date: Date | null) => {
    if (!date) return '';
    const formattedDate = new Date(date);
    formattedDate.setHours(20, 59, 59);
    return formattedDate.toISOString();
  };

  // Função para mudar a página
  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  // Função para mudar o limite de itens por página
  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(Number(event.target.value));
    setPage(1); // Resetar para a primeira página ao mudar o limite
  };

  useEffect(() => {
    if (startDate && endDate) {
      handleFetchData();
    }
  }, [startDate, endDate, page, limit, selectedCharacter, selectedMission]);

  useEffect(() => {
    handleFetchSummary(); // Buscar dados do resumo ao carregar a página
  }, []);

  return (
    <Container 
      sx={{ 
        py: 4, 
        borderRadius: "16px",
        bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'background.default'
      }}
    >
      {/* Header Section */}
      <Box 
        sx={{ 
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <HistoryIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              Histórico de Missões
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Visualize e analise o histórico completo de missões completadas
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Atualizar dados">
            <IconButton 
              onClick={handleFetchData}
              disabled={loading}
              sx={{ bgcolor: 'background.paper' }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Data Inicial"
                    value={startDate}
                    onChange={handleStartDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        InputProps: {
                          startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Data Final"
                    value={endDate}
                    onChange={handleEndDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        InputProps: {
                          startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              onClick={handleFetchData}
              disabled={loading}
              startIcon={<SearchIcon />}
              sx={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: 'none'
              }}
            >
              {loading ? 'Buscando...' : 'Buscar Histórico'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: 2, 
            bgcolor: 'error.light',
            color: 'error.dark',
            border: '1px solid',
            borderColor: 'error.main'
          }}
        >
          <Typography sx={{ fontWeight: '500', textAlign: 'center' }}>
            {error}
          </Typography>
        </Paper>
      )}

      {loading ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            border: '1px solid',
            borderColor: theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'
          }}
        >
          <Grid container spacing={2}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      ) : missionsData.length > 0 ? (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 2, 
                overflow: 'hidden',
                border: '1px solid',
                borderColor: theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'
              }}
            >
              {/* Filters Section */}
              <Box 
                sx={{ 
                  p: 2, 
                  borderBottom: '1px solid', 
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <FilterListIcon sx={{ color: 'text.secondary' }} />
                  <Typography variant="subtitle2">Filtros</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Filtrar por Personagem</InputLabel>
                      <Select
                        value={selectedCharacter}
                        onChange={e => setSelectedCharacter(e.target.value as string)}
                        label="Filtrar por Personagem"
                      >
                        <MenuItem value="">Todos os Personagens</MenuItem>
                        {characters.map(character => (
                          <MenuItem key={character} value={character}>
                            {character}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Filtrar por Missão</InputLabel>
                      <Select
                        value={selectedMission}
                        onChange={e => setSelectedMission(e.target.value as string)}
                        label="Filtrar por Missão"
                      >
                        <MenuItem value="">Todas as Missões</MenuItem>
                        {missions.map(mission => (
                          <MenuItem key={mission} value={mission}>
                            {mission}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {/* Table Section */}
              <TableContainer sx={{ maxHeight: 'calc(100vh - 450px)' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          fontWeight: 'bold',
                          bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
                        }}
                      >
                        Personagem
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 'bold',
                          bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
                        }}
                      >
                        Missão
                      </TableCell>
                      <TableCell 
                        sx={{ 
                          fontWeight: 'bold',
                          bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
                        }}
                      >
                        Data de Conclusão
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {missionsData.map(character =>
                      character.missionsCompleted.map((mission: any, index) => (
                        <TableRow 
                          key={`${character.id}-${mission.missionId}-${index}`}
                          hover
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: theme.palette.mode === 'light' 
                                ? 'grey.50' 
                                : 'grey.900'
                            }
                          }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              {character.thumbImgUrl ? (
                                <Box
                                  component="img"
                                  src={character.thumbImgUrl}
                                  alt={character.name}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1,
                                    objectFit: 'cover',
                                    boxShadow: 1
                                  }}
                                />
                              ) : (
                                <Skeleton variant="circular" width={40} height={40} />
                              )}
                              <Typography>{character.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              {mission.imgUrl ? (
                                <Box
                                  component="img"
                                  src={mission.imgUrl}
                                  alt={mission.name}
                                  sx={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 1,
                                    objectFit: 'cover',
                                    boxShadow: 1
                                  }}
                                />
                              ) : (
                                <Skeleton variant="circular" width={30} height={30} />
                              )}
                              <Typography>{mission.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={new Date(mission.dateCompleted).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              size="small"
                              sx={{ 
                                bgcolor: theme.palette.mode === 'light' ? 'grey.100' : 'grey.800',
                                borderRadius: 1
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination Section */}
              <Box 
                sx={{ 
                  p: 2, 
                  borderTop: '1px solid', 
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Mostrando {Math.min(page * limit, total)} de {total} resultados
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    select
                    label="Itens por página"
                    value={limit}
                    onChange={handleLimitChange}
                    size="small"
                    sx={{ width: '120px' }}
                  >
                    <MenuItem value={10}>10 itens</MenuItem>
                    <MenuItem value={20}>20 itens</MenuItem>
                    <MenuItem value={50}>50 itens</MenuItem>
                  </TextField>
                  <Pagination
                    count={Math.ceil(total / limit)}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                    size="small"
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Summary Section */}
          <Grid item xs={12} lg={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AssessmentIcon sx={{ fontSize: 24, mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Resumo e Análise</Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Análise por Personagem
                </Typography>
                <Autocomplete
                  options={summaryOptions.characters}
                  value={selectedSummaryCharacter}
                  onChange={(event, newValue) => setSelectedSummaryCharacter(newValue)}
                  renderInput={params => (
                    <TextField 
                      {...params} 
                      label="Selecione um personagem" 
                      size="small"
                      fullWidth 
                    />
                  )}
                />

                {selectedSummaryCharacter && (
                  <Box 
                    sx={{ 
                      mt: 2, 
                      p: 2, 
                      bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Missões completadas por {selectedSummaryCharacter}:
                    </Typography>
                    {Object.entries(getCharacterSummary(selectedSummaryCharacter)).map(
                      ([mission, count]) => (
                        <Box 
                          key={mission} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            py: 0.5 
                          }}
                        >
                          <Typography variant="body2">{mission}</Typography>
                          <Chip
                            label={`${count}x`}
                            size="small"
                            color="primary"
                            sx={{ 
                              fontWeight: 'bold',
                              minWidth: 45,
                              height: 24
                            }}
                          />
                        </Box>
                      )
                    )}
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Análise por Missão
                </Typography>
                <Autocomplete
                  options={summaryOptions.missions}
                  value={selectedSummaryMission}
                  onChange={(event, newValue) => setSelectedSummaryMission(newValue)}
                  renderInput={params => (
                    <TextField 
                      {...params} 
                      label="Selecione uma missão" 
                      size="small"
                      fullWidth 
                    />
                  )}
                />

                {selectedSummaryMission && (
                  <Box 
                    sx={{ 
                      mt: 2, 
                      p: 2, 
                      bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      Personagens que completaram "{selectedSummaryMission}":
                    </Typography>
                    {Object.entries(getMissionSummary(selectedSummaryMission))
                      .sort(([, a], [, b]) => b - a)
                      .map(([character, count]) => (
                        <Box 
                          key={character} 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            py: 0.5 
                          }}
                        >
                          <Typography variant="body2">{character}</Typography>
                          <Chip
                            label={`${count}x`}
                            size="small"
                            color="primary"
                            sx={{ 
                              fontWeight: 'bold',
                              minWidth: 45,
                              height: 24
                            }}
                          />
                        </Box>
                      ))}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 6,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            border: '1px solid',
            borderColor: theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'
          }}
        >
          <Box
            component="img"
            src="/assets/images/empty_state.svg"
            alt="Nenhum dado encontrado"
            sx={{ width: '200px', height: 'auto', opacity: 0.7 }}
          />
          <Typography variant="h6" color="text.secondary" align="center">
            Nenhum histórico encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Selecione um intervalo de datas e clique em buscar para visualizar o histórico
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default MissionHistoricPage;
