import { DeleteForever } from '@mui/icons-material';
import { Box, Card, Collapse, Grid, IconButton, Stack, Tooltip, Typography, useTheme, alpha } from '@mui/material';
import { blue, green, grey, red } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';

import { deleteDropItem } from '../../../../service/requests/missions/missions';
import { DropRateReport } from '../../../../service/requests/types';
import { useSnackbarStore } from '../../../../stores/snackBarStore';

interface DropRateStatsProps {
  expandedId: string | null;
  sessionItemId: string;
  sessionDropRate: DropRateReport['results'];
  formatTime: (time: number, format: 'text' | 'dots') => string;
}

const DropRateStats: React.FC<DropRateStatsProps> = ({
  expandedId,
  sessionItemId,
  sessionDropRate,
  formatTime
}) => {
  const [sessionDropRateList, setSessionDropRateList] = useState(sessionDropRate.dropRates);
  const { showSnackbar } = useSnackbarStore();
  const theme = useTheme();

  useEffect(()=>{
    setSessionDropRateList(sessionDropRate.dropRates);
  },[sessionDropRate])

  const handleDeleteDroppedItem = async (id: string) => {
    try {
      const data = await deleteDropItem(id);
  
      setSessionDropRateList((prevItems) => prevItems.filter((item) => item.id !== id));
  
      showSnackbar(data.results?.message || 'Item removido com sucesso!', 'success');
    } catch (error) {
      showSnackbar(error.message || 'Erro ao excluir o item.', 'error');
    }
  };
  
  
  return (
    <Collapse in={expandedId === sessionItemId}>
      <Box
        sx={{
          padding: 3,
          background: `linear-gradient(135deg, ${alpha(blue[800], 0.7)} 0%, ${alpha(blue[900], 0.6)} 100%)`,
          backdropFilter: 'blur(10px)',
          borderRadius: '0 0 16px 16px',
          marginTop: '-16px',
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          zIndex: -1,
          borderTop: 'none',
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '16px',
            right: '16px',
            height: '1px',
            background: `linear-gradient(to right, ${alpha(grey[400], 0)}, ${alpha(grey[400], 0.1)}, ${alpha(grey[400], 0)})`
          }
        }}
      >
        <Typography variant="h6" fontWeight="200" sx={{ mb: 3, color: 'white', ml: 1 }}>
          Taxas de Drop
        </Typography>

        <Grid container spacing={2}>
          {sessionDropRateList && sessionDropRateList.length > 0 ? (
            sessionDropRateList.map(item => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={item.itemName}>
                <Card
                  sx={{
                    width: '100%',
                    p: 2,
                    borderRadius: '16px',
                    background: `linear-gradient(145deg, ${alpha(blue[700], 0.4)}, ${alpha(blue[800], 0.3)})`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(blue[400], 0.1)}`,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.3)}`
                    }
                  }}
                >
                  <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
                    <Tooltip title={item.itemName} arrow placement="top">
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ width: '100%', overflow: 'hidden' }}
                      >
                        <Typography variant="body2" fontWeight="bold" color={grey[100]}>
                          {item.totalDropped}x
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="white"
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.itemName}
                        </Typography>
                      </Stack>
                    </Tooltip>

                    <Box
                      sx={{
                        width: '80%',
                        height: '1px',
                        background: `linear-gradient(to right, ${alpha(grey[400], 0)}, ${alpha(grey[400], 0.1)}, ${alpha(grey[400], 0)})`,
                        my: 0.5
                      }}
                    />

                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" color={grey[300]}>
                          Drop Rate:
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color={green[300]}>
                          {item.dropRate}%
                        </Typography>
                      </Stack>

                      <IconButton
                        size="small"
                        onClick={() => handleDeleteDroppedItem(item.id)}
                        sx={{
                          color: alpha(grey[400], 0.7),
                          '&:hover': {
                            color: alpha(red[400], 0.9),
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <DeleteForever fontSize="small" />
                      </IconButton>
                    </Stack>

                    <Box
                      sx={{
                        width: '80%',
                        height: '1px',
                        background: `linear-gradient(to right, ${alpha(grey[400], 0)}, ${alpha(grey[400], 0.1)}, ${alpha(grey[400], 0)})`,
                        my: 0.5
                      }}
                    />

                    <Typography variant="body2" color={grey[300]}>
                      Tempo Médio por Drop
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color={green[300]}>
                      {item.avgTimePerDrop && isFinite(Number(item.avgTimePerDrop))
                        ? formatTime(Math.round(Number(item.avgTimePerDrop)), 'text')
                        : '00:00:00'}
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body2" color={grey[300]} sx={{ textAlign: 'center' }}>
                Não há dados disponíveis para esta sessão. Atualize a página para verificar as
                estatísticas.
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Collapse>
  );
};

export default DropRateStats;
