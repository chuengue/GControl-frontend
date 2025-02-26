import { Autocomplete, Box, Button, Container, FormControl, Grid, InputLabel, MenuItem, Pagination, Paper, Select, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React, { useEffect, useState } from 'react';

import { getUserMissionsLogsHistoric } from '../../service/requests/limitedMissions/limitedMissions';
import { useSession } from '../../SessionContext';

const MissionHistoricPage: React.FC = () => {
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
        overflow: 'auto',
        padding: '24px',
        height: 'calc(100vh - 68px)'
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
        Histórico de Missões
      </Typography>

      {/* Componentes de data e botão de busca */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <DatePicker
                  label="Data Inicial"
                  value={startDate}
                  onChange={handleStartDateChange}
                  sx={{ width: '100%' }}
                  renderInput={params => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Data Final"
                  value={endDate}
                  onChange={handleEndDateChange}
                  sx={{ width: '100%' }}
                  renderInput={params => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Button
            variant="contained"
            onClick={handleFetchData}
            loading={loading}
            sx={{ width: '100%', height: '56px', borderRadius: '8px', boxShadow: 2 }}
          >
            Buscar Histórico
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Typography color="error" sx={{ mb: 2, fontWeight: '500', textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Skeleton variant="text" width={100} height={30} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={100} height={30} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={100} height={30} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(10)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="text" width={100} height={50} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={100} height={50} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={100} height={50} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : missionsData.length > 0 ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TableContainer
              component={Paper}
              sx={{ borderRadius: '12px', overflow: 'auto', maxHeight: '50vh' }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <InputLabel>Personagem</InputLabel>
                        <Select
                          value={selectedCharacter}
                          onChange={e => setSelectedCharacter(e.target.value as string)}
                          label="Personagem"
                        >
                          <MenuItem value="">Todos</MenuItem>
                          {characters.map(character => (
                            <MenuItem key={character} value={character}>
                              {character}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <InputLabel>Missão</InputLabel>
                        <Select
                          value={selectedMission}
                          onChange={e => setSelectedMission(e.target.value as string)}
                          label="Missão"
                        >
                          <MenuItem value="">Todas</MenuItem>
                          {missions.map(mission => (
                            <MenuItem key={mission} value={mission}>
                              {mission}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {missionsData.map(character =>
                    character.missionsCompleted.map((mission: any, index) => (
                      <TableRow key={`${character.id}-${mission.missionId}-${index}`}>
                        <TableCell
                          sx={{
                            minWidth: '120px'
                          }}
                        >
                          <Box display="flex" alignItems="center">
                            {character.thumbImgUrl ? (
                              <img
                                src={character.thumbImgUrl}
                                alt={character.name}
                                width={40}
                                style={{ borderRadius: '8px', marginRight: '8px' }}
                              />
                            ) : (
                              <Skeleton variant="circular" width={50} height={50} />
                            )}
                            <Typography variant="body2">{character.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" flexDirection="column">
                            {mission.imgUrl ? (
                              <img
                                src={mission.imgUrl}
                                alt={mission.name}
                                width={30}
                                style={{ borderRadius: '8px', marginRight: '8px' }}
                              />
                            ) : (
                              <Skeleton variant="circular" width={50} height={50} />
                            )}
                            <Typography variant="caption">{mission.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(mission.dateCompleted).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {Math.min(page * limit, total)} de {total} resultados
              </Typography>
              <Pagination
                count={Math.ceil(total / limit)}
                page={page}
                onChange={handlePageChange} // Usando a função handlePageChange
                color="primary"
              />
              <TextField
                select
                label="Itens por página"
                value={limit}
                onChange={handleLimitChange} // Usando a função handleLimitChange
                SelectProps={{ native: true }}
                size="small"
                sx={{ width: '150px' }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
              </TextField>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, borderRadius: '12px' }}>
              <Typography variant="h6" gutterBottom>
                Resumo
              </Typography>

              <Autocomplete
                options={summaryOptions.characters}
                value={selectedSummaryCharacter}
                onChange={(event, newValue) => setSelectedSummaryCharacter(newValue)}
                renderInput={params => (
                  <TextField {...params} label="Selecione um personagem" fullWidth />
                )}
                sx={{ mb: 2 }}
              />

              {selectedSummaryCharacter && (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    Missões completadas por {selectedSummaryCharacter}:
                  </Typography>
                  {Object.entries(getCharacterSummary(selectedSummaryCharacter)).map(
                    ([mission, count]) => (
                      <Typography key={mission} variant="body2">
                        {mission}: {count} vezes
                      </Typography>
                    )
                  )}
                </Box>
              )}

              <Autocomplete
                options={summaryOptions.missions}
                value={selectedSummaryMission}
                onChange={(event, newValue) => setSelectedSummaryMission(newValue)}
                renderInput={params => (
                  <TextField {...params} label="Selecione uma missão" fullWidth />
                )}
                sx={{ mt: 2, mb: 2 }}
              />

              {selectedSummaryMission && (
                <Box>
                  <Typography variant="body1" gutterBottom>
                    Personagens que mais completaram a missão "{selectedSummaryMission}":
                  </Typography>
                  {Object.entries(getMissionSummary(selectedSummaryMission)).map(
                    ([character, count]) => (
                      <Typography key={character} variant="body2">
                        {character}: {count} vezes
                      </Typography>
                    )
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Box
          sx={{
            height: '50vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <img src="/assets/images/empty_state.svg" alt="" />
          <Typography variant="h6" color="textSecondary" sx={{ whiteSpace: 'pre-line' }}>
            Nenhum histórico encontrado
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default MissionHistoricPage;
