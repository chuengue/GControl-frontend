import { Box, Skeleton, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getGeneralReportDrops } from '../../service/requests/missions/missions';
import { useSession } from '../../SessionContext';
import FarmTool from '../../shared/components/dropChart/dropChart';
import { useSnackbarStore } from '../../stores/snackBarStore';

const FarmToolsPage = () => {
  const { session } = useSession();
  const [dataList, setDataList] = useState<any>(null);
  const [noDataMessage, setNoDataMessage] = useState<string | null>(null);
  const { showSnackbar } = useSnackbarStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!session?.user?.uid) {
      showSnackbar('Usuário não encontrado', 'error');
      return;
    }

    try {
      const data = await getGeneralReportDrops(session.user.uid, 'mission');

      if (data?.results?.success === false) {
        setNoDataMessage(
          'Nenhuma sessão de farm encontrada! 🚀\n\nComece agora: registre suas sessões de farm e acompanhe seus drops em tempo real com nossos gráficos interativos.'
        );
        setDataList(null);
        return;
      }

      const missions = data?.results?.results?.data ?? [];

      if (missions.length === 0) {
        setNoDataMessage(
          'Nenhuma missão registrada! 📋\n\nRegistre suas tentativas de farm para visualizar suas estatísticas aqui.'
        );
        setDataList(null);
        return;
      }

      const hasDrops = missions.some(
        (mission: any) => mission.dropRates && mission.dropRates.length > 0
      );

      if (!hasDrops) {
        setNoDataMessage(
          'Nenhum drop encontrado! 🎲\n\nVocê já registrou suas sessões, mas ainda não encontrou nenhum item. Continue farmando e acompanhe seus resultados aqui!'
        );
        setDataList(null);
        return;
      }

      setNoDataMessage(null);
      setDataList(data);
    } catch (error: any) {
      console.error(error);
      showSnackbar(error.message, 'error');
      setNoDataMessage('Erro ao buscar dados. Tente novamente mais tarde.');
    }
  };

  return (
    <Box
      sx={{
        height: ' 90vh',
        paddingBottom: '30px',
        overflowY: 'auto'
      }}
    >
      {noDataMessage ? (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" color="textSecondary" sx={{ whiteSpace: 'pre-line' }}>
            {noDataMessage}
          </Typography>
        </Box>
      ) : dataList ? (
        <FarmTool data={dataList} />
      ) : (
        <Skeleton
          width="100%"
          height="100%"
          animation="wave"
          variant="rectangular"
          sx={{ borderRadius: '12px' }}
        />
      )}
    </Box>
  );
};

export default FarmToolsPage;
