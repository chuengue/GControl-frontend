import {
  alpha,
  Box,
  Card,
  CircularProgress,
  Fade,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import { blue, green } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';
import { UserCharacter } from '../../interfaces/char';

interface ProgressDashboardProps {
  chars: UserCharacter[];
  allChars: UserCharacter[];
}

const MAX_LEVEL = 85;

function ProgressDashboard({ chars, allChars }: ProgressDashboardProps) {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento dos dados
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate overall statistics
  const totalChars = chars.length;
  const totalPossibleChars = allChars.length;
  const maxLevelChars = chars.filter(char => char.level === MAX_LEVEL).length;
  const maxLevelPercentage = totalChars > 0 ? (maxLevelChars / totalChars) * 100 : 0;
  const collectionPercentage = totalPossibleChars > 0 ? Math.min((totalChars / totalPossibleChars) * 100, 100) : 0;
  
  // Calculate level statistics based on total possible characters
  const averageLevel = totalChars > 0 
    ? Math.round(chars.reduce((acc, char) => acc + char.level, 0) / totalChars)
    : 0;
  
  const levelDistribution = {
    max: chars.filter(char => char.level === MAX_LEVEL).length,
    high: chars.filter(char => char.level >= 60 && char.level < MAX_LEVEL).length,
    medium: chars.filter(char => char.level >= 30 && char.level < 60).length,
    low: chars.filter(char => char.level < 30).length
  };

  // Calculate level progress percentage based on total possible characters
  const levelProgress = totalPossibleChars > 0 
    ? Math.min((chars.reduce((acc, char) => acc + char.level, 0) / (totalPossibleChars * MAX_LEVEL)) * 100, 100)
    : 0;

  // Calculate progressive account score
  const calculateAccountScore = (chars: UserCharacter[]) => {
    if (totalChars === 0) return 0;

    // Calculate level score (progressive)
    const levelScore = chars.reduce((acc, char) => {
      // Base level score (0-100 per character)
      const baseLevelScore = (char.level / MAX_LEVEL) * 100;
      
      // Awakening bonus (50 points per awakened character)
      const awakeningBonus = char.isAwakened ? 50 : 0;
      
      // Level bonus (extra points for high levels)
      const levelBonus = char.level >= MAX_LEVEL ? 100 : 0;
      
      return acc + baseLevelScore + awakeningBonus + levelBonus;
    }, 0) * (totalChars / totalPossibleChars); // Adjust based on collection progress

    // Calculate attack score (progressive)
    const maxPossibleAttack = 100000; // Base value for normalization
    const attackScore = chars.reduce((acc, char) => {
      const attackValue = Number(char.atkTotal);
      // Progressive attack bonus with increased weight
      const attackBonus = attackValue > maxPossibleAttack ? 
        (attackValue - maxPossibleAttack) / 500 : 0; // Increased bonus rate
      return acc + (attackValue / maxPossibleAttack) * 200 + attackBonus;
    }, 0) * (totalChars / totalPossibleChars); // Adjust based on collection progress

    // Calculate collection score (progressive)
    const collectionBonus = (totalChars / totalPossibleChars) * 300; // Increased collection bonus

    const collectionScore = chars.reduce((acc, char) => {
      // Base collection score
      const baseScore = 100;
      // Awakening bonus
      const awakeningBonus = char.isAwakened ? 50 : 0;
      return acc + baseScore + awakeningBonus;
    }, 0) * (totalChars / totalPossibleChars) + collectionBonus;

    // Calculate final score (progressive)
    // 25% weight for levels, 45% for attack, 30% for collection
    const finalScore = (levelScore * 0.25 + attackScore * 0.45 + collectionScore * 0.3);

    return Math.round(finalScore);
  };

  const accountScore = calculateAccountScore(chars);

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
        sx={{ width: '100%' }}
      >
        <Fade in={true}>
          <CircularProgress size={60} sx={{ color: green[500] }} />
        </Fade>
      </Box>
    );
  }

  return (
    <Fade in={true}>
      <Stack spacing={3} width="100%" sx={{ p: 2 }}>
        <Card 
          sx={{ 
            p: 4,
            background: `linear-gradient(135deg, ${blue[900]} 0%, ${alpha(blue[800], 0.95)} 100%)`,
            color: 'white',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
            }
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box 
                textAlign="center" 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  background: alpha(blue[800], 0.4),
                  backdropFilter: 'blur(10px)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Personagens</Typography>
                <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>{totalChars}/{totalPossibleChars}</Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: alpha('#fff', 0.8),
                    mb: 2
                  }}
                >
                  {collectionPercentage.toFixed(1)}% do total
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={collectionPercentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(blue[700], 0.3),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: green[400],
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box 
                textAlign="center" 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  background: alpha(blue[800], 0.4),
                  backdropFilter: 'blur(10px)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Progressão de Nível</Typography>
                <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                  Nível {averageLevel}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: alpha('#fff', 0.8),
                    mb: 2
                  }}
                >
                  {levelProgress.toFixed(1)}% do objetivo máximo
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={levelProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(blue[700], 0.3),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: green[400],
                      borderRadius: 4
                    }
                  }}
                />
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.9) }}>
                      Máximo: <strong>{levelDistribution.max}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.9) }}>
                      Alto: <strong>{levelDistribution.high}</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.9) }}>
                      Médio: <strong>{levelDistribution.medium}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.9) }}>
                      Baixo: <strong>{levelDistribution.low}</strong>
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box 
                textAlign="center" 
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  background: alpha(blue[800], 0.4),
                  backdropFilter: 'blur(10px)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Pontuação da Conta</Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    mb: 1, 
                    fontWeight: 700,
                    color: green[300]
                  }}
                >
                  {accountScore}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: alpha('#fff', 0.8),
                    mb: 2
                  }}
                >
                  Baseada em nível, despertar, ataque e coleção
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((accountScore / 10000) * 100, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(blue[700], 0.3),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: green[400],
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Stack>
    </Fade>
  );
}

export default ProgressDashboard;
