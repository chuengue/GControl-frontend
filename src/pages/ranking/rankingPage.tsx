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
} from "@mui/material";
import { green, grey } from "@mui/material/colors";
import React, { useEffect, useState } from "react";
import theme from "../../../theme";
import { getRankingList } from "../../service/requests/ranking/ranking";
import { RankingList } from "../../service/requests/ranking/types";
import { useSession } from "../../SessionContext";

const RankingPage: React.FC = () => {
  const [rankingData, setRankingData] = useState<RankingList[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useSession();
  const apiLimit = 100; // Limit da API, que carrega 100 itens por vez
  const userId = session?.user.uid; // Usuário logado

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
    <Paper
      sx={{
        maxWidth: 750,
        mx: "auto",
        my: 3,
        p: 2,
        bgcolor: grey[900],
        borderRadius: "14px",
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center", fontWeight: "bold" }}>
        Ranking Geral - TOP 100
      </Typography>

      {/* Mensagem para destacar o usuário */}
      {userId && rankingData.some((char) => char.userId === userId) && (
        <Box sx={{ backgroundColor: green[400], padding: 2, borderRadius: "8px", mb: 2 }}>
          <Typography color="white" fontWeight="bold" align="center">
            Você está no TOP 100! 🎉
          </Typography>
        </Box>
      )}

      <TableContainer sx={{ maxHeight: "60vh" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center">🏆</TableCell>
              <TableCell>👤 IGN</TableCell>
              <TableCell>💪 Ataque</TableCell>
              <TableCell>🔰 Nível</TableCell>
              <TableCell>🎭 Personagem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Carregando...
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

                const isUser = userId === char.userId; // Verifica se é o usuário logado

                return (
                  <TableRow key={char.id} hover sx={{ backgroundColor: isUser ? theme.palette.info.dark  : "transparent" }}>
                    <TableCell align="center">
                      {rankImage ? (
                        <img src={rankImage} alt={`Rank ${index + 1}`} width={30} />
                      ) : (
                        <Typography fontWeight="bold">{index + 1}º</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">{char.nickname}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color={green[400]} fontWeight="bold">
                        {new Intl.NumberFormat().format(Number(char.atkTotal))}
                      </Typography>
                    </TableCell>
                    <TableCell>{char.level}</TableCell>
                    <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <img
                        width={40}
                        height={40}
                        src={char.gameChar.thumbImgUrl}
                        alt={char.gameChar.name}
                      />
                      <Typography variant="body2">{char.gameChar.name}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RankingPage;
