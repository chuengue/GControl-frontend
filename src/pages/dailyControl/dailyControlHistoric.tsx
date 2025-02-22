import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // Importe o DatePicker
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React, { useEffect, useState } from 'react';

import { useMediaQuery } from 'react-responsive';
import theme from '../../../theme';
import { getUserMissionsLogsHistoric } from '../../service/requests/limitedMissions/limitedMissions';
import { useSession } from '../../SessionContext';

const MissionHistoricPage: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null); // Estado para data inicial
  const [endDate, setEndDate] = useState<Date | null>(null); // Estado para data final
  const [missionsData, setMissionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useSession();
  const isMobile = useMediaQuery({ minWidth: 500 });

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

  const handleStartDateChange = (newDate: Date | null) => {
    setStartDate(newDate);
    setPage(1); // Resetar para a primeira página ao mudar a data inicial
  };

  const handleEndDateChange = (newDate: Date | null) => {
    setEndDate(newDate);
    setPage(1); // Resetar para a primeira página ao mudar a data final
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
    if (startDate && endDate) {
      handleFetchData();
    }
  }, [startDate, endDate, page, limit]); // Atualizar os dados quando as datas, a página ou o limite mudar

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
        {/* Container para os DatePicker */}
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <DatePicker
                  label="Data Inicial"
                  value={startDate}
                  onChange={handleStartDateChange}
                  sx={{
                    width: '100%' // Ocupa a largura total do Grid item
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: '8px',
                          padding: '8px 16px'
                        }
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Data Final"
                  value={endDate}
                  onChange={handleEndDateChange}
                  sx={{
                    width: '100%' // Ocupa a largura total do Grid item
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': {
                          borderRadius: '8px',
                          padding: '8px 16px'
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Grid>

        {/* Container para o botão */}
        <Grid item xs={12} sm={3}>
          <Button
            variant="contained"
            onClick={handleFetchData}
            loading={loading}
            sx={{
              width: '100%', // Ocupa a largura total em telas pequenas
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

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              flexDirection: { xs: 'column', md: 'row' },
              mt: { xs: 1, md: 2 },
              gap: { xs: 2, md: 0 } // Adiciona espaçamento entre os elementos em mobile
            }}
          >
            {isMobile && (


            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'center', md: 'flex-start' },
                gap: { xs: 1, md: 2 } // Espaçamento entre os textos
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Mostrando {Math.min(page * limit, total)} de {total} resultados
              </Typography>
            </Box>
            )}

            {/* Componente Pagination */}
            <Pagination
              count={Math.ceil(total / limit)} // Número total de páginas
              page={page} // Página atual
              onChange={(event, newPage) => handlePageChange(newPage)} // Função para mudar de página
              color="primary" // Cor do componente
              size={!isMobile? "small" : "medium"}
            />
          {
          isMobile && (
            
            <Box>
              <TextField
                select
                label="Itens por página"
                value={limit}
                onChange={handleLimitChange}
                SelectProps={{ native: true }}
                size="small"
                sx={{ width: { md: '150px', xs: '120px' } }} // Largura ajustada para mobile
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
              </TextField>
            </Box>
          )
          }
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
