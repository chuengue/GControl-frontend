import { Box, Card, Collapse, Grid, Stack, Tooltip, Typography } from '@mui/material';
import { blue, green, grey } from '@mui/material/colors';
import React from 'react';

import { DropRateReport } from '../../../../service/requests/types';

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
  return (
    <Collapse in={expandedId === sessionItemId}>
      <Box
        sx={{
          padding: 2,
          bgcolor: blue[900],
          borderRadius: '0 0 12px 12px',
          marginTop: '-18px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)' // Sombra para o container
        }}
      >
        <Typography variant="h6" fontWeight="200" sx={{ my: 1, color: 'white', ml: 1 }}>
          Taxas de Drop
        </Typography>
        <Grid container spacing={2}>
          {sessionDropRate?.dropRates.map(item => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={item.itemName}>
              <Card
                sx={{
                  width: '100%',
                  p: 2,
                  borderRadius: '8px',
                  bgcolor: blue[800],
                  background: `linear-gradient(145deg, ${blue[800]}, ${blue[700]})`, // Gradiente sutil
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Sombra para o card
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)', // Efeito de hover
                    boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center' }}>
                  <Tooltip title={item.itemName} arrow placement="top">
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ width: '100%', overflow: 'hidden' }}
                    >
                      <Typography variant="body2" fontWeight="bold" color={grey[200]}>
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

                  {/* Divisor Visual */}
                  <Box
                    sx={{
                      width: '60%',
                      height: '1px',
                      bgcolor: grey[300],
                      borderRadius: '4px',
                      my: 1,
                      opacity: 0.5 // Divisor mais sutil
                    }}
                  />

                  {/* Drop Rate */}
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body1" fontWeight="bold" color={grey[200]}>
                      Drop Rate:
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color={green[400]}>
                      {item.dropRate}%
                    </Typography>
                  </Stack>

                  {/* Tempo Médio por Drop */}
                  <Typography variant="body2" fontWeight="bold" color={grey[200]}>
                    Tempo Médio por Drop:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color={green[400]}>
                    {item.avgTimePerDrop
                      ? formatTime(Math.round(Number(item.avgTimePerDrop)), 'text')
                      : '00:00:00'}
                  </Typography>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Collapse>
  );
};

export default DropRateStats;
