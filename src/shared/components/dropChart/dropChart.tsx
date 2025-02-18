import { CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { getDropRateMissionReport } from '../../../service/requests/missions/missions';
import { DropRateResults } from '../../../service/requests/types';

interface DropRateChartProps {
  userId: string;
  userCharId: string;
  missionId: string;
}

const DropRateChart: React.FC<DropRateChartProps> = ({ userId, userCharId, missionId }) => {
  const [dropRates, setDropRates] = useState<DropRateResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDropRatesSessions = async () => {
      try {
        const data = await getDropRateMissionReport(userId, userCharId, missionId);
        setDropRates(data.results);
      } catch (error) {
        console.error('Error fetching drop rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDropRatesSessions();
  }, [userId, userCharId, missionId]);

  const chartData = dropRates?.dropRates?.map(item => ({
    date: format(new Date(item.dropTimestamp), 'HH:mm:ss'),
    item: item.itemName,
    totalDropped: item.totalDropped,
    dropRate: item.dropRate
  }));

  if (loading ) {
    return (
      <div className="loading-indicator">
        <CircularProgress />
      </div>
    ); // Exibe um indicador de carregamento enquanto os dados são obtidos
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" tick={{ fill: 'white' }} />
        <YAxis tick={{ fill: 'white' }} />
        <Tooltip />
        <Legend />
        {dropRates?.dropRates?.map((item, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey="dropRate"
            name={item.itemName}
            stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`} // Gera cores diferentes
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DropRateChart;
