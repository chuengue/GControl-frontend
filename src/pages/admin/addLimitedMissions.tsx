import {
  Autocomplete,
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  createLimitedMission,
  getAllLimitedMissions,
  removeLimitedMissions
} from '../../service/requests/limitedMissions/limitedMissions';
import { MissionResult } from '../../service/requests/limitedMissions/types';
import { getAllMissions } from '../../service/requests/missions/missions';
import { Mission } from '../../shared/types';

const missionTypes = [
  { label: 'Diária', value: 'daily' },
  { label: 'Semanal (Segunda)', value: 'weeklyMonday' },
  { label: 'Semanal (Quarta)', value: 'weeklyWednesday' },
  { label: 'Semanal (Sexta)', value: 'weeklyFriday' }
];

const LimitedMissionManager = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [missionType, setMissionType] = useState('daily');
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [limitedMissions, setLimitedMissions] = useState<MissionResult[]>([]);

  useEffect(() => {
    fetchMissions();
    fetchLimitedMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const data = await getAllMissions();
      setMissions(data.results);
    } catch (error) {
      console.error('Erro ao buscar missões:', error);
    }
  };

  const fetchLimitedMissions = async () => {
    try {
      const data = await getAllLimitedMissions();
      setLimitedMissions(data.results);
    } catch (error) {
      console.error('Erro ao buscar missões limitadas:', error);
    }
  };

  const handleCreateLimitedMission = async () => {
    if (!selectedMission) return;

    try {
      await createLimitedMission({
        missionId: selectedMission.id,
        type: missionType,
        max_attempts: maxAttempts
      });
      fetchLimitedMissions();
    } catch (error) {
      console.error('Erro ao criar missão limitada:', error);
    }
  };

  const handleDeleteLimitedMission = async (id: string) => {
    try {
      await removeLimitedMissions(id);
      fetchLimitedMissions();
    } catch (error) {
      console.error('Erro ao excluir missão limitada:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Gerenciar Missões Limitadas
      </Typography>
      <Stack spacing={2} mb={4}>
        <Autocomplete
          options={missions}
          getOptionLabel={mission => mission.name}
          value={selectedMission}
          onChange={(_, newValue) => setSelectedMission(newValue)}
          renderInput={params => <TextField {...params} label="Escolha uma missão" fullWidth />}
        />
        <Select value={missionType} onChange={e => setMissionType(e.target.value)} fullWidth>
          {missionTypes.map(type => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
        <TextField
          label="Máximo de tentativas"
          type="number"
          value={maxAttempts}
          onChange={e => setMaxAttempts(Number(e.target.value))}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleCreateLimitedMission}>
          Criar Missão Limitada
        </Button>
      </Stack>

      <Typography variant="h6">Missões Limitadas Criadas</Typography>
      <Box>
        {limitedMissions.map(mission => (
          <Box
            key={mission.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 1,
              borderBottom: '1px solid grey'
            }}
          >
            <Typography>
              {mission.missionId} - {mission.mission_name} - {mission.type} ({mission.max_attempts}{' '}
              tentativas)
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleDeleteLimitedMission(mission.id)}
            >
              Excluir
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default LimitedMissionManager;
