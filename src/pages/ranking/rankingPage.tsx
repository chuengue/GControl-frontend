import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  alpha,
  Fade,
  keyframes,
} from "@mui/material";
import { green, grey } from "@mui/material/colors";
import React, { useEffect, useState } from "react";
import theme from "../../../theme";
import { getRankingList } from "../../service/requests/ranking/ranking";
import { RankingList } from "../../service/requests/ranking/types";
import { useSession } from "../../SessionContext";

const shine = keyframes`
  0% {
    background-position: 200% center;
  }
  100% {
    background-position: -200% center;
  }
`;

const RankingPage: React.FC = () => {
  const [rankingData, setRankingData] = useState<RankingList[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useSession();
  const apiLimit = 100; // Limit da API, que carrega 100 itens por vez
  const userId = session?.user.uid; // Usuário logado
  const theme = useTheme();

  // Função para buscar todos os rankings de uma vez
  const fetchRanking = async () => {
    setLoading(true);
    try {
      const response = await getRankingList(1, apiLimit); // Carrega todos os rankings com limit 100
      if (response.success) {
        const sortedData = response.results.data.sort((a, b) => {
          // Ordena por poder de ataque, do maior para o menor
          return b.atkTotal - a.atkTotal;
        });
        setRankingData(sortedData);
      }
    } catch (error) {
      console.error("Erro ao buscar ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar os rankings na primeira renderização
  useEffect(() => {
    fetchRanking();
  }, []);

  return (
    <Box >
      <Paper
        elevation={24}
        sx={{
          maxWidth: 1200,
          maxHeight: 800,
          height: '100%',
          width: '100%',
          mx: "auto",
          p: { xs: 2, sm: 3 },
          background: `linear-gradient(135deg, ${alpha(grey[900], 0.95)} 0%, ${alpha(grey[800], 0.95)} 100%)`,
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 2, 
            textAlign: "center", 
            fontWeight: 800,
            fontSize: { xs: '1.5rem', sm: '2rem' },
            background: 'linear-gradient(90deg, #fff 0%, #888 50%, #fff 100%)',
            backgroundSize: '200% auto',
            animation: `${shine} 3s linear infinite`,
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🏆 Ranking Geral - TOP 100
        </Typography>

        {userId && rankingData.some((char) => char.userId === userId) && (
          <Fade in timeout={1000}>
            <Box sx={{ 
              background: `linear-gradient(135deg, ${green[600]}, ${green[400]})`,
              padding: 2,
              borderRadius: "12px",
              mb: 2,
              boxShadow: `0 8px 32px ${alpha(green[400], 0.3)}`,
              transform: 'translateY(-4px)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-6px)',
              }
            }}>
              <Typography color="white" fontWeight="bold" align="center" variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                🎉 Parabéns! Você está no TOP 100! 🎉
              </Typography>
            </Box>
          </Fade>
        )}

        <TableContainer 
          sx={{ 
            flexGrow: 1,
            borderRadius: "12px",
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: alpha(theme.palette.common.white, 0.1),
              borderRadius: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.common.white, 0.2),
              borderRadius: '6px',
              '&:hover': {
                background: alpha(theme.palette.common.white, 0.3),
              },
            },
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell 
                  align="center" 
                  sx={{ 
                    bgcolor: alpha(grey[900], 0.95),
                    fontWeight: 'bold',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    py: 1.5,
                  }}
                >
                  Posição
                </TableCell>
                <TableCell sx={{ bgcolor: alpha(grey[900], 0.95), fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' }, py: 1.5 }}>Jogador</TableCell>
                <TableCell sx={{ bgcolor: alpha(grey[900], 0.95), fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' }, py: 1.5 }}>Poder</TableCell>
                <TableCell sx={{ bgcolor: alpha(grey[900], 0.95), fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' }, py: 1.5 }}>Nível</TableCell>
                <TableCell sx={{ bgcolor: alpha(grey[900], 0.95), fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' }, py: 1.5 }}>Personagem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="h6" sx={{ py: 2 }}>Carregando ranking...</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rankingData.map((char, index) => {
                  const rankImage =
                    index === 0
                      ? "/assets/images/rank1.webp"
                      : index === 1
                      ? "/assets/images/rank2.webp"
                      : index === 2
                      ? "/assets/images/rank3.webp"
                      : null;

                  const isUser = userId === char.userId;
                  const isTopThree = index < 3;

                  return (
                    <TableRow 
                      key={char.id} 
                      sx={{
                        position: 'relative',
                        transition: 'transform 0.2s ease, background-color 0.2s ease',
                        backgroundColor: isUser 
                          ? alpha(theme.palette.info.dark, 0.3)
                          : isTopThree 
                            ? alpha(theme.palette.warning.dark, 0.1)
                            : 'transparent',
                        '&:hover': {
                          backgroundColor: isUser 
                            ? alpha(theme.palette.info.dark, 0.4)
                            : isTopThree 
                              ? alpha(theme.palette.warning.dark, 0.2)
                              : alpha(theme.palette.common.white, 0.05),
                          transform: 'scale(1.01)',
                        },
                      }}
                    >
                      <TableCell align="center" sx={{ py: 1 }}>
                        {rankImage ? (
                          <Box
                            component="img"
                            src={rankImage}
                            alt={`Rank ${index + 1}`}
                            sx={{
                              width: { xs: 30, sm: 35 },
                              height: { xs: 30, sm: 35 },
                              filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.3))',
                            }}
                          />
                        ) : (
                          <Typography 
                            fontWeight="bold"
                            sx={{
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                              color: isTopThree ? theme.palette.warning.light : 'inherit'
                            }}
                          >
                            {index + 1}º
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography 
                          fontWeight="bold"
                          sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            color: isTopThree ? theme.palette.warning.light : 'inherit'
                          }}
                        >
                          {char.nickname}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography 
                          sx={{
                            color: green[400],
                            fontWeight: 'bold',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            textShadow: isTopThree ? '0 0 10px rgba(76,175,80,0.3)' : 'none'
                          }}
                        >
                          {new Intl.NumberFormat().format(Number(char.atkTotal))}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: isTopThree ? 'bold' : 'normal',
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                          }}
                        >
                          {char.level}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Box sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 1,
                        }}>
                          <Box
                            component="img"
                            sx={{
                              width: { xs: 35, sm: 40 },
                              height: { xs: 35, sm: 40 },
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                              transition: 'transform 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.1)',
                              }
                            }}
                            src={char.gameChar.thumbImgUrl}
                            alt={char.gameChar.name}
                          />
                          <Typography 
                            variant="body2"
                            sx={{
                              fontWeight: isTopThree ? 'bold' : 'normal',
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            {char.gameChar.name}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default RankingPage;
