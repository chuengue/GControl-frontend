import { Box, Button, Container, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React, { useEffect, useState } from 'react';

import theme from '../../../theme';
import { getUserMissionsLogsHistoric } from '../../service/requests/limitedMissions/limitedMissions';
import { useSession } from '../../SessionContext';

const MissionHistoricPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [missionsData, setMissionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession();

  // Estados para paginação
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // Itens por página
  const [total, setTotal] = useState(0); // Total de registros

  // Estados para filtros
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [selectedMission, setSelectedMission] = useState<string>('');

  // Listas de personagens e missões para os filtros
  const characters = Array.from(new Set(missionsData.map(character => character.name)));
  const missions = Array.from(
    new Set(
      missionsData.flatMap(character =>
        character.missionsCompleted.map((mission: any) => mission.name)
      )
    )
  );

  const handleDateChange = (newRange: [Date | null, Date | null]) => {
    setDateRange(newRange);
    setPage(1); // Resetar para a primeira página ao mudar o intervalo de datas
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const formattedDate = new Date(date);
    formattedDate.setHours(-3, 0, 0, 0); // Início do dia (00:00:00)
    return formattedDate.toISOString();
  };

  const formatEndDate = (date: Date | null) => {
    if (!date) return '';
    const formattedDate = new Date(date);
    formattedDate.setHours(20, 59, 59); // Final do dia (23:59:59)
    return formattedDate.toISOString();
  };

  const handleFetchData = async () => {
    if (dateRange[0] && dateRange[1]) {
      const startDate = formatDate(dateRange[0]);
      const endDate = formatEndDate(dateRange[1]);
      setLoading(true);
      setError(null);

      try {
        const data = await getUserMissionsLogsHistoric(
          session?.user.uid,
          startDate,
          endDate,
          page,
          limit
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

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      handleFetchData();
    }
  }, [dateRange, page, limit]); // Atualizar os dados quando o intervalo de datas, a página ou o limite mudar

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(Number(event.target.value));
    setPage(1); // Resetar para a primeira página ao mudar o limite
  };

  // Função para filtrar os dados com base nos filtros selecionados
  const filteredData = missionsData.filter(character => {
    const matchesCharacter = selectedCharacter ? character.name === selectedCharacter : true;
    const matchesMission = selectedMission
      ? character.missionsCompleted.some((mission: any) => mission.name === selectedMission)
      : true;
    return matchesCharacter && matchesMission;
  });

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
        Histórico de Missões
      </Typography>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateRangePicker
                     localeText={{ start: 'Data de Início', end: 'Data de Fim' }} 

              value={dateRange}
              onChange={handleDateChange}
              renderInput={(startProps, endProps) => (
                <>
                  <TextField
                    {...startProps}
                    fullWidth
                    sx={{
                      '& .MuiInputBase-root': {
                        borderRadius: '8px',
                        padding: '8px 16px'
                      },
                      mb: 1
                    }}
                  />
                  <TextField
                    {...endProps}
                    fullWidth
                    sx={{
                      '& .MuiInputBase-root': {
                        borderRadius: '8px',
                        padding: '8px 16px'
                      },
                      mb: 1
                    }}
                  />
                </>
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            onClick={handleFetchData}
            loading={loading}
            sx={{
              height: '56px',
              borderRadius: '8px',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 3
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
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
        <>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: '12px',
              bgcolor: theme.palette.grey[900],
              overflow: 'auto',
              maxWidth: '100%',
              height: 'calc(100vh - 400px)'
            }}
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
                {filteredData.map(character =>
                  character.missionsCompleted.map((mission: any, index) => (
                    <TableRow key={`${character.id}-${mission.missionId}-${index}`}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {character.thumbImgUrl ? (
                            <img
                              src={character.thumbImgUrl}
                              alt={character.name}
                              width={50}
                              style={{ borderRadius: '8px', marginRight: '8px' }}
                            />
                          ) : (
                            <Skeleton variant="circular" width={50} height={50} />
                          )}
                          <Typography>{character.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {mission.imgUrl ? (
                            <img
                              src={mission.imgUrl}
                              alt={mission.name}
                              width={50}
                              style={{ borderRadius: '8px', marginRight: '8px' }}
                            />
                          ) : (
                            <Skeleton variant="circular" width={50} height={50} />
                          )}
                          <Typography>{mission.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(mission.dateCompleted).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Controles de paginação */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Mostrando {page * limit} de {total} resultados
              </Typography>
              <Typography variant="body1" color="text.primary">
                Página {page} de {Math.ceil(total / limit)}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center">
              <Button
                variant="contained"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                sx={{ mr: 1, borderRadius: '12px', padding: '6px 12px' }}
              >
                Anterior
              </Button>
              <Button
                variant="contained"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= Math.ceil(total / limit)}
                sx={{ borderRadius: '12px', padding: '6px 12px' }}
              >
                Próxima
              </Button>
            </Box>

            <Box>
              <TextField
                select
                label="Itens por página"
                value={limit}
                onChange={handleLimitChange}
                SelectProps={{ native: true }}
                size="small"
                sx={{ width: '150px' }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
              </TextField>
            </Box>
          </Box>
        </>
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Nenhum dado encontrado.
        </Typography>
      )}
    </Container>
  );
};

export default MissionHistoricPage;
